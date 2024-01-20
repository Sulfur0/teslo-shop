import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    nullable: false,
    description: "User's email (unique)",
    uniqueItems: true,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    nullable: false,
    description: "User's password",
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    nullable: false,
    description: "User's Full Name",
  })
  @IsString()
  @MinLength(1)
  fullname: string;

  @ApiProperty({
    nullable: true,
    description: "User's Active flag",
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    nullable: true,
    description: "User's roles",
    default: ['user'],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  roles?: string[];
}
