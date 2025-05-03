import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guard';
import { User } from '@/auth/decorator/user.decorator';
import { UploadsService } from './uploads.service';
import { FileSizeValidatorGuard } from './guards/file-size-validator.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@UseGuards(JwtGuard)
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly configService: ConfigService,
  ) {
    this.createUploadDirs();
  }

  private createUploadDirs() {
    const basePath =
      this.configService.get('FILE_UPLOAD_DEST') || './storage/uploads';
    const dirs = ['ktp', 'npwp', 'payslip'];

    dirs.forEach((dir) => {
      const dirPath = `${basePath}/${dir}`;
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  @Post('documents')
  @UseGuards(FileSizeValidatorGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'ktp_file', maxCount: 1 },
        { name: 'npwp_file', maxCount: 1 },
        { name: 'payslip_file', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const baseDir = process.env.FILE_UPLOAD_DEST || './storage/uploads';
            let uploadDir = '';

            if (file.fieldname === 'ktp_file') {
              uploadDir = `${baseDir}/ktp`;
            } else if (file.fieldname === 'npwp_file') {
              uploadDir = `${baseDir}/npwp`;
            } else if (file.fieldname === 'payslip_file') {
              uploadDir = `${baseDir}/payslip`;
            }

            cb(null, uploadDir);
          },
          filename: (req, file, cb) => {
            const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
            cb(null, uniqueName);
          },
        }),
        fileFilter: (req, file, cb) => {
          const allowedMimeTypes = (
            process.env.ALLOWED_MIMETYPES ||
            'image/jpeg,image/png,application/pdf'
          ).split(',');

          if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new BadRequestException(
                `Unsupported file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
              ),
              false,
            );
          }
        },
      },
    ),
  )
  async uploadDocuments(
    @User('user_id') userId: string,
    @UploadedFiles()
    files: {
      ktp_file?: Express.Multer.File[];
      npwp_file?: Express.Multer.File[];
      payslip_file?: Express.Multer.File[];
    },
  ) {
    if (!files.ktp_file && !files.npwp_file && !files.payslip_file) {
      throw new BadRequestException('No files were uploaded');
    }

    const document = await this.uploadsService.uploadDocument(userId, files);

    return new BaseResponseDto(
      true,
      'Documents uploaded successfully',
      document,
    );
  }

  @Get('documents')
  async getUserDocuments(@User('user_id') userId: string) {
    const documents = await this.uploadsService.getUserDocuments(userId);

    return new BaseResponseDto(
      true,
      'Documents fetched successfully',
      documents || null,
    );
  }

  @Delete('documents/:type')
  async deleteDocument(
    @User('user_id') userId: string,
    @Param('type') type: string,
  ) {
    if (!['ktp', 'npwp', 'payslip'].includes(type)) {
      throw new BadRequestException(
        'Invalid document type. Valid types: ktp, npwp, payslip',
      );
    }

    await this.uploadsService.deleteDocument(
      userId,
      type as 'ktp' | 'npwp' | 'payslip',
    );

    return new BaseResponseDto(
      true,
      `${type.toUpperCase()} document deleted successfully`,
      null,
    );
  }
}
