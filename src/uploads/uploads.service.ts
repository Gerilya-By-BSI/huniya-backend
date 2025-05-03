import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class UploadsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getServerUrl(): string {
    const protocol =
      this.configService.get('NODE_ENV') === 'production' ? 'https' : 'http';
    const host = this.configService.get('HOST') || 'localhost';
    const port = this.configService.get('PORT') || 4000;

    if (this.configService.get('NODE_ENV') === 'production') {
      return `${protocol}://${host}`;
    }

    return `${protocol}://${host}:${port}`;
  }

  private getFilePath(type: string, filename: string): string {
    const uploadDir =
      this.configService.get('FILE_UPLOAD_DEST') || './storage/uploads';
    return path.join(uploadDir, type, filename);
  }

  private getFileUrl(type: string, filename: string): string {
    return `${this.getServerUrl()}/uploads/${type}/${filename}`;
  }

  async uploadDocument(
    userId: string,
    files: {
      ktp_file?: Express.Multer.File[];
      npwp_file?: Express.Multer.File[];
      payslip_file?: Express.Multer.File[];
    },
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { document: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const fileUrls: {
        ktp_url?: string;
        npwp_url?: string;
        payslip_url?: string;
      } = {};

      if (files.ktp_file && files.ktp_file.length > 0) {
        fileUrls.ktp_url = this.getFileUrl('ktp', files.ktp_file[0].filename);
      }

      if (files.npwp_file && files.npwp_file.length > 0) {
        fileUrls.npwp_url = this.getFileUrl(
          'npwp',
          files.npwp_file[0].filename,
        );
      }

      if (files.payslip_file && files.payslip_file.length > 0) {
        fileUrls.payslip_url = this.getFileUrl(
          'payslip',
          files.payslip_file[0].filename,
        );
      }

      if (user.document) {
        if (fileUrls.ktp_url && user.document.ktp_url) {
          await this.deleteFileFromUrl(user.document.ktp_url);
        }

        if (fileUrls.npwp_url && user.document.npwp_url) {
          await this.deleteFileFromUrl(user.document.npwp_url);
        }

        if (fileUrls.payslip_url && user.document.payslip_url) {
          await this.deleteFileFromUrl(user.document.payslip_url);
        }

        return this.prismaService.document.update({
          where: { userId },
          data: {
            ...(fileUrls.ktp_url && { ktp_url: fileUrls.ktp_url }),
            ...(fileUrls.npwp_url && { npwp_url: fileUrls.npwp_url }),
            ...(fileUrls.payslip_url && { payslip_url: fileUrls.payslip_url }),
          },
        });
      } else {
        return this.prismaService.document.create({
          data: {
            ...fileUrls,
            userId,
          },
        });
      }
    } catch (error) {
      if (files.ktp_file && files.ktp_file.length > 0) {
        await this.deleteFile('ktp', files.ktp_file[0].filename);
      }

      if (files.npwp_file && files.npwp_file.length > 0) {
        await this.deleteFile('npwp', files.npwp_file[0].filename);
      }

      if (files.payslip_file && files.payslip_file.length > 0) {
        await this.deleteFile('payslip', files.payslip_file[0].filename);
      }

      throw error;
    }
  }

  async getUserDocuments(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { document: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.document;
  }

  async deleteDocument(userId: string, type: 'ktp' | 'npwp' | 'payslip') {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { document: true },
    });

    if (!user || !user.document) {
      throw new NotFoundException('Document not found');
    }

    let fileUrl: string | null = null;

    // Get the file URL based on type
    switch (type) {
      case 'ktp':
        fileUrl = user.document.ktp_url;
        break;
      case 'npwp':
        fileUrl = user.document.npwp_url;
        break;
      case 'payslip':
        fileUrl = user.document.payslip_url;
        break;
    }

    if (!fileUrl) {
      throw new NotFoundException(`No ${type} document found`);
    }

    // Delete the file
    await this.deleteFileFromUrl(fileUrl);

    // Update the database
    return this.prismaService.document.update({
      where: { userId },
      data: {
        [`${type}_url`]: null,
      },
    });
  }

  private async deleteFileFromUrl(fileUrl: string) {
    try {
      const urlParts = fileUrl.split('/');
      const type = urlParts[urlParts.length - 2];
      const filename = urlParts[urlParts.length - 1];

      await this.deleteFile(type, filename);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  private async deleteFile(type: string, filename: string) {
    try {
      const filePath = this.getFilePath(type, filename);
      await unlinkAsync(filePath);
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
    }
  }
}
