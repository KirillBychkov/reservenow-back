import { Client } from '../entities/client.entity';

export default class FindAllСlientsDto {
  filters: {
    skip?: number;
    limit?: number;
    search?: string;
    sorted?: string;
    total: number;
    received: number;
  };
  data: Client[];
}
