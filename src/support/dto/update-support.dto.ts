import { SupportStatus } from '../entities/support.entity';

export class UpdateSupportDto {
  result_description: string;
  status: SupportStatus;
}
