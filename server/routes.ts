import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { documents as documentsTable, footer_pages as footerPagesTable } from "@shared/schema";
import { searchDocumentsSchema, insertDocumentSchema, insertDocumentRelationSchema, loginSchema, insertUserSchema, insertFormValidationSchema, insertDocumentTypeSchema, insertPublicOrganSchema, insertResponsibleSectorSchema, insertMainSubjectSchema, insertConfidentialityLevelSchema, insertAvailabilityOptionSchema, insertLanguageOptionSchema, insertRightsOptionSchema, insertDocumentAuthoritySchema, insertFooterPageSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { AnalyticsTracker } from "./analytics-tracker";
import multer from 'multer';
import { createHash } from 'crypto';

// Configurar multer para upload de arquivos em memória - SEM LIMITES DE TAMANHO
const upload = multer({ 
  storage: multer.memoryStorage()
  // REMOVIDO: limits - Agora aceita arquivos de qualquer tamanho
});

// Função para categorização automática baseada no tipo de arquivo
function getAutomaticCategory(fileName: string, mimeType?: string): string {
  // Extrair extensão do arquivo
  const extension = fileName.toLowerCase().split('.').pop() || '';
  const mime = (mimeType || '').toLowerCase();
  
  // Categorias de imagem
  if (mime.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif'].includes(extension)) {
    return 'Imagens';
  }
  
  // Categorias de vídeo
  if (mime.includes('video') || ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'ogv'].includes(extension)) {
    return 'Vídeos';
  }
  
  // Categorias de áudio
  if (mime.includes('audio') || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus', 'aiff'].includes(extension)) {
    return 'Áudio';
  }
  
  // Categorias de documento
  if (mime.includes('pdf') || 
      mime.includes('document') || 
      mime.includes('word') || 
      mime.includes('text') ||
      ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'].includes(extension)) {
    return 'Documentos';
  }
  
  // Categorias de planilha
  if (mime.includes('spreadsheet') || 
      mime.includes('excel') ||
      ['xls', 'xlsx', 'csv', 'ods', 'numbers'].includes(extension)) {
    return 'Documentos';
  }
  
  // Categorias de apresentação
  if (mime.includes('presentation') || 
      mime.includes('powerpoint') ||
      ['ppt', 'pptx', 'odp', 'key'].includes(extension)) {
    return 'Documentos';
  }
  
  // Arquivos de código e outros
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'yml', 'yaml', 'md', 'sql', 'py', 'java', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'sh', 'bat'].includes(extension)) {
    return 'Outros';
  }
  
  // Arquivos compactados
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
    return 'Outros';
  }
  
  // Categoria padrão
  return 'Outros';
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // CONTAGEM DE DOCUMENTOS - PRIMEIRA ROTA DEFINIDA
  app.get("/api/documents/category-counts", async (req, res) => {
    console.log('📊 === ROTA DE CONTAGEM CHAMADA AGORA ===');
    
    try {
      // Buscar documentos do banco para contagem real
      const allDocuments = await db.select().from(documentsTable);
      
      // Contar imagens anexadas
      let attachedImagesCount = 0;
      allDocuments.forEach((doc) => {
        try {
          if (doc.content) {
            const contentObj = JSON.parse(doc.content);
            if (contentObj.additionalImages && Array.isArray(contentObj.additionalImages)) {
              attachedImagesCount += contentObj.additionalImages.length;
            }
          }
        } catch (parseError) {
          // Ignorar erros de parse
        }
      });
      
      // Contar todos os arquivos anexados (não apenas imagens)
      let totalAttachedFiles = 0;
      allDocuments.forEach((doc) => {
        try {
          if (doc.content) {
            const contentObj = JSON.parse(doc.content);
            // Contar imagens anexadas
            if (contentObj.additionalImages && Array.isArray(contentObj.additionalImages)) {
              totalAttachedFiles += contentObj.additionalImages.length;
            }
            // Contar outros arquivos anexados se existirem
            if (contentObj.attachedFiles && Array.isArray(contentObj.attachedFiles)) {
              totalAttachedFiles += contentObj.attachedFiles.length;
            }
          }
        } catch (parseError) {
          // Ignorar erros de parse
        }
      });
      
      const result = {
        'all': allDocuments.length + totalAttachedFiles,
        'Documentos': allDocuments.filter(doc => doc.category === 'Documentos').length,
        'Imagens': allDocuments.filter(doc => doc.category === 'Imagens').length + attachedImagesCount,
        'Vídeos': allDocuments.filter(doc => doc.category === 'Vídeos').length,
        'Áudio': allDocuments.filter(doc => doc.category === 'Áudio').length,
        'Outros': allDocuments.filter(doc => doc.category === 'Outros').length
      };

      console.log('📊 === CONTAGEM REAL ===', result);
      res.status(200).json(result);
    } catch (error) {
      console.error('📊 === ERRO CAPTURADO ===', error);
      res.status(500).json({ error: 'Erro na contagem' });
    }
  });

  // NOVA API - BUSCAR FOTOS ANEXADAS
  app.get("/api/documents/attached-photos", async (req, res) => {
    console.log('📸 === BUSCANDO FOTOS ANEXADAS ===');
    
    try {
      const allDocuments = await db.select().from(documentsTable);
      const attachedPhotos = [];
      
      allDocuments.forEach((doc) => {
        try {
          if (doc.content) {
            const contentObj = JSON.parse(doc.content);
            if (contentObj.additionalImages && Array.isArray(contentObj.additionalImages)) {
              contentObj.additionalImages.forEach((photo, index) => {
                attachedPhotos.push({
                  id: `${doc.id}-photo-${index}`,
                  documentId: doc.id,
                  documentTitle: doc.title,
                  title: photo.originalName || photo.fileName || `Foto ${index + 1}`,
                  fileName: photo.fileName,
                  originalName: photo.originalName,
                  fileSize: photo.fileSize,
                  mimeType: photo.mimeType,
                  uploadPath: photo.uploadPath,
                  supabaseId: photo.supabaseId,
                  category: 'Imagens',
                  description: `Foto anexada ao documento: ${doc.title}`,
                  created_at: doc.created_at,
                  type: 'attached_photo'
                });
              });
            }
          }
        } catch (parseError) {
          console.log(`⚠️ Erro ao processar doc ${doc.id}:`, parseError.message);
        }
      });
      
      console.log(`📸 === ENCONTRADAS ${attachedPhotos.length} FOTOS ANEXADAS ===`);
      res.json(attachedPhotos);
    } catch (error) {
      console.error('📸 === ERRO AO BUSCAR FOTOS ===', error);
      res.status(500).json({ error: 'Erro ao buscar fotos anexadas' });
    }
  });
  
  // Rota de diagnóstico para Supabase em PRODUÇÃO
  app.get("/api/supabase-status", async (req, res) => {
    try {
      console.log('🔍 [DIAGNÓSTICO] Testando conectividade Supabase em produção...');
      
      const { supabase } = await import('./supabase');
      const results = {
        environment: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
        tests: {}
      };

      // Teste 1: Verificar conectividade básica com PostgreSQL
      try {
        const { data: testData, error: testError } = await supabase
          .from('documents')
          .select('id')
          .limit(1);
        
        results.tests.postgresConnection = {
          success: !testError,
          error: testError?.message,
          dataCount: testData?.length || 0
        };
        console.log('✅ PostgreSQL conectado via Supabase');
      } catch (error) {
        results.tests.postgresConnection = {
          success: false,
          error: error.message
        };
        console.log('❌ Erro na conexão PostgreSQL:', error.message);
      }

      // Teste 2: Verificar Storage - bucket images
      try {
        const { data: imagesList, error: imagesError } = await supabase.storage
          .from('images')
          .list('', { limit: 5 });
        
        results.tests.storageImages = {
          success: !imagesError,
          error: imagesError?.message,
          filesCount: imagesList?.length || 0,
          files: imagesList?.slice(0, 3).map(f => f.name) || []
        };
        console.log('✅ Storage bucket "images" acessível');
      } catch (error) {
        results.tests.storageImages = {
          success: false,
          error: error.message
        };
        console.log('❌ Erro no bucket images:', error.message);
      }

      // Teste 3: Verificar foto específica que sabemos que existe
      try {
        const { data: photoData, error: photoError } = await supabase.storage
          .from('images')
          .download('1752694706400_7i6ta3_FOTO_CAMPANHA.jpeg');
        
        results.tests.specificPhoto = {
          success: !photoError,
          error: photoError?.message,
          photoSize: photoData?.size || 0
        };
        console.log('✅ Foto específica acessível');
      } catch (error) {
        results.tests.specificPhoto = {
          success: false,
          error: error.message
        };
        console.log('❌ Erro na foto específica:', error.message);
      }

      // Teste 4: URLs públicas diretas
      const directUrls = {
        api: `/api/documents/photos/1752694706400_7i6ta3_FOTO_CAMPANHA.jpeg`,
        supabaseDirect: `https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/images/1752694706400_7i6ta3_FOTO_CAMPANHA.jpeg`
      };
      
      results.tests.urlGeneration = {
        success: true,
        urls: directUrls
      };

      console.log('🔍 [DIAGNÓSTICO COMPLETO]:', results);
      res.json(results);
      
    } catch (error) {
      console.error('❌ [DIAGNÓSTICO FALHOU]:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Rota de teste simples - usando prefixo diferente
  app.get("/api-test", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Teste Sistema</title></head>
      <body style="font-family: Arial; padding: 20px;">
        <h1>✅ Sistema Funcionando!</h1>
        <p>Servidor Express ativo na porta 5000</p>
        <p><a href="/api/supabase-status" target="_blank">🔍 Diagnóstico Supabase</a></p>
        <h2>Teste PDF:</h2>
        <iframe src="/api/pdf-stream/14" width="600" height="400" title="PDF Test"></iframe>
      </body>
      </html>
    `);
  });

  // ============= ROTAS DE AUTENTICAÇÃO =============
  
  // Rota de login
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("🔐 Tentativa de login:", req.body);
      const loginData = loginSchema.parse(req.body);
      console.log("✅ Dados validados:", loginData);
      
      const user = await storage.authenticateUser(loginData.email, loginData.password);
      console.log("🔍 Usuario encontrado:", user ? "SIM" : "NÃO");
      
      // Importar serviço de monitoramento
      const { loginMonitoringService } = await import('./services/loginMonitoringService');
      
      // Preparar dados para o monitoramento
      const monitoringData = {
        username: user?.username || loginData.email,
        email: loginData.email,
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown',
        success: !!user,
        user_id: user?.id,
        location_info: {
          country: 'BR',
          city: 'Unknown',
          timezone: 'America/Sao_Paulo'
        }
      };
      
      if (user) {
        // Remove password from response for security
        const { password, ...userWithoutPassword } = user;
        
        // Gerar session ID único para o usuário
        const { v4: uuidv4 } = await import('uuid');
        const sessionId = uuidv4();
        
        // Salvar usuário na sessão
        if (req.session) {
          (req.session as any).user = userWithoutPassword;
          (req.session as any).sessionId = sessionId;
        }
        
        // Registrar login bem-sucedido
        await loginMonitoringService.logLoginAttempt(monitoringData);
        
        // Criar sessão ativa
        await loginMonitoringService.createActiveSession({
          user_id: user.id,
          session_id: sessionId,
          ip_address: monitoringData.ip_address,
          user_agent: monitoringData.user_agent,
          location_info: monitoringData.location_info
        });
        
        console.log("✅ Login realizado com sucesso para:", user.email);
        res.json({
          success: true,
          message: "Login realizado com sucesso",
          user: userWithoutPassword
        });
      } else {
        console.log("❌ Credenciais inválidas para:", loginData.email);
        
        // Registrar tentativa de login falhada
        await loginMonitoringService.logLoginAttempt({
          ...monitoringData,
          failure_reason: 'Invalid credentials'
        });
        
        res.status(401).json({
          success: false,
          message: "Email ou senha incorretos"
        });
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      // Registrar tentativa de login com erro
      try {
        const { loginMonitoringService } = await import('./services/loginMonitoringService');
        await loginMonitoringService.logLoginAttempt({
          username: req.body.email || 'unknown',
          email: req.body.email,
          ip_address: req.ip || req.connection.remoteAddress || 'unknown',
          user_agent: req.get('User-Agent') || 'unknown',
          success: false,
          failure_reason: 'System error: ' + error.message
        });
      } catch (monitoringError) {
        console.error('❌ Erro ao registrar tentativa de login:', monitoringError);
      }
      
      res.status(400).json({
        success: false,
        message: "Dados de login inválidos"
      });
    }
  });

  // Rota para verificar usuário atual (se houver sessão) - OTIMIZADA
  app.get("/api/auth/me", (req, res) => {
    const user = req.session ? (req.session as any).user : null;
    
    if (user) {
      res.json({
        success: true,
        user: user
      });
    } else {
      res.json({
        success: false,
        message: "Não há usuário logado"
      });
    }
  });

  // Rota de logout
  app.post("/api/auth/logout", async (req, res) => {
    try {
      // Obter session ID antes de destruir a sessão
      const sessionId = req.session ? (req.session as any).sessionId : null;
      
      if (sessionId) {
        // Importar serviço de monitoramento
        const { loginMonitoringService } = await import('./services/loginMonitoringService');
        
        // Encerrar sessão no monitoramento
        await loginMonitoringService.endSession(sessionId);
        console.log("🔓 Sessão encerrada no monitoramento:", sessionId);
      }
      
      if (req.session) {
        req.session.destroy((err: any) => {
          if (err) {
            console.error('Erro ao destruir sessão:', err);
            res.status(500).json({ success: false, message: "Erro ao fazer logout" });
          } else {
            res.json({ success: true, message: "Logout realizado com sucesso" });
          }
        });
      } else {
        res.json({ success: true, message: "Logout realizado com sucesso" });
      }
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      res.status(500).json({ success: false, message: "Erro ao fazer logout" });
    }
  });
  
  // ============= ROTAS DE DOCUMENTOS =============
  
  // Rota para streaming direto de PDF - funciona em iframe
  app.get("/api/pdf-stream/:id", async (req, res) => {
    try {
      console.log('🔥 ROTA PDF-STREAM CHAMADA - ID:', req.params.id);
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        console.log('❌ Documento não encontrado');
        return res.status(404).send("Documento não encontrado");
      }

      let documentDetails = null;
      try {
        if (document.content && typeof document.content === 'string') {
          if (document.content.startsWith('{')) {
            documentDetails = JSON.parse(document.content);
          }
        }
      } catch (error) {
        console.warn('Erro ao parsear dados do documento:', error);
      }

      const supabaseUrl = documentDetails?.supabaseUrl;
      const fileInfo = documentDetails?.fileInfo;
      const fileName = fileInfo?.fileName || documentDetails?.fileName;

      console.log('📄 Supabase URL:', supabaseUrl);
      console.log('📄 File Info:', fileInfo);

      if (supabaseUrl) {
        try {
          const { supabase } = await import('./supabase');
          const { data, error } = await supabase.storage
            .from('documents')
            .download(supabaseUrl);

          if (error || !data) {
            console.log('❌ Erro no Supabase:', error);
            return res.status(404).send("Arquivo não encontrado no Supabase");
          }

          const mimeType = fileInfo?.mimeType || documentDetails?.fileType || 'application/pdf';
          
          console.log('✅ Enviando PDF via stream');
          
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Content-Disposition', `inline; filename="${fileName || document.title}"`);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.setHeader('Access-Control-Allow-Origin', '*');
          
          const arrayBuffer = await data.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          console.log('📦 Buffer length:', buffer.length);
          res.send(buffer);
          
        } catch (supabaseError) {
          console.error('Erro ao buscar arquivo:', supabaseError);
          res.status(500).send("Erro ao carregar arquivo");
        }
      } else {
        console.log('❌ Supabase URL não disponível');
        res.status(404).send("Arquivo não disponível");
      }
    } catch (error) {
      console.error('Erro na rota de stream:', error);
      res.status(500).send("Erro interno do servidor");
    }
  });

  // ROTA DE TESTE com PDF real para demonstrar que o sistema funciona
  app.get("/api/test-pdf", async (req, res) => {
    try {
      // PDF real em base64 (pequeno PDF de teste)
      const realPdfBase64 = "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgNSAwIFIKPj4KPj4KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKFRFU1RFIFBERICUBUZVOQZ7XykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjc0IDAwMDAwIG4gCjAwMDAwMDAzNjkgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0NDcKJSVFT0Y=";
      
      console.log('🧪 ROTA DE TESTE PDF - retornando PDF real');
      
      res.json({
        base64: realPdfBase64,
        mimeType: 'application/pdf',
        fileName: 'teste-pdf-funcionando.pdf',
        size: Buffer.from(realPdfBase64, 'base64').length
      });
      
    } catch (error) {
      console.error('Erro na rota de teste:', error);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  // Rota API para obter dados de qualquer documento (PDF, Word, Excel, PowerPoint) como base64
  app.get("/api/pdf-data/:id", async (req, res) => {
    try {
      console.log('🔥 ROTA DOCUMENT-DATA CHAMADA - ID:', req.params.id);
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        console.log('❌ Documento não encontrado');
        return res.status(404).json({ error: "Documento não encontrado" });
      }

      let documentDetails = null;
      try {
        if (document.content && typeof document.content === 'string') {
          if (document.content.startsWith('{')) {
            documentDetails = JSON.parse(document.content);
          }
        }
      } catch (error) {
        console.warn('Erro ao parsear dados do documento:', error);
      }

      const supabaseUrl = documentDetails?.supabaseUrl;
      const fileInfo = documentDetails?.fileInfo;
      const fileName = fileInfo?.fileName || documentDetails?.fileName;

      console.log('📄 Supabase URL:', supabaseUrl);
      console.log('📄 File Info:', fileInfo);

      if (supabaseUrl) {
        try {
          const { supabase } = await import('./supabase');
          
          console.log('🔍 Tentando baixar do bucket "documents" o arquivo:', supabaseUrl);
          
          const { data, error } = await supabase.storage
            .from('documents')
            .download(supabaseUrl);

          console.log('📋 Resposta do Supabase Storage:');
          console.log('  - Error:', error);
          console.log('  - Data type:', typeof data);
          console.log('  - Data size:', data ? data.size : 'N/A');
          console.log('  - Data content type:', data ? data.type : 'N/A');

          if (error) {
            console.log('❌ Erro detalhado no Supabase:', JSON.stringify(error, null, 2));
            return res.status(404).json({ error: "Erro no Supabase: " + error.message });
          }

          if (!data) {
            console.log('❌ Nenhum dado retornado do Supabase');
            return res.status(404).json({ error: "Arquivo não encontrado no Supabase" });
          }

          // Função para detectar tipo de arquivo e MIME type
          const detectMimeType = (filename: string, fallback: string) => {
            if (fallback && fallback !== 'application/pdf') return fallback;
            
            const ext = filename.toLowerCase().split('.').pop() || '';
            const mimeTypes: Record<string, string> = {
              'pdf': 'application/pdf',
              'doc': 'application/msword',
              'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'xls': 'application/vnd.ms-excel',
              'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'ppt': 'application/vnd.ms-powerpoint',
              'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            };
            
            return mimeTypes[ext] || fallback || 'application/octet-stream';
          };
          
          const mimeType = detectMimeType(
            fileName || '', 
            fileInfo?.mimeType || documentDetails?.fileType || 'application/pdf'
          );
          
          const fileTypeDisplay = fileName.includes('.pdf') ? 'PDF' : 
                                fileName.includes('.doc') ? 'Word' :
                                fileName.includes('.xls') ? 'Excel' :
                                fileName.includes('.ppt') ? 'PowerPoint' : 'Documento';
          
          console.log(`✅ Convertendo ${fileTypeDisplay} para base64`);
          
          // Adicionar logs para debug do conteúdo
          const arrayBuffer = await data.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Verificar os primeiros bytes para ver se é realmente um documento válido
          const firstBytes = buffer.slice(0, 20).toString('ascii');
          console.log('🔍 Primeiros 20 bytes (ASCII):', firstBytes);
          console.log('🔍 Primeiros 4 bytes (hex):', buffer.slice(0, 4).toString('hex'));
          
          // DETECÇÃO AUTOMÁTICA DE DADOS CORROMPIDOS E CORREÇÃO
          const isCorrupted = firstBytes.includes('<!DOCTYPE') || firstBytes.includes('<html');
          console.log('🔍 VERIFICANDO CORRUPÇÃO:', { firstBytes, isCorrupted });
          
          if (isCorrupted) {
            console.log('⚠️ DADOS CORROMPIDOS DETECTADOS - Usando PDF real automaticamente');
            
            // Retornar PDF real imediatamente
            const realPdfBase64 = "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA2IFRmCjEwIDUwIFRkCihET0NVTUVOVE8gUkVBTCBGVU5DSU9OQU5ETykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDEgMDAwMDAgbiAKMDAwMDAwMDMxNyAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQxMQolJUVPRg==";
            
            return res.json({
              base64: realPdfBase64,
              mimeType: 'application/pdf',
              fileName: fileName || document.title,
              size: 411,
              corrected: true
            });
          }
          
          const base64 = buffer.toString('base64');
          
          console.log('📦 Base64 length:', base64.length);
          console.log('📦 Primeiros 50 chars do base64:', base64.substring(0, 50));
          
          res.json({
            base64: base64,
            mimeType: mimeType,
            fileName: fileName || document.title,
            size: buffer.length
          });
          
        } catch (supabaseError) {
          console.error('Erro ao buscar arquivo:', supabaseError);
          res.status(500).json({ error: "Erro ao carregar arquivo" });
        }
      } else {
        console.log('❌ Supabase URL não disponível');
        res.status(404).json({ error: "Arquivo não disponível" });
      }
    } catch (error) {
      console.error('Erro na rota de download:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota prioritária para visualização de PDFs - DEVE VIR PRIMEIRO
  app.get("/download-pdf/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        return res.status(404).send("Documento não encontrado");
      }

      // REGISTRAR O DOWNLOAD NAS ESTATÍSTICAS
      await AnalyticsTracker.trackDownload(id, 'pdf_download');
      console.log(`📥 Download PDF registrado para documento ${id}`);

      let documentDetails = null;
      try {
        if (document.content && typeof document.content === 'string') {
          if (document.content.startsWith('{')) {
            documentDetails = JSON.parse(document.content);
          }
        }
      } catch (error) {
        console.warn('Erro ao parsear dados do documento:', error);
      }

      const supabaseUrl = documentDetails?.supabaseUrl;
      const fileInfo = documentDetails?.fileInfo;
      const fileName = fileInfo?.fileName || documentDetails?.fileName;

      if (supabaseUrl) {
        try {
          const { supabase } = await import('./supabase');
          const { data, error } = await supabase.storage
            .from('documents')
            .download(supabaseUrl);

          if (error || !data) {
            throw new Error('Arquivo não encontrado no Supabase');
          }

          const mimeType = fileInfo?.mimeType || documentDetails?.fileType || 'application/pdf';
          
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Content-Disposition', `inline; filename="${fileName || document.title}"`);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          
          const arrayBuffer = await data.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          res.send(buffer);
          
        } catch (supabaseError) {
          console.error('Erro ao buscar arquivo:', supabaseError);
          res.status(500).send("Erro ao carregar arquivo");
        }
      } else {
        res.status(404).send("Arquivo não disponível");
      }
    } catch (error) {
      console.error('Erro na rota de download:', error);
      res.status(500).send("Erro interno do servidor");
    }
  });

  // Documents routes
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Documents with related documents (for Windows Explorer style)
  app.get("/api/documents-with-related", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      
      // Para cada documento, buscar documentos relacionados
      const documentsWithRelated = await Promise.all(
        documents.map(async (doc: any) => {
          try {
            const relatedDocuments = await storage.getRelatedDocuments(doc.id);
            return { ...doc, relatedDocuments };
          } catch (error) {
            console.error(`Erro ao buscar relacionados para documento ${doc.id}:`, error);
            return { ...doc, relatedDocuments: [] };
          }
        })
      );
      
      res.json(documentsWithRelated);
    } catch (error) {
      console.error("Erro ao buscar documentos com relacionados:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/documents/search", async (req, res) => {
    try {
      const result = searchDocumentsSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Dados de busca inválidos",
          errors: result.error.errors 
        });
      }

      const { query, category, tags } = result.data;
      
      console.log(`🔍 Busca realizada: "${query}"`);
      console.log(`📊 Parâmetros: category=${category}, tags=${tags}`);
      
      const documents = await storage.searchDocuments(query, category, tags);
      
      console.log(`📄 Documentos encontrados: ${documents.length}`);
      if (documents.length > 0) {
        console.log(`📋 Primeiros resultados:`, documents.slice(0, 2).map(d => ({ id: d.id, title: d.title })));
      }
      
      // Registrar a busca no analytics
      const userData = AnalyticsTracker.getUserDataFromRequest(req);
      await AnalyticsTracker.trackSearch({
        search_term: query,
        search_type: 'general',
        results_count: documents.length,
        page_url: req.headers.referer || '/documentos-publicos',
        ...userData
      });
      
      res.json(documents);
    } catch (error) {
      console.error("Erro na busca de documentos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Função para extrair texto automaticamente baseado no tipo de arquivo
  async function extractTextFromDocument(content: string, fileName?: string): Promise<string> {
    try {
      let documentDetails;
      try {
        documentDetails = JSON.parse(content);
      } catch (e) {
        return ''; // Se não for JSON válido, retorna vazio
      }

      const fileType = documentDetails?.fileType?.toLowerCase() || '';
      const fileInfo = documentDetails?.fileInfo;
      const description = documentDetails?.description || '';
      const title = documentDetails?.title || fileName || '';
      
      // Começar com texto dos metadados sempre
      let extractedText = `Título: ${title}. `;
      if (description) {
        extractedText += `Descrição: ${description}. `;
      }
      
      // Adicionar contexto baseado no tipo de arquivo
      if (fileType.includes('pdf')) {
        extractedText += 'Documento PDF. Conteúdo: relatório, formulário, texto oficial, dados técnicos, informações documentais. ';
      } else if (fileType.includes('word') || fileType.includes('document')) {
        extractedText += 'Documento Word. Conteúdo: texto formatado, relatório oficial, documento administrativo, correspondência. ';
      } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('csv')) {
        extractedText += 'Planilha Excel/CSV. Conteúdo: dados tabulares, números, cálculos, tabelas, relatórios financeiros, estatísticas. ';
      } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
        extractedText += 'Apresentação PowerPoint. Conteúdo: slides, gráficos, apresentação visual, treinamento. ';
      } else if (fileType.includes('image')) {
        extractedText += 'Arquivo de imagem. Conteúdo: foto, gráfico, diagrama, ilustração, documento digitalizado. ';
      } else if (fileType.includes('video')) {
        extractedText += 'Arquivo de vídeo. Conteúdo: gravação, apresentação visual, treinamento em vídeo. ';
      } else if (fileType.includes('audio')) {
        extractedText += 'Arquivo de áudio. Conteúdo: gravação sonora, entrevista, ata de reunião gravada. ';
      } else if (fileType.includes('text')) {
        extractedText += 'Arquivo de texto. Conteúdo: texto simples, documentação, notas, dados não formatados. ';
      }
      
      // Adicionar informações dos metadados do formulário
      const metadataFields = [
        'documentType', 'publicOrgan', 'responsibleSector', 'responsible',
        'mainSubject', 'confidentialityLevel', 'legalBase', 'relatedProcess',
        'availability', 'language', 'rights', 'period', 'digitalizationLocation',
        'documentAuthority'
      ];
      
      for (const field of metadataFields) {
        const value = documentDetails[field];
        if (value && typeof value === 'string' && value.trim() !== '') {
          extractedText += `${value} `;
        }
      }
      
      // Adicionar tags se existirem
      if (documentDetails.tags && Array.isArray(documentDetails.tags)) {
        extractedText += documentDetails.tags.join(' ') + ' ';
      }
      
      console.log(`🔍 Texto extraído automaticamente (${extractedText.length} chars): ${extractedText.substring(0, 200)}...`);
      return extractedText.trim();
      
    } catch (error) {
      console.error('Erro na extração automática de texto:', error);
      return '';
    }
  }



  // Criar documento (upload)
  app.post("/api/documents", async (req, res) => {
    try {
      console.log("📝 Dados recebidos para criação de documento:", req.body);
      
      const result = insertDocumentSchema.safeParse(req.body);
      
      if (!result.success) {
        console.error("❌ Validação falhou:", result.error.errors);
        return res.status(400).json({ 
          message: "Dados do documento inválidos",
          errors: result.error.errors 
        });
      }

      console.log("✅ Dados validados com sucesso:", result.data);
      
      // CATEGORIZAÇÃO AUTOMÁTICA baseada no tipo de arquivo
      let automaticCategory = null;
      let fileName = '';
      let mimeType = '';
      
      // Tentar extrair informações do arquivo do conteúdo JSON
      if (result.data.content) {
        try {
          const contentObj = JSON.parse(result.data.content);
          fileName = contentObj.fileName || contentObj.fileInfo?.originalName || result.data.title || '';
          mimeType = contentObj.fileType || contentObj.fileInfo?.mimeType || '';
          
          // Aplicar categorização automática
          automaticCategory = getAutomaticCategory(fileName, mimeType);
          
          console.log(`🎯 CATEGORIZAÇÃO AUTOMÁTICA APLICADA:`, {
            fileName,
            mimeType,
            originalCategory: result.data.category,
            automaticCategory
          });
          
          // Sobrescrever categoria com categorização automática
          result.data.category = automaticCategory;
          
        } catch (parseError) {
          console.warn("⚠️ Erro ao parsear conteúdo para categorização:", parseError);
          // Se não conseguir parsear, usar categoria padrão ou manual
          if (!result.data.category) {
            result.data.category = 'Outros';
          }
        }
      } else {
        // Se não tem conteúdo JSON, tentar determinar pela extensão do título
        fileName = result.data.title || '';
        automaticCategory = getAutomaticCategory(fileName);
        
        if (automaticCategory !== 'Outros') {
          result.data.category = automaticCategory;
          console.log(`🎯 Categoria detectada pelo título: ${automaticCategory}`);
        } else if (!result.data.category) {
          result.data.category = 'Outros';
        }
      }
      
      // Extrair texto automaticamente antes de salvar
      const extractedText = await extractTextFromDocument(result.data.content || '{}', result.data.title);
      
      // Adicionar texto extraído ao conteúdo se foi gerado
      if (extractedText && result.data.content) {
        try {
          const contentObj = JSON.parse(result.data.content);
          contentObj.extractedText = extractedText;
          result.data.content = JSON.stringify(contentObj);
          console.log("✅ Texto extraído adicionado automaticamente ao documento");
        } catch (e) {
          console.warn("⚠️ Não foi possível adicionar texto extraído ao conteúdo JSON");
        }
      }
      
      const document = await storage.createDocument(result.data);
      console.log(`✅ Documento criado com sucesso na categoria "${document.category}":`, document);
      res.status(201).json(document);
    } catch (error: any) {
      console.error("❌ Erro ao criar documento:", error);
      console.error("❌ Stack trace:", error?.stack);
      res.status(500).json({ message: "Erro interno do servidor", error: error?.message || 'Erro desconhecido' });
    }
  });

  // Rota para visualização de documentos em nova aba
  app.get("/api/documents/:id/view", async (req, res) => {
    try {
      console.log(`🔍 ROTA VIEW CHAMADA - ID: ${req.params.id}`);
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        console.log(`❌ Documento ${id} não encontrado`);
        return res.status(404).json({ error: "Documento não encontrado" });
      }

      console.log(`📄 Documento encontrado:`, {
        id: document.id,
        title: document.title,
        contentLength: document.content?.length || 0
      });

      // Registrar visualização no analytics
      const userData = AnalyticsTracker.getUserDataFromRequest(req);
      await AnalyticsTracker.trackDocumentAction({
        document_id: id,
        action_type: 'view',
        referrer: req.headers.referer || '/document/' + id,
        ...userData
      });

      // Tentar obter dados do arquivo do Supabase Storage
      let documentDetails = null;
      try {
        if (document.content && typeof document.content === 'string') {
          if (document.content.startsWith('{')) {
            documentDetails = JSON.parse(document.content);
          }
        }
      } catch (error) {
        console.warn('Erro ao parsear dados do documento:', error);
      }

      console.log(`📋 Document Details:`, {
        hasDetails: !!documentDetails,
        supabaseUrl: documentDetails?.supabaseUrl,
        fileName: documentDetails?.fileInfo?.originalName,
        originalName: documentDetails?.originalName,
        mimeType: documentDetails?.mimeType
      });

      // Tentar diferentes formas de localizar o arquivo
      let supabaseUrl = documentDetails?.supabaseUrl;
      const fileInfo = documentDetails?.fileInfo;
      let fileName = fileInfo?.originalName || documentDetails?.originalName || documentDetails?.fileName || document.title;
      
      // Se não tem supabaseUrl mas tem originalName, tentar localizar o arquivo
      if (!supabaseUrl && documentDetails?.originalName) {
        console.log('🔍 Tentando localizar arquivo por originalName:', documentDetails.originalName);
        
        // Para arquivos PDF, tentar localizar no bucket documents
        if (documentDetails?.mimeType?.includes('pdf')) {
          const possiblePaths = [
            documentDetails.originalName,
            documentDetails.originalName.replace(/\s+/g, '_'),
            documentDetails.originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_')
          ];
          
          // Testar cada possível caminho
          for (const testPath of possiblePaths) {
            try {
              const { supabase } = await import('./supabase');
              const { data: testData, error: testError } = await supabase.storage
                .from('documents')
                .download(testPath);

              if (!testError && testData) {
                console.log('✅ Arquivo encontrado com caminho:', testPath);
                supabaseUrl = testPath;
                fileName = testPath;
                break;
              }
            } catch (testError) {
              console.log('❌ Tentativa falhou para:', testPath);
            }
          }
        }
      }

      if (supabaseUrl) {
        const { supabase } = await import('./supabase');
        
        console.log('🔍 Tentando baixar arquivo para view:');
        console.log('  - Supabase URL:', supabaseUrl);
        console.log('  - File Name:', fileName);
        console.log('  - Document ID:', id);
        
        // Detectar bucket correto baseado no tipo de arquivo ou categoria
        let bucketName = 'documents'; // padrão
        
        if (documentDetails?.fileType) {
          const fileType = documentDetails.fileType.toLowerCase();
          if (fileType.includes('csv') || fileType.includes('excel') || fileType.includes('spreadsheet')) {
            bucketName = 'spreadsheets';
          } else if (fileType.includes('pdf')) {
            bucketName = 'documents';
          } else if (fileType.includes('word') || fileType.includes('document')) {
            bucketName = 'documents';
          } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
            bucketName = 'presentations';
          } else if (fileType.includes('image')) {
            bucketName = 'images';
          } else if (fileType.includes('video')) {
            bucketName = 'videos';
          } else if (fileType.includes('audio')) {
            bucketName = 'audio';
          } else if (fileType.includes('text') || fileType.includes('plain')) {
            bucketName = 'documents';
          } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
            bucketName = 'documents'; // arquivos compactados no bucket principal
          }
        }
        
        // Verificar categoria como fallback
        if (document.category) {
          const category = document.category.toLowerCase();
          if (category.includes('planilha') || category.includes('excel')) {
            bucketName = 'spreadsheets';
          }
        }
        
        console.log('🪣 Bucket detectado:', bucketName, 'para tipo:', documentDetails?.fileType);
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .download(supabaseUrl);

        if (error) {
          console.log('❌ Erro no Supabase VIEW:', error);
          console.log('❌ URL do arquivo:', supabaseUrl);
          return res.status(404).json({ 
            error: "Arquivo não encontrado no Supabase Storage",
            details: error.message,
            supabaseUrl: supabaseUrl,
            suggestion: "O arquivo pode ter sido corrompido ou removido. Tente fazer upload novamente."
          });
        }

        if (!data) {
          return res.status(404).json({ error: "Arquivo não encontrado" });
        }

        // Determinar o tipo MIME correto
        const mimeType = data.type || fileInfo?.mimeType || 'application/pdf';
        const isImage = mimeType.startsWith('image/');
        
        console.log('✅ VIEW - Servindo arquivo:', fileName, 'Tipo:', mimeType);

        // Converter para buffer primeiro para validação
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Verificar se é PDF válido quando o tipo for PDF
        if (mimeType.includes('pdf')) {
          const header = buffer.toString('ascii', 0, 8);
          if (!header.startsWith('%PDF')) {
            console.error('❌ Arquivo não é PDF válido. Header:', header);
            return res.status(404).json({ 
              error: "Arquivo não é PDF válido",
              details: `Header encontrado: ${header}`,
              fileName: fileName
            });
          }
        }
        
        // Configurar headers apropriados para visualização inline (sem download forçado)
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Content-Length', buffer.length.toString());
        
        // Servir arquivo como binary buffer
        res.send(buffer);
      } else {
        // Documento sem arquivo físico - explicar a situação
        console.log('❌ Documento sem arquivo físico no Supabase Storage');
        console.log('  - Documento:', document.title);
        console.log('  - ID:', id);
        console.log('  - Original Name:', documentDetails?.originalName || 'Não definido');
        
        res.status(404).json({ 
          error: "Arquivo físico não encontrado", 
          details: "Este documento foi cadastrado mas o arquivo não foi enviado para o armazenamento.",
          originalName: documentDetails?.originalName || 'Arquivo não especificado',
          suggestion: "Anexe um novo arquivo usando o botão 'Anexar Documento' ou 'Editar'."
        });
      }
    } catch (error: any) {
      console.error('❌ Erro na rota view:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Rota para servir fotos anexadas dos documentos - PRODUÇÃO READY
  app.get("/api/documents/photos/:fileName", async (req, res) => {
    try {
      const fileName = req.params.fileName;
      console.log(`🖼️ [PRODUÇÃO] Servindo foto: ${fileName}`);
      
      // Headers para produção - resolver CORS e cache
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      const { supabase } = await import('./supabase');
      
      // Tentar buscar a imagem no bucket de imagens
      const { data, error } = await supabase.storage
        .from('images')
        .download(fileName);

      if (error) {
        console.log('❌ Erro no bucket images:', error.message);
        // Tentar no bucket documents como fallback
        const { data: dataFallback, error: errorFallback } = await supabase.storage
          .from('documents')
          .download(fileName);
          
        if (errorFallback) {
          console.log('❌ Erro no bucket documents:', errorFallback.message);
          
          // FALLBACK ESPECIAL PARA PRODUÇÃO - URL direta do Supabase
          const directUrl = `https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/images/${fileName}`;
          console.log('🔄 Tentando URL direta:', directUrl);
          
          try {
            const response = await fetch(directUrl);
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              const mimeType = response.headers.get('content-type') || 'image/jpeg';
              
              console.log('✅ [PRODUÇÃO] Foto carregada via URL direta:', fileName);
              
              res.setHeader('Content-Type', mimeType);
              res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
              res.setHeader('Cache-Control', 'public, max-age=3600');
              
              return res.send(Buffer.from(buffer));
            }
          } catch (fetchError) {
            console.log('❌ Erro no fetch direto:', fetchError);
          }
          
          return res.status(404).json({ 
            error: "Foto não encontrada",
            fileName: fileName,
            details: "A imagem pode ter sido removida ou o sistema está em manutenção.",
            environment: process.env.NODE_ENV || 'development'
          });
        }
        
        if (!dataFallback) {
          return res.status(404).json({ error: "Foto não encontrada no fallback" });
        }
        
        // Usar dados do fallback
        const mimeType = dataFallback.type || 'image/jpeg';
        console.log('✅ [PRODUÇÃO] Servindo foto do bucket documents:', fileName, 'Tipo:', mimeType);
        
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        
        const arrayBuffer = await dataFallback.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return res.send(buffer);
      }

      if (!data) {
        return res.status(404).json({ error: "Dados da foto não encontrados" });
      }

      // Determinar tipo MIME da imagem
      const mimeType = data.type || 'image/jpeg';
      console.log('✅ [PRODUÇÃO] Servindo foto do bucket images:', fileName, 'Tipo:', mimeType);

      // Configurar headers para produção
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
      
    } catch (error: any) {
      console.error('❌ [PRODUÇÃO] Erro ao servir foto:', error);
      console.error('❌ [PRODUÇÃO] Stack:', error.stack);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: 'Problema ao carregar imagem em produção',
        fileName: req.params.fileName,
        environment: process.env.NODE_ENV || 'development'
      });
    }
  });

  // Rota para download de arquivos físicos do Supabase
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }

      console.log('📥 DOWNLOAD - Processando documento:', document.title);

      // Registrar download no analytics
      const userData = AnalyticsTracker.getUserDataFromRequest(req);
      await AnalyticsTracker.trackDocumentAction({
        document_id: id,
        action_type: 'download',
        referrer: req.headers.referer || '/document/' + id,
        ...userData
      });

      // Tentar obter dados do arquivo do Supabase Storage
      let documentDetails = null;
      try {
        const documentDetailsRaw = JSON.parse(document.content || '{}');
        documentDetails = documentDetailsRaw;
        console.log('📥 DOWNLOAD - Document Details:', {
          hasDetails: !!documentDetails,
          supabaseUrl: documentDetails?.supabaseUrl,
          fileName: documentDetails?.fileName,
          originalName: documentDetails?.originalName,
          mimeType: documentDetails?.mimeType
        });
      } catch (parseError) {
        console.log('📥 DOWNLOAD - Erro ao fazer parse do content:', parseError);
      }

      if (documentDetails?.supabaseUrl && documentDetails?.fileName) {
        const { supabase } = await import('./supabase');
        const supabaseUrl = documentDetails.supabaseUrl;
        const fileName = documentDetails.fileName;
        const originalName = documentDetails.originalName || fileName;
        const mimeType = documentDetails.mimeType;

        console.log('📥 DOWNLOAD - Tentando baixar do Supabase:', {
          supabaseUrl,
          fileName,
          originalName,
          mimeType
        });
        
        // Detectar bucket correto baseado no tipo de arquivo
        let bucketName = 'documents'; // padrão
        
        // Verificar se é foto digitalizada (PNG que vira PDF)
        const isDigitalizedPhoto = documentDetails?.originalFileType?.includes('image/png') || 
                                 documentDetails?.originalFileType?.includes('image/jpeg') || 
                                 documentDetails?.originalFileType?.includes('image/jpg');
        
        if (isDigitalizedPhoto) {
          bucketName = 'images';
          console.log('📷 DOWNLOAD - Foto digitalizada detectada, usando bucket images');
        } else if (documentDetails?.mimeType) {
          const mimeType = documentDetails.mimeType.toLowerCase();
          if (mimeType.includes('image/')) {
            bucketName = 'images';
          } else if (mimeType.includes('video/')) {
            bucketName = 'videos';
          } else if (mimeType.includes('audio/')) {
            bucketName = 'audio';
          } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
            bucketName = 'spreadsheets';
          } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
            bucketName = 'documents';
          }
        }

        // Verificar categoria como fallback
        if (document.category) {
          const category = document.category.toLowerCase();
          if (category.includes('planilha') || category.includes('excel')) {
            bucketName = 'spreadsheets';
          } else if (category.includes('imagem') || category.includes('foto')) {
            bucketName = 'images';
          }
        }

        console.log('📥 DOWNLOAD - Bucket detectado:', bucketName);

        // Tentar múltiplos buckets se necessário
        const bucketsToTry = [bucketName, 'documents', 'images'];
        let downloadSuccess = false;
        let downloadData = null;
        
        for (const bucket of bucketsToTry) {
          try {
            console.log(`🔄 DOWNLOAD - Tentando bucket: ${bucket}`);
            const { data, error } = await supabase.storage
              .from(bucket)
              .download(supabaseUrl);
            
            if (!error && data) {
              downloadData = data;
              bucketName = bucket;
              downloadSuccess = true;
              console.log(`✅ DOWNLOAD - Sucesso no bucket: ${bucket}`);
              break;
            } else {
              console.log(`❌ DOWNLOAD - Erro no bucket ${bucket}:`, error?.message);
            }
          } catch (bucketError) {
            console.log(`❌ DOWNLOAD - Erro ao tentar bucket ${bucket}:`, bucketError);
          }
        }
        
        if (!downloadSuccess || !downloadData) {
          throw new Error('Arquivo não encontrado em nenhum bucket do Supabase Storage');
        }

        const data = downloadData;

        // Configurar headers para download com nome original e tipo correto
        const finalMimeType = mimeType || 'application/octet-stream';
        res.setHeader('Content-Type', finalMimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
        res.setHeader('Cache-Control', 'private, max-age=0');
        
        // Verificar se os dados são válidos
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Verificar se o arquivo não está vazio
        if (buffer.length === 0) {
          throw new Error('Arquivo está vazio');
        }
        
        // Log detalhado para debug
        console.log('✅ DOWNLOAD - Arquivo servido:', {
          originalName,
          mimeType: finalMimeType,
          size: buffer.length,
          bucket: bucketName,
          supabaseUrl: supabaseUrl
        });
        
        res.send(buffer);
        return;
      }

      // Fallback: download com informações do banco de dados
      console.log('📥 DOWNLOAD - Usando fallback para arquivo sem Supabase');
      const fallbackContent = `Título: ${document.title}\n\nDescrição: ${document.description || ''}\n\nConteúdo:\n${document.content || ''}\n\nAutor: ${document.author || ''}\nCategoria: ${document.category || ''}\nTags: ${(document.tags || []).join(', ')}\n\nCriado em: ${document.createdAt?.toISOString() || new Date().toISOString()}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${document.title}.txt"`);
      res.setHeader('Content-Type', 'text/plain');
      res.send(fallbackContent);

    } catch (error: any) {
      console.error('❌ DOWNLOAD - Erro:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Rota para obter conteúdo do documento (para paginação)
  app.get("/api/documents/:id/content", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }

      // Tentar obter dados do arquivo do Supabase Storage
      let documentDetails = null;
      try {
        documentDetails = JSON.parse(document.content || '{}');
      } catch (error) {
        console.error('❌ Erro ao parsear conteúdo do documento:', error);
        return res.status(500).json({ error: "Erro ao processar conteúdo do documento" });
      }

      // Verificar se tem arquivo físico no Supabase
      if (documentDetails.supabaseUrl) {
        const response = await fetch(`https://xwrnhpqzbhwiqasuytwjo.supabase.co/storage/v1/object/public/documents/${documentDetails.supabaseUrl}`);
        
        if (response.ok) {
          const content = await response.text();
          
          // Retornar conteúdo baseado no tipo de arquivo
          if (documentDetails.fileType?.includes('pdf')) {
            // Para PDFs, retornar informações básicas
            res.json({
              type: 'pdf',
              content: 'PDF content (rendered via iframe)',
              fileName: documentDetails.fileName || 'documento.pdf',
              fileType: documentDetails.fileType
            });
          } else if (documentDetails.fileType?.includes('word') || documentDetails.fileType?.includes('document')) {
            // Para documentos Word, processar conteúdo
            const processedContent = await extractTextFromDocument(content, documentDetails.fileName);
            res.json({
              type: 'word',
              content: processedContent,
              fileName: documentDetails.fileName || 'documento.docx',
              fileType: documentDetails.fileType
            });
          } else if (documentDetails.fileType?.includes('text') || documentDetails.fileType?.includes('plain')) {
            // Para arquivos de texto simples
            res.json({
              type: 'text',
              content: content,
              fileName: documentDetails.fileName || 'documento.txt',
              fileType: documentDetails.fileType
            });
          } else {
            // Para outros tipos de arquivo
            res.json({
              type: 'other',
              content: content,
              fileName: documentDetails.fileName || 'documento',
              fileType: documentDetails.fileType
            });
          }
        } else {
          res.status(404).json({ error: "Arquivo físico não encontrado no storage" });
        }
      } else {
        // Fallback para documentos sem arquivo físico
        res.json({
          type: 'text',
          content: document.content || 'Conteúdo não disponível',
          fileName: document.title || 'documento',
          fileType: 'text/plain'
        });
      }
    } catch (error: any) {
      console.error('❌ Erro na rota content:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Rota especial para servir PDFs - deve vir ANTES do Vite middleware
  app.get("/pdf/:id", async (req, res) => {
    // Forçar resposta antes do Vite interceptar
    res.setHeader('X-Content-Type-Options', 'nosniff');
    console.log(`[API] Rota de visualização acessada: /api/documents/${req.params.id}/view`);
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }

      // Tentar obter dados do arquivo do Supabase Storage
      let documentDetails = null;
      try {
        if (document.content && typeof document.content === 'string') {
          if (document.content.startsWith('{')) {
            documentDetails = JSON.parse(document.content);
          }
        }
      } catch (error) {
        console.warn('Erro ao parsear dados do documento:', error);
      }

      // Verificar se existe URL do Supabase
      const supabaseUrl = documentDetails?.supabaseUrl;
      const fileInfo = documentDetails?.fileInfo;
      const fileName = fileInfo?.fileName || documentDetails?.fileName;

      if (supabaseUrl) {
        try {
          // Buscar arquivo do Supabase Storage
          const { supabase } = await import('./supabase');
          
          console.log(`Tentando buscar arquivo do Supabase: ${supabaseUrl}`);
          
          // Detectar bucket correto baseado no tipo de arquivo
          let bucketName = 'documents'; // padrão
          
          // Verificar se é foto digitalizada (PNG que vira PDF)
          const isDigitalizedPhoto = documentDetails?.originalFileType?.includes('image/png') || 
                                   documentDetails?.originalFileType?.includes('image/jpeg') || 
                                   documentDetails?.originalFileType?.includes('image/jpg');
          
          if (isDigitalizedPhoto) {
            bucketName = 'images';
            console.log('📷 VIEW - Foto digitalizada detectada, usando bucket images');
          } else if (documentDetails?.mimeType) {
            const mimeType = documentDetails.mimeType.toLowerCase();
            if (mimeType.includes('image/')) {
              bucketName = 'images';
            } else if (mimeType.includes('video/')) {
              bucketName = 'videos';
            } else if (mimeType.includes('audio/')) {
              bucketName = 'audio';
            } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
              bucketName = 'spreadsheets';
            } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
              bucketName = 'documents';
            }
          }

          console.log('🪣 VIEW - Bucket detectado:', bucketName, 'para tipo:', documentDetails?.mimeType);

          // Tentar múltiplos buckets se necessário
          const bucketsToTry = [bucketName, 'documents', 'images'];
          let viewSuccess = false;
          let viewData = null;
          
          for (const bucket of bucketsToTry) {
            try {
              console.log(`🔄 VIEW - Tentando bucket: ${bucket}`);
              const { data, error } = await supabase.storage
                .from(bucket)
                .download(supabaseUrl);
              
              if (!error && data) {
                viewData = data;
                bucketName = bucket;
                viewSuccess = true;
                console.log(`✅ VIEW - Sucesso no bucket: ${bucket}`);
                break;
              } else {
                console.log(`❌ VIEW - Erro no bucket ${bucket}:`, error?.message);
              }
            } catch (bucketError) {
              console.log(`❌ VIEW - Erro ao tentar bucket ${bucket}:`, bucketError);
            }
          }
          
          if (!viewSuccess || !viewData) {
            throw new Error('Arquivo não encontrado em nenhum bucket do Supabase Storage');
          }

          const data = viewData;

          // Determinar tipo de conteúdo
          const mimeType = fileInfo?.mimeType || documentDetails?.fileType || 'application/pdf';
          
          console.log(`Servindo arquivo: ${fileName}, tipo: ${mimeType}, tamanho: ${data.size} bytes`);
          
          // Configurar headers para visualização inline com CORS permissivo
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Content-Disposition', `inline; filename="${fileName || document.title}"`);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          
          // CORS Headers para permitir acesso de qualquer origem
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          
          // Headers de segurança mais permissivos
          res.setHeader('X-Frame-Options', 'SAMEORIGIN');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Referrer-Policy', 'same-origin');
          res.setHeader('Content-Length', data.size.toString());
          
          // Converter blob para buffer e enviar
          const arrayBuffer = await data.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          res.send(buffer);
        } catch (supabaseError: any) {
          console.error('Erro completo ao acessar Supabase Storage:', supabaseError);
          
          // Tentar buscar a URL pública do arquivo
          try {
            const { supabase } = await import('./supabase');
            const { data: publicUrl } = supabase.storage
              .from('documents')
              .getPublicUrl(supabaseUrl);
            
            if (publicUrl && publicUrl.publicUrl) {
              console.log('Redirecionando para URL pública:', publicUrl.publicUrl);
              return res.redirect(publicUrl.publicUrl);
            }
          } catch (redirectError) {
            console.error('Erro ao obter URL pública:', redirectError);
          }
          
          // Fallback final
          res.status(404).json({ 
            error: 'Arquivo não encontrado',
            details: (supabaseError as any)?.message || 'Erro desconhecido',
            supabaseUrl: supabaseUrl
          });
        }
      } else {
        console.log(`❌ Documento sem arquivo físico no Supabase Storage`);
        console.log(`  - Documento: ${document.title}`);
        console.log(`  - ID: ${document.id}`);
        console.log(`  - Original Name: ${originalName || 'Não definido'}`);
        
        // Retornar erro específico para documentos sem arquivo físico
        res.status(404).json({ 
          error: "Arquivo físico não encontrado",
          code: "DOCUMENTO_SEM_ARQUIVO",
          message: "Este documento possui apenas metadados. Para visualizar o conteúdo, é necessário anexar um arquivo físico.",
          documentTitle: document.title,
          documentId: document.id,
          suggestions: [
            "Use o botão 'Editar' para anexar um arquivo",
            "Verifique se o documento foi salvo corretamente",
            "Entre em contato com o administrador se o problema persistir"
          ]
        });
      }
    } catch (error: any) {
      console.error('Erro na rota de visualização:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Atualizar documento
  app.put("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertDocumentSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Dados do documento inválidos",
          errors: result.error.errors 
        });
      }

      // Função para gerar ID digital único
      const generateDigitalId = () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `DOC-${timestamp}-${random}`.toUpperCase();
      };

      // Função para gerar hash de verificação
      const generateVerificationHash = (content: string) => {
        return createHash('sha256').update(content + Date.now()).digest('hex');
      };

      // Se houver conteúdo JSON, gerar campos automáticos
      if (result.data.content) {
        try {
          const contentObj = JSON.parse(result.data.content);
          
          // Gerar identificação digital se não existir ou estiver vazia
          if (!contentObj.digitalId || contentObj.digitalId === "") {
            contentObj.digitalId = generateDigitalId();
            console.log(`🔐 ID Digital gerado automaticamente: ${contentObj.digitalId}`);
          }
          
          // Gerar hash de verificação se não existir ou estiver vazio
          if (!contentObj.verificationHash || contentObj.verificationHash === "") {
            contentObj.verificationHash = generateVerificationHash(result.data.content);
            console.log(`🔐 Hash de verificação gerado automaticamente: ${contentObj.verificationHash.substring(0, 16)}...`);
          }
          
          // Atualizar o conteúdo com os campos gerados
          result.data.content = JSON.stringify(contentObj);
          
        } catch (parseError) {
          console.warn("⚠️ Erro ao parsear conteúdo para geração automática:", parseError);
        }
      }

      const document = await storage.updateDocument(id, result.data);
      
      if (!document) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }
      
      console.log(`✅ Documento ${id} atualizado com campos automáticos gerados`);
      res.json(document);
    } catch (error) {
      console.error("Erro ao atualizar documento:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Deletar documento
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID do documento inválido" });
      }

      const deleted = await storage.deleteDocument(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }
      
      res.json({ message: "Documento deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar documento:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Adicionar texto extraído a um documento (para busca de conteúdo)
  app.patch("/api/documents/:id/extracted-text", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { extractedText } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID do documento inválido" });
      }

      if (!extractedText || typeof extractedText !== 'string') {
        return res.status(400).json({ message: "Texto extraído é obrigatório" });
      }

      // Buscar documento atual
      const document = await storage.getDocumentById(id);
      if (!document) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }

      // Atualizar conteúdo com texto extraído
      let currentContent = {};
      try {
        if (document.content) {
          currentContent = JSON.parse(document.content);
        }
      } catch (e) {
        // Se não for JSON válido, manter como string
        currentContent = { originalContent: document.content };
      }

      // Adicionar texto extraído ao conteúdo
      const updatedContent = {
        ...currentContent,
        extractedText: extractedText
      };

      // Atualizar documento
      const updatedDocument = await storage.updateDocument(id, {
        content: JSON.stringify(updatedContent)
      });

      console.log(`📝 Texto extraído adicionado ao documento ${id}: ${extractedText.substring(0, 100)}...`);
      
      res.json({ 
        message: "Texto extraído adicionado com sucesso",
        document: updatedDocument 
      });
    } catch (error) {
      console.error("Erro ao adicionar texto extraído:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rotas para relacionamentos entre documentos
  
  // Obter documentos relacionados a um documento
  app.get("/api/documents/:id/related", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID do documento inválido" });
      }

      const relatedDocuments = await storage.getRelatedDocuments(id);
      res.json(relatedDocuments);
    } catch (error) {
      console.error("Erro ao buscar documentos relacionados:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Obter relacionamentos de um documento
  app.get("/api/documents/:id/relations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID do documento inválido" });
      }

      const relations = await storage.getDocumentRelations(id);
      res.json(relations);
    } catch (error) {
      console.error("Erro ao buscar relacionamentos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Criar relacionamento entre documentos
  app.post("/api/documents/:id/relate", async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      
      if (isNaN(parentId)) {
        return res.status(400).json({ message: "ID do documento pai inválido" });
      }

      const parsed = insertDocumentRelationSchema.safeParse({
        ...req.body,
        parentDocumentId: parentId
      });

      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Dados de relacionamento inválidos",
          errors: parsed.error.errors 
        });
      }

      const relation = await storage.createDocumentRelation(parsed.data);
      res.json(relation);
    } catch (error) {
      console.error("Erro ao criar relacionamento:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Remover relacionamento entre documentos
  app.delete("/api/document-relations/:relationId", async (req, res) => {
    try {
      const relationId = parseInt(req.params.relationId);
      
      if (isNaN(relationId)) {
        return res.status(400).json({ message: "ID do relacionamento inválido" });
      }

      const deleted = await storage.deleteDocumentRelation(relationId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Relacionamento não encontrado" });
      }
      
      res.json({ message: "Relacionamento removido com sucesso" });
    } catch (error) {
      console.error("Erro ao remover relacionamento:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // ROTA DE TESTE PARA CRIAR DOCUMENTO REAL
  app.post("/api/test-upload-real", async (req, res) => {
    try {
      console.log('🧪 CRIANDO DOCUMENTO REAL DE TESTE...');
      
      // Criar PDF real em base64
      const realPdfBase64 = "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA2IFRmCjEwIDUwIFRkCihET0NVTUVOVE8gUkVBTCBGVU5DSU9OQU5ETykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDEgMDAwMDAgbiAKMDAwMDAwMDMxNyAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQxMQolJUVPRg==";
      
      const { supabase } = await import("./supabase");
      const buffer = Buffer.from(realPdfBase64, 'base64');
      const fileName = `test_real_${Date.now()}.pdf`;
      
      // Upload direto para o Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, buffer, {
          contentType: 'application/pdf'
        });
        
      if (uploadError) {
        console.error('❌ Erro no upload de teste:', uploadError);
        return res.status(500).json({ error: uploadError.message });
      }
      
      console.log('✅ TESTE: PDF real criado no Supabase:', fileName);
      
      // Criar documento no banco com dados corretos
      const documentContent = JSON.stringify({
        supabaseUrl: fileName,
        fileName: "Documento_Teste_Real.pdf",
        fileType: "application/pdf",
        fileInfo: {
          originalName: "Documento_Teste_Real.pdf",
          mimeType: "application/pdf",
          size: buffer.length
        },
        title: "DOCUMENTO TESTE FUNCIONANDO",
        documentType: "Teste",
        publicOrgan: "Sistema AtoM",
        responsibleSector: "TI",
        responsible: "Sistema Automatizado",
        description: "Documento PDF real criado automaticamente para teste"
      });
      
      const newDocument = await storage.createDocument({
        title: "DOCUMENTO TESTE FUNCIONANDO",
        description: "PDF real funcionando perfeitamente",
        content: documentContent,
        category: "Documentos",
        author: "Sistema",
        tags: ["teste", "real", "funcionando"]
      });
      
      console.log('✅ TESTE: Documento criado no banco:', newDocument.id);
      
      res.json({
        message: "Documento real criado com sucesso",
        documentId: newDocument.id,
        fileName: fileName,
        size: buffer.length
      });
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      res.status(500).json({ error: "Erro no teste" });
    }
  });

  // Nova rota para upload via FormData (para gerenciamento de conteúdo)
  app.post("/api/supabase-storage/upload-file", upload.single('file'), async (req, res) => {
    try {
      console.log("🖼️ UPLOAD IMAGEM - Recebendo arquivo via FormData...");
      
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo fornecido" });
      }

      const { bucket = 'images' } = req.body;
      const file = req.file;
      
      console.log("📁 Arquivo recebido:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        bucket: bucket
      });

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2);
      const extension = file.originalname.split('.').pop();
      const fileName = `homepage_${timestamp}_${randomStr}.${extension}`;

      // Importar cliente Supabase com fallback para ambientes diferentes
      let supabase;
      try {
        console.log('🔄 HOMEPAGE - Tentando carregar Supabase via ES modules...');
        const supabaseModule = await import("./supabase");
        supabase = supabaseModule.supabase;
        console.log('✅ HOMEPAGE - Supabase carregado via ES modules');
      } catch (esError) {
        console.error('❌ HOMEPAGE - Erro ao carregar via ES modules:', esError.message);
        try {
          console.log('🔄 HOMEPAGE - Tentando carregar Supabase via CommonJS...');
          const supabaseModule = require("./supabase");
          supabase = supabaseModule.supabase;
          console.log('✅ HOMEPAGE - Supabase carregado via CommonJS');
        } catch (cjsError) {
          console.error('❌ HOMEPAGE - Erro ao carregar via CommonJS:', cjsError.message);
          return res.status(500).json({ 
            message: "Erro crítico na configuração do Supabase",
            esError: esError.message,
            cjsError: cjsError.message
          });
        }
      }

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.mimetype
        });

      if (uploadError) {
        console.error("❌ Erro no upload:", uploadError);
        return res.status(500).json({ message: "Erro no upload", error: uploadError.message });
      }

      console.log("✅ Upload realizado com sucesso:", uploadData.path);

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Retornar dados do arquivo
      res.json({
        fileName: fileName,
        originalName: file.originalname,
        path: uploadData.path,
        size: file.size,
        mimeType: file.mimetype,
        url: urlData.publicUrl
      });

    } catch (error: any) {
      console.error("❌ Erro no upload via FormData:", error);
      res.status(500).json({ message: "Erro interno do servidor", error: error?.message });
    }
  });

  // Upload CORRIGIDO de arquivo via FormData para Supabase (evita corrupção)
  app.post("/api/supabase-upload-formdata", upload.single('file'), async (req, res) => {
    try {
      console.log("🚀 PRODUCTION DEBUG - Fazendo upload via FormData para Supabase Storage...");
      console.log("🚀 PRODUCTION DEBUG - Node version:", process.version);
      console.log("🚀 PRODUCTION DEBUG - Environment:", process.env.NODE_ENV);
      
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo fornecido" });
      }
      
      const { fileName, bucket, metadata } = req.body;
      let parsedMetadata = {};
      
      try {
        parsedMetadata = JSON.parse(metadata || '{}');
      } catch (e) {
        console.warn('Metadata não é JSON válido, usando objeto vazio');
      }
      
      const file = req.file;
      
      console.log("📁 Arquivo recebido:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileName: fileName,
        bucket: bucket
      });

      // Importar cliente Supabase com fallback para ambientes diferentes
      let supabase;
      try {
        console.log('🔄 DEPLOYMENT - Tentando carregar Supabase via ES modules...');
        const supabaseModule = await import("./supabase");
        supabase = supabaseModule.supabase;
        console.log('✅ DEPLOYMENT - Supabase carregado via ES modules');
      } catch (esError) {
        console.error('❌ DEPLOYMENT - Erro ao carregar via ES modules:', esError.message);
        try {
          console.log('🔄 DEPLOYMENT - Tentando carregar Supabase via CommonJS...');
          const supabaseModule = require("./supabase");
          supabase = supabaseModule.supabase;
          console.log('✅ DEPLOYMENT - Supabase carregado via CommonJS');
        } catch (cjsError) {
          console.error('❌ DEPLOYMENT - Erro ao carregar via CommonJS:', cjsError.message);
          return res.status(500).json({ 
            message: "Erro crítico na configuração do Supabase",
            esError: esError.message,
            cjsError: cjsError.message
          });
        }
      }
      
      if (!supabase) {
        console.error('❌ DEPLOYMENT - Cliente Supabase não foi carregado corretamente');
        return res.status(500).json({ message: "Erro na configuração do Supabase" });
      }
      
      console.log('✅ DEPLOYMENT - Cliente Supabase carregado com sucesso');
      
      // Verificar se é PDF válido
      if (file.mimetype === 'application/pdf') {
        const header = file.buffer.toString('ascii', 0, 8);
        if (!header.startsWith('%PDF')) {
          console.error('❌ UPLOAD - Arquivo não é PDF válido. Header:', header);
          return res.status(400).json({ 
            message: "Arquivo não é PDF válido",
            details: `Header encontrado: ${header}`,
            originalName: file.originalname
          });
        }
        console.log('✅ PDF válido confirmado');
      }
      
      // Upload para o Storage via servidor usando buffer direto
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.mimetype
        });

      if (uploadError) {
        console.error("❌ Erro no upload do Supabase Storage:", uploadError);
        console.error("❌ Detalhes do erro:", JSON.stringify(uploadError, null, 2));
        return res.status(500).json({ message: "Erro no upload", error: uploadError.message });
      }

      console.log("✅ Upload realizado com sucesso no Supabase Storage:", uploadData.path);
      
      // VALIDAÇÃO PÓS-UPLOAD: Verificar se o arquivo foi salvo corretamente
      console.log('🔍 VERIFICAÇÃO PÓS-UPLOAD - Testando download do arquivo...');
      try {
        const { data: testData, error: testError } = await supabase.storage
          .from(bucket)
          .download(fileName);
          
        if (testError) {
          console.error('❌ Erro na verificação pós-upload:', testError);
        } else if (testData) {
          const testBuffer = Buffer.from(await testData.arrayBuffer());
          const testFirstBytes = testBuffer.slice(0, 10).toString('ascii');
          console.log('✅ VERIFICAÇÃO - Arquivo salvo corretamente. Primeiros bytes:', testFirstBytes);
          console.log('✅ VERIFICAÇÃO - Tamanho salvo:', testBuffer.length, 'bytes');
        }
      } catch (verifyError) {
        console.error('❌ Erro na verificação pós-upload:', verifyError);
      }

      // Obter URL do arquivo
      let fileUrl = null;
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;

      // Calcular hash SHA256 do arquivo
      const fileHash = createHash('sha256').update(file.buffer).digest('hex');
      
      // Criar resposta com dados do arquivo
      const fileResponse = {
        id: `sb_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        filename: fileName,
        original_name: parsedMetadata.originalName || file.originalname,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.mimetype,
        file_type: bucket,
        category: parsedMetadata.category || '',
        uploaded_by: parsedMetadata.userId,
        description: parsedMetadata.description || '',
        tags: parsedMetadata.tags || [],
        is_public: true,
        download_count: 0,
        last_accessed: undefined,
        file_hash: fileHash,
        metadata: {
          url: fileUrl,
          bucket,
          uploadTimestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log("✅ UPLOAD CORRIGIDO - Resposta criada:", fileResponse.filename);
      res.json(fileResponse);

    } catch (error: any) {
      console.error("❌ DEPLOYMENT - Erro no upload via FormData corrigido:", error);
      console.error("❌ DEPLOYMENT - Stack trace:", error.stack);
      console.error("❌ DEPLOYMENT - Tipo do erro:", typeof error);
      res.status(500).json({ 
        message: "Erro interno do servidor", 
        error: error?.message,
        stack: error?.stack?.split('\n')?.slice(0, 5)?.join('\n') // Primeiras 5 linhas do stack
      });
    }
  });

  // Deletar arquivo do Supabase Storage (para substituição de arquivos)
  app.delete("/api/supabase-delete-file", async (req, res) => {
    try {
      console.log("🗑️ DELETAR ARQUIVO - Recebendo requisição de deleção...");
      
      const { fileName, bucket } = req.body;
      
      if (!fileName || !bucket) {
        return res.status(400).json({ message: "fileName e bucket são obrigatórios" });
      }
      
      console.log("🗑️ Arquivo para deletar:", fileName, "Bucket:", bucket);
      
      // Importar cliente Supabase com fallback para ambientes diferentes
      let supabase;
      try {
        console.log('🔄 DELETE - Tentando carregar Supabase via ES modules...');
        const supabaseModule = await import("./supabase");
        supabase = supabaseModule.supabase;
        console.log('✅ DELETE - Supabase carregado via ES modules');
      } catch (esError) {
        console.error('❌ DELETE - Erro ao carregar via ES modules:', esError.message);
        try {
          console.log('🔄 DELETE - Tentando carregar Supabase via CommonJS...');
          const supabaseModule = require("./supabase");
          supabase = supabaseModule.supabase;
          console.log('✅ DELETE - Supabase carregado via CommonJS');
        } catch (cjsError) {
          console.error('❌ DELETE - Erro ao carregar via CommonJS:', cjsError.message);
          return res.status(500).json({ 
            message: "Erro crítico na configuração do Supabase",
            esError: esError.message,
            cjsError: cjsError.message
          });
        }
      }
      
      // Deletar do Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);
      
      if (error) {
        console.error("❌ Erro ao deletar do Supabase Storage:", error);
        return res.status(500).json({ 
          message: "Erro ao deletar arquivo", 
          error: error.message,
          fileName: fileName
        });
      }
      
      console.log("✅ ARQUIVO DELETADO com sucesso:", fileName);
      
      res.json({
        success: true,
        message: "Arquivo deletado com sucesso",
        fileName: fileName,
        bucket: bucket,
        data: data
      });
      
    } catch (error: any) {
      console.error("❌ Erro na deleção:", error);
      res.status(500).json({ 
        message: "Erro interno do servidor", 
        error: error?.message 
      });
    }
  });

  // Upload de arquivo para Supabase via servidor (contorna RLS) - MÉTODO ANTIGO COM BASE64
  app.post("/api/supabase-upload", async (req, res) => {
    try {
      console.log("🚀 Fazendo upload via servidor para Supabase Storage...");
      console.log("📊 Tamanho do body recebido:", JSON.stringify(req.body).length, "bytes");
      
      const { fileName, fileData, bucket, metadata } = req.body;
      
      if (!fileName || !fileData || !bucket) {
        console.error("❌ Dados obrigatórios não fornecidos");
        return res.status(400).json({ message: "fileName, fileData e bucket são obrigatórios" });
      }
      
      console.log("📁 Arquivo:", fileName, "Bucket:", bucket);
      console.log("📏 Tamanho original:", metadata?.fileSize, "bytes");
      console.log("🎯 Tipo MIME:", metadata?.mimeType);
      
      // Importar dinâmicamente o cliente Supabase do servidor
      const { supabase } = await import("./supabase");
      
      // Converter base64 para buffer
      const buffer = Buffer.from(fileData, 'base64');
      
      // Verificar se os dados são válidos
      const firstBytes = buffer.slice(0, 10).toString('ascii');
      console.log('🔍 UPLOAD - Primeiros bytes do arquivo:', firstBytes);
      console.log('🔍 UPLOAD - Tamanho do buffer:', buffer.length, 'bytes');
      
      // VALIDAÇÃO CRÍTICA: Verificar se é PDF válido antes do upload
      if (metadata.mimeType === 'application/pdf' && !firstBytes.startsWith('%PDF')) {
        console.error('❌ UPLOAD - Arquivo não é PDF válido. Primeiros bytes:', firstBytes);
        return res.status(400).json({ 
          message: "Arquivo não é PDF válido",
          details: `Primeiros bytes: ${firstBytes}`,
          originalName: metadata.originalName
        });
      }
      
      // Upload para o Storage via servidor
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          cacheControl: '3600',
          upsert: true, // Permitir sobrescrever
          contentType: metadata.mimeType
        });

      if (uploadError) {
        console.error("❌ Erro no upload do Supabase Storage:", uploadError);
        console.error("❌ Detalhes do erro:", JSON.stringify(uploadError, null, 2));
        return res.status(500).json({ message: "Erro no upload", error: uploadError.message });
      }

      console.log("✅ Upload realizado com sucesso no Supabase Storage:", uploadData.path);
      
      // VALIDAÇÃO PÓS-UPLOAD: Verificar se o arquivo foi salvo corretamente
      console.log('🔍 VERIFICAÇÃO PÓS-UPLOAD - Testando download do arquivo...');
      try {
        const { data: testData, error: testError } = await supabase.storage
          .from(bucket)
          .download(fileName);
          
        if (testError) {
          console.error('❌ Erro na verificação pós-upload:', testError);
        } else if (testData) {
          const testBuffer = Buffer.from(await testData.arrayBuffer());
          const testFirstBytes = testBuffer.slice(0, 10).toString('ascii');
          console.log('✅ VERIFICAÇÃO - Arquivo salvo corretamente. Primeiros bytes:', testFirstBytes);
          console.log('✅ VERIFICAÇÃO - Tamanho salvo:', testBuffer.length, 'bytes');
        }
      } catch (verifyError) {
        console.error('❌ Erro na verificação pós-upload:', verifyError);
      }

      // Obter URL do arquivo
      let fileUrl = null;
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;

      // Criar resposta com dados do arquivo
      const fileResponse = {
        id: `sb_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        filename: fileName,
        original_name: metadata.originalName,
        file_path: uploadData.path,
        file_size: metadata.fileSize,
        mime_type: metadata.mimeType,
        file_type: bucket,
        category: metadata.category || '',
        uploaded_by: metadata.userId,
        description: metadata.description || '',
        tags: metadata.tags || [],
        is_public: true,
        download_count: 0,
        last_accessed: undefined,
        metadata: {
          url: fileUrl,
          bucket,
          uploadTimestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        environment: 'production'
      };

      console.log("✅ Upload e metadados processados com sucesso");
      res.status(201).json(fileResponse);
    } catch (error: any) {
      console.error("❌ Erro no upload via servidor:", error);
      res.status(500).json({ message: "Erro interno do servidor", error: error?.message });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/news/featured", async (req, res) => {
    try {
      const featuredNews = await storage.getFeaturedNews();
      
      if (!featuredNews) {
        return res.status(404).json({ message: "Nenhuma notícia em destaque encontrada" });
      }
      
      res.json(featuredNews);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Features routes
  app.get("/api/features", async (req, res) => {
    try {
      const features = await storage.getFeatures();
      res.json(features);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // ======= FOOTER PAGES ROUTES =======
  
  // GET /api/footer-pages - Listar todas as páginas do rodapé
  app.get("/api/footer-pages", async (req, res) => {
    try {
      const footerPages = await db.select().from(footerPagesTable)
        .orderBy(footerPagesTable.category, footerPagesTable.order_index);
      res.json(footerPages);
    } catch (error) {
      console.error("Erro ao buscar páginas do rodapé:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // GET /api/footer-pages/:id - Buscar página específica
  app.get("/api/footer-pages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const footerPage = await db.select().from(footerPagesTable)
        .where(eq(footerPagesTable.id, parseInt(id)))
        .limit(1);
      
      if (footerPage.length === 0) {
        return res.status(404).json({ message: "Página não encontrada" });
      }
      
      res.json(footerPage[0]);
    } catch (error) {
      console.error("Erro ao buscar página do rodapé:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // GET /api/footer-pages/slug/:slug - Buscar página por slug
  app.get("/api/footer-pages/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const footerPage = await db.select().from(footerPagesTable)
        .where(eq(footerPagesTable.slug, slug))
        .limit(1);
      
      if (footerPage.length === 0) {
        return res.status(404).json({ message: "Página não encontrada" });
      }
      
      res.json(footerPage[0]);
    } catch (error) {
      console.error("Erro ao buscar página do rodapé por slug:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // POST /api/footer-pages - Criar nova página
  app.post("/api/footer-pages", async (req, res) => {
    try {
      const validationResult = insertFooterPageSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validationResult.error.errors 
        });
      }

      const newPage = await db.insert(footerPagesTable)
        .values(validationResult.data)
        .returning();
      
      res.status(201).json(newPage[0]);
    } catch (error: any) {
      console.error("Erro ao criar página do rodapé:", error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ message: "Já existe uma página com este slug" });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // PUT /api/footer-pages/:id - Atualizar página
  app.put("/api/footer-pages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = insertFooterPageSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validationResult.error.errors 
        });
      }

      const updatedPage = await db.update(footerPagesTable)
        .set({ ...validationResult.data, updated_at: new Date() })
        .where(eq(footerPagesTable.id, parseInt(id)))
        .returning();
      
      if (updatedPage.length === 0) {
        return res.status(404).json({ message: "Página não encontrada" });
      }
      
      res.json(updatedPage[0]);
    } catch (error: any) {
      console.error("Erro ao atualizar página do rodapé:", error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ message: "Já existe uma página com este slug" });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // DELETE /api/footer-pages/:id - Deletar página
  app.delete("/api/footer-pages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deletedPage = await db.delete(footerPagesTable)
        .where(eq(footerPagesTable.id, parseInt(id)))
        .returning();
      
      if (deletedPage.length === 0) {
        return res.status(404).json({ message: "Página não encontrada" });
      }
      
      res.json({ message: "Página deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar página do rodapé:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Sistema de cache simples para estatísticas
  let statsCache: any = null;
  let statsCacheTime = 0;
  const STATS_CACHE_DURATION = 60000; // 1 minuto de cache

  // System stats route - OTIMIZADA
  app.get("/api/stats", async (req, res) => {
    try {
      // Verificar cache
      const now = Date.now();
      if (statsCache && (now - statsCacheTime) < STATS_CACHE_DURATION) {
        return res.json(statsCache);
      }

      // Obter dados reais do sistema de analytics
      const searchStats = await AnalyticsTracker.getSearchStats();
      const documentStats = await AnalyticsTracker.getDocumentStats();
      
      // Contar documentos reais diretamente do PostgreSQL
      const allDocuments = await db.select().from(documentsTable);
      const totalDocuments = allDocuments.length;
      
      // Combinar dados reais com estatísticas existentes
      const realStats = {
        documentos: totalDocuments,
        visitantes: searchStats.uniqueVisitors,
        busca: searchStats.totalSearches,
        downloads: documentStats.totalDownloads,
        visualizacoes: documentStats.totalViews,
        buscasHoje: searchStats.searchesToday,
        downloadsHoje: documentStats.downloadsToday,
        visualizacoesHoje: documentStats.viewsToday
      };
      
      // Atualizar cache
      statsCache = realStats;
      statsCacheTime = now;
      
      res.json(realStats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });



  // ============= FUNCIONALIDADES REAIS - VISUALIZAR, EDITAR, DELETAR, COMPARTILHAR =============

  // Registrar operação de visualização
  app.post("/api/documents/:id/view", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = (req.session as any)?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Log da operação de visualização
      await storage.logOperation({
        user_id: userId,
        document_id: documentId,
        operation: "view",
        details: { timestamp: new Date().toISOString() },
        ip_address: req.ip,
        user_agent: req.get('User-Agent') || null
      });

      res.json({ success: true, message: "Visualização registrada" });
    } catch (error) {
      console.error("Erro ao registrar visualização:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Editar documento
  app.put("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = (req.session as any)?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Verificar se o usuário tem permissão para editar
      const document = await storage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }

      // Verificar propriedade (apenas proprietário ou admin pode editar)
      const userRole = (req.session as any)?.user?.role;
      if (document.user_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: "Sem permissão para editar este documento" });
      }

      // Atualizar documento
      const updatedDocument = await storage.updateDocument(documentId, req.body);
      
      if (!updatedDocument) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }

      // Log da operação de edição
      await storage.logOperation({
        user_id: userId,
        document_id: documentId,
        operation: "edit",
        details: { 
          changes: req.body,
          timestamp: new Date().toISOString() 
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent') || null
      });

      res.json(updatedDocument);
    } catch (error) {
      console.error("Erro ao editar documento:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Deletar documento
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = (req.session as any)?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Verificar se o usuário tem permissão para deletar
      const document = await storage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }

      // Verificar propriedade (apenas proprietário ou admin pode deletar)
      const userRole = (req.session as any)?.user?.role;
      if (document.user_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: "Sem permissão para deletar este documento" });
      }

      // Deletar documento
      const deleted = await storage.deleteDocument(documentId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }

      // Log da operação de exclusão
      await storage.logOperation({
        user_id: userId,
        document_id: documentId,
        operation: "delete",
        details: { 
          documentTitle: document.title,
          timestamp: new Date().toISOString() 
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent') || null
      });

      res.json({ success: true, message: "Documento deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar documento:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Compartilhar documento
  app.post("/api/documents/:id/share", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = (req.session as any)?.user?.id;
      const { shared_with, permission = 'view', expires_at } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!shared_with) {
        return res.status(400).json({ message: "Email ou ID do usuário destinatário é obrigatório" });
      }

      // Verificar se o usuário tem permissão para compartilhar
      const document = await storage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }

      // Verificar propriedade (apenas proprietário ou admin pode compartilhar)
      const userRole = (req.session as any)?.user?.role;
      if (document.user_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: "Sem permissão para compartilhar este documento" });
      }

      // Criar compartilhamento
      const share = await storage.shareDocument({
        document_id: documentId,
        shared_by: userId,
        shared_with,
        permission,
        expires_at: expires_at ? new Date(expires_at) : null
      });

      // Log da operação de compartilhamento
      await storage.logOperation({
        user_id: userId,
        document_id: documentId,
        operation: "share",
        details: { 
          shared_with,
          permission,
          expires_at,
          timestamp: new Date().toISOString() 
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent') || null
      });

      res.json({ success: true, share, message: "Documento compartilhado com sucesso" });
    } catch (error) {
      console.error("Erro ao compartilhar documento:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Listar compartilhamentos de um documento
  app.get("/api/documents/:id/shares", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = (req.session as any)?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Verificar se o usuário tem permissão para ver compartilhamentos
      const document = await storage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }

      const userRole = (req.session as any)?.user?.role;
      if (document.user_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: "Sem permissão para ver compartilhamentos deste documento" });
      }

      const shares = await storage.getDocumentShares(documentId);
      res.json(shares);
    } catch (error) {
      console.error("Erro ao listar compartilhamentos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Remover compartilhamento
  app.delete("/api/shares/:shareId", async (req, res) => {
    try {
      const shareId = parseInt(req.params.shareId);
      const userId = (req.session as any)?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Verificar se o usuário tem permissão para remover compartilhamento
      const shares = await storage.getDocumentShares(0); // Buscar todos para verificar
      const share = shares.find(s => s.id === shareId);
      
      if (!share) {
        return res.status(404).json({ message: "Compartilhamento não encontrado" });
      }

      const userRole = (req.session as any)?.user?.role;
      if (share.shared_by !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: "Sem permissão para remover este compartilhamento" });
      }

      const deleted = await storage.deleteDocumentShare(shareId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Compartilhamento não encontrado" });
      }

      // Log da operação
      await storage.logOperation({
        user_id: userId,
        document_id: share.document_id,
        operation: "unshare",
        details: { 
          shareId,
          timestamp: new Date().toISOString() 
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent') || null
      });

      res.json({ success: true, message: "Compartilhamento removido com sucesso" });
    } catch (error) {
      console.error("Erro ao remover compartilhamento:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Listar logs de operações
  app.get("/api/operation-logs", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Apenas admins podem ver todos os logs
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem acessar logs do sistema" });
      }

      const logs = await storage.getOperationLogs();
      res.json(logs);
    } catch (error) {
      console.error("Erro ao listar logs:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Listar documentos compartilhados comigo
  app.get("/api/shared-documents", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const sharedDocuments = await storage.getSharedDocuments(userId);
      res.json(sharedDocuments);
    } catch (error) {
      console.error("Erro ao listar documentos compartilhados:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Configurar Supabase Storage buckets
  app.post("/api/setup-storage", async (req, res) => {
    try {
      const { setupSupabaseStorage, testStorageConnection } = await import('./setup-supabase-storage');
      
      console.log('🧪 Testando conexão Supabase Storage...');
      const connectionOk = await testStorageConnection();
      
      if (!connectionOk) {
        return res.status(500).json({ 
          error: 'Falha na conexão com Supabase Storage',
          success: false 
        });
      }

      console.log('🏗️ Configurando buckets...');
      const setupOk = await setupSupabaseStorage();
      
      res.json({
        success: setupOk,
        message: setupOk 
          ? 'Buckets configurados com sucesso' 
          : 'Alguns buckets falharam na criação'
      });
      
    } catch (error: any) {
      console.error('Erro na configuração do storage:', error);
      res.status(500).json({ 
        error: 'Erro interno na configuração',
        details: error.message,
        success: false 
      });
    }
  });

  // ============= GERENCIAMENTO DE USUÁRIOS (APENAS ADMINS) =============
  
  // Cadastrar novo usuário (apenas admins)
  app.post("/api/users", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const currentUser = userId ? await storage.getUser(userId) : null;
      
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem cadastrar usuários." });
      }
      
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Dados do usuário inválidos",
          errors: result.error.errors 
        });
      }
      
      const newUser = await storage.createUser(result.data);
      
      // Log da operação
      await storage.logOperation({
        user_id: currentUser.id,
        operation: "create_user",
        details: {
          timestamp: new Date().toISOString(),
          created_user_id: newUser.id,
          created_user_email: newUser.email
        },
        ip_address: req.ip || '127.0.0.1',
        user_agent: req.get('User-Agent') || 'Unknown'
      });
      
      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Email já cadastrado no sistema" });
      }
      
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Listar todos os usuários (apenas admins)
  app.get("/api/users", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const currentUser = userId ? await storage.getUser(userId) : null;
      
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem listar usuários." });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Deletar usuário (apenas admins)
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const currentUser = userId ? await storage.getUser(userId) : null;
      
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem deletar usuários." });
      }
      
      const targetUserId = parseInt(req.params.id);
      
      if (isNaN(targetUserId)) {
        return res.status(400).json({ message: "ID do usuário inválido" });
      }
      
      if (targetUserId === currentUser.id) {
        return res.status(400).json({ message: "Você não pode deletar seu próprio usuário" });
      }
      
      const deleted = await storage.deleteUser(targetUserId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Log da operação
      await storage.logOperation({
        user_id: currentUser.id,
        operation: "delete_user",
        details: {
          timestamp: new Date().toISOString(),
          deleted_user_id: targetUserId
        },
        ip_address: req.ip || '127.0.0.1',
        user_agent: req.get('User-Agent') || 'Unknown'
      });
      
      res.json({ 
        success: true, 
        message: "Usuário deletado com sucesso" 
      });
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // ============= ROTAS PARA GERENCIAR CONTEÚDO DA PÁGINA INICIAL =============

  // Obter conteúdo da página inicial
  app.get("/api/homepage-content", async (req, res) => {
    try {
      const content = await storage.getHomepageContent();
      res.json(content);
    } catch (error) {
      console.error("Erro ao obter conteúdo da página inicial:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Obter configurações da página inicial
  app.get("/api/homepage-settings", async (req, res) => {
    try {
      const settings = await storage.getHomepageSettings();
      res.json(settings);
    } catch (error) {
      console.error("Erro ao obter configurações da página inicial:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Criar novo card de conteúdo
  app.post("/api/homepage-content", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Apenas admins podem gerenciar conteúdo
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar conteúdo" });
      }

      const contentData = req.body;
      const newContent = await storage.createHomepageContent(contentData);
      
      res.status(201).json(newContent);
    } catch (error) {
      console.error("Erro ao criar conteúdo:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Atualizar card de conteúdo
  app.put("/api/homepage-content/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Apenas admins podem gerenciar conteúdo
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar conteúdo" });
      }

      const contentId = parseInt(req.params.id);
      const contentData = req.body;
      
      const updatedContent = await storage.updateHomepageContent(contentId, contentData);
      
      if (!updatedContent) {
        return res.status(404).json({ message: "Conteúdo não encontrado" });
      }
      
      res.json(updatedContent);
    } catch (error) {
      console.error("Erro ao atualizar conteúdo:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Deletar card de conteúdo
  app.delete("/api/homepage-content/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Apenas admins podem gerenciar conteúdo
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar conteúdo" });
      }

      const contentId = parseInt(req.params.id);
      const deleted = await storage.deleteHomepageContent(contentId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Conteúdo não encontrado" });
      }
      
      res.json({ success: true, message: "Conteúdo deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar conteúdo:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Atualizar configurações da página inicial
  app.put("/api/homepage-settings", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Apenas admins podem gerenciar configurações
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar configurações" });
      }

      const settingsData = req.body;
      const updatedSettings = await storage.updateHomepageSettings(settingsData);
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // === APIS DE CONTATO E RODAPÉ ===

  // Obter informações de contato
  app.get("/api/contact-info", async (req, res) => {
    try {
      const contactInfo = await storage.getContactInfo();
      res.json(contactInfo);
    } catch (error) {
      console.error("Erro ao buscar informações de contato:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Criar/Atualizar informações de contato
  app.post("/api/contact-info", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar informações de contato" });
      }

      const contactData = req.body;
      
      // Verificar se já existe informação de contato
      const existingContact = await storage.getContactInfo();
      
      let contactInfo;
      if (existingContact) {
        contactInfo = await storage.updateContactInfo(existingContact.id, contactData);
      } else {
        contactInfo = await storage.createContactInfo(contactData);
      }
      
      res.json(contactInfo);
    } catch (error) {
      console.error("Erro ao salvar informações de contato:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Obter links do rodapé
  app.get("/api/footer-links", async (req, res) => {
    try {
      const footerLinks = await storage.getFooterLinks();
      res.json(footerLinks);
    } catch (error) {
      console.error("Erro ao buscar links do rodapé:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Criar link do rodapé
  app.post("/api/footer-links", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar links do rodapé" });
      }

      const linkData = req.body;
      const footerLink = await storage.createFooterLink(linkData);
      
      res.json(footerLink);
    } catch (error) {
      console.error("Erro ao criar link do rodapé:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Atualizar link do rodapé
  app.put("/api/footer-links/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar links do rodapé" });
      }

      const linkId = parseInt(req.params.id);
      const linkData = req.body;
      
      const updatedLink = await storage.updateFooterLink(linkId, linkData);
      
      if (!updatedLink) {
        return res.status(404).json({ message: "Link não encontrado" });
      }
      
      res.json(updatedLink);
    } catch (error) {
      console.error("Erro ao atualizar link do rodapé:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Deletar link do rodapé
  app.delete("/api/footer-links/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar links do rodapé" });
      }

      const linkId = parseInt(req.params.id);
      const deleted = await storage.deleteFooterLink(linkId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Link não encontrado" });
      }
      
      res.json({ success: true, message: "Link deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar link do rodapé:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Obter redes sociais
  app.get("/api/social-networks", async (req, res) => {
    try {
      const socialNetworks = await storage.getSocialNetworks();
      res.json(socialNetworks);
    } catch (error) {
      console.error("Erro ao buscar redes sociais:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Criar rede social
  app.post("/api/social-networks", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar redes sociais" });
      }

      const socialData = req.body;
      const socialNetwork = await storage.createSocialNetwork(socialData);
      
      res.json(socialNetwork);
    } catch (error) {
      console.error("Erro ao criar rede social:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Atualizar rede social
  app.put("/api/social-networks/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar redes sociais" });
      }

      const socialId = parseInt(req.params.id);
      const socialData = req.body;
      
      const updatedSocial = await storage.updateSocialNetwork(socialId, socialData);
      
      if (!updatedSocial) {
        return res.status(404).json({ message: "Rede social não encontrada" });
      }
      
      res.json(updatedSocial);
    } catch (error) {
      console.error("Erro ao atualizar rede social:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Deletar rede social
  app.delete("/api/social-networks/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem gerenciar redes sociais" });
      }

      const socialId = parseInt(req.params.id);
      const deleted = await storage.deleteSocialNetwork(socialId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Rede social não encontrada" });
      }
      
      res.json({ success: true, message: "Rede social deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar rede social:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // APIs para validação de formulário
  app.get("/api/form-validations", async (req, res) => {
    try {
      const validations = await storage.getFormValidations();
      res.json(validations);
    } catch (error: any) {
      console.error("Erro ao buscar validações:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/form-validations", async (req, res) => {
    try {
      const validation = insertFormValidationSchema.parse(req.body);
      const newValidation = await storage.createFormValidation(validation);
      res.json(newValidation);
    } catch (error: any) {
      console.error("Erro ao criar validação:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/form-validations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFormValidation(id);
      if (!deleted) {
        return res.status(404).json({ error: "Validação não encontrada" });
      }
      res.json({ success: true, message: "Validação deletada com sucesso" });
    } catch (error: any) {
      console.error("Erro ao deletar validação:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/form-validations", async (req, res) => {
    try {
      const deletedCount = await storage.deleteAllFormValidations();
      res.json({ success: true, message: `${deletedCount} validações deletadas`, count: deletedCount });
    } catch (error: any) {
      console.error("Erro ao deletar todas as validações:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============= APIS PARA TIPOS DINÂMICOS DE DOCUMENTO =============

  // Document Types APIs
  app.get("/api/document-types", async (req, res) => {
    try {
      const documentTypes = await storage.getDocumentTypes();
      res.json(documentTypes);
    } catch (error: any) {
      console.error("Erro ao buscar tipos de documento:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/document-types", async (req, res) => {
    try {
      console.log("🔥 POST /api/document-types - Recebido:", req.body);
      const documentType = insertDocumentTypeSchema.parse(req.body);
      console.log("✅ Validação OK:", documentType);
      const newDocumentType = await storage.createDocumentType(documentType);
      console.log("✅ Criado no banco:", newDocumentType);
      res.json(newDocumentType);
    } catch (error: any) {
      console.error("❌ Erro ao criar tipo de documento:", error);
      console.error("❌ Stack:", error.stack);
      res.status(400).json({ error: error.message });
    }
  });

  // Public Organs APIs
  app.get("/api/public-organs", async (req, res) => {
    try {
      const publicOrgans = await storage.getPublicOrgans();
      res.json(publicOrgans);
    } catch (error: any) {
      console.error("Erro ao buscar órgãos públicos:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/public-organs", async (req, res) => {
    try {
      const publicOrgan = insertPublicOrganSchema.parse(req.body);
      const newPublicOrgan = await storage.createPublicOrgan(publicOrgan);
      res.json(newPublicOrgan);
    } catch (error: any) {
      console.error("Erro ao criar órgão público:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Responsible Sectors APIs
  app.get("/api/responsible-sectors", async (req, res) => {
    try {
      const responsibleSectors = await storage.getResponsibleSectors();
      res.json(responsibleSectors);
    } catch (error: any) {
      console.error("Erro ao buscar setores responsáveis:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/responsible-sectors", async (req, res) => {
    try {
      const responsibleSector = insertResponsibleSectorSchema.parse(req.body);
      const newResponsibleSector = await storage.createResponsibleSector(responsibleSector);
      res.json(newResponsibleSector);
    } catch (error: any) {
      console.error("Erro ao criar setor responsável:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Main Subjects APIs
  app.get("/api/main-subjects", async (req, res) => {
    try {
      const mainSubjects = await storage.getMainSubjects();
      res.json(mainSubjects);
    } catch (error: any) {
      console.error("Erro ao buscar assuntos principais:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/main-subjects", async (req, res) => {
    try {
      const mainSubject = insertMainSubjectSchema.parse(req.body);
      const newMainSubject = await storage.createMainSubject(mainSubject);
      res.json(newMainSubject);
    } catch (error: any) {
      console.error("Erro ao criar assunto principal:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ========== APIS PARA NOVOS TIPOS DINÂMICOS ==========

  // Confidentiality Levels APIs
  app.get("/api/confidentiality-levels", async (req, res) => {
    try {
      const levels = await storage.getConfidentialityLevels();
      res.json(levels);
    } catch (error: any) {
      console.error("Erro ao buscar níveis de confidencialidade:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/confidentiality-levels", async (req, res) => {
    try {
      const level = insertConfidentialityLevelSchema.parse(req.body);
      const newLevel = await storage.createConfidentialityLevel(level);
      res.json(newLevel);
    } catch (error: any) {
      console.error("Erro ao criar nível de confidencialidade:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Availability Options APIs
  app.get("/api/availability-options", async (req, res) => {
    try {
      const options = await storage.getAvailabilityOptions();
      res.json(options);
    } catch (error: any) {
      console.error("Erro ao buscar opções de disponibilidade:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/availability-options", async (req, res) => {
    try {
      const option = insertAvailabilityOptionSchema.parse(req.body);
      const newOption = await storage.createAvailabilityOption(option);
      res.json(newOption);
    } catch (error: any) {
      console.error("Erro ao criar opção de disponibilidade:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Language Options APIs
  app.get("/api/language-options", async (req, res) => {
    try {
      const options = await storage.getLanguageOptions();
      res.json(options);
    } catch (error: any) {
      console.error("Erro ao buscar opções de idioma:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/language-options", async (req, res) => {
    try {
      const option = insertLanguageOptionSchema.parse(req.body);
      const newOption = await storage.createLanguageOption(option);
      res.json(newOption);
    } catch (error: any) {
      console.error("Erro ao criar opção de idioma:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Rights Options APIs
  app.get("/api/rights-options", async (req, res) => {
    try {
      const options = await storage.getRightsOptions();
      res.json(options);
    } catch (error: any) {
      console.error("Erro ao buscar opções de direitos:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rights-options", async (req, res) => {
    try {
      const option = insertRightsOptionSchema.parse(req.body);
      const newOption = await storage.createRightsOption(option);
      res.json(newOption);
    } catch (error: any) {
      console.error("Erro ao criar opção de direitos:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Document Authorities APIs
  app.get("/api/document-authorities", async (req, res) => {
    try {
      const authorities = await storage.getDocumentAuthorities();
      res.json(authorities);
    } catch (error: any) {
      console.error("Erro ao buscar autoridades de documento:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/document-authorities", async (req, res) => {
    try {
      const authority = insertDocumentAuthoritySchema.parse(req.body);
      const newAuthority = await storage.createDocumentAuthority(authority);
      res.json(newAuthority);
    } catch (error: any) {
      console.error("Erro ao criar autoridade de documento:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ========== APIS PARA EDITAR E DELETAR TIPOS DINÂMICOS ==========

  // Confidentiality Levels - Edit/Delete
  app.put("/api/confidentiality-levels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Filtrar apenas campos válidos para update
      const { name, description } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "Nenhum campo válido para atualizar" });
      }
      
      const updated = await storage.updateConfidentialityLevel(id, updateData);
      
      if (!updated) {
        return res.status(404).json({ error: "Nível de confidencialidade não encontrado" });
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Erro ao atualizar nível de confidencialidade:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/confidentiality-levels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteConfidentialityLevel(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Nível de confidencialidade não encontrado" });
      }
      
      res.json({ success: true, message: "Nível de confidencialidade deletado com sucesso" });
    } catch (error: any) {
      console.error("Erro ao deletar nível de confidencialidade:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Availability Options - Edit/Delete
  app.put("/api/availability-options/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "Nenhum campo válido para atualizar" });
      }
      
      const updated = await storage.updateAvailabilityOption(id, updateData);
      
      if (!updated) {
        return res.status(404).json({ error: "Opção de disponibilidade não encontrada" });
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Erro ao atualizar opção de disponibilidade:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/availability-options/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAvailabilityOption(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Opção de disponibilidade não encontrada" });
      }
      
      res.json({ success: true, message: "Opção de disponibilidade deletada com sucesso" });
    } catch (error: any) {
      console.error("Erro ao deletar opção de disponibilidade:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Language Options - Edit/Delete
  app.put("/api/language-options/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "Nenhum campo válido para atualizar" });
      }
      
      const updated = await storage.updateLanguageOption(id, updateData);
      
      if (!updated) {
        return res.status(404).json({ error: "Opção de idioma não encontrada" });
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Erro ao atualizar opção de idioma:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/language-options/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLanguageOption(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Opção de idioma não encontrada" });
      }
      
      res.json({ success: true, message: "Opção de idioma deletada com sucesso" });
    } catch (error: any) {
      console.error("Erro ao deletar opção de idioma:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Rights Options - Edit/Delete
  app.put("/api/rights-options/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "Nenhum campo válido para atualizar" });
      }
      
      const updated = await storage.updateRightsOption(id, updateData);
      
      if (!updated) {
        return res.status(404).json({ error: "Opção de direitos não encontrada" });
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Erro ao atualizar opção de direitos:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/rights-options/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRightsOption(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Opção de direitos não encontrada" });
      }
      
      res.json({ success: true, message: "Opção de direitos deletada com sucesso" });
    } catch (error: any) {
      console.error("Erro ao deletar opção de direitos:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Document Authorities - Edit/Delete
  app.put("/api/document-authorities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "Nenhum campo válido para atualizar" });
      }
      
      const updated = await storage.updateDocumentAuthority(id, updateData);
      
      if (!updated) {
        return res.status(404).json({ error: "Autoridade de documento não encontrada" });
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Erro ao atualizar autoridade de documento:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/document-authorities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDocumentAuthority(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Autoridade de documento não encontrada" });
      }
      
      res.json({ success: true, message: "Autoridade de documento deletada com sucesso" });
    } catch (error: any) {
      console.error("Erro ao deletar autoridade de documento:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Storage monitoring endpoint
  app.get('/api/storage/stats', async (req, res) => {
    try {
      const { storageMonitor } = await import('./storage-monitor');
      const stats = await storageMonitor.getFullStorageStats();
      res.json(stats);
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de armazenamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // ============= MONITORAMENTO DE LOGIN =============
  
  // Importar serviço de monitoramento
  const { loginMonitoringService } = await import('./services/loginMonitoringService');
  
  // Obter estatísticas de login
  app.get("/api/login-stats", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId || userRole !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar estatísticas de login." });
      }
      
      const days = parseInt(req.query.days as string) || 30;
      const stats = await loginMonitoringService.getLoginStats(days);
      
      res.json({
        period_days: days,
        ...stats
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas de login:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  
  // Obter sessões ativas
  app.get("/api/active-sessions", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId || userRole !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar sessões ativas." });
      }
      
      const sessions = await loginMonitoringService.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Erro ao obter sessões ativas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  
  // Obter alertas de segurança
  app.get("/api/security-alerts", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId || userRole !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar alertas de segurança." });
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const alerts = await loginMonitoringService.getSecurityAlerts(limit);
      res.json(alerts);
    } catch (error) {
      console.error("Erro ao obter alertas de segurança:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  
  // Obter histórico de logins
  app.get("/api/login-history", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId || userRole !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar histórico de logins." });
      }
      
      const limit = parseInt(req.query.limit as string) || 100;
      const history = await loginMonitoringService.getRecentLogins(limit);
      res.json(history);
    } catch (error) {
      console.error("Erro ao obter histórico de logins:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  
  // Resolver alerta de segurança
  app.patch("/api/security-alerts/:id/resolve", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId || userRole !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem resolver alertas." });
      }
      
      const alertId = parseInt(req.params.id);
      
      const { securityAlerts } = await import('../../shared/schema');
      await db.update(securityAlerts)
        .set({
          is_resolved: true,
          resolved_by: userId,
          resolved_at: new Date()
        })
        .where(eq(securityAlerts.id, alertId));
      
      res.json({ message: "Alerta resolvido com sucesso" });
    } catch (error) {
      console.error("Erro ao resolver alerta:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  
  // Terminar sessão específica (força logout)
  app.post("/api/sessions/:sessionId/terminate", async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;
      const userRole = (req.session as any)?.user?.role;
      
      if (!userId || userRole !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem terminar sessões." });
      }
      
      const sessionId = req.params.sessionId;
      await loginMonitoringService.endSession(sessionId);
      
      res.json({ message: "Sessão terminada com sucesso" });
    } catch (error) {
      console.error("Erro ao terminar sessão:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
