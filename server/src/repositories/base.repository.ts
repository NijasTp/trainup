import { Document, Model, Types, FilterQuery, UpdateQuery, QueryOptions, PopulateOptions } from 'mongoose';
import { injectable } from 'inversify';

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
  findByIdAndUpdate(id: string, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null>;
  findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null>;
  deleteById(id: string): Promise<T | null>;
  deleteOne(filter: FilterQuery<T>): Promise<{ deletedCount?: number }>;
  countDocuments(filter: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
}

@injectable()
export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async find(filter: FilterQuery<T> = {}, options?: QueryOptions): Promise<T[]> {
    let query = this.model.find(filter);

    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }

    if (typeof options?.populate === 'string') {
      query = query.populate(options.populate as string);
    } else if (Array.isArray(options?.populate)) {
      query = query.populate(options.populate as PopulateOptions[]);
    } else if (typeof options?.populate === 'object') {
      query = query.populate(options.populate as PopulateOptions);
    }

    return await query.exec();
  }

  async findByIdAndUpdate(id: string, update: UpdateQuery<T>, options: QueryOptions = { new: true }): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, update, options).exec();
  }

  async findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options: QueryOptions = { new: true }): Promise<T | null> {
    return await this.model.findOneAndUpdate(filter, update, options).exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async deleteOne(filter: FilterQuery<T>): Promise<{ deletedCount?: number }> {
    return await this.model.deleteOne(filter).exec();
  }

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.exists(filter).exec();
    return result !== null;
  }
}

