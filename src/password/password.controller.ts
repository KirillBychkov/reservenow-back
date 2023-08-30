import { Controller, Post, Patch, Body, Put, UseGuards, Request } from '@nestjs/common';
import { PasswordService } from './password.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import ResetDto from './dto/reset.dto';
import ChangeDto from './dto/change.dto';
import ResetRo from './ro/reset.ro';
import AuthRo from 'src/auth/ro/auth.ro';
import ConfirmDto from './dto/confirm.dto';

@ApiTags('Password')
@ApiBearerAuth()
@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @ApiOperation({ summary: 'Receive a reset token for password reset' })
  @Post('reset')
  @ApiOkResponse({ description: 'Successfully received a reset token', type: ResetRo })
  reset(@Body() body: ResetDto) {
    return this.passwordService.resetPassword(body.email);
  }

  @ApiOperation({ summary: 'Create new password by sending the reset token' })
  @UseGuards(AuthGuard('jwt-reset'))
  @Patch('confirm')
  @ApiOkResponse({ description: 'The password has been changed', type: AuthRo })
  confirm(@Request() req, @Body() body: ConfirmDto) {
    const { id, email } = req.user;
    return this.passwordService.confirmReset(body.new_password, { id, email });
  }

  @ApiOperation({ summary: 'Change password for the user by their access token' })
  @UseGuards(AuthGuard('jwt'))
  @Put('change')
  @ApiOkResponse({ description: 'The password has been changed', type: AuthRo })
  change(@Request() req, @Body() body: ChangeDto) {
    const { old_password, new_password } = body;
    const { id } = req.user;

    return this.passwordService.changePassword(id, old_password, new_password);
  }
}
