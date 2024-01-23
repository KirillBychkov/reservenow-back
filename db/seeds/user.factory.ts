import { User } from 'src/user/entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(User, (faker) => {
  const user = new User();
  user.first_name = faker.name.firstName();
  user.last_name = faker.name.lastName();
  user.phone = faker.phone.number('380#########');
  return user;
});
