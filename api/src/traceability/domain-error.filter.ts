import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../domain/product';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = error.code.endsWith('_NOT_FOUND') ? 404 : 400;
    response.status(status).json({ code: error.code, message: error.message });
  }
}
