import {
  Get,
  Body,
  Controller,
  Post,
  Query,
  Res,
  Delete,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  MaxFileSizeValidator,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { Response } from 'express';
import UserDTO from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import ElementsQueryDto from './dto/query.dto';
import { User } from './entities/user.entity';
import { Permissions } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import CreateUserDto from './dto/create-user.dto';
import FindAllUsersDto from './dto/find-all-users.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@ApiBearerAuth()
@Permissions('users')
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
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
      }),
    )
    @Body()
    createUserDto: CreateUserDto,
  ) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Download a file with users in the system' })
  @ApiOkResponse({ description: 'The file with users has been downloaded successfully' })
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
  @Patch(':id')
  update(@Param('id') id: string, @Body() Body: UserDTO) {
    return this.userService.update(+id, Body);
  }

  @ApiOperation({ summary: 'Delete user by their ID' })
  @ApiNoContentResponse({ description: 'The user has been deleted successfully' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @ApiOperation({ summary: 'Create a new avatar for the user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('/upload/image/:id')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(jpg|png|jpeg)' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.uploadImage(+id, file);
  }
}
