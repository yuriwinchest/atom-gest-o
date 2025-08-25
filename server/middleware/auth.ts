import { NextFunction, Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = req.session as any;

    if (!session?.user?.id) {
      return res.status(401).json({
        message: "Usuário não autenticado",
        code: "UNAUTHORIZED",
      });
    }

    req.user = {
      id: session.user.id,
      role: session.user.role || "user",
      email: session.user.email,
    };

    next();
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      code: "AUTH_ERROR",
    });
  }
};

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado",
        code: "UNAUTHORIZED",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Acesso negado. Apenas administradores podem acessar este recurso.",
        code: "FORBIDDEN",
      });
    }

    next();
  } catch (error) {
    console.error("Erro no middleware de admin:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      code: "ADMIN_ERROR",
    });
  }
};

