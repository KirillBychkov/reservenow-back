import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RstStrategy extends PassportStrategy(Strategy, 'jwt-reset') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.RESET_SECRET,
    });
  }

  validate(payload: any) {
    console.log(payload);
    delete payload.exp;
    delete payload.iat;
    return payload;
  }
}
