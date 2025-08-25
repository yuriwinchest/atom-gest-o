import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { UploadMetadata, UploadService } from "../services/UploadService";

export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  /**
   * Upload de arquivo via FormData para Supabase
   */
  uploadFormData = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        console.log(
          "🚀 PRODUCTION DEBUG - Fazendo upload via FormData para Supabase Storage..."
        );
        console.log("🚀 PRODUCTION DEBUG - Node version:", process.version);
        console.log("🚀 PRODUCTION DEBUG - Environment:", process.env.NODE_ENV);

        if (!req.file) {
          return res.status(400).json({
            message: "Nenhum arquivo fornecido",
            code: "FILE_MISSING",
          });
        }

        const { fileName, bucket, metadata } = req.body;
        let parsedMetadata: UploadMetadata = {};

        // Validação e parsing seguro do metadata
        try {
          if (metadata) {
            parsedMetadata = JSON.parse(metadata);
            console.log(
              "✅ Metadata parsed successfully:",
              Object.keys(parsedMetadata)
            );
          } else {
            console.log("ℹ️ No metadata provided, using defaults");
          }
        } catch (e) {
          console.error("❌ Invalid JSON in metadata:", metadata);
          console.error("❌ JSON parse error:", e);
          return res.status(400).json({
            success: false,
            message: "Metadata JSON inválido",
            code: "INVALID_METADATA_JSON",
            details: e instanceof Error ? e.message : "Erro de parsing",
          });
        }

        const file = req.file;

        console.log("📁 Arquivo recebido:", {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          fileName: fileName,
          bucket: bucket,
        });

        // Adicionar informações do usuário autenticado
        if (req.user) {
          parsedMetadata.userId = req.user.id;
        }

        // Fazer upload usando o serviço
        const uploadResult = await this.uploadService.uploadToSupabase(
          file,
          fileName,
          bucket,
          parsedMetadata
        );

        console.log(
          "✅ UPLOAD CORRIGIDO - Resposta criada:",
          uploadResult.filename
        );

        // Garantir resposta JSON válida com estrutura consistente
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: true,
          data: uploadResult,
          message: "Arquivo enviado com sucesso",
          code: "UPLOAD_SUCCESS",
        });
      } catch (error: any) {
        console.error(
          "❌ DEPLOYMENT - Erro no upload via FormData corrigido:",
          error
        );
        console.error("❌ DEPLOYMENT - Stack trace:", error.stack);
        console.error("❌ DEPLOYMENT - Tipo do erro:", typeof error);

        // Garantir resposta JSON válida mesmo em caso de erro
        res.setHeader("Content-Type", "application/json");
        res.status(500).json({
          success: false,
          message: "Erro interno no upload",
          code: "UPLOAD_ERROR",
          error: error.message,
          details: error.stack,
        });
      }
    }
  );

  /**
   * Upload de arquivo para Backblaze B2
   */
  uploadToBackblaze = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            message: "Nenhum arquivo fornecido",
            code: "FILE_MISSING",
          });
        }

        const { fileName, bucket, metadata } = req.body;
        let parsedMetadata: UploadMetadata = {};

        try {
          parsedMetadata = JSON.parse(metadata || "{}");
        } catch (e) {
          console.warn("Metadata não é JSON válido, usando objeto vazio");
        }

        // Adicionar informações do usuário autenticado
        if (req.user) {
          parsedMetadata.userId = req.user.id;
        }

        // TODO: Implementar upload para Backblaze B2
        // Por enquanto, retornamos um erro indicando que não está implementado
        res.status(501).json({
          message: "Upload para Backblaze B2 não implementado ainda",
          code: "NOT_IMPLEMENTED",
        });
      } catch (error: any) {
        console.error("❌ Erro no upload para Backblaze B2:", error);
        throw error;
      }
    }
  );

  /**
   * Deletar arquivo do Supabase Storage
   */
  deleteFile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        console.log("🗑️ DELETAR ARQUIVO - Recebendo requisição de deleção...");

        const { fileName, bucket } = req.body;

        if (!fileName || !bucket) {
          return res.status(400).json({
            message: "Nome do arquivo e bucket são obrigatórios",
            code: "MISSING_PARAMETERS",
          });
        }

        // Deletar arquivo usando o serviço
        await this.uploadService.deleteFromSupabase(fileName, bucket);

        // Garantir resposta JSON válida com estrutura consistente
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: true,
          message: "Arquivo deletado com sucesso",
          data: {
            fileName,
            bucket,
          },
          code: "DELETE_SUCCESS",
        });
      } catch (error: any) {
        console.error("❌ Erro ao deletar arquivo:", error);

        // Garantir resposta JSON válida mesmo em caso de erro
        res.setHeader("Content-Type", "application/json");
        res.status(500).json({
          success: false,
          message: "Erro interno ao deletar arquivo",
          code: "DELETE_ERROR",
          error: error.message,
        });
      }
    }
  );

  /**
   * Teste de upload real
   */
  testUploadReal = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        console.log("🧪 TESTE DE UPLOAD REAL - Iniciando teste...");

        if (!req.file) {
          return res.status(400).json({
            message: "Nenhum arquivo fornecido para teste",
            code: "FILE_MISSING",
          });
        }

        const file = req.file;
        const testFileName = `test_${Date.now()}_${file.originalname}`;
        const testBucket = "test-bucket";

        console.log("📁 Arquivo de teste:", {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          testFileName: testFileName,
          testBucket: testBucket,
        });

        // Fazer upload de teste
        const uploadResult = await this.uploadService.uploadToSupabase(
          file,
          testFileName,
          testBucket,
          {
            originalName: file.originalname,
            category: "Teste",
            userId: req.user?.id || "test-user",
            description: "Arquivo de teste para validação do sistema",
            tags: ["teste", "validação"],
            title: `Teste - ${file.originalname}`,
            environment: "test",
          }
        );

        console.log(
          "✅ TESTE DE UPLOAD REAL - Sucesso:",
          uploadResult.filename
        );

        // Deletar arquivo de teste após sucesso
        try {
          await this.uploadService.deleteFromSupabase(testFileName, testBucket);
          console.log("🧹 Arquivo de teste deletado após validação");
        } catch (deleteError) {
          console.warn(
            "⚠️ Não foi possível deletar arquivo de teste:",
            deleteError
          );
        }

        res.json({
          message: "Teste de upload realizado com sucesso",
          testResult: uploadResult,
          code: "TEST_SUCCESS",
        });
      } catch (error: any) {
        console.error("❌ TESTE DE UPLOAD REAL - Erro:", error);
        throw error;
      }
    }
  );
}
