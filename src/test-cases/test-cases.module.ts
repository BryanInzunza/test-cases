import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCasesService } from './test-cases.service';
import { TestCasesController } from './test-cases.controller';
// import { ApplicationRepository } from './application.repository'; // Asegúrate de que la ruta sea correcta
import { CommonModule } from 'src/common/common.module'; // Asegúrate de que la ruta sea correcta
import { Application } from './entities/application.entity';
import { Applicationstatus } from '../applicationstatus/entities/applicationstatus.entity';
import { Sourcecode } from '../sourcecode/entities/sourcecode.entity';
import { User } from 'src/auth/entities/user.entity';
import { Checkmarx } from '../checkmarx/entities/checkmarx.entity';
import { Cost } from './entities/cost.entity';
import { UsersApplication } from './entities/users-application.entity';
import { Scan } from './entities/scan.entity';
import { Position } from 'src/positions/entities/position.entity';
import { RviaModule } from '../rvia/rvia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      Applicationstatus,
      Sourcecode,
      User,
      Position,
      UsersApplication,
      Scan,
      Checkmarx,
      Cost,
    ]),
    CommonModule,
    RviaModule // Importa el módulo que contiene CommonService
  ],
  controllers: [TestCasesController],
  providers: [TestCasesService],
})
export class TestCasesModule { }