export class CreateManagerDto {
  email: string;
  first_name: string;
  last_name: string;
  description: string;
  hired_at: Date;
  resigned_at?: Date;
}
