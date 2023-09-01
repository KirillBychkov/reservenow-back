import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from './token.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Token')
@ApiBearerAuth()
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}
  @ApiOperation({ summary: "Refresh tokens by sending the user's refresh token" })
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @ApiOkResponse({ description: 'The tokens have been refreshed' })
  refresh(@Request() req) {
    return this.tokenService.refresh(req.user);
  }
}
