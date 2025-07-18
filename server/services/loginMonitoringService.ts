import { db } from '../db';
import { loginLogs, activeSessions, securityAlerts, users } from '../../shared/schema';
import { eq, and, desc, gte, count, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface LoginAttempt {
  username: string;
  email?: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  user_id?: number;
  location_info?: any;
  device_info?: any;
}

export interface SessionData {
  user_id: number;
  session_id: string;
  ip_address: string;
  user_agent: string;
  device_fingerprint?: string;
  location_info?: any;
}

export class LoginMonitoringService {
  private static instance: LoginMonitoringService;

  static getInstance(): LoginMonitoringService {
    if (!LoginMonitoringService.instance) {
      LoginMonitoringService.instance = new LoginMonitoringService();
    }
    return LoginMonitoringService.instance;
  }

  // Gerar fingerprint do dispositivo
  private generateDeviceFingerprint(userAgent: string, ip: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(userAgent + ip);
    return hash.digest('hex').substring(0, 16);
  }

  // Detectar informações do dispositivo
  private parseDeviceInfo(userAgent: string): any {
    const deviceInfo = {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown',
      mobile: false
    };

    // Detectar browser
    if (userAgent.includes('Chrome')) deviceInfo.browser = 'Chrome';
    else if (userAgent.includes('Firefox')) deviceInfo.browser = 'Firefox';
    else if (userAgent.includes('Safari')) deviceInfo.browser = 'Safari';
    else if (userAgent.includes('Edge')) deviceInfo.browser = 'Edge';

    // Detectar OS
    if (userAgent.includes('Windows')) deviceInfo.os = 'Windows';
    else if (userAgent.includes('Mac OS')) deviceInfo.os = 'MacOS';
    else if (userAgent.includes('Linux')) deviceInfo.os = 'Linux';
    else if (userAgent.includes('Android')) deviceInfo.os = 'Android';
    else if (userAgent.includes('iOS')) deviceInfo.os = 'iOS';

    // Detectar se é mobile
    deviceInfo.mobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

    return deviceInfo;
  }

  // Registrar tentativa de login
  async logLoginAttempt(attemptData: LoginAttempt): Promise<void> {
    try {
      const deviceInfo = this.parseDeviceInfo(attemptData.user_agent);
      
      // Inserir log de login
      await db.insert(loginLogs).values({
        user_id: attemptData.user_id || null,
        username: attemptData.username,
        email: attemptData.email || null,
        login_status: attemptData.success ? 'success' : 'failed',
        ip_address: attemptData.ip_address,
        user_agent: attemptData.user_agent,
        session_id: attemptData.success ? uuidv4() : null,
        failure_reason: attemptData.failure_reason || null,
        device_info: deviceInfo,
        location_info: attemptData.location_info || null,
        security_flags: this.analyzeSecurityFlags(attemptData)
      });

      // Verificar se precisa gerar alertas de segurança
      if (!attemptData.success) {
        await this.checkFailedLoginAlerts(attemptData.username, attemptData.ip_address);
      }

      console.log('🔐 Login attempt logged:', {
        username: attemptData.username,
        success: attemptData.success,
        ip: attemptData.ip_address,
        device: deviceInfo.browser + ' on ' + deviceInfo.os
      });

    } catch (error) {
      console.error('❌ Erro ao registrar tentativa de login:', error);
    }
  }

  // Criar sessão ativa
  async createActiveSession(sessionData: SessionData): Promise<void> {
    try {
      const deviceFingerprint = this.generateDeviceFingerprint(
        sessionData.user_agent,
        sessionData.ip_address
      );

      const deviceInfo = this.parseDeviceInfo(sessionData.user_agent);

      await db.insert(activeSessions).values({
        user_id: sessionData.user_id,
        session_id: sessionData.session_id,
        ip_address: sessionData.ip_address,
        user_agent: sessionData.user_agent,
        device_fingerprint: deviceFingerprint,
        location_info: sessionData.location_info || { country: 'BR', city: 'Unknown' }
      });

      console.log('📱 Active session created:', {
        user_id: sessionData.user_id,
        session_id: sessionData.session_id.substring(0, 8) + '...',
        device: deviceInfo.browser + ' on ' + deviceInfo.os
      });

    } catch (error) {
      console.error('❌ Erro ao criar sessão ativa:', error);
    }
  }

  // Atualizar última atividade da sessão
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await db.update(activeSessions)
        .set({ last_activity: new Date() })
        .where(eq(activeSessions.session_id, sessionId));
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade da sessão:', error);
    }
  }

  // Encerrar sessão
  async endSession(sessionId: string): Promise<void> {
    try {
      const session = await db.query.activeSessions.findFirst({
        where: eq(activeSessions.session_id, sessionId)
      });

      if (session) {
        const sessionDuration = Math.floor(
          (Date.now() - new Date(session.login_time).getTime()) / 1000
        );

        // Atualizar log de login com informações de logout
        await db.update(loginLogs)
          .set({
            logout_time: new Date(),
            session_duration: sessionDuration
          })
          .where(eq(loginLogs.session_id, sessionId));

        // Marcar sessão como inativa
        await db.update(activeSessions)
          .set({ is_active: false })
          .where(eq(activeSessions.session_id, sessionId));

        console.log('🔓 Session ended:', {
          session_id: sessionId.substring(0, 8) + '...',
          duration: sessionDuration + 's'
        });
      }
    } catch (error) {
      console.error('❌ Erro ao encerrar sessão:', error);
    }
  }

  // Analisar flags de segurança
  private analyzeSecurityFlags(attemptData: LoginAttempt): any {
    const flags = {
      suspicious_ip: false,
      new_device: false,
      multiple_failures: false,
      unusual_time: false
    };

    // Verificar se é IP suspeito (exemplo básico)
    if (attemptData.ip_address.startsWith('192.168.')) {
      flags.suspicious_ip = false; // IPs locais são normais
    }

    // Verificar horário (exemplo: fora do horário comercial)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      flags.unusual_time = true;
    }

    return flags;
  }

  // Verificar alertas de múltiplas tentativas falhadas
  private async checkFailedLoginAlerts(username: string, ip: string): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Contar tentativas falhadas na última hora
      const failedAttempts = await db
        .select({ count: count() })
        .from(loginLogs)
        .where(
          and(
            eq(loginLogs.username, username),
            eq(loginLogs.login_status, 'failed'),
            gte(loginLogs.login_time, oneHourAgo)
          )
        );

      const failureCount = failedAttempts[0]?.count || 0;

      if (failureCount >= 3) {
        // Criar alerta de segurança
        await db.insert(securityAlerts).values({
          user_id: null,
          alert_type: 'multiple_failed_attempts',
          severity: failureCount >= 5 ? 'high' : 'medium',
          description: `${failureCount} tentativas de login falhadas para ${username} do IP ${ip}`,
          ip_address: ip,
          metadata: {
            username: username,
            failure_count: failureCount,
            time_window: '1 hour'
          }
        });

        console.log('🚨 Security alert created:', {
          type: 'multiple_failed_attempts',
          username: username,
          failures: failureCount
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar alertas de segurança:', error);
    }
  }

  // Obter estatísticas de login
  async getLoginStats(days: number = 30): Promise<any> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const stats = await db
        .select({
          total_attempts: count(),
          successful_logins: count(sql`CASE WHEN login_status = 'success' THEN 1 END`),
          failed_attempts: count(sql`CASE WHEN login_status = 'failed' THEN 1 END`),
          unique_users: count(sql`DISTINCT user_id`),
          unique_ips: count(sql`DISTINCT ip_address`)
        })
        .from(loginLogs)
        .where(gte(loginLogs.login_time, startDate));

      return stats[0] || {
        total_attempts: 0,
        successful_logins: 0,
        failed_attempts: 0,
        unique_users: 0,
        unique_ips: 0
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de login:', error);
      return null;
    }
  }

  // Obter sessões ativas
  async getActiveSessions(): Promise<any[]> {
    try {
      return await db
        .select({
          id: activeSessions.id,
          user_id: activeSessions.user_id,
          username: users.username,
          email: users.email,
          ip_address: activeSessions.ip_address,
          device_fingerprint: activeSessions.device_fingerprint,
          login_time: activeSessions.login_time,
          last_activity: activeSessions.last_activity,
          location_info: activeSessions.location_info
        })
        .from(activeSessions)
        .leftJoin(users, eq(activeSessions.user_id, users.id))
        .where(eq(activeSessions.is_active, true))
        .orderBy(desc(activeSessions.last_activity));
    } catch (error) {
      console.error('❌ Erro ao obter sessões ativas:', error);
      return [];
    }
  }

  // Obter alertas de segurança
  async getSecurityAlerts(limit: number = 50): Promise<any[]> {
    try {
      return await db
        .select()
        .from(securityAlerts)
        .where(eq(securityAlerts.is_resolved, false))
        .orderBy(desc(securityAlerts.created_at))
        .limit(limit);
    } catch (error) {
      console.error('❌ Erro ao obter alertas de segurança:', error);
      return [];
    }
  }

  // Obter histórico de logins recentes
  async getRecentLogins(limit: number = 100): Promise<any[]> {
    try {
      return await db
        .select({
          id: loginLogs.id,
          username: loginLogs.username,
          email: loginLogs.email,
          login_status: loginLogs.login_status,
          ip_address: loginLogs.ip_address,
          user_agent: loginLogs.user_agent,
          login_time: loginLogs.login_time,
          logout_time: loginLogs.logout_time,
          session_duration: loginLogs.session_duration,
          device_info: loginLogs.device_info,
          location_info: loginLogs.location_info,
          failure_reason: loginLogs.failure_reason
        })
        .from(loginLogs)
        .orderBy(desc(loginLogs.login_time))
        .limit(limit);
    } catch (error) {
      console.error('❌ Erro ao obter histórico de logins:', error);
      return [];
    }
  }
}

export const loginMonitoringService = LoginMonitoringService.getInstance();