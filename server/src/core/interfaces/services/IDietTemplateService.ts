import { CreateTemplateRequestDto, TemplateResponseDto } from '../../../dtos/diet.dto'

export interface IDietTemplateService {
  createTemplate(adminId: string, dto: CreateTemplateRequestDto): Promise<TemplateResponseDto>
  listTemplates(filter?: any): Promise<TemplateResponseDto[]>
  getTemplate(id: string): Promise<TemplateResponseDto | null>
  deleteTemplate(id: string): Promise<void>
}