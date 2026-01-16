import { inject, injectable } from "inversify";
import { TemplateRepository } from "../repositories/dietTemplate.repository";
import { IDietTemplate } from "../models/dietTemplate.model";
import { FilterQuery } from "mongoose";
import TYPES from "../core/types/types";
import { IDietTemplateService } from "../core/interfaces/services/IDietTemplateService";
import { CreateTemplateRequestDto, TemplateResponseDto } from '../dtos/diet.dto';

@injectable()
export class DietTemplateService implements IDietTemplateService {
  constructor(@inject(TYPES.ITemplateRepository) private _dietTemplateRepo: TemplateRepository) { }

  async createTemplate(adminId: string, dto: CreateTemplateRequestDto): Promise<TemplateResponseDto> {
    const payload: Partial<IDietTemplate> = {
      ...dto,
      createdBy: adminId,
      days: dto.days.map(day => ({
        dayNumber: day.dayNumber,
        meals: day.meals.map(meal => ({
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
          time: meal.time,
          notes: meal.notes
        }))
      }))
    };

    const template = await this._dietTemplateRepo.create(payload);
    return this.mapToResponseDto(template);
  }

  async listTemplates(filter: FilterQuery<IDietTemplate> = {}): Promise<TemplateResponseDto[]> {
    const result = await this._dietTemplateRepo.find(filter, 1, 100);
    return result.templates.map(template => this.mapToResponseDto(template));
  }

  async getTemplate(id: string): Promise<TemplateResponseDto | null> {
    const template = await this._dietTemplateRepo.getById(id);
    return template ? this.mapToResponseDto(template) : null;
  }

  async deleteTemplate(id: string): Promise<void> {
    await this._dietTemplateRepo.delete(id);
  }

  private mapToResponseDto(template: IDietTemplate): TemplateResponseDto {
    return {
      _id: template._id.toString(),
      title: template.title,
      description: template.description,
      duration: template.duration,
      goal: template.goal,
      bodyType: template.bodyType,
      createdBy: template.createdBy.toString(),
      days: template.days.map(day => ({
        dayNumber: day.dayNumber,
        meals: day.meals.map(meal => ({
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
          time: meal.time,
          notes: meal.notes,
          nutritions: [] // Model doesn't store detailed nutritions yet, need to update if required
        }))
      })),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
  }
}