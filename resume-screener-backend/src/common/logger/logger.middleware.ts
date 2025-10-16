import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private static readonly REQUEST_ID_HEADER = 'x-request-id';

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startedAt;
      const requestIdHeader =
        res.getHeader(LoggerMiddleware.REQUEST_ID_HEADER) ??
        req.headers[LoggerMiddleware.REQUEST_ID_HEADER];
      const requestId = Array.isArray(requestIdHeader)
        ? requestIdHeader[0]
        : requestIdHeader;

      this.logger.log(
        `${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} (${duration}ms) [${requestId ?? 'no-request-id'}]`,
      );
    });

    next();
  }
}
