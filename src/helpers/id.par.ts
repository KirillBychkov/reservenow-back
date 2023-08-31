import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export default class IdPar {
  @IsNumberString()
  @ApiProperty({ description: 'Id of the object' })
  id: number;
}
