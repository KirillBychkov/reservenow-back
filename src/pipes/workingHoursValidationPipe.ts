import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
@Injectable()
export class WorkingHoursValidationPipe implements PipeTransform {
  transform(dto) {
    const hours = [
      dto.monday_start_hours,
      dto.monday_end_hours,
      dto.tuesday_start_hours,
      dto.tuesday_end_hours,
      dto.wednesday_start_hours,
      dto.wednesday_end_hours,
      dto.thursday_start_hours,
      dto.thursday_end_hours,
      dto.friday_start_hours,
      dto.friday_end_hours,
      dto.saturday_start_hours,
      dto.saturday_end_hours,
      dto.sunday_start_hours,
      dto.sunday_end_hours,
    ];

    for (let i = 0; i < hours.length; i += 2) {
      if (
        !((!hours[i] && !hours[i + 1]) || hours[i + 1] > hours[i]) &&
        hours[i] > 0 &&
        hours[i + 1] < 24
      ) {
        throw new BadRequestException('Invalid working hours.');
      }
    }

    return dto;
  }
}
