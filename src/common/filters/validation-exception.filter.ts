import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseResponseDto } from '../dto/base-response.dto';

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      status === HttpStatus.BAD_REQUEST &&
      exceptionResponse?.message &&
      (Array.isArray(exceptionResponse.message) ||
        (typeof exceptionResponse === 'object' && exceptionResponse.message))
    ) {
      const validationErrors = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : [exceptionResponse.message];

      return response.status(status).json(
        BaseResponseDto.error(exceptionResponse.message, {
          errors: validationErrors,
        }),
      );
    }

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message || 'An error occurred';

    return response.status(status).json(BaseResponseDto.error(message));
  }
}
