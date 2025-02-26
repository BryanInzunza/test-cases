import { Module } from '@nestjs/common';
import { SeguimientoService } from './seguimiento.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Seguimiento } from './entities/seguimiento.entity';

@Module({
  providers: [SeguimientoService],
  imports: [
    TypeOrmModule.forFeature([ Seguimiento ])
  ],
  exports:[TypeOrmModule, SeguimientoService]
})
export class SeguimientoModule {}
