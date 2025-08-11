import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { getDailyEntries } from '../handlers/get_daily_entries';

describe('getDailyEntries', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no entries exist', async () => {
    const result = await getDailyEntries();
    expect(result).toEqual([]);
  });

  it('should return entries for today when no date provided', async () => {
    // Create test entry for today
    const today = new Date();
    await db.insert(foodEntriesTable)
      .values({
        name: 'Apple',
        calories: 95,
        created_at: today
      })
      .execute();

    const result = await getDailyEntries();
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Apple');
    expect(result[0].calories).toEqual(95);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return entries for specific date when provided', async () => {
    // Create entries for different dates
    const specificDate = new Date('2024-01-15');
    const otherDate = new Date('2024-01-16');
    
    await db.insert(foodEntriesTable)
      .values([
        {
          name: 'Banana',
          calories: 105,
          created_at: specificDate
        },
        {
          name: 'Orange',
          calories: 62,
          created_at: otherDate
        }
      ])
      .execute();

    const result = await getDailyEntries('2024-01-15');
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Banana');
    expect(result[0].calories).toEqual(105);
  });

  it('should return multiple entries for the same date', async () => {
    const targetDate = new Date('2024-01-15');
    
    await db.insert(foodEntriesTable)
      .values([
        {
          name: 'Breakfast',
          calories: 300,
          created_at: new Date(targetDate.getTime() + 8 * 60 * 60 * 1000) // 8 AM
        },
        {
          name: 'Lunch',
          calories: 500,
          created_at: new Date(targetDate.getTime() + 12 * 60 * 60 * 1000) // 12 PM
        },
        {
          name: 'Dinner',
          calories: 700,
          created_at: new Date(targetDate.getTime() + 19 * 60 * 60 * 1000) // 7 PM
        }
      ])
      .execute();

    const result = await getDailyEntries('2024-01-15');
    
    expect(result).toHaveLength(3);
    expect(result.map(r => r.name)).toContain('Breakfast');
    expect(result.map(r => r.name)).toContain('Lunch');
    expect(result.map(r => r.name)).toContain('Dinner');
  });

  it('should exclude entries from previous and next day', async () => {
    const targetDate = new Date('2024-01-15T12:00:00');
    const previousDay = new Date('2024-01-14T23:59:59');
    const nextDay = new Date('2024-01-16T00:00:01');
    
    await db.insert(foodEntriesTable)
      .values([
        {
          name: 'Previous Day',
          calories: 100,
          created_at: previousDay
        },
        {
          name: 'Target Day',
          calories: 200,
          created_at: targetDate
        },
        {
          name: 'Next Day',
          calories: 300,
          created_at: nextDay
        }
      ])
      .execute();

    const result = await getDailyEntries('2024-01-15');
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Target Day');
  });

  it('should handle edge cases at midnight boundaries', async () => {
    const startOfDay = new Date('2024-01-15T00:00:00');
    const endOfDay = new Date('2024-01-15T23:59:59');
    const startOfNextDay = new Date('2024-01-16T00:00:00');
    
    await db.insert(foodEntriesTable)
      .values([
        {
          name: 'Start of Day',
          calories: 100,
          created_at: startOfDay
        },
        {
          name: 'End of Day',
          calories: 200,
          created_at: endOfDay
        },
        {
          name: 'Start of Next Day',
          calories: 300,
          created_at: startOfNextDay
        }
      ])
      .execute();

    const result = await getDailyEntries('2024-01-15');
    
    expect(result).toHaveLength(2);
    expect(result.map(r => r.name)).toContain('Start of Day');
    expect(result.map(r => r.name)).toContain('End of Day');
    expect(result.map(r => r.name)).not.toContain('Start of Next Day');
  });

  it('should return empty array for date with no entries', async () => {
    // Create entry for different date
    await db.insert(foodEntriesTable)
      .values({
        name: 'Some Food',
        calories: 150,
        created_at: new Date('2024-01-15T12:00:00')
      })
      .execute();

    const result = await getDailyEntries('2024-01-20');
    expect(result).toEqual([]);
  });

  it('should handle invalid date format gracefully', async () => {
    // Invalid date string should still work (Date constructor handles it)
    const result = await getDailyEntries('invalid-date');
    expect(result).toEqual([]);
  });
});