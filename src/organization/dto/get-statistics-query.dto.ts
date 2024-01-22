import { ApiProperty } from '@nestjs/swagger';

export default class GetStatisticQueryDto {
  @ApiProperty({
    description: "Time frame for statistics('all' | 'month' | 'week' | 'day')",
    required: false,
  })
  time_frame?: 'all' | 'month' | 'week' | 'day';

  @ApiProperty({ description: 'Start date for statistics', required: false })
  start_date?: string;

  @ApiProperty({ description: 'End date for statistics', required: false })
  end_date?: string;
}
