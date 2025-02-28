import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { TestCasesService } from './test-cases.service';
import { CreateTestCases } from './dto/create-test-cases.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ValidationInterceptor } from 'src/interceptors/validation-file/validation-file.interceptor';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilterZip, fileNamerZip } from './helper/ZIP';
import * as fs from 'fs';

import { CreateFileDto } from './dto/create-file.dto';
@Controller('test-cases')
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) { }


  @Get()
  findAll() {
    return this.testCasesService.findAll();
  }

  @Patch(':id')
  addApptestCases(@Param('id', ParseIntPipe) id: number, @Body() createTestCases: CreateTestCases) {
    return this.testCasesService.addAppTestCases(id, createTestCases);
  }

  @Post('git')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilterZip,
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = `/sysx/bito/projects`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }),
    new ValidationInterceptor((dto: CreateApplicationDto) => {
      return true;
    })
  )
  create(@Body() createApplicationDto: CreateApplicationDto, @UploadedFile() file: Express.Multer.File) {
    return this.testCasesService.createGitFile(createApplicationDto, file);
  }

  @Post('gitlab')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilterZip,
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = `/sysx/bito/projects`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }),
    new ValidationInterceptor((dto: CreateApplicationDto) => {
      return true;
    }))
  createGitLab(@Body() createApplicationDto: CreateApplicationDto, @UploadedFile() file: Express.Multer.File) {
    return this.testCasesService.createGitLabFile(createApplicationDto, file);
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('files', 2, {
    fileFilter: fileFilterZip,
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = `/sysx/bito/projects`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    }),
  }),
    new ValidationInterceptor((dto: CreateFileDto) => {
      return true;
    }))
  uploadFileZip(
    @Body() createFileDto: CreateFileDto,
    @UploadedFile() files: Express.Multer.File[]
  ) {

    if (files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const zipOr7zFile = files.find(file =>
      file.mimetype.includes('zip') || file.mimetype.includes('x-7z-compressed') || file.mimetype.includes('x-zip-compressed')
    );
    const pdfFile = files.find(file => file.mimetype.includes('pdf'));

    if (!zipOr7zFile) {
      throw new BadRequestException('You must upload one ZIP file and one PDF file');
    }

    return this.testCasesService.createFiles(createFileDto, zipOr7zFile, pdfFile);

  }

  @Get('zip/:id')
  async findFileZip(
    @Res() res: Response,
    @Param('id') id: number
  ) {
    await this.testCasesService.getStaticFile7z(id, res);
  }
}
