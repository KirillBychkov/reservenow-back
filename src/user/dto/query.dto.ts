import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

export default class ElementsQueryDto {
  @ApiProperty({ description: 'How many posts to receive from the DB (10 by default)' })
  @IsNumberString()
  limit?: number;
  @ApiProperty({ description: 'How many posts to skip in the DB (0 by default)' })
  @IsNumberString()
  skip?: number;
  @ApiProperty({ description: 'Name of the user (empty by default)' })
  @IsString()
  search?: string;
}
