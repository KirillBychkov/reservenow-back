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
import { UserService } from './user.service';
import { Response } from 'express';
import UserDTO from './dto/user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import ElementsQueryDto from './dto/query.dto';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get all users in the system' })
  @Get('')
  @ApiFoundResponse({ description: 'All users have been received', type: [User] })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  getUser(@Query() query: ElementsQueryDto) {
    const { search, limit, skip } = query;
    return this.userService.get(search, limit, skip);
  }

  @ApiOperation({ summary: 'Download a file with users in the system' })
  @Get('/export')
  @ApiOkResponse({ description: 'The file with users has been downloaded successfully' })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  async exportUsers(@Res() res: Response, @Query() query: ElementsQueryDto) {
    const { search, limit, skip } = query;
    const file: string = await this.userService.export(search, limit, skip);

    res.download(file);
  }

  @ApiOperation({ summary: 'Create a new user in the system' })
  @Post('')
  @ApiCreatedResponse({ description: 'A new user has been created successfully', type: User })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  postUser(@Body() userDTO: UserDTO) {
    return this.userService.insertUser(userDTO);
  }

  @ApiOperation({ summary: 'Update user by their ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the user that you want to update',
  })
  @Put(':id')
  @ApiOkResponse({ description: 'A new user has been updated successfully', type: User })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  fullUserUpdate(@Param('id') id: number, @Body() body) {
    return this.userService.fullyUpdateUser(id, body);
  }

  @ApiOperation({ summary: 'Update user by their ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the user that you want to update',
  })
  @Patch(':id')
  @ApiOkResponse({ description: 'A new user has been updated successfully', type: User })
  // @ApiForbiddenResponse({ description: 'Forbidded' })
  partialUserUpdate(@Param('id') id: number, @Body() Body) {
    return this.userService.partiallyUpdateUser(id, Body);
  }

  @ApiOperation({ summary: 'Delete user by their ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the user that you want to delete',
  })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'A new user has been deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') id: number) {
    return this.userService.deleteUserById(id);
  }
}
