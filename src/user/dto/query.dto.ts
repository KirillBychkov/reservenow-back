import { ApiProperty } from '@nestjs/swagger';

export default class ElementsQueryDto {
  @ApiProperty({ description: 'How many posts to receive from the DB (10 by default)' })
  limit?: number;
  @ApiProperty({ description: 'How many posts to skip in the DB (0 by default)' })
  skip?: number;
  @ApiProperty({ description: 'Name of the user (empty by default)' })
  search?: string;
}
