import { db } from './db';
import { search_analytics, document_analytics } from '@shared/schema';
import type { InsertSearchAnalytics, InsertDocumentAnalytics } from '@shared/schema';

export class AnalyticsTracker {
  // Função para registrar uma busca
  static async trackSearch(searchData: Omit<InsertSearchAnalytics, 'id' | 'created_at'>) {
    try {
      await db.insert(search_analytics).values(searchData);
      console.log('📊 Busca registrada:', searchData.search_term);
    } catch (error) {
      console.error('❌ Erro ao registrar busca:', error);
    }
  }

  // Função para registrar ação em documento
  static async trackDocumentAction(actionData: Omit<InsertDocumentAnalytics, 'id' | 'created_at'>) {
    try {
      await db.insert(document_analytics).values(actionData);
      console.log('📋 Ação de documento registrada:', actionData.action_type);
    } catch (error) {
      console.error('❌ Erro ao registrar ação de documento:', error);
    }
  }

  // Função específica para registrar downloads
  static async trackDownload(documentId: number, type: string = 'document') {
    try {
      await this.trackDocumentAction({
        document_id: documentId,
        action_type: 'download',
        referrer: `/document/${documentId}`,
        user_ip: '127.0.0.1', // Será atualizado pela requisição real
        user_agent: 'System',
        session_id: `download_${Date.now()}`
      });
      console.log(`📥 Download registrado para ${type} ID: ${documentId}`);
    } catch (error) {
      console.error('❌ Erro ao registrar download:', error);
    }
  }

  // Função para obter estatísticas de buscas
  static async getSearchStats() {
    try {
      const totalSearches = await db.select().from(search_analytics);
      const uniqueVisitors = new Set(totalSearches.map(s => s.user_ip)).size;
      const searchesToday = totalSearches.filter(s => {
        const today = new Date().toISOString().split('T')[0];
        return s.created_at?.toISOString().split('T')[0] === today;
      });

      return {
        totalSearches: totalSearches.length,
        uniqueVisitors: uniqueVisitors,
        searchesToday: searchesToday.length
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de busca:', error);
      return {
        totalSearches: 0,
        uniqueVisitors: 0,
        searchesToday: 0
      };
    }
  }

  // Função para obter estatísticas de documentos
  static async getDocumentStats() {
    try {
      const allDocumentActions = await db.select().from(document_analytics);
      
      const totalViews = allDocumentActions.filter(a => a.action_type === 'view').length;
      const totalDownloads = allDocumentActions.filter(a => a.action_type === 'download').length;
      
      const today = new Date().toISOString().split('T')[0];
      const viewsToday = allDocumentActions.filter(a => 
        a.action_type === 'view' && a.created_at?.toISOString().split('T')[0] === today
      ).length;
      
      const downloadsToday = allDocumentActions.filter(a => 
        a.action_type === 'download' && a.created_at?.toISOString().split('T')[0] === today
      ).length;

      return {
        totalViews,
        totalDownloads,
        viewsToday,
        downloadsToday
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de documentos:', error);
      return {
        totalViews: 0,
        totalDownloads: 0,
        viewsToday: 0,
        downloadsToday: 0
      };
    }
  }

  // Função para obter dados do usuário a partir do request
  static getUserDataFromRequest(req: any) {
    return {
      user_ip: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
      session_id: req.sessionID || 'unknown',
      is_authenticated: !!req.session?.user,
      referrer: req.headers.referer || null
    };
  }
}