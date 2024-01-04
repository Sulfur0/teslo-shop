import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  // Se registra la entidad en el módulo donde se configura, Product pertenece a ProductsModule
  // Solo en este caso se utiliza el forFeature de TypeOrmModule
  imports: [TypeOrmModule.forFeature([Product])],
})
export class ProductsModule {}
