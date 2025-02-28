import { forwardRef, Module } from '@nestjs/common';
import { RviaService } from './rvia.service';
import { RviaController } from './rvia.controller';
import { CommonModule } from 'src/common/common.module';
import { TestCasesModule } from 'src/test-cases/test-cases.module';

@Module({
  controllers: [RviaController],
  providers: [RviaService],
  imports: [
    forwardRef(() => TestCasesModule),
    CommonModule,
  ],
  exports: [RviaService]
})
export class RviaModule { }
