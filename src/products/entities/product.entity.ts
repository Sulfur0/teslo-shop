import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '1022c266-8803-4916-a20c-08bb2a6ebf17',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: "Men's Powerwall Tee",
    description: 'Product title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({ example: 35, description: 'Product price' })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    example:
      "Inspired by our popular home battery, the Tesla Powerwall Tee is made from 100% cotton and features the phrase 'Pure Energy' under our signature logo in the back. Designed for fit, comfort and style, the exclusive tee promotes sustainable energy in any environment.",
    description: 'Product description',
    default: null,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 'men_powerwall_tee',
    description: 'Product Slug',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({ example: 24, description: 'Product Stock', default: 0 })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({ example: ['XL', 'XXL'], description: 'Product Sizes' })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({ example: 'men', description: 'Product Gender' })
  @Column('text')
  gender: string;

  @ApiProperty({ example: 'shirt', description: 'Product Tags' })
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty({
    example: ['9877034-00-A_0_2000.jpg', '9877034-00-A_2.jpg'],
    description: 'Product Images',
  })
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  /**
   * Argumentos:
   * 1. La otra entidad relacionada con esta
   * 2. Instancia de la otra tabla, como se relaciona con esta tabla?
   * 3. Eager carga automaticamente esta relacion cuando se hagan
   * consultas (no funciona con querybuilders)
   */
  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    if (this.slug) {
      this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }
  }
}
