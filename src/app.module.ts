import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config';
import { TestCasesModule } from './test-cases/test-cases.module';
import { TestCasesController } from './test-cases/test-cases.controller';
import { TestCasesService } from './test-cases/test-cases.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      database: envs.dbName,
      username: envs.dbUsername,
      password: envs.dbPassword,
      autoLoadEntities: true,
      synchronize: false
    }),
    TestCasesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
