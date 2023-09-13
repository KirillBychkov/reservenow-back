import {
  Get,
  Body,
  Controller,
  Post,
  Query,
  Res,
  Delete,
  Param,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
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
import CreateUserDto from './dto/create-user.dto';
import FindAllUsersDto from './dto/find-all-users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Roles('superuser')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get all users in the system' })
  @ApiOkResponse({ description: 'All users have been received', type: FindAllUsersDto })
  @Get()
  findAll(@Query() queryDto: ElementsQueryDto) {
    return this.userService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Create a new user in the system' })
  @ApiCreatedResponse({
    description: 'A new user has been created successfully',
    schema: {
      type: 'object',
      properties: {
        reset_token: {
          type: 'string',
        },
      },
    },
  })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Download a file with users in the system' })
  @ApiOkResponse({ description: 'The file with users has been downloaded successfully' })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  @Get('export')
  async export(@Res() res: Response, @Query() queryDto: ElementsQueryDto) {
    const file: string = await this.userService.export(queryDto);

    res.download(file);
  }

  @ApiOperation({ summary: 'Get a user by its id' })
  @ApiOkResponse({ description: 'The user has been received', type: User })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update user by their ID' })
  @ApiOkResponse({ description: 'The user has been updated successfully', type: User })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  @Put(':id')
  fullUserUpdate(@Param('id') id: string, @Body() body: UserDTO) {
    return this.userService.fullyUpdateUser(+id, body);
  }

  @ApiOperation({ summary: 'Update user by their ID' })
  @ApiOkResponse({ description: 'The user has been updated successfully', type: User })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  @Patch(':id')
  partialUserUpdate(@Param('id') id: string, @Body() Body: UserDTO) {
    return this.userService.partiallyUpdateUser(+id, Body);
  }

  @ApiOperation({ summary: 'Delete user by their ID' })
  @ApiNoContentResponse({ description: 'The user has been deleted successfully' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(+id);
  }
}