import { Equipment } from '../entities/equipment.entity';

export default class FindAllEquipmentDto {
  filters: {
    skip?: number;
    limit?: number;
    search?: string;
    sorted?: string;
    total: number;
    received: number;
  };
  data: Equipment[];
}
