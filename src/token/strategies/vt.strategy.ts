import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class VtStrategy extends PassportStrategy(Strategy, 'jwt-verify') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.VERIFY_SECRET,
    });
  }

  validate(payload: any) {
    delete payload.exp;
    delete payload.iat;
    console.log(payload);
    return payload;
  }
}
