import { Module, forwardRef } from '@nestjs/common';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleController } from './role.controller';
import { AccountModule } from 'src/account/account.module';
import { Permission } from './entities/permission.entity';

@Module({
  imports: [forwardRef(() => AccountModule), TypeOrmModule.forFeature([Permission, Role])],
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
