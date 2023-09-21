import { Account } from 'src/account/entities/account.entity';

export default class FindAllUsersDto {
  filters: {
    skip?: number;
    limit?: number;
    search?: string;
    total: number;
  };
  data: Account[];
}
