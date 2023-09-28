import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Client])],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
