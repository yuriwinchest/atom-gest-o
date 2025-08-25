import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          message: "Dados de entrada inválidos",
          errors: validationErrors,
          code: "VALIDATION_ERROR",
        });
      }

      console.error("Erro na validação:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        code: "VALIDATION_ERROR",
      });
    }
  };
};

// Schemas de validação comuns
export const documentSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Título é obrigatório"),
    content: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    is_public: z.boolean().optional(),
  }),
});

export const uploadSchema = z.object({
  body: z.object({
    fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
    bucket: z.string().min(1, "Bucket é obrigatório"),
    metadata: z.string().optional(),
  }),
});

export const searchSchema = z.object({
  body: z.object({
    query: z.string().min(1, "Termo de busca é obrigatório"),
    filters: z
      .object({
        category: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "Senha é obrigatória"),
  }),
});

