import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Logger, Inject, forwardRef, UnsupportedMediaTypeException } from '@nestjs/common';
import { CreateTestCases } from './dto/create-test-cases.dto';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Repository } from 'typeorm';
import { CreateFileDto } from './dto/create-file.dto';
import { User } from '../auth/entities/user.entity'
import { v4 as uuid } from 'uuid';
import { join } from 'path';
import * as fsExtra from 'fs-extra';
import { SourcecodeService } from '../sourcecode/sourcecode.service';
import { ApplicationstatusService } from '../applicationstatus/applicationstatus.service';
import { RviaService } from '../rvia/rvia.service';
import * as unzipper from 'unzipper';
import * as seven from '7zip-min';

const addon = require(process.env.RVIA_PATH);

@Injectable()
export class TestCasesService {

    private readonly logger = new Logger('ApplicationsService');
    private readonly crviaEnvironment: number;

    constructor(
        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
        private readonly encryptionService: CommonService,
        private readonly configService: ConfigService,
        private readonly estatusService: ApplicationstatusService,
        private readonly sourcecodeService: SourcecodeService,
        @Inject(forwardRef(() => RviaService))
        private readonly rviaService: RviaService,

    ) {
        this.crviaEnvironment = Number(this.configService.get('RVIA_ENVIRONMENT'));
    }

    async findOne(id: number) {
        const aplicacion = await this.applicationRepository.findOneBy({ idu_aplicacion: id });

        if (!aplicacion)
            throw new NotFoundException(`Aplicación con ${id} no encontrado `);

        return aplicacion;
    }

    async addAppTestCases(id: number, createTestCases: CreateTestCases) {
        try {
            const obj = new addon.CRvia(this.crviaEnvironment);
            //Pendiente 
            // const iResult3 = obj.createTestCase( lID, 90329121, "/sysx/bito/projects/Web-Basico-PHP");
            // console.log(" Valor de retorno: " + iResult3);

            const application = await this.applicationRepository.findOne({
                where: { idu_aplicacion: id }
            });

            if (!application) throw new NotFoundException(`Aplicación con ID ${id} no encontrado`);

            application.opc_arquitectura = {
                ...application.opc_arquitectura,
                [createTestCases.opcArquitectura]: true,
            };

            application.opc_estatus_caso = 2;

            await this.applicationRepository.save(application);

            application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);

            return application;
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    async holaPrueba() {
        return 'hola';
    }

    private handleDBExceptions(error: any) {
        if (error.code === '23505') throw new BadRequestException(error.detail);
        if (error.response) throw new BadRequestException(error.message);

        this.logger.error(error);
        throw new InternalServerErrorException('Unexpected error, check server logs');
    }

    async createFiles(createFileDto: CreateFileDto, zipFile: Express.Multer.File, pdfFile: Express.Multer.File | undefined, user: User) {

        const obj = new addon.CRvia(this.crviaEnvironment);
        const iduProject = obj.createIDProject();
        const tempExtension = zipFile.originalname.split('.');

        const nameApplication = tempExtension.slice(0, -1).join('.').replace(/\s+/g, '-');
        const uniqueTempFolderName = `temp-${uuid()}`;
        const tempFolderPath = join(zipFile.destination, uniqueTempFolderName);
        const tempZipPath = join(tempFolderPath, zipFile.filename);
        const repoFolderPath = join(zipFile.destination, `${iduProject}_${nameApplication}`);
        const isSanitizacion = createFileDto.num_accion == 2 ? true : false;
        let dataCheckmarx: { message: string; error?: string; isValid?: boolean; checkmarx?: any };
        let rviaProcess: { isValidProcess: boolean, messageRVIA: string };

        try {

            if (isSanitizacion && !pdfFile) {
                throw new BadRequestException("Es necesario subir el PDF");
            }

            const estatu = await this.findOne(2);
            if (!estatu) throw new NotFoundException('Estatus no encontrado');

            if (createFileDto.num_accion == 0 && !createFileDto.opc_arquitectura)
                throw new BadRequestException("Es necesario seleccionar una opción de arquitectura");

            await fsExtra.ensureDir(tempFolderPath);
            await fsExtra.move(zipFile.path, tempZipPath);

            // Verifica si el archivo se movió correctamente
            const fileExists = await fsExtra.pathExists(tempZipPath);
            if (!fileExists) {
                throw new InternalServerErrorException(`El archivo no se movió correctamente a ${tempZipPath}`);
            }

            try {
                let extractedFolders: string[] = [];
                if (zipFile.mimetype === 'application/zip' || zipFile.mimetype === 'application/x-zip-compressed') {
                    // Descomprimir archivo .zip
                    await unzipper.Open.file(tempZipPath)
                        .then(async (directory) => {
                            await fsExtra.remove(repoFolderPath);
                            await fsExtra.ensureDir(repoFolderPath);
                            await directory.extract({ path: repoFolderPath });
                            extractedFolders = await fsExtra.readdir(repoFolderPath);
                        })
                        .catch(error => {
                            throw new InternalServerErrorException(`Error al descomprimir el archivo .zip: ${error.message}`);
                        });
                } else if (zipFile.mimetype === 'application/x-7z-compressed') {
                    // Descomprimir archivo .7z
                    await new Promise<void>((resolve, reject) => {
                        seven.unpack(tempZipPath, repoFolderPath, (err) => {
                            if (err) {
                                return reject(new InternalServerErrorException(`Error al descomprimir el archivo .7z: ${err.message}`));
                            }
                            resolve();
                        });
                    });
                    extractedFolders = await fsExtra.readdir(repoFolderPath);
                } else {
                    throw new UnsupportedMediaTypeException('Formato de archivo no soportado');
                }
                // if (extractedFolders.length === 1 && (await fsExtra.stat(join(repoFolderPath, extractedFolders[0]))).isDirectory()) {
                //   const singleFolderPath = join(repoFolderPath, extractedFolders[0]);
                //   const filesInside = await fsExtra.readdir(singleFolderPath);
                //   for (const file of filesInside) {
                //       await fsExtra.move(join(singleFolderPath, file), join(repoFolderPath, file), { overwrite: true });
                //   }
                //   await fsExtra.remove(singleFolderPath);
                // }
            } catch (error) {
                throw new InternalServerErrorException(`Error al descomprimir el archivo: ${error.message}`);
            }

            // Crear el registro de código fuente
            const sourcecode = await this.sourcecodeService.create({
                nom_codigo_fuente: this.encryptionService.encrypt(`${iduProject}_${nameApplication}.${tempExtension[tempExtension.length - 1]}`),
                nom_directorio: this.encryptionService.encrypt(repoFolderPath),
            });
            const opciones = createFileDto.opc_arquitectura;
            // Crear el registro de la aplicación
            const application = new Application();
            application.nom_aplicacion = this.encryptionService.encrypt(nameApplication);
            application.idu_proyecto = iduProject;
            application.num_accion = createFileDto.num_accion;
            application.opc_arquitectura = createFileDto.opc_arquitectura || { "1": false, "2": false, "3": false, "4": false };
            application.opc_lenguaje = createFileDto.opc_lenguaje;
            application.opc_estatus_doc = opciones['1'] ? 2 : 0;
            application.opc_estatus_doc_code = opciones['2'] ? 2 : 0;
            application.opc_estatus_caso = opciones['3'] ? 2 : 0;
            application.opc_estatus_calificar = opciones['4'] ? 2 : 0;
            // application.applicationstatus = estatu;
            application.sourcecode = sourcecode;
            application.idu_usuario = 1;

            await this.applicationRepository.save(application);


            // Renombrar el archivo .zip o .7z con el id y nombre de la aplicación
            const newZipFileName = `${application.idu_proyecto}_${nameApplication}.${tempExtension[tempExtension.length - 1]}`;
            const newZipFilePath = join(zipFile.destination, newZipFileName);

            // Verifica si el archivo existe antes de renombrarlo
            const tempZipExists = await fsExtra.pathExists(tempZipPath);
            if (tempZipExists) {
                await fsExtra.rename(tempZipPath, newZipFilePath);
            } else {
                throw new InternalServerErrorException(`El archivo a renombrar no existe: ${tempZipPath}`);
            }

            await fsExtra.remove(tempFolderPath);

            rviaProcess = await this.rviaService.ApplicationInitProcess(application, obj);

            application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);

            return {
                application,
                checkmarx: isSanitizacion && pdfFile ? dataCheckmarx.checkmarx : [],
                esSanitizacion: isSanitizacion,
                rviaProcess
            };

        } catch (error) {
            console.error('Error al procesar el archivo:', error);
            if (pdfFile) {
                await fsExtra.remove(pdfFile.path);
            }

            if (zipFile && zipFile.path) {
                await fsExtra.remove(tempZipPath);
                await fsExtra.remove(tempFolderPath);
            }
            this.handleDBExceptions(error);
            throw error;
        }
    }


}