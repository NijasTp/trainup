import { injectable } from 'inversify'
import WorkoutDayModel, { IWorkoutDay } from '../models/workoutDay.model'
import { IWorkoutDayRepository } from '../core/interfaces/repositories/IWorkoutDayRepository'

@injectable()
export class WorkoutDayRepository implements IWorkoutDayRepository {
  async create(day: Partial<IWorkoutDay>): Promise<IWorkoutDay> {
    const doc = new WorkoutDayModel(day)
    return await doc.save()
  }

  async findById(id: string) {
    return WorkoutDayModel.findById(id).populate('sessions').exec()
  }

  async findByUserAndDate(userId: string, date: string) {
    return WorkoutDayModel.findOne({ userId, date }).populate('sessions').exec()
  }

  async findByUserId(userId: string, skip = 0, limit = 10) {
    return WorkoutDayModel.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sessions')
      .exec()
  }

  async addSessionToDay(dayId: string, sessionId: string) {
    return WorkoutDayModel.findByIdAndUpdate(
      dayId,
      { $addToSet: { sessions: sessionId } },
      { new: true }
    )
      .populate('sessions')
      .exec()
  }

  async removeSessionFromDay(dayId: string, sessionId: string) {
    return WorkoutDayModel.findByIdAndUpdate(
      dayId,
      { $pull: { sessions: sessionId } },
      { new: true }
    )
      .populate('sessions')
      .exec()
  }

  async update(dayId: string, update: Partial<IWorkoutDay>) {
    return WorkoutDayModel.findByIdAndUpdate(dayId, update, { new: true })
      .populate('sessions')
      .exec()
  }
}
