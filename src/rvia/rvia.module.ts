import { forwardRef, Module } from '@nestjs/common';
import { RviaService } from './rvia.service';
import { RviaController } from './rvia.controller';
import { CommonModule } from 'src/common/common.module';
import { CheckmarxModule } from 'src/checkmarx/checkmarx.module';
import { TestCasesService } from 'src/test-cases/test-cases.service';

@Module({
  controllers: [RviaController],
  providers: [RviaService],
  imports: [
    forwardRef(() => TestCasesService),
    CommonModule,
    forwardRef(() => CheckmarxModule),
  ],
  exports: [RviaService]
})
export class RviaModule { }
