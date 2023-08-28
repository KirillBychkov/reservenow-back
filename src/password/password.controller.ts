import {
  Controller,
  Post,
  Patch,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PasswordService } from './password.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Password')
@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Post('reset')
  reset() {}

  @Patch('confirm')
  confirm() {}

  @UseGuards(AuthGuard('jwt'))
  @Put('change')
  change(@Request() req) {
    const { old_password, new_password } = req.body;
    const { email } = req.user;

    return this.passwordService.changePassword(
      email,
      old_password,
      new_password,
    );
  }
}
