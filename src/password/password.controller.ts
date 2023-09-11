import { Controller, Post, Patch, Body, Put, UseGuards, Request } from '@nestjs/common';
import { PasswordService } from './password.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import ResetPasswordDto from './dto/reset-password.dto';
import ChangePasswordDto from './dto/change-password.dto';
import ResetRo from './ro/reset.ro';
import AuthRo from 'src/auth/dto/auth.dto';
import ConfirmPasswordDto from './dto/confirm-password.dto';

@ApiTags('Password')
@ApiBearerAuth()
@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @ApiOperation({ summary: 'Receive a reset token for password reset' })
  @Post('reset')
  @ApiOkResponse({ description: 'Successfully received a reset token', type: ResetRo })
  reset(@Body() body: ResetPasswordDto) {
    return this.passwordService.resetPassword(body.email);
  }

  @ApiOperation({ summary: 'Create new password by sending the reset token' })
  @UseGuards(AuthGuard('jwt-reset'))
  @Patch('confirm')
  @ApiOkResponse({ description: 'The password has been changed', type: AuthRo })
  confirm(@Request() req, @Body() body: ConfirmPasswordDto) {
    return this.passwordService.confirmReset(body, req.user);
  }

  @ApiOperation({ summary: 'Change password for the user by their access token' })
  @UseGuards(AuthGuard('jwt'))
  @Put('change')
  @ApiOkResponse({ description: 'The password has been changed', type: AuthRo })
  change(@Request() req, @Body() body: ChangePasswordDto) {
    return this.passwordService.changePassword(req.user.id, body);
  }
}
