import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  SetMetadata,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { Auth, GetUserData, RawHeaders } from './decorators';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';

@ApiTags('Auth')
@ApiResponse({ status: 201, description: 'User was created', type: User })
@ApiResponse({ status: 200, description: 'User was requested', type: User })
@ApiResponse({ status: 400, description: 'Bad request exception' })
@ApiResponse({ status: 403, description: 'Forbidden. Token error' })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.update(id, updateUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('refresh-token')
  @Auth()
  refreshToken(@GetUserData() user: User) {
    return this.authService.refreshToken(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUserData() user: User,
    @GetUserData(['email', 'fullname']) userData: Partial<User>,
    @RawHeaders() rawHeaders: string[], // custom decorator
    @Headers() headers: IncomingHttpHeaders, // out of the box
  ) {
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userData,
      rawHeaders,
      headers,
    };
  }

  /**
   * Usado para la autorizacion, es decir validar que el
   * usuario tenga los roles debidos para acceder al recurso
   * @param user
   * @returns
   */
  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUserData() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.superUser)
  privateRoute3(@GetUserData() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
