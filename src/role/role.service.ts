import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import RoleDto from './dto/creete-role.dto';

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>) {}

  findAll() {
    return this.roleRepository.find();
  }

  async getByName(name: string) {
    const role = this.roleRepository.findOneBy({ name });
    if (!role) throw new ConflictException('A role with the given id does not exist');
    return role;
  }

  async findOne(id: number) {
    const role = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('role.id = :id', { id })
      .getOne();
    if (!role) throw new ConflictException('A role with the given id does not exist');
    return role;
  }

  async create(roleDto: RoleDto) {
    const newRole = await this.roleRepository
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values(roleDto)
      .returning('*')
      .execute();

    return newRole.raw;
  }

  async update(id: number, fieldsToUpdate: any) {
    await this.findOne(id);

    const updated = await this.roleRepository
      .createQueryBuilder('role')
      .update(Role, fieldsToUpdate)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated;
  }

  async delete(id: number) {
    await this.findOne(id);

    const deleted = await this.roleRepository.delete({ id });
    if (deleted.affected === 0) throw new NotFoundException();
    return;
  }
}
