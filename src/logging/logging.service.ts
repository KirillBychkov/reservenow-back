import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';

@Injectable()
export class LoggingService {
  constructor(@InjectRepository(Log) private readonly logRepository: Repository<Log>) {}

  findAll() {
    return this.logRepository.find();
  }
}
