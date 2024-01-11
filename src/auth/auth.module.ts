import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [TypeOrmModule.forFeature([User])], // crea la tabla en base de datos
  exports: [TypeOrmModule], // permite que User pueda ser usado fuera de este modulo
})
export class AuthModule {}
