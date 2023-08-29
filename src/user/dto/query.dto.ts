import { ApiProperty } from '@nestjs/swagger';

export default class ElementsQueryEto {
  @ApiProperty({ description: 'How many posts to receive from the DB' })
  limit: number = 10;
  @ApiProperty({ description: 'How many posts to skip in the DB' })
  skip: number = 0;
  search: string = '';
}
