import { PartialType } from '@nestjs/mapped-types';
import { CreateUsageGuideDto } from './create-usage-guide.dto';

export class UpdateUsageGuideDto extends PartialType(CreateUsageGuideDto) {}
