import { AuthService } from './auth.service';
import {
  Body,
  Request,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import SignInDTO from './dto/signin.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  getUser(@Request() req) {
    return this.authService.getUser(req);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('verify')
  verify() {
    return '/auth/verify';
  }

  @Post('login')
  login(@Body() signInDTO: SignInDTO) {
    return this.authService.login(signInDTO);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('logout')
  @HttpCode(204)
  logout(@Request() req) {
    return this.authService.logout(req);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  refresh(@Request() req) {
    return this.authService.refresh(req);
  }
}
