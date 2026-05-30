import { Router, Request, Response, NextFunction } from "express";
import { WgerExerciseModel } from "../models/wgerExercise.model";

const router = Router();

let isSeeding = false;

async function seedWgerExercises() {
  if (isSeeding) return;
  isSeeding = true;
  console.log("Wger Caching: Beginning exercise database sync...");
  try {
    let offset = 0;
    let hasMore = true;
    const limit = 100;

    while (hasMore) {
      const url = `https://wger.de/api/v2/exerciseinfo/?limit=${limit}&offset=${offset}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Wger API returned status ${response.status}`);
      }
      const data: any = await response.json();
      const results = data.results || [];

      if (results.length === 0) {
        hasMore = false;
        break;
      }

      const bulkOps = results.map((ex: any) => {
        const translation = ex.translations?.find((t: any) => t.language === 2) || ex.translations?.[0];
        const exerciseName = translation?.name || "Exercise";
        const mainImage = ex.images?.find((img: any) => img.is_main) || ex.images?.[0];

        const rawData = {
          ...ex,
          name: exerciseName,
        };

        return {
          updateOne: {
            filter: { wgerId: ex.id },
            update: {
              wgerId: ex.id,
              name: exerciseName,
              category: ex.category?.name || "Exercise",
              image: mainImage ? mainImage.image.replace("https://wger.de", "") : "",
              image_thumbnail: mainImage ? mainImage.image.replace("https://wger.de", "") : "",
              rawData,
            },
            upsert: true,
          },
        };
      });

      if (bulkOps.length > 0) {
        await WgerExerciseModel.bulkWrite(bulkOps);
      }

      console.log(`Wger Caching: Synchronized ${offset + results.length} exercises...`);
      offset += limit;
      if (results.length < limit) {
        hasMore = false;
      }
    }
    console.log("Wger Caching: Exercise database synchronization complete!");
  } catch (error) {
    console.error("Wger Caching: Failed to seed exercise database:", error);
  } finally {
    isSeeding = false;
  }
}

router.get("/exerciseinfo", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const term = (req.query.name as string || "").trim();
    
    const count = await WgerExerciseModel.countDocuments();
    if (count === 0) {
      console.log("Wger Caching: Cache is empty. Fetching initial page...");
      const response = await fetch("https://wger.de/api/v2/exerciseinfo/?limit=100");
      if (response.ok) {
        const data: any = await response.json();
        const results = data.results || [];
        const bulkOps = results.map((ex: any) => {
          const translation = ex.translations?.find((t: any) => t.language === 2) || ex.translations?.[0];
          const exerciseName = translation?.name || "Exercise";
          const mainImage = ex.images?.find((img: any) => img.is_main) || ex.images?.[0];
          const rawData = { ...ex, name: exerciseName };
          return {
            updateOne: {
              filter: { wgerId: ex.id },
              update: {
                wgerId: ex.id,
                name: exerciseName,
                category: ex.category?.name || "Exercise",
                image: mainImage ? mainImage.image.replace("https://wger.de", "") : "",
                image_thumbnail: mainImage ? mainImage.image.replace("https://wger.de", "") : "",
                rawData,
              },
              upsert: true,
            },
          };
        });
        if (bulkOps.length > 0) {
          await WgerExerciseModel.bulkWrite(bulkOps);
        }
        seedWgerExercises();
      }
    } else if (count < 800) {
      seedWgerExercises();
    }

    let results = [];
    if (term) {
      results = await WgerExerciseModel.find({
        name: { $regex: term, $options: "i" },
      }).limit(50);
    } else {
      results = await WgerExerciseModel.find().limit(50);
    }

    const formattedResults = results.map((item) => item.rawData);

    res.status(200).json({
      count: formattedResults.length,
      next: null,
      previous: null,
      results: formattedResults,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/exerciseinfo/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid exercise ID" });
      return;
    }

    let exercise = await WgerExerciseModel.findOne({ wgerId: id });
    if (!exercise) {
      console.log(`Wger Caching: Exercise ${id} not found in cache. Fetching from API...`);
      const response = await fetch(`https://wger.de/api/v2/exerciseinfo/${id}/`);
      if (response.ok) {
        const ex: any = await response.json();
        const translation = ex.translations?.find((t: any) => t.language === 2) || ex.translations?.[0];
        const exerciseName = translation?.name || "Exercise";
        const mainImage = ex.images?.find((img: any) => img.is_main) || ex.images?.[0];
        const rawData = { ...ex, name: exerciseName };

        exercise = await WgerExerciseModel.findOneAndUpdate(
          { wgerId: id },
          {
            wgerId: id,
            name: exerciseName,
            category: ex.category?.name || "Exercise",
            image: mainImage ? mainImage.image.replace("https://wger.de", "") : "",
            image_thumbnail: mainImage ? mainImage.image.replace("https://wger.de", "") : "",
            rawData,
          },
          { upsert: true, new: true }
        );
      }
    }

    if (!exercise) {
      res.status(404).json({ detail: "Not found." });
      return;
    }

    res.status(200).json(exercise.rawData);
  } catch (error) {
    next(error);
  }
});

export default router;
