import { ApiProperty } from '@nestjs/swagger';

export default class ResetRo {
  @ApiProperty()
  reset_token: string;
}
