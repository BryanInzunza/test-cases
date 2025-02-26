import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckmarxService } from './checkmarx.service';
import { CheckmarxController } from './checkmarx.controller';
import { Checkmarx } from './entities/checkmarx.entity';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { RviaModule } from 'src/rvia/rvia.module';
import { TestCasesModule } from 'src/test-cases/test-cases.module';
@Module({
  controllers: [CheckmarxController],
  providers: [CheckmarxService],
  imports: [
    TypeOrmModule.forFeature([Checkmarx]),
    forwardRef(() => TestCasesModule),
    CommonModule,
    AuthModule,
    forwardRef(() => RviaModule),
  ],
  exports: [
    CheckmarxService,
    TypeOrmModule
  ]
})
export class CheckmarxModule { }
