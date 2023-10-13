export class CreateManagerDto {
  user_id: number;
  first_name: string;
  last_name: string;
  description: string;
  hired_at: Date;
  resigned_at?: Date;
}
