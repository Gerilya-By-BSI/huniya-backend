import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(error: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exception = this.mapErrorToResponse(error);
    const statusCode = exception.getStatus();

    const errorMessage = exception.message;
    const lastLine = errorMessage.split('\n').pop();

    response.status(statusCode).json({
      status: 'fail',
      message: lastLine || 'Something went wrong',
    });
  }

  private mapErrorToResponse(error: PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new HttpException(error.message, HttpStatus.CONFLICT);
    }

    if (error.code === 'P2003' || error.code === 'P2025') {
      return new HttpException(error.message, HttpStatus.NOT_FOUND);
    }

    return new HttpException(
      'Something went wrong',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
