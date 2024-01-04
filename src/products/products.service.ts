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
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { formatMultilineString } from './../common/helper';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: relaciones
    });
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneByOrFail({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      try {
        product = await queryBuilder
          .where(`LOWER(title) =:title or slug =:slug`, {
            title: term.toLowerCase(),
            slug: term,
          })
          .getOne();
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
    if (!product)
      throw new NotFoundException(`Product with search term ${term} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });
    if (!product)
      throw new NotFoundException(`Product with id: ${id} not Found`);

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const deletion = await this.productRepository.delete(id);
    if (deletion.affected > 0)
      return { message: 'The record has been deleted successfully' };
    else
      throw new NotFoundException(
        'Could not find product, no deletion was executed',
      );
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
}
