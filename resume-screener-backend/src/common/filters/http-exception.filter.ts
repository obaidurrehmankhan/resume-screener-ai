import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  success: false;
  code: number;
  message: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

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
    const requestId = Array.isArray(requestIdHeader)
      ? requestIdHeader[0]
      : requestIdHeader;

    const isInternalError = status === HttpStatus.INTERNAL_SERVER_ERROR;
    const responseMessage = isInternalError
      ? 'Internal server error'
      : extractedMessage ?? 'Internal server error';

    if (isInternalError) {
      const errorMessage = extractedMessage ?? 'Unknown error';
      const errorStack =
        exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${request.method} ${request.url} -> ${status} [${requestId ?? 'unknown-request'}]: ${errorMessage}`,
        errorStack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} -> ${status} [${requestId ?? 'unknown-request'}]: ${extractedMessage}`,
      );
    }

    const responseBody: ErrorResponseBody = {
      success: false,
      code: status,
      message: responseMessage,
      ...(!isInternalError && details !== undefined ? { details } : {}),
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
