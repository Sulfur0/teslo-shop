import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  // private readonly productsService: ProductsService;
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    await this.insertNewProducts();
    return 'Seed executed';
  }

  private async insertNewProducts() {
    try {
      await this.productsService.deleteAllProducts();
      const products = initialData.products;
      const insertPromises = [];
      products.forEach((product) => {
        insertPromises.push(this.productsService.create(product));
      });
      // Espera a que se resuelvan todos los inserts y continua con la siguiente línea
      await Promise.all(insertPromises);
    } catch (error) {
      throw new Error('Unable to seed products, check logs');
    }
  }
}
