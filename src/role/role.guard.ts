import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accountService: AccountService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tag = this.reflector.getAllAndOverride<string>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    const account = await this.accountService.getAccount(user.id, null);
    const role = account.role;

    if (!role.permissions.includes(tag) && role.name !== 'superuser') return false;

    return true;
  }
}
