import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { TestCasesService } from './test-cases.service';
import { CreateTestCases } from './dto/create-test-cases.dto';
// import { Auth } from 'src/auth/decorators';
// import { ValidRoles } from 'src/auth/interfaces';

@Controller('test-cases')
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) { }

  @Get()
  getHello() {
    return this.testCasesService.holaPrueba();
  }

  @Patch(':id')
  addApptestCases(@Param('id', ParseIntPipe) id: number, @Body() createTestCases: CreateTestCases) {
    return this.testCasesService.addAppTestCases(id, createTestCases);
  }
}
