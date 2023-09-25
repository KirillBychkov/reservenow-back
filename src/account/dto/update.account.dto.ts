import { Manager } from 'src/manager/entities/manager.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { User } from 'src/user/entities/user.entity';
import { AccountStatus } from '../entities/account.entity';

export class UpdateAccountDto {
  password?: string;
  user?: User;
  manager?: Manager;
  trainer?: Trainer;
  status?: AccountStatus;
}
