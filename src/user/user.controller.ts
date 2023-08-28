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
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import UserDTO from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  getUser(@Query() query) {
    const { search, limit, skip } = query;
    return this.userService.get(search, limit, skip);
  }

  @Get('/export')
  async exportUsers(@Res() res: Response, @Query() query) {
    const { search, limit, skip } = query;
    const file: string = await this.userService.export(search, limit, skip);

    res.download(file);
  }

  /*
  Get user by ID with relations in params
  @Get('/:id')
  */

  @Post('')
  postUser(@Body() userDTO: UserDTO) {
    return this.userService.insertUser(userDTO);
  }

  @Put(':id')
  fullUserUpdate(@Param('id') id: number, @Body() body) {
    return this.userService.fullyUpdateUser(id, body);
  }

  @Patch(':id')
  partialUserUpdate(@Param('id') id: number, @Body() Body) {
    return this.userService.partiallyUpdateUser(id, Body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') id: number) {
    return this.userService.deleteUserById(id);
  }
}
