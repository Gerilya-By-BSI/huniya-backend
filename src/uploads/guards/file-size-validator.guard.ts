import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileSizeValidatorGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const maxSize = parseInt(
      this.configService.get('MAX_FILE_SIZE') || '10485760',
      10,
    );

    const files = request.files;

    if (!files) {
      return true;
    }

    for (const fieldName in files) {
      const fieldFiles = files[fieldName];

      for (const file of fieldFiles) {
        if (file.size > maxSize) {
          throw new BadRequestException(
            `File ${file.originalname} exceeds the limit of ${maxSize / 1024 / 1024}MB`,
          );
        }
      }
    }

    return true;
  }
}
