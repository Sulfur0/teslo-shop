import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class SeedService {
  // private readonly productsService: ProductsService;
  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'Seed executed';
  }

  private async deleteTables() {
    // como hay cascade en los productos, va a borrar las imagenes tambien
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });
    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    try {
      // como hay cascade en los productos, va a borrar las imagenes tambien
      await this.productsService.deleteAllProducts();
      const products = initialData.products;
      const insertPromises = [];
      products.forEach((product) => {
        insertPromises.push(this.productsService.create(product, user));
      });
      // Espera a que se resuelvan todos los inserts y continua con la siguiente línea
      await Promise.all(insertPromises);
    } catch (error) {
      throw new Error('Unable to seed products, check logs');
    }
  }
}
