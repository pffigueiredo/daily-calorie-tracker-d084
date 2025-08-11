import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { type FoodEntry } from '../schema';
import { gte, lt, and } from 'drizzle-orm';

export async function getDailyEntries(date?: string): Promise<FoodEntry[]> {
  try {
    // Use provided date or default to today
    let targetDate: Date;
    if (date) {
      targetDate = new Date(date);
      // Check if date is invalid
      if (isNaN(targetDate.getTime())) {
        return [];
      }
    } else {
      targetDate = new Date();
    }
    
    // Set to start of day (00:00:00)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Set to start of next day (00:00:00)
    const startOfNextDay = new Date(targetDate);
    startOfNextDay.setDate(startOfNextDay.getDate() + 1);
    startOfNextDay.setHours(0, 0, 0, 0);
    
    // Query food entries within the date range
    const results = await db.select()
      .from(foodEntriesTable)
      .where(
        and(
          gte(foodEntriesTable.created_at, startOfDay),
          lt(foodEntriesTable.created_at, startOfNextDay)
        )
      )
      .execute();
    
    return results;
  } catch (error) {
    console.error('Failed to get daily entries:', error);
    throw error;
  }
}