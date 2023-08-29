import { AuthService } from './auth.service';
import { Body, Request, Controller, Delete, Get, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import SignInDTO from './dto/signin.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import AuthDTO from './dto/auth.dto';
import { User } from 'src/user/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Get bearer token for the user in the system' })
  @Post('login')
  @ApiOkResponse({ description: 'The user has logged in successfully', type: AuthDTO })
  login(@Body() signInDTO: SignInDTO) {
    return this.authService.login(signInDTO);
  }

  @ApiOperation({ summary: 'Get current user by the access token' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  @ApiOkResponse({ description: 'The user has been received successfully', type: User })
  getUser(@Request() req) {
    return this.authService.getUser(req.user.id);
  }

  @ApiOperation({ summary: 'Verify email by the token' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('verify')
  verify() {
    return '/auth/verify';
  }

  @ApiOperation({ summary: 'Log out from the account' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('logout')
  @ApiNoContentResponse({ description: 'The user has logged out successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
