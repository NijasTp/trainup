export interface IExerciseDb {
    exerciseId: string;
    name: string;
    gifUrl: string;
    bodyParts: string[];
    targetMuscles: string[];
    secondaryMuscles: string[];
    equipments: string[];
    instructions: string[];
    description: string;
    exerciseData?: SafeAny;
}
