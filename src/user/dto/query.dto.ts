import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export default class ElementsQueryDto {
  @ApiProperty({ description: 'How many posts to receive from the DB' })
  @IsInt()
  limit: number = 10;
  @ApiProperty({ description: 'How many posts to skip in the DB' })
  @IsInt()
  skip: number = 0;
  search: string = '';
}
