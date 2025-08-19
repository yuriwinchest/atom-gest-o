import { supabase } from '../supabase';
// import { db } from '../db'; // Removido - usando Supabase
// import { loginLogs, activeSessions, securityAlerts, users } from '../../shared/schema'; // Removido
// import { eq, and, desc, gte, count, sql } from 'drizzle-orm'; // Removido
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

      // TEMPORARIAMENTE DESABILITADO - usando Supabase
      console.log('🔐 Login attempt (log disabled):', {
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

      // TEMPORARIAMENTE DESABILITADO - usando Supabase
      console.log('📱 Active session (log disabled):', {
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
      // TEMPORARIAMENTE DESABILITADO - usando Supabase
      console.log('📱 Session activity update (log disabled):', sessionId);
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade da sessão:', error);
    }
  }

  // Encerrar sessão
  async endSession(sessionId: string): Promise<void> {
    try {
      // TEMPORARIAMENTE DESABILITADO - usando Supabase
      console.log('📱 Session end (log disabled):', sessionId);
      console.log('🔓 Session ended (log disabled):', sessionId);
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
      // TEMPORARIAMENTE DESABILITADO - usando Supabase
      console.log('🚨 Security alert check (log disabled):', username, ip);
    } catch (error) {
      console.error('❌ Erro ao verificar alertas de segurança:', error);
    }
  }

  // Obter estatísticas de login
  async getLoginStats(days: number = 30): Promise<any> {
    try {
      // TEMPORARIAMENTE DESABILITADO - usando Supabase
      console.log('📊 Login stats (log disabled):', days, 'days');
      return {
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
      // TEMPORARIAMENTE DESABILITADO - usando Supabase
      console.log('📱 Active sessions (log disabled)');
      return [];
    } catch (error) {
      console.error('❌ Erro ao obter sessões ativas:', error);
      return [];
    }
  }

  // Obter alertas de segurança
  async getSecurityAlerts(limit: number = 50): Promise<any[]> {
    try {
      // TEMPORARIAMENTE DESABILITADO - usando Supabase
      console.log('🚨 Security alerts (log disabled):', limit);
      return [];
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