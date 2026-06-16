import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess(res: Response, data: any, message: string = 'Operación exitosa', pagination?: PaginationMeta, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    ...(pagination && { pagination })
  });
}

export function sendError(res: Response, message: string, statusCode: number = 500, errorDetails?: any) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errorDetails && { details: errorDetails })
  });
}
