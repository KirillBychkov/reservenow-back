import { ApiProperty } from '@nestjs/swagger';

export default class ElementsQueryDto {
  @ApiProperty({ description: 'How many support records to receive from the DB (10 by default)' })
  limit?: number;
  @ApiProperty({ description: 'How many support records to skip in the DB (0 by default)' })
  skip?: number;
  @ApiProperty({
    description: 'Option which allow you to choose sorting like title:1 ASC or _id:-1 DESC',
  })
  sort?: string;
  @ApiProperty({ description: 'ID of the support records (empty by default)' })
  search?: string;
}
