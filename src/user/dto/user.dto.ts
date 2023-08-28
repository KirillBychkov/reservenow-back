import { ApiProperty } from '@nestjs/swagger';

export default class UserDTO {
  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  domain_url: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  description: string;
}
