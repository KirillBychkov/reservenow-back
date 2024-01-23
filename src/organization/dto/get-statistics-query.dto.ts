import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsIn } from 'class-validator';

export default class GetStatisticQueryDto {
  @ApiProperty({
    description: "Time frame for statistics('all' | 'month' | 'week' | 'day')",
    required: false,
  })
  @IsIn(['all', 'month', 'week', 'day', undefined])
  time_frame?: 'all' | 'month' | 'week' | 'day';

  @ApiProperty({ description: 'Start date for statistics', required: false })
  @IsISO8601()
  start_date?: string;

  @ApiProperty({ description: 'End date for statistics', required: false })
  @IsISO8601()
  end_date?: string;
}
