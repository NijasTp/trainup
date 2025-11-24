import { Request, Response } from 'express';
import Review from '../models/review.model';
import Trainer from '../models/trainer.model';
import { GymModel } from '../models/gym.model';
import mongoose from 'mongoose';

export const addReview = async (req: Request, res: Response) => {
    try {
        const { targetId, targetModel, rating, comment } = req.body;
        const userId = (req as any).user.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ userId, targetId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this.' });
        }

        const review = new Review({
            userId,
            targetId,
            targetModel,
            rating,
            comment,
        });

        await review.save();

        // Update average rating
        await updateAverageRating(targetId, targetModel);

        res.status(201).json({ message: 'Review added successfully', review });
    } catch (error: any) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getReviews = async (req: Request, res: Response) => {
    try {
        const { targetId } = req.params;

        const reviews = await Review.find({ targetId })
            .populate('userId', 'name profileImage')
            .sort({ createdAt: -1 });

        res.status(200).json({ reviews });
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const { reviewId } = req.params;
        const userId = (req as any).user.id;

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const { targetId, targetModel } = review;

        await Review.deleteOne({ _id: reviewId });

        // Update average rating
        await updateAverageRating(targetId, targetModel);

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const updateAverageRating = async (targetId: mongoose.Types.ObjectId, targetModel: string) => {
    const stats = await Review.aggregate([
        { $match: { targetId: new mongoose.Types.ObjectId(targetId) } },
        {
            $group: {
                _id: '$targetId',
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    const averageRating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;

    if (targetModel === 'Trainer') {
        await Trainer.findByIdAndUpdate(targetId, { rating: averageRating });
    } else if (targetModel === 'Gym') {
        // Assuming Gym model has a rating field, if not it might need to be added or ignored for now
        // Based on previous file read, Gym model doesn't seem to have rating explicitly shown in interface but let's check schema
        // The Gym interface didn't show rating, but let's assume we might want to add it or just skip if not present.
        // For now, I'll try to update it, if it fails or field doesn't exist, it might just be ignored by mongoose if strictly typed or schema limited.
        // Actually, looking at Gym model again, it does NOT have rating. I should probably add it to Gym model too if I want to support it fully.
        // But the user request specifically mentioned Trainer model has rating.
        // I will stick to Trainer for now as primary requirement.
        // If Gym needs it, I'll add it. The user said "gym also needs review", so I should probably add rating to Gym model too.
        await GymModel.findByIdAndUpdate(targetId, { rating: averageRating });
    }
};
