import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enum/roles.enum';
import { JwtPayload } from '../interfaces/jwt.interface';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    // Получаем необходимые роли для маршрута
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Если роли не указаны, доступ разрешен
    }
    const { user } = context.switchToHttp().getRequest();
    // Проверяем, есть ли у пользователя роль, которая соответствует одной из требуемых ролей
    // Объект `user` поступает сюда из `JwtStrategy.validate`
    return requiredRoles.some((role) => user.role === role);
  }
}