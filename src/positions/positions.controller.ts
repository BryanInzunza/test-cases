import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';

import { ValidRoles } from '../auth/interfaces/valid-roles';
import { Auth } from '../auth/decorators';
import { Position } from './entities/position.entity';

import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('positions')
@Auth(ValidRoles.admin)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) { }

  @Post()
  @Auth(ValidRoles.admin)
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @Auth(ValidRoles.admin)
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.remove(id);
  }
}