import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/file-filter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/file-namer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  getFile(
    // Maneja respuesta manualmente
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    const path = this.filesService.getImage(imageName);
    // Envía de respuesta la imagen
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fileSize: 1024 }
    storage: diskStorage({
      destination: "./static/products",
      filename: fileNamer
    })
  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File
  ) {
    if(!file) throw new BadRequestException('Make sure that the file is an image');
    console.log(file);
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return {
      secureUrl
    }  
  }

}
