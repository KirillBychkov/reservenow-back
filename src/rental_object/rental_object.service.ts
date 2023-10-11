import { ConflictException, Injectable, UseInterceptors } from '@nestjs/common';
import { CreateRentalObjectDto } from './dto/create-rental_object.dto';
import { UpdateRentalObjectDto } from './dto/update-rental_object.dto';
import { RentalObject } from './entities/rental_object.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationService } from 'src/organization/organization.service';
import { workingHoursValidation } from 'src/helpers/workingHoursValidation';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class RentalObjectService {
  constructor(
    @InjectRepository(RentalObject)
    private readonly rentalObjectsRepository: Repository<RentalObject>,
    private readonly organizationService: OrganizationService,
    private readonly storageService: StorageService,
  ) {}

  @UseInterceptors()
  async create(
    file: Express.Multer.File,
    createRentalObjectDto: CreateRentalObjectDto,
  ): Promise<RentalObject> {
    await workingHoursValidation(createRentalObjectDto);

    const { organizationId, ...rentalObject } = createRentalObjectDto;
    const organization = await this.organizationService.findOne(organizationId);

    const result =
      file !== undefined
        ? await this.storageService.s3_upload(
            file.buffer,
            `rental_object_${rentalObject.address}.${file.mimetype.split('/')[1]}`,
            file.mimetype,
          )
        : { Location: null };

    return this.rentalObjectsRepository.save({
      organization,
      photo: result.Location,
      ...rentalObject,
    });
  }

  findAll(): Promise<RentalObject[]> {
    return this.rentalObjectsRepository.find();
  }

  async findOne(id: number): Promise<RentalObject> {
    const rentalObject = this.rentalObjectsRepository.findOneBy({ id });
    if (!rentalObject) throw new ConflictException(`Rental object with id ${id} does not exist`);
    return rentalObject;
  }

  async update(id: number, updateRentalObjectDto: UpdateRentalObjectDto): Promise<RentalObject> {
    await this.findOne(id);

    const updated = await this.rentalObjectsRepository
      .createQueryBuilder()
      .update(RentalObject, updateRentalObjectDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.rentalObjectsRepository.delete({ id });
  }
}
