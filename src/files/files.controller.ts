import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer, fileFilter } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Param('imageName') imageName: string,
    @Res() res: Response,
  ) {
    const path = this.filesService.getStatusProductImage(imageName);
    res.sendFile(path);
  }
  /**
   * Método para guardar la imágen en el filesystem del proyecto
   * @param file
   * @returns
   */
  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      limits: { fileSize: 500000 },
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }
    const host_api_raw: string = this.configService.getOrThrow('HOST_API');
    const port: string = this.configService.getOrThrow('PORT');
    const host_api = host_api_raw.replaceAll('{PORT}', port);
    return {
      originalFileName: file.originalname,
      secureUrl: `${host_api}/files/product/${file.filename}`,
    };
  }

  /**
   * Metodo para subir imagen en un bucket S3 de AWS
   * Este método no usa el fileFilter custom creado anteriormente
   * Sino que usa el ParseFilePipe que debería usarse con nest
   * @param file
   * @returns
   */
  @Post('product/aws')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductFileToS3(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const storeResponse = await this.filesService.upload(
      file.originalname,
      file.buffer,
    );
    if (storeResponse['$metadata'].httpStatusCode === 200)
      return {
        message: 'The resource has been stored correctly',
        file: file.originalname,
      };
    else
      return {
        message:
          'There has been an error trying to store the resource, check logs',
      };
  }
}
