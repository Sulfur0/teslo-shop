import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    example: '1022c266-8803-4916-a20c-08bb2a6ebf17',
    description: 'User ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'test2@gmail.com',
    description: "User's email",
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  email: string;

  @ApiProperty({
    example: 'Abc123',
    description: "User's password",
  })
  @Column('text', { select: false })
  password: string;

  @ApiProperty({
    example: 'Test Two',
    description: "User's full name",
    uniqueItems: false,
  })
  @Column('text')
  fullname: string;

  @ApiProperty({
    nullable: true,
    description: "User's Active flag",
    default: true,
  })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({
    nullable: true,
    description: "User's roles",
    default: ['user'],
  })
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  /**
   * Argumentos:
   * 1. La otra entidad relacionada con esta
   * 2. Instancia de la otra tabla, como se relaciona con esta tabla?
   */
  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
