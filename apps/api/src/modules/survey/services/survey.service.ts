import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey, SurveyStatus } from './entities/survey.entity';
import { SurveyVersion } from './entities/survey-version.entity';
import { User } from '../user/entities/user.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { QuerySurveyDto } from './dto/query-survey.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(SurveyVersion)
    private readonly versionRepository: Repository<SurveyVersion>,
  ) {}

  async findAll(query: QuerySurveyDto, user: User) {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
      tags,
    } = query;

    const qb = this.surveyRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.current_version', 'current_version')
      .leftJoinAndSelect('survey.creator', 'creator')
      .where('survey.deleted_at IS NULL');

    // 狀態篩選
    if (status) {
      const statuses = status.split(',');
      qb.andWhere('survey.status IN (:...statuses)', { statuses });
    }

    // 關鍵字搜尋
    if (search) {
      qb.andWhere(
        '(survey.title ILIKE :search OR survey.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 標籤篩選
    if (tags) {
      const tagArray = tags.split(',');
      qb.andWhere('survey.tags && :tags', { tags: tagArray });
    }

    // 排序
    const orderDirection = sort_order.toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`survey.${sort_by}`, orderDirection);

    // 分頁
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: User): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { id },
      relations: [
        'current_version',
        'current_version.questions',
        'current_version.questions.options',
        'creator',
      ],
    });

    if (!survey) {
      throw new NotFoundException('問卷不存在');
    }

    return survey;
  }

  async create(createSurveyDto: CreateSurveyDto, user: User): Promise<Survey> {
    // 建立問卷
    const survey = this.surveyRepository.create({
      ...createSurveyDto,
      created_by: user.id,
      updated_by: user.id,
    });

    const savedSurvey = await this.surveyRepository.save(survey);

    // 建立第一個版本
    const version = this.versionRepository.create({
      survey_id: savedSurvey.id,
      version_number: 1,
      title: createSurveyDto.title,
      description: createSurveyDto.description,
      is_active: true,
      created_by: user.id,
    });

    const savedVersion = await this.versionRepository.save(version);

    // 更新問卷的 current_version_id
    savedSurvey.current_version_id = savedVersion.id;
    await this.surveyRepository.save(savedSurvey);

    return await this.findOne(savedSurvey.id, user);
  }

  async update(
    id: string,
    updateSurveyDto: UpdateSurveyDto,
    user: User,
  ): Promise<Survey> {
    const survey = await this.findOne(id, user);

    // 檢查是否可編輯
    if (survey.status === SurveyStatus.CLOSED) {
      throw new BadRequestException('已關閉的問卷無法編輯');
    }

    Object.assign(survey, {
      ...updateSurveyDto,
      updated_by: user.id,
    });

    await this.surveyRepository.save(survey);

    return await this.findOne(id, user);
  }

  async publish(id: string, user: User): Promise<Survey> {
    const survey = await this.findOne(id, user);

    if (survey.status === SurveyStatus.PUBLISHED) {
      throw new BadRequestException('問卷已發布');
    }

    // 檢查是否有題目
    if (!survey.current_version || !survey.current_version.questions?.length) {
      throw new BadRequestException('問卷至少需要一個題目才能發布');
    }

    survey.status = SurveyStatus.PUBLISHED;
    survey.published_at = new Date();
    survey.updated_by = user.id;

    await this.surveyRepository.save(survey);

    return await this.findOne(id, user);
  }

  async pause(id: string, user: User): Promise<Survey> {
    const survey = await this.findOne(id, user);

    if (survey.status !== SurveyStatus.PUBLISHED) {
      throw new BadRequestException('只有已發布的問卷可以暫停');
    }

    survey.status = SurveyStatus.PAUSED;
    survey.updated_by = user.id;

    await this.surveyRepository.save(survey);

    return await this.findOne(id, user);
  }

  async close(id: string, user: User): Promise<Survey> {
    const survey = await this.findOne(id, user);

    if (survey.status === SurveyStatus.CLOSED) {
      throw new BadRequestException('問卷已關閉');
    }

    survey.status = SurveyStatus.CLOSED;
    survey.closed_at = new Date();
    survey.updated_by = user.id;

    await this.surveyRepository.save(survey);

    return await this.findOne(id, user);
  }

  async remove(id: string, user: User): Promise<void> {
    const survey = await this.findOne(id, user);

    // 軟刪除
    await this.surveyRepository.softDelete(id);
  }
}
