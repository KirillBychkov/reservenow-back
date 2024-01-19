import { RentalObject } from 'src/rental_object/entities/rental_object.entity';

export const total_working_hours_per_week = (rental_object: RentalObject): number => {
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return daysOfWeek.reduce((acc, day) => {
    const start = rental_object[`${day}_start_hours`];
    const end = rental_object[`${day}_end_hours`];
    if (start && end) {
      return acc + (end - start);
    }
    return acc;
  }, 0);
};

export const getTotalHoursForDay = (rental_object: RentalObject, day: string): number => {
  const start = rental_object[`${day}_start_hours`];
  const end = rental_object[`${day}_end_hours`];
  if (start && end) {
    return end - start;
  }
  return 0;
};
