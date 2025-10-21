import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { appLogger } from '../logger/app.logger';

interface ErrorResponseBody {
  error: {
    code: number;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const status: HttpStatus =
      exception instanceof HttpException
        ? (exception.getStatus() as HttpStatus)
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message: extractedMessage, details } =
      this.extractMessageAndDetails(exception);

    const requestIdHeader =
      response.getHeader('x-request-id') ?? request.headers['x-request-id'];
    const requestIdValue = (Array.isArray(requestIdHeader)
      ? requestIdHeader[0]
      : requestIdHeader) ?? request.requestId;
    const requestId = requestIdValue
      ? String(requestIdValue)
      : undefined;

    const isInternalError = status === HttpStatus.INTERNAL_SERVER_ERROR;
    const responseMessage = isInternalError
      ? 'Internal server error'
      : extractedMessage ?? 'Internal server error';

    const logContext = {
      method: request.method,
      path: request.originalUrl || request.url,
      status,
      requestId,
    };

    if (isInternalError) {
      const errorMessage = extractedMessage ?? 'Unknown error';
      const errValue =
        exception instanceof Error ? exception : new Error(String(errorMessage));
      appLogger.error(
        {
          ...logContext,
          err: errValue,
        },
        'Unhandled exception',
      );
    } else {
      appLogger.warn(
        {
          ...logContext,
          details,
        },
        'Handled exception',
      );
    }

    const responseBody: ErrorResponseBody = {
      error: {
        code: status,
        message: responseMessage,
        ...(!isInternalError && details !== undefined ? { details } : {}),
      },
      ...(requestId ? { requestId } : {}),
    };

    response.status(status).json(responseBody);
  }

  private extractMessageAndDetails(exception: unknown): {
    message: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return { message: response };
      }

      if (response && typeof response === 'object') {
        const res = response as Record<string, unknown>;
        const message = res.message;
        const error = res.error;
        const details = res.details;

        if (Array.isArray(message)) {
          return {
            message: 'Validation failed',
            details: message,
          };
        }

        if (typeof message === 'string') {
          return {
            message,
            ...(details !== undefined ? { details } : {}),
          };
        }

        if (typeof error === 'string') {
          return {
            message: error,
            ...(details !== undefined ? { details } : {}),
          };
        }
      }
    }

    if (exception instanceof Error) {
      return { message: exception.message };
    }

    return { message: 'Internal server error' };
  }
}
