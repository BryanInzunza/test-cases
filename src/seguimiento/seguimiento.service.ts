import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { Seguimiento } from './entities/seguimiento.entity';


@Injectable()
export class SeguimientoService {

  constructor(
    @InjectRepository(Seguimiento)
    private seguimientoRepository: Repository<Seguimiento>,
    
  ) {}

  create(createSeguimientoDto: CreateSeguimientoDto) {
    const auditoriaGlobal = this.seguimientoRepository.create(createSeguimientoDto);
    return this.seguimientoRepository.save(auditoriaGlobal);
  }
}
