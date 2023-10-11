import { BadRequestException } from '@nestjs/common';

export const workingHoursValidation = (dto) => {
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
    if (!((hours[i] === undefined && hours[i + 1] === undefined) || hours[i + 1] > hours[i])) {
      throw new BadRequestException('Invalid working hours');
    }
  }
};
