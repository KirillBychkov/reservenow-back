import { Support } from '../entities/support.entity';

export default class FindAllSupportRecordsDto {
  filters: {
    skip?: number;
    limit?: number;
    search?: string;
    sorted?: string;
    total: number;
    received: number;
  };
  data: Support[];
}
