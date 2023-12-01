import { ApiProperty } from '@nestjs/swagger';

export default class ElementsQueryDto {
  @ApiProperty({
    description: "Id of the organization you want to get all client's reservations for",
  })
  organization_id?: number;
  @ApiProperty({ description: 'How many clients to receive from the DB (10 by default)' })
  limit?: number;
  @ApiProperty({ description: 'How many clients to skip in the DB (0 by default)' })
  skip?: number;
  @ApiProperty({
    description: 'Option which allow you to choose sorting like title:1 ASC or _id:-1 DESC',
  })
  sort?: string;
  @ApiProperty({ description: 'Name of the client (empty by default)' })
  search?: string;
}
