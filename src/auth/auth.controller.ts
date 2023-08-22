import { AuthService } from './auth.service';
import { Controller } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
}
