import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export default class ElementsQueryDto {
  @ApiProperty({ description: 'How many posts to receive from the DB' })
  @IsNumberString()
  limit: number = 10;
  @ApiProperty({ description: 'How many posts to skip in the DB' })
  @IsNumberString()
  skip: number = 0;
  search: string = '';
}
