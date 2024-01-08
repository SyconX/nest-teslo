import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('UserRoleGuard');
    
    // Recoge meta archivos, en este caso para buscar roles válidos
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());

    // Comprueba si no hay roles configurados y permite pasar
    if(!validRoles) return true;
    if(validRoles.length == 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
  
    if(!user)
      throw new BadRequestException('User not found');

    for (const role of user.roles) {
      if( validRoles.includes(role) )
        return true;
    }
    throw new ForbiddenException(`User ${user.fullName} need a valid role: [${validRoles}}`);
  }
}
