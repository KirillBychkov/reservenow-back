import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';

export default class GetStatisticQueryDto {
  @ApiProperty({ description: 'Start date for statistics', required: false })
  @IsISO8601()
  start_date?: string;

  @ApiProperty({ description: 'End date for statistics', required: false })
  @IsISO8601()
  end_date?: string;
}
