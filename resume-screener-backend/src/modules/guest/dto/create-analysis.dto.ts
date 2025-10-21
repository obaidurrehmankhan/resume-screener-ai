import { IsUUID } from 'class-validator';

export class CreateAnalysisDto {
  @IsUUID()
  draftId: string;
}
