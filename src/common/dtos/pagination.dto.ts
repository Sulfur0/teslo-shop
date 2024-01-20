import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ default: 10, description: 'Limit of rows to be fetched' })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ default: 0, description: 'Amount of skipped rows' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
