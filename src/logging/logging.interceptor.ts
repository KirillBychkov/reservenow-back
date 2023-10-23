import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, tap } from 'rxjs';
import { Log } from './entities/log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@InjectRepository(Log) private readonly logRepository: Repository<Log>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    const log = new Log();
    log.url = response.req.url;
    log.status = response.statusCode;

    return next.handle().pipe(
      tap({
        next: () => {
          log.message = 'fine';
          this.logRepository.save(log);
        },
        error: (error) => {
          log.message = JSON.stringify(error);
          this.logRepository.save(log);
        },
      }),
    );
  }
}
