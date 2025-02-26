import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { Position } from './entities/position.entity';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [PositionsController],
  providers: [PositionsService],
  imports: [ 
    TypeOrmModule.forFeature([ Position ]),
    forwardRef(() => AuthModule),
    CommonModule
  ],
  exports:[PositionsService]
})
export class PositionsModule {}
