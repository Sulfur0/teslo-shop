import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { GetUserData, RawHeaders } from './decorators';
import { IncomingHttpHeaders } from 'http';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
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
}
