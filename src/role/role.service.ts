import { Injectable, NotFoundException } from '@nestjs/common';
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

  getById(id: number) {
    return this.roleRepository.findBy({ id });
  }

  createRole(roleDto: RoleDto) {
    return this.roleRepository.insert(roleDto);
  }

  async updateRole(id: number, fieldsToUpdate: any) {
    const updated = await this.roleRepository
      .createQueryBuilder('role')
      .update(Role, fieldsToUpdate)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async deleteRoleById(id: number) {
    const result = await this.roleRepository.delete({ id });
    if (result.affected === 0) throw new NotFoundException();
    return;
  }
}
