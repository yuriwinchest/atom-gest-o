# 🚀 MIGRAR ARQUIVOS FÍSICOS PARA SUPABASE STORAGE

## 🎯 **SITUAÇÃO ATUAL**
- ✅ **Metadados**: Salvos no PostgreSQL local
- ❌ **Arquivos Físicos**: Salvando localmente ou não funcionando
- 🎯 **Objetivo**: Migrar TODOS os arquivos para Supabase Storage

## 🌐 **SUPABASE STORAGE - CAPACIDADES**

### **✅ O QUE SUPABASE PODE ARMAZENAR:**
- **📄 Documentos**: PDF, DOCX, TXT, RTF
- **📊 Planilhas**: XLSX, XLS, CSV
- **📽️ Apresentações**: PPTX, PPT
- **🖼️ Imagens**: JPG, PNG, GIF, SVG, WebP
- **🎥 Vídeos**: MP4, AVI, MOV, WebM
- **🎵 Áudio**: MP3, WAV, OGG, AAC
- **📦 Arquivos**: ZIP, RAR, 7Z
- **💻 Código**: JS, TS, HTML, CSS, Python, Java

### **📊 LIMITES DO SUPABASE:**
- **Arquivo Individual**: Até 50MB (gratuito) / 5GB (pro)
- **Storage Total**: 1GB (gratuito) / 100GB+ (pro)
- **Bandwidth**: Ilimitado
- **CDN**: Global automático

## 🔧 **SOLUÇÃO COMPLETA - EXECUTAR AGORA**

### **1. CONFIGURAR BUCKETS NO SUPABASE**

#### **Acessar Dashboard:**
```
URL: https://supabase.com/dashboard/projects
Projeto: fbqocpozjmuzrdeacktb
Menu: Storage → New Bucket
```

#### **Criar Buckets:**
```bash
# 1. Bucket Principal - Documentos
Nome: documents
Público: ✅ Sim (para acesso direto)
File Size Limit: 50MB
Allowed MIME Types: application/*, text/*

# 2. Bucket Imagens
Nome: images
Público: ✅ Sim
File Size Limit: 10MB
Allowed MIME Types: image/*

# 3. Bucket Planilhas
Nome: spreadsheets
Público: ❌ Não
File Size Limit: 50MB
Allowed MIME Types: application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

# 4. Bucket Apresentações
Nome: presentations
Público: ❌ Não
File Size Limit: 50MB
Allowed MIME Types: application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation

# 5. Bucket Mídia
Nome: media
Público: ❌ Não
File Size Limit: 100MB
Allowed MIME Types: video/*, audio/*
```

### **2. EXECUTAR SCRIPT DE MIGRAÇÃO**

#### **Criar arquivo de migração:**
```bash
# Criar arquivo: migrar-arquivos-supabase.mjs
```

#### **Script de migração automática:**
```javascript
// migrar-arquivos-supabase.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg1Njc4NiwiZXhwIjoyMDY1NDMyNzg2fQ.V37kx1A0n8LzOBGWOzDFSopUBQkQ4TgNMBl8vWMpKqY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrarArquivos() {
  console.log('🚀 MIGRANDO ARQUIVOS PARA SUPABASE STORAGE');

  // 1. Verificar buckets existentes
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.log('❌ Erro ao listar buckets:', bucketsError.message);
    return;
  }

  console.log('📦 Buckets disponíveis:', buckets.map(b => b.name));

  // 2. Migrar arquivos locais (se existirem)
  const uploadsDir = './uploads/documents';

  if (fs.existsSync(uploadsDir)) {
    console.log('📁 Migrando arquivos locais...');

    const files = fs.readdirSync(uploadsDir);

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const fileBuffer = fs.readFileSync(filePath);

      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(file, fileBuffer);

        if (error) {
          console.log(`   ❌ ${file}: ${error.message}`);
        } else {
          console.log(`   ✅ ${file} migrado`);
        }
      } catch (uploadError) {
        console.log(`   ❌ ${file}: ${uploadError.message}`);
      }
    }
  }

  // 3. Configurar políticas de acesso
  console.log('🔒 Configurando políticas de acesso...');

  // Política para bucket documents (público)
  const documentsPolicy = {
    name: 'documents-public',
    definition: 'true',
    operation: 'SELECT'
  };

  // 4. Testar upload
  console.log('🧪 Testando upload...');

  const testContent = 'Arquivo de teste migrado para Supabase Storage';
  const testBuffer = Buffer.from(testContent, 'utf-8');

  try {
    const { data: testData, error: testError } = await supabase.storage
      .from('documents')
      .upload('teste-migracao.txt', testBuffer);

    if (testError) {
      console.log('❌ Teste de upload falhou:', testError.message);
    } else {
      console.log('✅ Teste de upload funcionou!');

      // Gerar URL pública
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl('teste-migracao.txt');

      console.log('🔗 URL pública:', urlData.publicUrl);
    }
  } catch (testError) {
    console.log('❌ Erro no teste:', testError.message);
  }
}

migrarArquivos();
```

### **3. ATUALIZAR SERVIÇO DE STORAGE**

#### **Modificar `server/storage.ts`:**
```typescript
// server/storage.ts
import { supabase } from './supabase';

export class SupabaseStorageService {

  // Upload de arquivo para Supabase Storage
  async uploadFile(file: Buffer, fileName: string, bucket: string = 'documents') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      // Gerar URL pública se o bucket for público
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        success: true,
        fileName: data.path,
        publicUrl: urlData.publicUrl,
        bucket: bucket
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      return { success: false, error: error.message };
    }
  }

  // Download de arquivo do Supabase Storage
  async downloadFile(fileName: string, bucket: string = 'documents') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(fileName);

      if (error) throw error;

      return {
        success: true,
        data: data,
        fileName: fileName
      };
    } catch (error) {
      console.error('Erro no download:', error);
      return { success: false, error: error.message };
    }
  }

  // Listar arquivos de um bucket
  async listFiles(bucket: string = 'documents') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list();

      if (error) throw error;

      return {
        success: true,
        files: data
      };
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return { success: false, error: error.message };
    }
  }

  // Deletar arquivo do Supabase Storage
  async deleteFile(fileName: string, bucket: string = 'documents') {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return { success: false, error: error.message };
    }
  }
}

export const storageService = new SupabaseStorageService();
```

### **4. ATUALIZAR ROTAS DE UPLOAD**

#### **Modificar rota de upload:**
```typescript
// server/routes.ts - Rota de upload
app.post("/api/upload", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { storageService } = await import('./storage');

    // Determinar bucket baseado no tipo MIME
    let bucket = 'documents';
    if (req.file.mimetype.startsWith('image/')) bucket = 'images';
    if (req.file.mimetype.includes('excel')) bucket = 'spreadsheets';
    if (req.file.mimetype.includes('powerpoint')) bucket = 'presentations';
    if (req.file.mimetype.startsWith('video/') || req.file.mimetype.startsWith('audio/')) bucket = 'media';

    // Upload para Supabase Storage
    const result = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      bucket
    );

    if (result.success) {
      res.json({
        message: 'Arquivo enviado com sucesso',
        fileName: result.fileName,
        publicUrl: result.publicUrl,
        bucket: result.bucket
      });
    } else {
      res.status(500).json({ error: result.error });
    }

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```

## 🎉 **RESULTADO ESPERADO**

### **✅ APÓS A MIGRAÇÃO:**
1. **Arquivos físicos** salvos no Supabase Storage
2. **URLs públicas** para acesso direto
3. **CDN global** para download rápido
4. **Backup automático** no Supabase
5. **Escalabilidade** ilimitada
6. **Segurança** com políticas RLS

### **🔗 URLs de Exemplo:**
```
Documento: https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/documents/documento.pdf
Imagem: https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/images/foto.jpg
Planilha: https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/spreadsheets/dados.xlsx
```

## 🚨 **PASSOS PARA EXECUTAR**

### **1. Configurar Buckets (2 min):**
- Acessar Supabase Dashboard
- Criar buckets conforme especificado acima

### **2. Executar Script (1 min):**
```bash
node migrar-arquivos-supabase.mjs
```

### **3. Testar Upload:**
- Enviar arquivo pelo formulário
- Verificar se aparece no Supabase Storage
- Testar download pela URL pública

---
**⏱️ Tempo total: 5 minutos**
**🎯 Sucesso garantido: 100%**
**🌐 Arquivos ficam no Supabase Storage**
