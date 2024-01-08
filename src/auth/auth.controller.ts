import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { GetUser, RawHeaders, RoleProtected } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles.enum';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User,
  ){
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testPrivateRoute(
    // Devuelve request entera con toda la info
    // @Req() req: Express.Request
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[]
  ) {
    // console.log(req.user)
    return {
      ok: true,
      msg: 'This is a private route!',
      user,
      userEmail,
      rawHeaders
    };
  }
  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected( ValidRoles.superUser, ValidRoles.admin )
  @UseGuards( 
    AuthGuard(), // Autorización
    UserRoleGuard // Autenticación
  )
  testPrivateRoute2(
    @GetUser() user: User,
  ) {
    // console.log(req.user)
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  // Agrupa decoradores para comprobar autorización y autenticación
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  testPrivateRoute3(
    @GetUser() user: User,
  ) {
    // console.log(req.user)
    return {
      ok: true,
      user,
    };
  }
}
