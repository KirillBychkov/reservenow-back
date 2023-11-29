import { ConflictException, Injectable, UseInterceptors } from '@nestjs/common';
import { CreateRentalObjectDto } from './dto/create-rental_object.dto';
import { UpdateRentalObjectDto } from './dto/update-rental_object.dto';
import { RentalObject } from './entities/rental_object.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from 'src/storage/storage.service';
import ElementsQueryDto from './dto/query.dto';
import FindAllRentalObjectsDto from './dto/find-all-rental_objects.dto';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class RentalObjectService {
  constructor(
    @InjectRepository(RentalObject)
    private readonly rentalObjectsRepository: Repository<RentalObject>,
    private readonly organizationService: OrganizationService,
    private readonly storageService: StorageService,
  ) {}

  @UseInterceptors()
  async create(createRentalObjectDto: CreateRentalObjectDto): Promise<RentalObject> {
    const { organization_id, ...rentalObject } = createRentalObjectDto;
    const organization = await this.organizationService.findOne(organization_id);

    return this.rentalObjectsRepository.save({
      organization,
      ...rentalObject,
    });
  }

  async findAll(query: ElementsQueryDto, userId?: number): Promise<FindAllRentalObjectsDto> {
    const { organizationId, search, limit, sort, skip } = query;
    const sortFilters = (sort == undefined ? 'created_at:1' : sort).split(':');

    let rentalObjectsQuery = this.rentalObjectsRepository
      .createQueryBuilder('rental_object')
      .leftJoinAndSelect('rental_object.organization', 'organization')
      .leftJoinAndSelect('organization.user', 'user')
      .where('rental_object.name ILIKE :search', { search: `%${search ?? ''}%` })
      .orderBy(`rental_object.${sortFilters[0]}`, sortFilters[1] === '1' ? 'ASC' : 'DESC')
      .skip(skip ?? 0)
      .take(limit ?? 10);

    if (userId) {
      rentalObjectsQuery = rentalObjectsQuery.andWhere('organization.user.id = :userId', {
        userId,
      });
    }
    if (organizationId) {
      rentalObjectsQuery = rentalObjectsQuery.andWhere('organization.id = :organizationId', {
        organizationId,
      });
    }

    const rentalObjects = await rentalObjectsQuery.getManyAndCount();

    return {
      filters: {
        skip,
        limit,
        search,
        total: rentalObjects[1],
        received: rentalObjects[0].length,
      },
      data: rentalObjects[0],
    };
  }

  async findOne(id: number): Promise<RentalObject> {
    const rentalObject = await this.rentalObjectsRepository
      .createQueryBuilder('rental_object')
      .leftJoinAndSelect('rental_object.organization', 'organization')
      .leftJoinAndSelect('organization.user', 'user')
      .leftJoinAndSelect('rental_object.reservations', 'reservation')
      .where('rental_object.id = :id', { id })
      .getOne();

    if (!rentalObject) throw new ConflictException(`Rental object with id ${id} does not exist`);
    return rentalObject;
  }

  async update(id: number, updateRentalObjectDto: UpdateRentalObjectDto): Promise<RentalObject> {
    const { photo: oldPhoto } = await this.findOne(id);
    const { photo: newPhoto } = updateRentalObjectDto;

    if (newPhoto !== undefined) {
      await this.storageService.s3_delete(new URL(oldPhoto));
    }

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

    return this.rentalObjectsRepository.update(id, { is_deleted: true });
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    const { photo: oldPhoto } = await this.findOne(id);

    if (oldPhoto !== null) {
      await this.storageService.s3_delete(new URL(oldPhoto));
    }

    const photo = await this.storageService.s3_upload(
      file,
      `rentalobject/${id}/photo.${file.originalname.split('.').pop()}`,
    );

    const updated = await this.rentalObjectsRepository
      .createQueryBuilder()
      .update(RentalObject)
      .set({ photo: photo.location })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }
}
