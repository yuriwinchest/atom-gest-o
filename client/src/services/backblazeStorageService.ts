// Configuração para ambiente browser
// Configuração para ambiente browser
// As variáveis de ambiente são carregadas pelo backend

export interface BackblazeFile {
  id: string;
  filename: string;
  file_path: string;
  backblaze_url: string;
  file_size: number;
  mime_type: string;
  upload_timestamp: string;
  content_sha1: string;
  content_md5: string;
  category?: string;
  description?: string;
  tags?: string[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  bucketName: string;
  lastSync: string;
}

interface AuthData {
  authorizationToken: string;
  apiUrl: string;
  allowed: {
    bucketId: string;
    bucketName: string;
    capabilities: string[];
  };
}

class BackblazeStorageService {
  private apiUrl: string;
  private authToken: string | null = null;
  private uploadUrl: string | null = null;
  private accountId: string;
  private applicationKeyId: string;
  private applicationKey: string;
  private bucketName: string;
  private bucketId: string | null = null;

  // Cache inteligente para tokens
  private tokenExpiry: number = 0;
  private uploadUrlExpiry: number = 0;
  private readonly TOKEN_LIFETIME = 23 * 60 * 60 * 1000; // 23 horas (Backblaze expira em 24h)
  private readonly UPLOAD_URL_LIFETIME = 23 * 60 * 1000; // 23 minutos (Backblaze expira em 24h)

  // Configurações de retry
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 segundo
  private readonly REQUEST_TIMEOUT = 30000; // 30 segundos

  constructor() {
    this.apiUrl = 'https://api002.backblazeb2.com';

    // No frontend, as variáveis de ambiente são carregadas pelo backend
    // Aqui definimos valores padrão que serão sobrescritos pelo backend
    this.accountId = '';
    this.applicationKeyId = '';
    this.applicationKey = '';
    this.bucketName = '';
    this.bucketId = '';

    console.log('ℹ️ Backblaze B2: Serviço inicializado (configuração via backend)');
  }

  /**
   * Verifica se o token ainda é válido
   */
  private isTokenValid(): boolean {
    return !!(this.authToken && Date.now() < this.tokenExpiry);
  }

  /**
   * Verifica se a URL de upload ainda é válida
   */
  private isUploadUrlValid(): boolean {
    return !!(this.uploadUrl && Date.now() < this.uploadUrlExpiry);
  }

  /**
   * Delay para retry
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch com timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout na requisição');
      }
      throw error;
    }
  }

  /**
   * Autentica com o Backblaze B2 com retry
   */
  private async authenticate(): Promise<void> {
    if (this.isTokenValid()) {
      console.log('✅ Token ainda válido, usando cache');
      return;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔐 Tentativa ${attempt} de autenticação Backblaze B2`);

        const response = await this.fetchWithTimeout(
          `${this.apiUrl}/b2api/v2/b2_authorize_account`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${btoa(`${this.applicationKeyId}:${this.applicationKey}`)}`
            }
          },
          this.REQUEST_TIMEOUT
        );

        if (!response.ok) {
          throw new Error(`Falha na autenticação: ${response.status} ${response.statusText}`);
        }

        const authData: AuthData = await response.json();

        // Atualizar dados de autenticação
        this.authToken = authData.authorizationToken;
        this.apiUrl = authData.apiUrl;

        if (!this.bucketId) {
          this.bucketId = authData.allowed.bucketId;
        }

        // Definir expiração do token (23 horas para segurança)
        this.tokenExpiry = Date.now() + this.TOKEN_LIFETIME;

        console.log('✅ Autenticação Backblaze B2 realizada com sucesso');
        console.log(`⏰ Token expira em: ${new Date(this.tokenExpiry).toLocaleString()}`);
        return;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erro desconhecido');
        console.error(`❌ Tentativa ${attempt} falhou:`, lastError.message);

        if (attempt < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY * attempt; // Delay exponencial
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await this.delay(delay);
        }
      }
    }

    throw new Error(`Falha na autenticação após ${this.MAX_RETRIES} tentativas: ${lastError?.message}`);
  }

  /**
   * Obtém URL de upload com cache inteligente
   */
  private async getUploadUrl(): Promise<{ uploadUrl: string; authToken: string }> {
    // Verificar se a URL de upload ainda é válida
    if (this.isUploadUrlValid()) {
      console.log('✅ URL de upload ainda válida, usando cache');
      return { uploadUrl: this.uploadUrl!, authToken: this.authToken! };
    }

    // Renovar autenticação se necessário
    await this.authenticate();

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔗 Tentativa ${attempt} de obter URL de upload`);

        const response = await this.fetchWithTimeout(
          `${this.apiUrl}/b2api/v2/b2_get_upload_url`,
          {
            method: 'POST',
            headers: {
              'Authorization': this.authToken!,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              bucketId: this.bucketId
            })
          },
          this.REQUEST_TIMEOUT
        );

        if (!response.ok) {
          throw new Error(`Falha ao obter URL de upload: ${response.status}`);
        }

        const uploadData = await response.json();

        // Cache da URL de upload
        this.uploadUrl = uploadData.uploadUrl;
        this.uploadUrlExpiry = Date.now() + this.UPLOAD_URL_LIFETIME;

        console.log('✅ URL de upload obtida com sucesso');
        console.log(`⏰ URL expira em: ${new Date(this.uploadUrlExpiry).toLocaleString()}`);

        return { uploadUrl: uploadData.uploadUrl, authToken: this.authToken! };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erro desconhecido');
        console.error(`❌ Tentativa ${attempt} falhou:`, lastError.message);

        if (attempt < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY * attempt;
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await this.delay(delay);
        }
      }
    }

    throw new Error(`Falha ao obter URL de upload após ${this.MAX_RETRIES} tentativas: ${lastError?.message}`);
  }

  /**
   * Calcula SHA1 do arquivo
   */
  private async calculateSha1(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Determina tipo MIME do arquivo
   */
  private getFileType(file: File): string {
    if (file.type) return file.type;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed'
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Faz upload de um arquivo com retry
   */
  async uploadFile(file: File, metadata?: { category?: string; description?: string; tags?: string[] }): Promise<BackblazeFile> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`📤 Tentativa ${attempt} de upload para Backblaze B2: ${file.name}`);

        // 1. Autenticação FRESCA (com cache inteligente)
        await this.authenticate();

        // 2. Obter URL de upload IMEDIATAMENTE (com cache inteligente)
        const { uploadUrl, authToken } = await this.getUploadUrl();

        // 3. Preparar upload
        const sha1 = await this.calculateSha1(file);
        const mimeType = this.getFileType(file);

        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const fileName = `${timestamp}_${randomId}_${file.name}`;

        const headers: Record<string, string> = {
          'Authorization': authToken, // Token FRESCO obtido agora
          'X-Bz-File-Name': fileName,
          'Content-Type': mimeType,
          'Content-Length': file.size.toString(),
          'X-Bz-Content-Sha1': sha1,
          'X-Bz-Info-Author': 'atom-gestao-documentos'
        };

        if (metadata?.category) {
          headers['X-Bz-Info-Category'] = metadata.category;
        }
        if (metadata?.description) {
          headers['X-Bz-Info-Description'] = metadata.description;
        }
        if (metadata?.tags) {
          headers['X-Bz-Info-Tags'] = metadata.tags.join(',');
        }

        // 4. Upload com timeout
        const response = await this.fetchWithTimeout(
          uploadUrl,
          {
            method: 'POST',
            headers,
            body: file
          },
          this.REQUEST_TIMEOUT
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Falha no upload: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const uploadResult = await response.json();

        // 5. Construir URL dinâmica baseada na resposta
        const fileUrl = uploadResult.fileName ?
          `https://f004.backblazeb2.com/file/${this.bucketName}/${uploadResult.fileName}` :
          `https://f004.backblazeb2.com/file/${this.bucketName}/${fileName}`;

        const backblazeFile: BackblazeFile = {
          id: uploadResult.fileId,
          filename: file.name,
          file_path: `${this.bucketName}/${fileName}`,
          backblaze_url: fileUrl,
          file_size: file.size,
          mime_type: mimeType,
          upload_timestamp: new Date().toISOString(),
          content_sha1: sha1,
          content_md5: uploadResult.contentMd5 || '',
          category: metadata?.category,
          description: metadata?.description,
          tags: metadata?.tags
        };

        console.log('✅ Arquivo enviado para Backblaze B2:', backblazeFile.filename);
        console.log(`🔗 URL: ${backblazeFile.backblaze_url}`);
        return backblazeFile;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erro desconhecido');
        console.error(`❌ Tentativa ${attempt} falhou:`, lastError.message);

        if (attempt < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY * attempt;
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await this.delay(delay);

          // Limpar cache em caso de erro para forçar renovação
          if (error instanceof Error && (error.message.includes('401') || error.message.includes('bad_auth_token'))) {
            console.log('🔄 Token expirado, limpando cache...');
            this.authToken = null;
            this.uploadUrl = null;
            this.tokenExpiry = 0;
            this.uploadUrlExpiry = 0;
          }
        }
      }
    }

    throw new Error(`Falha no upload após ${this.MAX_RETRIES} tentativas: ${lastError?.message}`);
  }

  /**
   * Faz upload de múltiplos arquivos
   */
  async uploadMultipleFiles(files: File[], metadata?: { category?: string; description?: string; tags?: string[] }): Promise<BackblazeFile[]> {
    console.log(`📤 Iniciando upload de ${files.length} arquivos para Backblaze B2`);

    const results: BackblazeFile[] = [];
    const errors: Error[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, metadata);
        results.push(result);
        console.log(`✅ ${file.name} - Upload concluído`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`❌ ${file.name} - Falha no upload:`, errorMsg);
        errors.push(error instanceof Error ? error : new Error(errorMsg));
      }
    }

    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} arquivos falharam no upload`);
      throw new Error(`Falha no upload de ${errors.length} arquivos: ${errors.map(e => e.message).join(', ')}`);
    }

    console.log(`🎉 Upload de ${results.length} arquivos concluído com sucesso`);
    return results;
  }

  /**
   * Obtém URL de download
   */
  async getDownloadUrl(file: BackblazeFile): Promise<string> {
    return file.backblaze_url;
  }

  /**
   * Lista arquivos (simulado - Backblaze não tem API nativa para isso)
   */
  async listFiles(prefix?: string, maxKeys?: number): Promise<BackblazeFile[]> {
    console.log('⚠️ Listagem de arquivos não implementada para Backblaze B2');
    return [];
  }

  /**
   * Deleta arquivo com retry
   */
  async deleteFile(fileId: string): Promise<boolean> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🗑️ Tentativa ${attempt} de deletar arquivo: ${fileId}`);

        if (!this.isTokenValid()) {
          await this.authenticate();
        }

        const response = await this.fetchWithTimeout(
          `${this.apiUrl}/b2api/v2/b2_delete_file_version`,
          {
            method: 'POST',
            headers: {
              'Authorization': this.authToken!,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fileId: fileId,
              fileName: 'placeholder' // Backblaze requer fileName mesmo para delete
            })
          },
          this.REQUEST_TIMEOUT
        );

        if (!response.ok) {
          throw new Error(`Falha ao deletar arquivo: ${response.status}`);
        }

        console.log('✅ Arquivo deletado do Backblaze B2:', fileId);
        return true;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erro desconhecido');
        console.error(`❌ Tentativa ${attempt} falhou:`, lastError.message);

        if (attempt < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY * attempt;
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await this.delay(delay);
        }
      }
    }

    console.error(`❌ Falha ao deletar arquivo após ${this.MAX_RETRIES} tentativas:`, lastError?.message);
    return false;
  }

  /**
   * Obtém estatísticas do storage
   */
  async getStorageStats(): Promise<StorageStats> {
    return {
      totalFiles: 0,
      totalSize: 0,
      bucketName: this.bucketName,
      lastSync: new Date().toISOString()
    };
  }

  /**
   * Testa a conexão com Backblaze B2
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testando conexão com Backblaze B2...');
      await this.authenticate();
      console.log('✅ Conexão com Backblaze B2 funcionando');
      return true;
    } catch (error) {
      console.error('❌ Falha na conexão com Backblaze B2:', error);
      return false;
    }
  }

  /**
   * Limpa o cache de tokens
   */
  clearCache(): void {
    this.authToken = null;
    this.uploadUrl = null;
    this.tokenExpiry = 0;
    this.uploadUrlExpiry = 0;
    console.log('🧹 Cache de tokens limpo');
  }
}

export const backblazeStorageService = new BackblazeStorageService();
