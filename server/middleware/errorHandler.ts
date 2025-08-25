import { NextFunction, Request, Response } from "express";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Erro capturado pelo middleware:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Erros conhecidos com códigos específicos
  if (error.code === "VALIDATION_ERROR") {
    return res.status(400).json({
      message: "Dados de entrada inválidos",
      code: error.code,
      details: error.details,
    });
  }

  if (error.code === "UNAUTHORIZED") {
    return res.status(401).json({
      message: "Usuário não autenticado",
      code: error.code,
    });
  }

  if (error.code === "FORBIDDEN") {
    return res.status(403).json({
      message: "Acesso negado",
      code: error.code,
    });
  }

  if (error.code === "NOT_FOUND") {
    return res.status(404).json({
      message: "Recurso não encontrado",
      code: error.code,
    });
  }

  if (error.code === "CONFLICT") {
    return res.status(409).json({
      message: "Conflito de dados",
      code: error.code,
      details: error.details,
    });
  }

  // Erros de upload específicos
  if (error.message.includes("PDF") || error.message.includes("arquivo")) {
    return res.status(400).json({
      message: error.message,
      code: "FILE_ERROR",
    });
  }

  // Erros de banco de dados
  if (
    error.message.includes("database") ||
    error.message.includes("connection")
  ) {
    return res.status(503).json({
      message: "Serviço temporariamente indisponível",
      code: "DATABASE_ERROR",
    });
  }

  // Erro padrão para erros não mapeados
  const statusCode = error.statusCode || 500;
  const message = error.message || "Erro interno do servidor";

  res.status(statusCode).json({
    message,
    code: error.code || "INTERNAL_ERROR",
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
    }),
  });
};

// Função helper para criar erros padronizados
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

// Middleware para capturar erros assíncronos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

