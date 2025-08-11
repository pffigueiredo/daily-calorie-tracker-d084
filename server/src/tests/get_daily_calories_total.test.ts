import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { getDailyCaloriesTotal } from '../handlers/get_daily_calories_total';

describe('getDailyCaloriesTotal', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero calories and entries for empty database', async () => {
    const result = await getDailyCaloriesTotal('2024-01-15');

    expect(result.date).toEqual('2024-01-15');
    expect(result.total_calories).toEqual(0);
    expect(result.entry_count).toEqual(0);
  });

  it('should calculate total calories for a specific date', async () => {
    const testDate = '2024-01-15';
    
    // Insert test food entries for the target date
    await db.insert(foodEntriesTable).values([
      {
        name: 'Apple',
        calories: 95,
        created_at: new Date(`${testDate}T08:00:00.000Z`)
      },
      {
        name: 'Banana',
        calories: 105,
        created_at: new Date(`${testDate}T12:00:00.000Z`)
      },
      {
        name: 'Orange',
        calories: 60,
        created_at: new Date(`${testDate}T18:00:00.000Z`)
      }
    ]).execute();

    const result = await getDailyCaloriesTotal(testDate);

    expect(result.date).toEqual(testDate);
    expect(result.total_calories).toEqual(260); // 95 + 105 + 60
    expect(result.entry_count).toEqual(3);
  });

  it('should only include entries from the specified date', async () => {
    const targetDate = '2024-01-15';
    const otherDate = '2024-01-16';
    
    // Insert entries for target date
    await db.insert(foodEntriesTable).values([
      {
        name: 'Morning Apple',
        calories: 95,
        created_at: new Date(`${targetDate}T08:00:00.000Z`)
      },
      {
        name: 'Lunch Sandwich',
        calories: 350,
        created_at: new Date(`${targetDate}T12:30:00.000Z`)
      }
    ]).execute();

    // Insert entries for different date (should be excluded)
    await db.insert(foodEntriesTable).values([
      {
        name: 'Next Day Breakfast',
        calories: 200,
        created_at: new Date(`${otherDate}T09:00:00.000Z`)
      },
      {
        name: 'Previous Day Dinner',
        calories: 400,
        created_at: new Date('2024-01-14T19:00:00.000Z')
      }
    ]).execute();

    const result = await getDailyCaloriesTotal(targetDate);

    expect(result.date).toEqual(targetDate);
    expect(result.total_calories).toEqual(445); // Only target date entries: 95 + 350
    expect(result.entry_count).toEqual(2);
  });

  it('should handle entries at day boundaries correctly', async () => {
    const testDate = '2024-01-15';
    
    // Insert entries at the very start and end of the day
    await db.insert(foodEntriesTable).values([
      {
        name: 'Midnight Snack Start',
        calories: 100,
        created_at: new Date(`${testDate}T00:00:00.000Z`)
      },
      {
        name: 'Late Night Snack',
        calories: 150,
        created_at: new Date(`${testDate}T23:59:59.999Z`)
      },
      {
        name: 'Next Day Start',
        calories: 200,
        created_at: new Date('2024-01-16T00:00:00.000Z') // Should be excluded
      }
    ]).execute();

    const result = await getDailyCaloriesTotal(testDate);

    expect(result.date).toEqual(testDate);
    expect(result.total_calories).toEqual(250); // Only entries within the day: 100 + 150
    expect(result.entry_count).toEqual(2);
  });

  it('should use today\'s date when no date provided', async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Insert entry for today
    await db.insert(foodEntriesTable).values({
      name: 'Today\'s Meal',
      calories: 300,
      created_at: new Date() // Current timestamp
    }).execute();

    const result = await getDailyCaloriesTotal();

    expect(result.date).toEqual(today);
    expect(result.total_calories).toEqual(300);
    expect(result.entry_count).toEqual(1);
  });

  it('should handle large calorie totals correctly', async () => {
    const testDate = '2024-01-15';
    
    // Insert entries with large calorie values
    await db.insert(foodEntriesTable).values([
      {
        name: 'Large Pizza',
        calories: 2400,
        created_at: new Date(`${testDate}T12:00:00.000Z`)
      },
      {
        name: 'Burger with Fries',
        calories: 1200,
        created_at: new Date(`${testDate}T18:00:00.000Z`)
      },
      {
        name: 'Milkshake',
        calories: 800,
        created_at: new Date(`${testDate}T20:00:00.000Z`)
      }
    ]).execute();

    const result = await getDailyCaloriesTotal(testDate);

    expect(result.date).toEqual(testDate);
    expect(result.total_calories).toEqual(4400); // 2400 + 1200 + 800
    expect(result.entry_count).toEqual(3);
  });

  it('should handle single entry correctly', async () => {
    const testDate = '2024-01-15';
    
    await db.insert(foodEntriesTable).values({
      name: 'Single Apple',
      calories: 95,
      created_at: new Date(`${testDate}T10:00:00.000Z`)
    }).execute();

    const result = await getDailyCaloriesTotal(testDate);

    expect(result.date).toEqual(testDate);
    expect(result.total_calories).toEqual(95);
    expect(result.entry_count).toEqual(1);
  });
});