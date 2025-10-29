import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RunAnalysisDto {
  @IsOptional()
  @IsString()
  @MaxLength(200000, { message: 'resumeText is too long' })
  resumeText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200000, { message: 'jobDescription is too long' })
  jobDescription?: string;
}
