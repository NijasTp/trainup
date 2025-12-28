export interface WeightEntry {
    date: string;
    weight: number;
    goal: number;
}

export interface Workout {
    id: string;
    name: string;
    date: string;
    duration: number;
    exercises: number;
    completed: boolean;
}

export interface User {
    name: string;
    currentWeight: number;
    goalWeight: number;
}

export interface CurrentWeightProps {
    user: User;
}

export interface AddWeightDialogProps {
    newWeight: string;
    setNewWeight: React.Dispatch<React.SetStateAction<string>>;
    onAddWeight: (weight: number) => void;
    isWeightLoggedToday: boolean;
}

export interface WeightChartProps {
    weightData: WeightEntry[];
}

export interface TransformationWidgetProps { }

export interface RecentWorkoutsProps {
    workouts: Workout[];
}

export interface IBackendSession {
    _id: string;
    name: string;
    date: string;
    isDone: boolean;
    exercises: { timeTaken?: number }[];
}
