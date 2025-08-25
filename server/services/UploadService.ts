import { createHash } from "crypto";
import { createError } from "../middleware/errorHandler";
import { supabase, supabaseAdmin } from "../supabase";

export interface UploadMetadata {
  originalName?: string;
  category?: string;
  userId?: string;
  description?: string;
  tags?: string[];
  title?: string;
  mainSubject?: string;
  environment?: string;
}

export interface UploadResult {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  file_category: string;
  file_extension: string;
  category: string;
  uploaded_by: string;
  description: string;
  tags: string[];
  is_public: boolean;
  file_checksum: string;
  metadata: any;
  title: string;
  main_subject: string;
  environment: string;
  created_at: string;
  updated_at: string;
}

export class UploadService {
  /**
   * Valida se um arquivo é um PDF válido
   */
  private validatePDF(file: Express.Multer.File): void {
    if (file.mimetype === "application/pdf") {
      const header = file.buffer.toString("ascii", 0, 8);
      if (!header.startsWith("%PDF")) {
        throw createError("Arquivo não é PDF válido", 400, "FILE_ERROR", {
          header,
          originalName: file.originalname,
        });
      }
    }
  }

  /**
   * Categoriza automaticamente o arquivo baseado no tipo
   */
  private getAutomaticCategory(fileName: string, mimeType?: string): string {
    const extension = fileName.toLowerCase().split(".").pop() || "";
    const mime = (mimeType || "").toLowerCase();

    // Categorias de imagem
    if (
      mime.includes("image") ||
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "svg",
        "ico",
        "tiff",
        "tif",
      ].includes(extension)
    ) {
      return "Imagens";
    }

    // Categorias de vídeo
    if (
      mime.includes("video") ||
      [
        "mp4",
        "avi",
        "mkv",
        "mov",
        "wmv",
        "flv",
        "webm",
        "m4v",
        "3gp",
        "ogv",
      ].includes(extension)
    ) {
      return "Vídeos";
    }

    // Categorias de áudio
    if (
      mime.includes("audio") ||
      [
        "mp3",
        "wav",
        "flac",
        "aac",
        "ogg",
        "wma",
        "m4a",
        "opus",
        "aiff",
      ].includes(extension)
    ) {
      return "Áudio";
    }

    // Categorias de documento
    if (
      mime.includes("pdf") ||
      mime.includes("document") ||
      mime.includes("word") ||
      mime.includes("text") ||
      ["pdf", "doc", "docx", "txt", "rtf", "odt", "pages"].includes(extension)
    ) {
      return "Documentos";
    }

    // Categorias de planilha
    if (
      mime.includes("spreadsheet") ||
      mime.includes("excel") ||
      ["xls", "xlsx", "csv", "ods", "numbers"].includes(extension)
    ) {
      return "Documentos";
    }

    // Categorias de apresentação
    if (
      mime.includes("presentation") ||
      mime.includes("powerpoint") ||
      ["ppt", "pptx", "odp", "key"].includes(extension)
    ) {
      return "Documentos";
    }

    // Arquivos de código e outros
    if (
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "html",
        "css",
        "json",
        "xml",
        "yml",
        "yaml",
        "md",
        "sql",
        "py",
        "java",
        "cpp",
        "c",
        "h",
        "php",
        "rb",
        "go",
        "rs",
        "sh",
        "bat",
      ].includes(extension)
    ) {
      return "Outros";
    }

    // Arquivos compactados
    if (["zip", "rar", "7z", "tar", "gz", "bz2", "xz"].includes(extension)) {
      return "Outros";
    }

    return "Outros";
  }

  /**
   * Faz upload de arquivo para o Supabase Storage
   */
  async uploadToSupabase(
    file: Express.Multer.File,
    fileName: string,
    bucket: string,
    metadata: UploadMetadata
  ): Promise<UploadResult> {
    try {
      console.log("🚀 Iniciando upload para Supabase Storage...");

      // Validar arquivo
      this.validatePDF(file);

      // Upload para o Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.mimetype,
        });

      if (uploadError) {
        console.error("❌ Erro no upload do Supabase Storage:", uploadError);
        throw createError(
          "Erro no upload do arquivo",
          500,
          "UPLOAD_ERROR",
          uploadError
        );
      }

      console.log(
        "✅ Upload realizado com sucesso no Supabase Storage:",
        uploadData.path
      );

      // Verificar se o arquivo foi salvo corretamente
      await this.verifyUploadedFile(bucket, fileName);

      // Obter URL do arquivo
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      const fileUrl = urlData.publicUrl;

      // Calcular hash SHA256 do arquivo
      const fileHash = createHash("sha256").update(file.buffer).digest("hex");

      // Categorização automática
      const category =
        metadata.category ||
        this.getAutomaticCategory(file.originalname, file.mimetype);

      // Preparar dados para salvar na tabela files
      const fileData = {
        id: `sb_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        filename: fileName,
        original_name: metadata.originalName || file.originalname,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.mimetype,
        file_type: bucket,
        file_category: category,
        file_extension: (
          file.originalname.split(".").pop() || "txt"
        ).toLowerCase(),
        category: category,
        uploaded_by: metadata.userId || "system",
        description: metadata.description || "",
        tags: metadata.tags || [],
        is_public: true,
        file_checksum: fileHash,
        metadata: {
          url: fileUrl,
          bucket,
          uploadTimestamp: new Date().toISOString(),
          title: metadata.title || metadata.originalName || file.originalname,
          main_subject: metadata.mainSubject || metadata.category || "",
          environment: metadata.environment || "production",
        },
        title: metadata.title || metadata.originalName || file.originalname,
        main_subject: metadata.mainSubject || metadata.category || "",
        environment: metadata.environment || "production",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Salvar metadados na tabela files
      const savedFile = await this.saveFileMetadata(fileData);

      console.log("✅ Upload completo com sucesso:", savedFile.filename);
      return savedFile;
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      throw error;
    }
  }

  /**
   * Verifica se o arquivo foi salvo corretamente
   */
  private async verifyUploadedFile(
    bucket: string,
    fileName: string
  ): Promise<void> {
    try {
      console.log("🔍 Verificando arquivo salvo...");

      const { data: testData, error: testError } = await supabase.storage
        .from(bucket)
        .download(fileName);

      if (testError) {
        console.error("❌ Erro na verificação pós-upload:", testError);
        throw createError(
          "Falha na verificação do arquivo salvo",
          500,
          "VERIFICATION_ERROR"
        );
      }

      if (testData) {
        const testBuffer = Buffer.from(await testData.arrayBuffer());
        const testFirstBytes = testBuffer.slice(0, 10).toString("ascii");
        console.log("✅ Arquivo verificado. Primeiros bytes:", testFirstBytes);
        console.log("✅ Tamanho salvo:", testBuffer.length, "bytes");
      }
    } catch (error) {
      console.error("❌ Erro na verificação pós-upload:", error);
      throw error;
    }
  }

  /**
   * Salva metadados do arquivo na tabela files
   */
  private async saveFileMetadata(fileData: any): Promise<UploadResult> {
    try {
      console.log("💾 Salvando metadados na tabela files...");

      if (!supabaseAdmin) {
        throw createError(
          "Cliente administrativo do Supabase não configurado",
          500,
          "CONFIGURATION_ERROR"
        );
      }

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from("files")
        .insert(fileData)
        .select()
        .single();

      if (insertError) {
        console.error("❌ Erro ao salvar na tabela files:", insertError);
        throw createError(
          "Erro ao salvar metadados",
          500,
          "DATABASE_ERROR",
          insertError
        );
      }

      console.log("✅ Metadados salvos na tabela files:", insertData.id);
      return { ...fileData, id: insertData.id };
    } catch (error) {
      console.error("❌ Erro ao salvar metadados:", error);
      throw error;
    }
  }

  /**
   * Deleta arquivo do Supabase Storage
   */
  async deleteFromSupabase(fileName: string, bucket: string): Promise<void> {
    try {
      console.log("🗑️ Deletando arquivo do Supabase Storage...");

      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (deleteError) {
        console.error("❌ Erro ao deletar arquivo:", deleteError);
        throw createError(
          "Erro ao deletar arquivo",
          500,
          "DELETE_ERROR",
          deleteError
        );
      }

      console.log("✅ Arquivo deletado com sucesso:", fileName);
    } catch (error) {
      console.error("❌ Erro ao deletar arquivo:", error);
      throw error;
    }
  }
}

