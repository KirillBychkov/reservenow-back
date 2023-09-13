import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from './token.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import AuthDto from 'src/auth/dto/auth.dto';

@ApiTags('Token')
@ApiBearerAuth()
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @ApiOperation({ summary: "Refresh tokens by sending the user's refresh token" })
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiCreatedResponse({ description: 'The tokens have been refreshed', type: AuthDto })
  @Post('refresh')
  refresh(@Request() req) {
    return this.tokenService.refresh(req.user);
  }
}
