# 🚀 MIGRAÇÃO PARA BACKBLAZE B2 - PLANO TÉCNICO COMPLETO

## 📋 **1. ANÁLISE DAS OPÇÕES DISPONÍVEIS**

### **🎯 RECOMENDAÇÃO: API S3-COMPATIBLE (MELHOR OPÇÃO)**

**✅ Vantagens:**
- 🔄 **Migração Simples**: Reutiliza AWS SDK existente (mínimas mudanças no código)
- 📚 **Documentação Robusta**: Suporte extensivo e comunidade ativa
- 🛠️ **Ferramentas**: Compatível com ferramentas S3 existentes
- 🔧 **Manutenção**: Mais fácil de manter e debugar
- 💰 **Custo-Benefício**: $6/TB/mês (vs $23/TB no AWS S3)

**❌ Limitações:**
- 🔒 Sem IAM roles
- 🏷️ Object tagging limitado
- 📊 Sem lifecycle rules automáticas

### **🆚 COMPARAÇÃO COM OUTRAS OPÇÕES:**

| Característica | S3-Compatible | API Nativa B2 | SDKs Oficiais |
|----------------|---------------|---------------|---------------|
| **Facilidade de migração** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Documentação** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Compatibilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Recursos disponíveis** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Manutenção** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

---

## 🔐 **2. CONFIGURAÇÃO DE CREDENCIAIS (CRÍTICO)**

### **⚠️ PROBLEMA IDENTIFICADO:**
Você forneceu a **Master Application Key**, mas para S3-Compatible API é necessário criar uma **Application Key específica**.

### **🛠️ PASSOS PARA CRIAR APPLICATION KEY CORRETA:**

1. **Acesse o Console Backblaze B2:**
   ```
   https://secure.backblaze.com/b2_buckets.htm
   ```

2. **Navegue para Application Keys:**
   - Menu lateral: "App Keys"
   - Botão: "Add a New Application Key"

3. **Configure a Nova Key:**
   ```
   Name of Key: sistema-gestao-documentos-s3
   Allow access to Bucket(s): All
   Type of Access: Read and Write
   Allow List All Bucket Names: ✅ Yes
   File name prefix: (deixar vazio)
   Duration: (deixar vazio para nunca expirar)
   ```

4. **Anotar as Credenciais:**
   ```
   keyID: (será gerado automaticamente)
   applicationKey: (será gerado automaticamente)
   ```

### **🔍 IDENTIFICAR SUA REGIÃO:**
```
Endpoint Padrão: https://s3.us-west-004.backblazeb2.com
Região: us-west-004

⚠️ IMPORTANTE: Sua região pode ser diferente!
Verificar no console B2 em "Bucket Details"
```

---

## 📦 **3. ESTRUTURA DE MIGRAÇÃO**

### **🗂️ MAPEAMENTO DE BUCKETS:**

**Atual (Supabase) → Novo (Backblaze B2):**
```
documents      → gestao-docs-documents
images         → gestao-docs-images
videos         → gestao-docs-videos
audio          → gestao-docs-audio
spreadsheets   → gestao-docs-spreadsheets
presentations  → gestao-docs-presentations
archives       → gestao-docs-archives
```

### **🔧 CONFIGURAÇÃO TÉCNICA:**

**Environment Variables (.env):**
```env
# Backblaze B2 Credentials
B2_KEY_ID=your_new_key_id_here
B2_APPLICATION_KEY=your_new_application_key_here
B2_REGION=us-west-004
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com

# Manter PostgreSQL para metadados
DATABASE_URL=postgresql://neondb_owner:npg_bYMZqwoTg04V@ep-round-sea-afdzzdpj.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require

# Backup/Fallback (manter temporariamente)
SUPABASE_URL=https://fbqocpozjmuzrdeacktb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💻 **4. IMPLEMENTAÇÃO TÉCNICA**

### **📋 Dependencies a Instalar:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
```

### **🔧 Novo Arquivo: server/backblaze-b2.ts**
```typescript
import { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListBucketsCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Configuração do cliente B2
const b2Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT || 'https://s3.us-west-004.backblazeb2.com',
  region: process.env.B2_REGION || 'us-west-004',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
  forcePathStyle: true, // Necessário para Backblaze B2
});

// Buckets do sistema
const SYSTEM_BUCKETS = [
  'gestao-docs-documents',
  'gestao-docs-images', 
  'gestao-docs-videos',
  'gestao-docs-audio',
  'gestao-docs-spreadsheets',
  'gestao-docs-presentations',
  'gestao-docs-archives'
];

export class BackblazeB2Service {
  
  // Inicializar buckets (executar uma vez)
  async initializeBuckets(): Promise<boolean> {
    try {
      console.log('🚀 Inicializando buckets Backblaze B2...');
      
      // Listar buckets existentes
      const { Buckets } = await b2Client.send(new ListBucketsCommand({}));
      const existingBuckets = Buckets?.map(b => b.Name) || [];
      
      console.log('📁 Buckets existentes:', existingBuckets);
      
      // Criar buckets que não existem
      for (const bucketName of SYSTEM_BUCKETS) {
        if (!existingBuckets.includes(bucketName)) {
          console.log(`📦 Criando bucket: ${bucketName}`);
          
          try {
            await b2Client.send(new CreateBucketCommand({
              Bucket: bucketName
            }));
            console.log(`✅ Bucket criado: ${bucketName}`);
          } catch (error: any) {
            if (error.name === 'BucketAlreadyExists' || error.name === 'BucketAlreadyOwnedByYou') {
              console.log(`ℹ️ Bucket já existe: ${bucketName}`);
            } else {
              console.error(`❌ Erro ao criar bucket ${bucketName}:`, error.message);
              return false;
            }
          }
        } else {
          console.log(`ℹ️ Bucket já existe: ${bucketName}`);
        }
      }
      
      console.log('✅ Inicialização de buckets concluída!');
      return true;
      
    } catch (error) {
      console.error('❌ Erro na inicialização dos buckets:', error);
      return false;
    }
  }
  
  // Upload de arquivo
  async uploadFile(
    bucketName: string, 
    fileName: string, 
    fileBuffer: Buffer, 
    contentType: string
  ): Promise<{success: boolean, url?: string, error?: string}> {
    try {
      const key = `${Date.now()}_${fileName}`;
      
      console.log(`📤 Enviando arquivo para B2:`, {
        bucket: bucketName,
        key: key,
        size: fileBuffer.length,
        type: contentType
      });
      
      await b2Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ContentLength: fileBuffer.length
      }));
      
      const fileUrl = `${process.env.B2_ENDPOINT}/${bucketName}/${key}`;
      
      console.log(`✅ Arquivo enviado com sucesso: ${fileUrl}`);
      
      return {
        success: true,
        url: fileUrl
      };
      
    } catch (error: any) {
      console.error('❌ Erro no upload para B2:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Download de arquivo
  async downloadFile(bucketName: string, fileName: string): Promise<{success: boolean, data?: Buffer, error?: string}> {
    try {
      console.log(`📥 Baixando arquivo do B2: ${bucketName}/${fileName}`);
      
      const response = await b2Client.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName
      }));
      
      if (!response.Body) {
        return {
          success: false,
          error: 'Arquivo não encontrado'
        };
      }
      
      // Converter stream para buffer
      const chunks: Uint8Array[] = [];
      const reader = response.Body.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      const buffer = Buffer.concat(chunks);
      
      console.log(`✅ Arquivo baixado com sucesso: ${buffer.length} bytes`);
      
      return {
        success: true,
        data: buffer
      };
      
    } catch (error: any) {
      console.error('❌ Erro no download do B2:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Deletar arquivo
  async deleteFile(bucketName: string, fileName: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deletando arquivo do B2: ${bucketName}/${fileName}`);
      
      await b2Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName
      }));
      
      console.log(`✅ Arquivo deletado com sucesso`);
      return true;
      
    } catch (error: any) {
      console.error('❌ Erro ao deletar arquivo do B2:', error);
      return false;
    }
  }
  
  // Verificar se arquivo existe
  async fileExists(bucketName: string, fileName: string): Promise<boolean> {
    try {
      await b2Client.send(new HeadObjectCommand({
        Bucket: bucketName,
        Key: fileName
      }));
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Gerar URL assinada temporária
  async getSignedUrl(bucketName: string, fileName: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName
      });
      
      const signedUrl = await getSignedUrl(b2Client, command, { expiresIn });
      return signedUrl;
      
    } catch (error) {
      console.error('❌ Erro ao gerar URL assinada:', error);
      throw error;
    }
  }
  
  // Determinar bucket correto baseado no tipo de arquivo
  getBucketForFileType(mimeType: string, originalName: string): string {
    const type = mimeType.toLowerCase();
    const extension = originalName.toLowerCase().split('.').pop() || '';
    
    // Imagens
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
      return 'gestao-docs-images';
    }
    
    // Vídeos
    if (type.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
      return 'gestao-docs-videos';
    }
    
    // Áudio
    if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(extension)) {
      return 'gestao-docs-audio';
    }
    
    // Planilhas
    if (type.includes('spreadsheet') || type.includes('excel') || ['xlsx', 'xls', 'csv', 'ods'].includes(extension)) {
      return 'gestao-docs-spreadsheets';
    }
    
    // Apresentações
    if (type.includes('presentation') || ['ppt', 'pptx', 'odp'].includes(extension)) {
      return 'gestao-docs-presentations';
    }
    
    // Arquivos compactados
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
      return 'gestao-docs-archives';
    }
    
    // Documentos (padrão)
    return 'gestao-docs-documents';
  }
  
  // Testar conexão
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testando conexão com Backblaze B2...');
      
      await b2Client.send(new ListBucketsCommand({}));
      
      console.log('✅ Conexão com B2 funcionando!');
      return true;
      
    } catch (error) {
      console.error('❌ Erro na conexão com B2:', error);
      return false;
    }
  }
}

// Instância singleton
export const backblazeB2Service = new BackblazeB2Service();
```

### **🔄 Modificar: server/storage.ts (Adicionar métodos B2)**
```typescript
// Adicionar no início do arquivo
import { backblazeB2Service } from './backblaze-b2';

// Adicionar na interface IStorage
export interface IStorage {
  // ... métodos existentes
  
  // Novos métodos B2
  uploadToB2(file: Express.Multer.File, bucket?: string): Promise<{success: boolean, url?: string, error?: string}>;
  downloadFromB2(bucketName: string, fileName: string): Promise<{success: boolean, data?: Buffer, error?: string}>;
  deleteFromB2(bucketName: string, fileName: string): Promise<boolean>;
}

// Implementação na DatabaseStorage
export class DatabaseStorage implements IStorage {
  // ... métodos existentes
  
  async uploadToB2(file: Express.Multer.File, bucket?: string): Promise<{success: boolean, url?: string, error?: string}> {
    try {
      const bucketName = bucket || backblazeB2Service.getBucketForFileType(file.mimetype, file.originalname);
      
      return await backblazeB2Service.uploadFile(
        bucketName,
        file.originalname,
        file.buffer,
        file.mimetype
      );
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async downloadFromB2(bucketName: string, fileName: string): Promise<{success: boolean, data?: Buffer, error?: string}> {
    return await backblazeB2Service.downloadFile(bucketName, fileName);
  }
  
  async deleteFromB2(bucketName: string, fileName: string): Promise<boolean> {
    return await backblazeB2Service.deleteFile(bucketName, fileName);
  }
}
```

---

## 🗺️ **5. PLANO DE MIGRAÇÃO (3 FASES)**

### **⚡ FASE 1: PREPARAÇÃO (1-2 dias)**
1. ✅ Criar Application Key no console B2
2. ✅ Configurar environment variables
3. ✅ Instalar dependências AWS SDK
4. ✅ Criar serviço BackblazeB2Service
5. ✅ Implementar métodos básicos (upload/download/delete)
6. ✅ Testar conexão e criação de buckets

### **🔄 FASE 2: IMPLEMENTAÇÃO HÍBRIDA (3-5 dias)**
1. ✅ Modificar rotas de upload para usar B2
2. ✅ Manter Supabase como fallback temporário
3. ✅ Implementar sistema de migração de arquivos existentes
4. ✅ Testar todas as funcionalidades principais
5. ✅ Validar integridade dos dados

### **🎯 FASE 3: FINALIZAÇÃO (1-2 dias)**
1. ✅ Migrar todos os arquivos do Supabase para B2
2. ✅ Remover dependências do Supabase Storage
3. ✅ Atualizar documentação
4. ✅ Testes finais de produção
5. ✅ Cleanup de código antigo

---

## 💰 **6. VANTAGENS ECONÔMICAS**

### **💵 COMPARAÇÃO DE CUSTOS:**

| Serviço | Storage | Download | Benefícios |
|---------|---------|----------|------------|
| **Backblaze B2** | $6/TB/mês | $10/TB | ✅ Preço fixo, sem surpresas |
| **AWS S3** | $23/TB/mês | $90/TB | ❌ Complexo, taxas escondidas |
| **Supabase** | $0.021/GB/mês | Limitado | ❌ Limitações de storage |

### **📊 ESTIMATIVA PARA SISTEMA ATUAL:**
```
Cenário: 100GB de documentos, 1TB de downloads/mês

Backblaze B2:
- Storage: 100GB × $0.006 = $0.60/mês
- Download: 1TB × $10 = $10/mês
- TOTAL: $10.60/mês

AWS S3:
- Storage: 100GB × $0.023 = $2.30/mês  
- Download: 1TB × $90 = $90/mês
- TOTAL: $92.30/mês

💡 ECONOMIA: $81.70/mês (87% de redução!)
```

---

## 🧪 **7. SCRIPT DE TESTE INICIAL**

### **🔧 Criar: test-backblaze-b2.js**
```javascript
// test-backblaze-b2.js
import { backblazeB2Service } from './server/backblaze-b2.js';
import fs from 'fs';

async function testBackblazeB2() {
  console.log('🧪 TESTE COMPLETO BACKBLAZE B2\n');
  
  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão...');
    const connected = await backblazeB2Service.testConnection();
    if (!connected) {
      throw new Error('Falha na conexão');
    }
    
    // 2. Inicializar buckets
    console.log('\n2️⃣ Inicializando buckets...');
    const bucketsCreated = await backblazeB2Service.initializeBuckets();
    if (!bucketsCreated) {
      throw new Error('Falha na criação de buckets');
    }
    
    // 3. Testar upload
    console.log('\n3️⃣ Testando upload...');
    const testContent = Buffer.from('Teste de arquivo para Backblaze B2!', 'utf-8');
    const uploadResult = await backblazeB2Service.uploadFile(
      'gestao-docs-documents',
      'teste-arquivo.txt',
      testContent,
      'text/plain'
    );
    
    if (!uploadResult.success) {
      throw new Error(`Upload falhou: ${uploadResult.error}`);
    }
    
    console.log('✅ Upload bem-sucedido!');
    console.log('📄 URL:', uploadResult.url);
    
    // 4. Testar download
    console.log('\n4️⃣ Testando download...');
    const fileName = uploadResult.url?.split('/').pop();
    const downloadResult = await backblazeB2Service.downloadFile(
      'gestao-docs-documents',
      fileName!
    );
    
    if (!downloadResult.success) {
      throw new Error(`Download falhou: ${downloadResult.error}`);
    }
    
    const downloadedContent = downloadResult.data?.toString('utf-8');
    console.log('✅ Download bem-sucedido!');
    console.log('📄 Conteúdo:', downloadedContent);
    
    // 5. Testar delete
    console.log('\n5️⃣ Testando delete...');
    const deleted = await backblazeB2Service.deleteFile(
      'gestao-docs-documents',
      fileName!
    );
    
    if (!deleted) {
      throw new Error('Delete falhou');
    }
    
    console.log('✅ Delete bem-sucedido!');
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Backblaze B2 está funcionando perfeitamente!');
    
  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES:', error.message);
    console.error('🔧 Verifique as credenciais e configurações.');
  }
}

// Executar teste
testBackblazeB2();
```

---

## 📚 **8. PRÓXIMOS PASSOS RECOMENDADOS**

### **🚀 IMPLEMENTAÇÃO IMEDIATA:**

1. **Criar Application Key específica no console B2**
2. **Configurar environment variables**
3. **Instalar dependências AWS SDK**
4. **Implementar BackblazeB2Service**
5. **Executar script de teste**

### **💡 COMANDOS PARA EXECUTAR:**

```bash
# 1. Instalar dependências
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid

# 2. Configurar .env (adicionar suas credenciais B2)
echo "B2_KEY_ID=your_key_id_here" >> .env
echo "B2_APPLICATION_KEY=your_application_key_here" >> .env
echo "B2_REGION=us-west-004" >> .env
echo "B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com" >> .env

# 3. Testar implementação
node test-backblaze-b2.js
```

---

## ✅ **9. CHECKLIST DE MIGRAÇÃO**

### **📋 PRÉ-MIGRAÇÃO:**
- [ ] Application Key criada no console B2
- [ ] Environment variables configuradas
- [ ] Dependências instaladas
- [ ] Testes de conexão passando
- [ ] Buckets criados com sucesso

### **📋 MIGRAÇÃO:**
- [ ] Serviço B2 implementado
- [ ] Rotas modificadas para usar B2
- [ ] Sistema híbrido funcionando
- [ ] Testes de upload/download/delete passando
- [ ] Backup dos dados do Supabase criado

### **📋 PÓS-MIGRAÇÃO:**
- [ ] Todos os arquivos migrados para B2
- [ ] Performance validada
- [ ] Logs de erro limpos
- [ ] Documentação atualizada
- [ ] Dependências do Supabase removidas

---

**🎯 CONCLUSÃO**: A API S3-Compatible do Backblaze B2 é a escolha ideal para seu sistema, oferecendo economia significativa (87% vs AWS S3), implementação simples e performance excelente. O plano de migração em 3 fases garante transição segura sem perda de dados ou interrupção do serviço.

---
*Documento técnico criado em 30 de julho, 2025 - Sistema de Gestão de Documentos*