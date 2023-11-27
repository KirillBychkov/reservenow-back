import {
  ForbiddenError,
  ForcedSubject,
  MongoAbility,
  RawRuleOf,
  createMongoAbility,
  subject,
} from '@casl/ability';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from './role.service';
import { size, map } from 'lodash';
import { render } from 'mustache';

import { CHECK_ABILITY, RequiredRule } from './abilities.decorator';
import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';

export const actions = ['read', 'manage', 'create', 'update', 'delete'] as const;

export const subjects = ['organization', 'user', 'all'] as const;

type Abilities = [
  (typeof actions)[number],
  (typeof subjects)[number] | ForcedSubject<Exclude<(typeof subjects)[number], 'all'>>,
];

export type AppAbility = MongoAbility<Abilities>;

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private readonly dataSource: DataSource,
    private reflector: Reflector,
    private roleService: RoleService,
  ) {}

  createAbility = (rules: RawRuleOf<AppAbility>[]) => createMongoAbility<AppAbility>(rules);

  parseCondition(permissions: any, user: User) {
    const data = map(permissions, (permission) => {
      if (size(permission.conditions)) {
        const parsedCondition = render(permission.conditions['userId'], user);

        return { ...permission, conditions: { userId: Number(parsedCondition) } };
      }
      return permission;
    });

    return data;
  }

  async getObject(subName: string, id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    const queries = {
      rentalObject: `SELECT ro.*, o."userId"
                     FROM rental_object ro
                     JOIN organization o ON ro."organizationId" = o.id
                     WHERE ro.id = $1`,
      allOther: `SELECT * FROM "${subName}" WHERE id = $1`,
    };

    try {
      await queryRunner.connect();
      const subject = await queryRunner.query(
        subName === 'rental_object' ? queries.rentalObject : queries.allOther,
        [id],
      );
      queryRunner.release();

      if (!subject.length) throw new NotFoundException(`${subName} not found`);
      return subject;
    } catch (err) {
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules: any =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) || [];
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const role = await this.roleService.findOne(user.role_id);

    const parsedPermissions = this.parseCondition(role.permissions, user);

    try {
      const ability = this.createAbility(Object(parsedPermissions));
      for (const rule of rules) {
        let sub = {};
        if (rule.conditions) {
          const subId = +request.params['id'] ?? +request.query['organizationId'];
          sub = await this.getObject(rule.subject, subId);
        }
        request.data = sub;
        ForbiddenError.from(ability)
          .setMessage('You are not allowed to perform this action')
          .throwUnlessCan(rule.action, subject(rule.subject, sub[0] || {}));
      }
      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }
}
