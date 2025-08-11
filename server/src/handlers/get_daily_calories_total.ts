import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { type DailyCaloriesSummary } from '../schema';
import { sql, gte, lt, count, sum } from 'drizzle-orm';

export const getDailyCaloriesTotal = async (date?: string): Promise<DailyCaloriesSummary> => {
  try {
    // Use today's date if none provided
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Parse the date and create start/end timestamps for the day
    const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDate}T23:59:59.999Z`);
    
    // Query for total calories and entry count for the specified date
    const result = await db
      .select({
        total_calories: sum(foodEntriesTable.calories),
        entry_count: count(foodEntriesTable.id)
      })
      .from(foodEntriesTable)
      .where(
        sql`${foodEntriesTable.created_at} >= ${startOfDay} AND ${foodEntriesTable.created_at} <= ${endOfDay}`
      )
      .execute();

    const row = result[0];
    
    return {
      date: targetDate,
      total_calories: row.total_calories ? Number(row.total_calories) : 0,
      entry_count: Number(row.entry_count)
    };
  } catch (error) {
    console.error('Failed to get daily calories total:', error);
    throw error;
  }
};