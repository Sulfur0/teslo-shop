import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  // Se registra la entidad en el módulo donde se configura, Product pertenece a ProductsModule
  // Solo en este caso se utiliza el forFeature de TypeOrmModule
  imports: [TypeOrmModule.forFeature([Product, ProductImage]), AuthModule], // crea las tablas en base de datos
  exports: [ProductsService, TypeOrmModule], // permite que User pueda ser usado fuera de este modulo
})
export class ProductsModule {}
