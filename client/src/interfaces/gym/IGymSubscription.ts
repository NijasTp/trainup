
export interface CreateSubscriptionPlanPayload {
  name: string;
  duration: number;
  durationUnit: 'day' | 'month' | 'year';
  price: number;
  description?: string;
  features?: string[];
}
