import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

const CORS_DEFAULTS = {
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
} as const;

function resolveAllowedOrigins(): (string | RegExp)[] | boolean {
  const { APP_ORIGIN } = process.env;

  if (!APP_ORIGIN) {
    // Allow localhost during development when an explicit allowlist is not provided.
    return [/^http:\/\/localhost:\d+$/];
  }

  const origins = APP_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : false;
}

export function configureApp(app: INestApplication) {
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor());

  app.use(cookieParser());
  app.use(helmet());

  const adapter = app.getHttpAdapter();
  const httpServer =
    typeof adapter.getInstance === 'function' ? adapter.getInstance() : null;

  if (httpServer && typeof (httpServer as { set?: unknown }).set === 'function') {
    (httpServer as { set: (key: string, value: unknown) => void }).set(
      'trust proxy',
      1,
    );
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const origin = resolveAllowedOrigins();
  app.enableCors({
    ...CORS_DEFAULTS,
    origin,
  });

  app.setGlobalPrefix('api');
}
