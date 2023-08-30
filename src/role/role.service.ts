import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import RoleDto from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>) {}

  getAll() {
    return this.roleRepository.find();
  }

  async getByName(name: string) {
    const role = this.roleRepository.findOneBy({ name });
    if (!role) throw new ConflictException('An account with the given id does not exist');
    return role;
  }

  async getById(id: number) {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) throw new ConflictException('An account with the given id does not exist');
    return role;
  }

  async createRole(roleDto: RoleDto) {
    const newRole = await this.roleRepository
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values(roleDto)
      .returning('*')
      .execute();
    return newRole;
  }

  async updateRole(id: number, fieldsToUpdate: any) {
    try {
      await this.getById(id);
    } catch (error) {
      return error;
    }
    const updated = await this.roleRepository
      .createQueryBuilder('role')
      .update(Role, fieldsToUpdate)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated;
  }

  async deleteRoleById(id: number) {
    try {
      await this.getById(id);
    } catch (error) {
      return error;
    }

    const deleted = await this.roleRepository.delete({ id });
    if (deleted.affected === 0) throw new NotFoundException();
    return;
  }
}
