import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { type AddFoodEntryInput, type FoodEntry } from '../schema';

export const addFoodEntry = async (input: AddFoodEntryInput): Promise<FoodEntry> => {
  try {
    // Insert food entry record
    const result = await db.insert(foodEntriesTable)
      .values({
        name: input.name,
        calories: input.calories
      })
      .returning()
      .execute();

    // Return the created food entry
    const foodEntry = result[0];
    return {
      id: foodEntry.id,
      name: foodEntry.name,
      calories: foodEntry.calories,
      created_at: foodEntry.created_at
    };
  } catch (error) {
    console.error('Food entry creation failed:', error);
    throw error;
  }
};