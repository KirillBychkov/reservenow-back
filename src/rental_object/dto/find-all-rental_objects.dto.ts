import { RentalObject } from '../entities/rental_object.entity';

export default class FindAllRentalObjectsDto {
  filters: {
    skip?: number;
    limit?: number;
    search?: string;
    sorted?: string;
    total: number;
    received: number;
  };
  data: RentalObject[];
}
