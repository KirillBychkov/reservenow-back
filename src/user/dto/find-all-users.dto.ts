import { User } from '../entities/user.entity';

export default class FindAllUsersDto {
  filters: {
    skip: number;
    limit: number;
    search: string;
    total: number;
  };
  data: User[];
}

// { filters: { skip, limit, search, total: users.length }, data: users };
