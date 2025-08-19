// Rotas para categorias usando sistema real do Supabase (tabela files)
import type { Express } from 'express';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função helper para buscar categorias de um tipo específico
async function buscarCategorias(categoria_tipo: string) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('file_type', 'categoria_dinamica')
    .eq('category', categoria_tipo)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data?.map(item => ({
    id: item.id,
    name: item.original_name,
    created_at: item.created_at
  })) || [];
}

// Função helper para buscar usuário válido
async function buscarUsuarioValido(): Promise<string> {
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (!users || users.length === 0) {
    throw new Error('Nenhum usuário encontrado no sistema');
  }
  return users[0].id;
}

// Função helper para criar nova categoria
async function criarCategoria(categoria_tipo: string, nome: string, userId: string) {
  const registro = {
    filename: `categoria_${categoria_tipo}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    original_name: nome,
    file_path: `/sistema/categorias/${categoria_tipo}`,
    file_size: 0,
    mime_type: 'application/json',
    file_type: 'categoria_dinamica',
    category: categoria_tipo,
    uploaded_by: userId,
    description: `Categoria dinâmica: ${nome}`,
    tags: [categoria_tipo, 'categoria_dinamica'],
    is_public: false,
    download_count: 0,
    environment: 'production',
    metadata: JSON.stringify({
      categoria_tipo: categoria_tipo,
      categoria_nome: nome,
      criado_usuario: true,
      data_criacao: new Date().toISOString()
    })
  };

  const { data, error } = await supabase.from('files').insert(registro).select().single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.original_name,
    created_at: data.created_at
  };
}

export function aplicarRotasCategoriasSupabase(app: Express) {
  console.log('🎯 Aplicando rotas de categorias Supabase (tabela files)...');

  // 1. Document Types
  app.get("/api/document-types", async (req, res) => {
    try {
      console.log('🔍 Buscando document-types do Supabase...');
      const categorias = await buscarCategorias('document_types');
      console.log('✅ Document-types encontrados:', categorias.length);
      res.json(categorias);
    } catch (err: any) {
      console.log('❌ Erro document-types:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/document-types", async (req, res) => {
    try {
      const { name } = req.body;
      console.log('🔥 POST /api/document-types - Criando categoria:', name);
      
      const userId = await buscarUsuarioValido();
      const novaCategoria = await criarCategoria('document_types', name, userId);
      console.log('✅ Nova categoria document-types criada no Supabase:', novaCategoria);
      res.json(novaCategoria);
    } catch (err: any) {
      console.log('❌ Erro POST document-types:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Public Organs
  app.get("/api/public-organs", async (req, res) => {
    try {
      const categorias = await buscarCategorias('public_organs');
      console.log('✅ Public-organs encontrados:', categorias.length);
      res.json(categorias);
    } catch (err: any) {
      console.log('❌ Erro public-organs:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/public-organs", async (req, res) => {
    try {
      const { name } = req.body;
      const userId = await buscarUsuarioValido();
      const novaCategoria = await criarCategoria('public_organs', name, userId);
      res.json(novaCategoria);
    } catch (err: any) {
      console.log('❌ Erro POST public-organs:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Responsible Sectors
  app.get("/api/responsible-sectors", async (req, res) => {
    try {
      const categorias = await buscarCategorias('responsible_sectors');
      res.json(categorias);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/responsible-sectors", async (req, res) => {
    try {
      const { name } = req.body;
      const userId = await buscarUsuarioValido();
      const novaCategoria = await criarCategoria('responsible_sectors', name, userId);
      res.json(novaCategoria);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Main Subjects
  app.get("/api/main-subjects", async (req, res) => {
    try {
      const categorias = await buscarCategorias('main_subjects');
      res.json(categorias);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/main-subjects", async (req, res) => {
    try {
      const { name } = req.body;
      const userId = await buscarUsuarioValido();
      const novaCategoria = await criarCategoria('main_subjects', name, userId);
      res.json(novaCategoria);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Confidentiality Levels
  app.get("/api/confidentiality-levels", async (req, res) => {
    try {
      const categorias = await buscarCategorias('confidentiality_levels');
      res.json(categorias);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/confidentiality-levels", async (req, res) => {
    try {
      const { name } = req.body;
      const userId = await buscarUsuarioValido();
      const novaCategoria = await criarCategoria('confidentiality_levels', name, userId);
      res.json(novaCategoria);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Availability Options
  app.get("/api/availability-options", async (req, res) => {
    try {
      const categorias = await buscarCategorias('availability_options');
      res.json(categorias);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/availability-options", async (req, res) => {
    try {
      const { name } = req.body;
      const userId = await buscarUsuarioValido();
      const novaCategoria = await criarCategoria('availability_options', name, userId);
      res.json(novaCategoria);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Language Options
  app.get("/api/language-options", async (req, res) => {
    try {
      const categorias = await buscarCategorias('language_options');
      res.json(categorias);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/language-options", async (req, res) => {
    try {
      const { name } = req.body;
      const userId = await buscarUsuarioValido();
      const novaCategoria = await criarCategoria('language_options', name, userId);
      res.json(novaCategoria);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Rights Options
  app.get("/api/rights-options", async (req, res) => {
    try {
      const categorias = await buscarCategorias('rights_options');
      res.json(categorias);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/rights-options", async (req, res) => {
    try {
      const { name } = req.body;
      const userId = await buscarUsuarioValido();
      const novaCategoria = await criarCategoria('rights_options', name, userId);
      res.json(novaCategoria);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Document Authorities
  app.get("/api/document-authorities", async (req, res) => {
    try {
      const categorias = await buscarCategorias('document_authorities');
      res.json(categorias);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/document-authorities", async (req, res) => {
    try {
      const { name } = req.body;
      const userId = await buscarUsuarioValido();
      const novaCategoria = await criarCategoria('document_authorities', name, userId);
      res.json(novaCategoria);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  console.log('✅ Rotas de categorias Supabase aplicadas com sucesso!');
}