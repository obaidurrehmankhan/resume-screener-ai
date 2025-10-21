import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  it('should respond with standardized error envelope and requestId for handled exceptions', () => {
    const filter = new HttpExceptionFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    const response = {
      status,
      getHeader: jest.fn().mockReturnValue('req-123'),
    } as any;

    const request = {
      method: 'GET',
      url: '/test',
      headers: {},
      requestId: 'req-123',
    } as any;

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;

    const exception = new BadRequestException('Invalid input');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: HttpStatus.BAD_REQUEST,
        message: 'Invalid input',
      },
      requestId: 'req-123',
    });
  });
});
