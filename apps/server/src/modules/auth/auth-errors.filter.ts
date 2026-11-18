import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

const codes: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  409: 'EMAIL_IN_USE',
  429: 'RATE_LIMITED',
  503: 'SERVICE_UNAVAILABLE',
};

@Catch()
export class AuthErrorsFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = error instanceof HttpException ? error.getStatus() : 500;
    const payload = error instanceof HttpException ? error.getResponse() : null;
    const message: unknown =
      typeof payload === 'string'
        ? payload
        : payload && 'message' in payload
          ? payload.message
          : undefined;
    const details =
      statusCode === 400 && Array.isArray(message)
        ? message.filter((value): value is string => typeof value === 'string')
        : undefined;
    const safeMessage =
      statusCode === 429
        ? 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
        : statusCode >= 500
          ? 'Não foi possível acessar o serviço. Tente novamente em instantes.'
          : typeof message === 'string'
            ? message
            : details
              ? 'Revise os campos informados.'
              : 'Não foi possível concluir a solicitação.';
    response.setHeader('Cache-Control', 'no-store');
    response
      .status(statusCode)
      .json({
        statusCode,
        code: codes[statusCode] ?? 'INTERNAL_ERROR',
        message: safeMessage,
        ...(details ? { details } : {}),
      });
  }
}
