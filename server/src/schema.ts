import { z } from 'zod';

// Food entry schema for database records
export const foodEntrySchema = z.object({
  id: z.number(),
  name: z.string(),
  calories: z.number(),
  created_at: z.coerce.date() // Automatically converts string timestamps to Date objects
});

export type FoodEntry = z.infer<typeof foodEntrySchema>;

// Input schema for adding food entries
export const addFoodEntryInputSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  calories: z.number().positive("Calories must be positive")
});

export type AddFoodEntryInput = z.infer<typeof addFoodEntryInputSchema>;

// Schema for daily calories summary
export const dailyCaloriesSummarySchema = z.object({
  date: z.string(), // ISO date string (YYYY-MM-DD)
  total_calories: z.number(),
  entry_count: z.number()
});

export type DailyCaloriesSummary = z.infer<typeof dailyCaloriesSummarySchema>;