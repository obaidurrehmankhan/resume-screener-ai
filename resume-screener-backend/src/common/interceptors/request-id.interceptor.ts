import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestIdInterceptor.name);
  private static readonly HEADER_NAME = 'x-request-id';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request & { requestId?: string }>();
    const response = httpContext.getResponse<Response>();

    const incomingHeader = request.headers[RequestIdInterceptor.HEADER_NAME];
    const requestId =
      (Array.isArray(incomingHeader) ? incomingHeader[0] : incomingHeader) ??
      randomUUID();

    request.requestId = requestId;
    response.setHeader(RequestIdInterceptor.HEADER_NAME, requestId);

    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        finalize: () => {
          const duration = Date.now() - startedAt;
          this.logger.debug(
            `${request.method} ${request.originalUrl || request.url} [${requestId}] completed in ${duration}ms`,
          );
        },
      }),
    );
  }
}
