import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { validate as isUUID } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
        user,
      });
      await this.productRepository.save(product);
      // se retorna el objeto con las imagenes sin los ids,
      // tal y como fueron ingresados en el createProductDto
      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: { images: true },
    });
    // Se mapea el producto para evitar retornar los ids de las imagenes
    return products.map((product) => ({
      ...product,
      images: product.images.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneByOrFail({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); // alias de la tabla
      try {
        product = await queryBuilder
          .where(`LOWER(title) =:title or slug =:slug`, {
            title: term.toLowerCase(),
            slug: term,
          })
          .leftJoinAndSelect('prod.images', 'prodImages')
          .getOne();
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
    if (!product)
      throw new NotFoundException(`Product with search term ${term} not found`);
    return product;
  }

  /**
   * Metodo para retornar un producto con las imagenes parseadas sin id
   * @param term
   * @returns
   */
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...rest } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...rest,
      images: [],
    });
    if (!product)
      throw new NotFoundException(`Product with id: ${id} not Found`);

    /**
     * Si vienen imágenes, al actualizarlas del modo anterior se estaba
     * perdiendo la referencia al id del producto, ahora toca armar una
     * transacción, borrar las imágenes existentes del producto y volverlas
     * a registrar bajo el producto actualizado.
     */
    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: id });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      } else {
        /**
         * Si la query no tiene imágenes, buscar las
         * imágenes que tiene actualmente el producto
         * y guardarlos
         */
        product.images = await this.productImageRepository.findBy({
          product: { id },
        });
      }
      product.user = user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return product;
      // return await this.productRepository.save(product);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
