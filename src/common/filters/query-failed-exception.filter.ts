import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

interface PostgresError {
  code?: string;
  constraint?: string;
  column?: string;
  detail?: string;
}

const PG_ERROR_CODES: Record<string, { status: number; error: string; message: string }> = {
  '23514': { status: HttpStatus.BAD_REQUEST, error: 'Bad Request', message: 'The provided value violates a database constraint.' },
  '23505': { status: HttpStatus.CONFLICT, error: 'Conflict', message: 'A record with the same value already exists.' },
  '23503': { status: HttpStatus.BAD_REQUEST, error: 'Bad Request', message: 'Referenced resource does not exist.' },
  '23502': { status: HttpStatus.BAD_REQUEST, error: 'Bad Request', message: 'A required field is missing.' },
};

@Catch(QueryFailedError, EntityNotFoundError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedExceptionFilter.name);

  catch(exception: QueryFailedError | EntityNotFoundError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof EntityNotFoundError) {
      this.logger.warn(exception.message);
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'The requested resource was not found.',
      });
      return;
    }

    // QueryFailedError
    const pgError = (exception as unknown as { driverError: PostgresError }).driverError ?? {};
    const code = pgError.code;
    const mapped = code ? PG_ERROR_CODES[code] : undefined;

    this.logger.error(exception.message, exception.stack);

    if (mapped) {
      response.status(mapped.status).json({
        statusCode: mapped.status,
        error: mapped.error,
        message: mapped.message,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'An unexpected database error occurred.',
      });
    }
  }
}
