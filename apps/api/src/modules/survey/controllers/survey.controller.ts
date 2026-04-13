import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SurveyService } from '../services/survey.service';
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { UpdateSurveyDto } from '../dto/update-survey.dto';
import { QuerySurveyDto } from '../dto/query-survey.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';

@ApiTags('Surveys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get()
  @ApiOperation({ summary: '取得問卷列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功取得問卷列表',
  })
  async findAll(@Query() query: QuerySurveyDto, @CurrentUser() user: User) {
    const { items, pagination } = await this.surveyService.findAll(
      query,
      user,
    );

    return {
      success: true,
      data: {
        items,
        pagination,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '取得問卷詳情' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功取得問卷詳情',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '問卷不存在',
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const survey = await this.surveyService.findOne(id, user);

    return {
      success: true,
      data: survey,
    };
  }

  @Post()
  @ApiOperation({ summary: '建立問卷' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '成功建立問卷',
  })
  async create(
    @Body() createSurveyDto: CreateSurveyDto,
    @CurrentUser() user: User,
  ) {
    const survey = await this.surveyService.create(createSurveyDto, user);

    return {
      success: true,
      data: survey,
      message: '問卷建立成功',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新問卷' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功更新問卷',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSurveyDto: UpdateSurveyDto,
    @CurrentUser() user: User,
  ) {
    const survey = await this.surveyService.update(id, updateSurveyDto, user);

    return {
      success: true,
      data: survey,
      message: '問卷更新成功',
    };
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '發布問卷' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功發布問卷',
  })
  async publish(@Param('id') id: string, @CurrentUser() user: User) {
    const survey = await this.surveyService.publish(id, user);

    return {
      success: true,
      data: survey,
      message: '問卷發布成功',
    };
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '暫停問卷' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功暫停問卷',
  })
  async pause(@Param('id') id: string, @CurrentUser() user: User) {
    const survey = await this.surveyService.pause(id, user);

    return {
      success: true,
      data: survey,
      message: '問卷已暫停',
    };
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '關閉問卷' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功關閉問卷',
  })
  async close(@Param('id') id: string, @CurrentUser() user: User) {
    const survey = await this.surveyService.close(id, user);

    return {
      success: true,
      data: survey,
      message: '問卷已關閉',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '刪除問卷' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功刪除問卷',
  })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.surveyService.remove(id, user);

    return {
      success: true,
      message: '問卷刪除成功',
    };
  }
}
