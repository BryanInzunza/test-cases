import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationstatusService } from './applicationstatus.service';
import { ApplicationstatusController } from './applicationstatus.controller';
import { Applicationstatus } from './entities/applicationstatus.entity';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ApplicationstatusController],
  providers: [ApplicationstatusService],
  imports: [
    TypeOrmModule.forFeature([Applicationstatus]),
    CommonModule,
    AuthModule,
  ],
  exports:[
    ApplicationstatusService
  ]
})
export class ApplicationstatusModule {}
