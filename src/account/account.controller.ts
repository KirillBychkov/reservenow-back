import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import { AccountService } from './account.service';
import { Account } from './entities/account.entity';
import { UpdateAccountDto } from './dto/update.account.dto';

@ApiTags('Account')
@ApiBearerAuth()
@Roles('superuser')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOperation({ summary: 'Get all accounts in the system' })
  @ApiOkResponse({ description: 'All accounts have been received', type: [Account] })
  @Get()
  findAll() {
    return this.accountService.findAll();
  }

  @ApiOperation({ summary: 'Get an account by its id' })
  @ApiOkResponse({ description: 'The account has been received', type: Account })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }
}
