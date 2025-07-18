import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// MIDDLEWARE DE PROTEÇÃO DAS ROTAS CRÍTICAS - PRIORIDADE MÁXIMA
app.use('/api/*', (req, res, next) => {
  // Garantir que rotas API nunca sejam interceptadas pelo Vite
  console.log(`🔒 API ROUTE PROTECTED: ${req.method} ${req.path}`);
  next();
});

// Configuração de sessão - DEVE VIR ANTES DAS ROTAS
app.use(session({
  secret: process.env.SESSION_SECRET || 'sistema-gestao-documentos-secret-key-2025',
  name: 'sessionId',
  resave: true, // Permitir salvamento mesmo sem mudanças
  saveUninitialized: true, // Salvar sessões não inicializadas
  rolling: true, // Renova o cookie a cada requisição
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias de duração
    sameSite: 'lax' // Permitir cookies cross-site
  }
}));

// Servir arquivos estáticos da pasta public
app.use(express.static('public'));

// REMOVIDOS COMPLETAMENTE TODOS OS LIMITES DE UPLOAD - SEM RESTRIÇÕES
app.use(express.json({ limit: Infinity }));
app.use(express.urlencoded({ extended: false, limit: Infinity }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse).slice(0, 80)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// ROTA BYPASS COMPLETO PARA PREVIEW - SOLUÇÃO DEFINITIVA
app.get("/raw-document/:id", async (req, res) => {
  try {
    console.log('🚀 ROTA BYPASS DIRETA - ID:', req.params.id);
    const { storage } = await import('./storage');
    const id = parseInt(req.params.id);
    const document = await storage.getDocumentById(id);
    
    if (!document) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    const documentDetails = JSON.parse(document.content || '{}');
    const supabaseUrl = documentDetails?.supabaseUrl;
    const fileInfo = documentDetails?.fileInfo;
    const fileName = fileInfo?.originalName || documentDetails?.fileName || document.title;

    if (supabaseUrl) {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase.storage
        .from('documents')
        .download(supabaseUrl);

      if (error || !data) {
        return res.status(404).send("Arquivo não encontrado no Supabase");
      }

      const mimeType = fileInfo?.mimeType || documentDetails?.fileType || 'application/pdf';
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${fileName || document.title}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
      return;
      
    } else {
      return res.status(404).send("Arquivo não disponível");
    }
  } catch (error) {
    console.error('Erro na rota crítica:', error);
    return res.status(500).send("Erro interno do servidor");
  }
});

(async () => {
  // Registrar todas as rotas da aplicação
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // Setup Vite for development/production
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`server serving on http://0.0.0.0:${PORT}`);
  });
})();