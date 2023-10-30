import {
  Body,
  Request,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import SignInDTO from './dto/signin.dto';
import AuthDto from './dto/auth.dto';
import { Account } from 'src/account/entities/account.entity';
import ConfirmPasswordDto from 'src/password/dto/confirm-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Get bearer token for the user in the system' })
  @ApiCreatedResponse({ description: 'The user has logged in successfully', type: AuthDto })
  @Post('login')
  login(@Body() signInDTO: SignInDTO) {
    return this.authService.login(signInDTO);
  }

  @ApiOperation({ summary: 'Get current user by the access token' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ description: 'The user has been received successfully', type: Account })
  @Get('user')
  getUser(@Request() req) {
    return this.authService.getAccount(req.user.id);
  }

  @ApiOperation({ summary: 'Verify email by the token' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-verify'))
  @Post('verify')
  verify(@Request() req, @Body() body: ConfirmPasswordDto) {
    return this.authService.verify(body, req.user);
  }

  @ApiOperation({ summary: 'Log out from the account' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiNoContentResponse({ description: 'The user has logged out successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('logout')
  logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
