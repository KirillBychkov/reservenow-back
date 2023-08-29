import { ApiProperty } from '@nestjs/swagger';

export default class RoleDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  permissioins: string[];
}
