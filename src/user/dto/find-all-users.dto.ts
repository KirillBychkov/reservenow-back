import { User } from '../entities/user.entity';

export default class FindAllUsersDto {
  filters: {
    skip?: number;
    limit?: number;
    search?: string;
    total: number;
    received: number;
  };
  data: User[];
}
