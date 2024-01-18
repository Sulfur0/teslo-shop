import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );
    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user: User = req.user;
    // cuando se use este guard, es necesario usar el auth guard
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // forof, con que uno de los roles del usuario se encuentre
    // en la lista de los roles permitidos, permite la request
    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }
    // Se puede dejar el return false para retornar
    //   {
    //     "message": "Forbidden resource",
    //     "error": "Forbidden",
    //     "statusCode": 403
    // }
    // return false;
    throw new ForbiddenException(
      `User ${user.fullname} is not allowed to access this resource, validRoles: [${validRoles}]`,
    );
  }
}
