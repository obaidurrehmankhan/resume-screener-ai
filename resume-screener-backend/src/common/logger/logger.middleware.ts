import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { appLogger } from './app.logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private static readonly REQUEST_ID_HEADER = 'x-request-id';

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      const durationNs = process.hrtime.bigint() - startedAt;
      const durationMs = Number(durationNs) / 1_000_000;
      const requestIdHeader =
        res.getHeader(LoggerMiddleware.REQUEST_ID_HEADER) ??
        req.headers[LoggerMiddleware.REQUEST_ID_HEADER];
      const requestId = Array.isArray(requestIdHeader)
        ? requestIdHeader[0]
        : requestIdHeader;

      const reqWithMeta = req as Request & {
        requestId?: string | number;
        user?: { sub?: string };
      };

      const logContext = {
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        ms: Number(durationMs.toFixed(2)),
        requestId: requestId ?? reqWithMeta.requestId,
        userId: reqWithMeta.user?.sub,
      };

      if (res.statusCode >= 500) {
        appLogger.error(logContext, 'HTTP request error');
      } else if (res.statusCode >= 400) {
        appLogger.warn(logContext, 'HTTP request warning');
      } else {
        appLogger.info(logContext, 'HTTP request success');
      }
    });

    next();
  }
}
