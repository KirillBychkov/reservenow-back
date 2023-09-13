export class CreateTokenDto {
  access_token?: string;
  refresh_token?: string;
  verify_token?: string;
  reset_token?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at?: string;
}
