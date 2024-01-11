import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
  });
  constructor(private readonly configService: ConfigService) {}

  async upload(filename: string, file: Buffer) {
    try {
      return await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'nestjs-teslo-shop-uploader',
          Key: filename,
          Body: file,
        }),
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  getStatusProductImage(imageName: string) {
    const path = join(__dirname, '../../static/products/', imageName);
    if (!existsSync(path))
      throw new BadRequestException(`No product found with image ${imageName}`);

    return path;
  }
}
