import {
  Get,
  Body,
  Controller,
  Post,
  Query,
  Res,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { Response } from 'express';
import UserDTO from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import ElementsQueryDto from './dto/query.dto';
import { User } from './entities/user.entity';
import { Roles } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import NewUserDto from './dto/create-user.dto';
import IdPar from 'src/helpers/id.par';

@ApiTags('Users')
@ApiBearerAuth()
@Roles('superuser')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get all users in the system' })
  @Get('')
  @ApiFoundResponse({ description: 'All users have been received', type: [User] })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  findAll(@Query() queryDto: ElementsQueryDto) {
    return this.userService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Download a file with users in the system' })
  @Get('/export')
  @ApiOkResponse({ description: 'The file with users has been downloaded successfully' })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  async export(@Res() res: Response, @Query() queryDto: ElementsQueryDto) {
    const file: string = await this.userService.export(queryDto);

    res.download(file);
  }

  @ApiOperation({ summary: 'Create a new user in the system' })
  @Post('')
  @ApiCreatedResponse({ description: 'A new user has been created successfully' })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  create(@Body() newUserDto: NewUserDto): Promise<User> {
    const { email, user } = newUserDto;
    return this.userService.create(email, user);
  }

  @ApiOperation({ summary: 'Update user by their ID' })
  @Put(':id')
  @ApiOkResponse({ description: 'The user has been updated successfully' })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  fullUserUpdate(@Param('id') id: IdPar, @Body() body: UserDTO): Promise<User> {
    return this.userService.fullyUpdateUser(id.id, body);
  }

  @ApiOperation({ summary: 'Update user by their ID' })
  @Patch(':id')
  @ApiOkResponse({ description: 'The user has been updated successfully' })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  partialUserUpdate(@Param('id') id: IdPar, @Body() Body: UserDTO): Promise<User> {
    return this.userService.partiallyUpdateUser(id.id, Body);
  }

  @ApiOperation({ summary: 'Delete user by their ID' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The user has been deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: IdPar) {
    return this.userService.delete(id.id);
  }
}
