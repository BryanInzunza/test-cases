import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCasesService } from './test-cases.service';
import { TestCasesController } from './test-cases.controller';
// import { ApplicationRepository } from './application.repository'; // Asegúrate de que la ruta sea correcta
import { CommonModule } from 'src/common/common.module'; // Asegúrate de que la ruta sea correcta
import { Application } from './entities/application.entity';
import { Applicationstatus } from '../applicationstatus/entities/applicationstatus.entity';
import { Sourcecode } from '../sourcecode/entities/sourcecode.entity';
// import { Checkmarx } from '../checkmarx/entities/checkmarx.entity';
import { Cost } from './entities/cost.entity';
import { Scan } from './entities/scan.entity';
import { RviaModule } from '../rvia/rvia.module';
import { ApplicationstatusModule } from 'src/applicationstatus/applicationstatus.module';
import { SourcecodeModule } from 'src/sourcecode/sourcecode.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      Applicationstatus,
      Sourcecode,
      Scan,
      Cost,
    ]),
    ApplicationstatusModule,
    SourcecodeModule,
    HttpModule,
    CommonModule,
    RviaModule // Importa el módulo que contiene CommonService
  ],
  controllers: [TestCasesController],
  providers: [TestCasesService],
  exports: [TestCasesService]
})
export class TestCasesModule { }