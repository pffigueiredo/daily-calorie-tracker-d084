import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { type AddFoodEntryInput } from '../schema';
import { addFoodEntry } from '../handlers/add_food_entry';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: AddFoodEntryInput = {
  name: 'Apple',
  calories: 95
};

describe('addFoodEntry', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a food entry', async () => {
    const result = await addFoodEntry(testInput);

    // Basic field validation
    expect(result.name).toEqual('Apple');
    expect(result.calories).toEqual(95);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save food entry to database', async () => {
    const result = await addFoodEntry(testInput);

    // Query using proper drizzle syntax
    const foodEntries = await db.select()
      .from(foodEntriesTable)
      .where(eq(foodEntriesTable.id, result.id))
      .execute();

    expect(foodEntries).toHaveLength(1);
    expect(foodEntries[0].name).toEqual('Apple');
    expect(foodEntries[0].calories).toEqual(95);
    expect(foodEntries[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different food types with various calorie values', async () => {
    const inputs: AddFoodEntryInput[] = [
      { name: 'Banana', calories: 105 },
      { name: 'Pizza Slice', calories: 285 },
      { name: 'Celery Stick', calories: 6 }
    ];

    const results = await Promise.all(
      inputs.map(input => addFoodEntry(input))
    );

    expect(results).toHaveLength(3);
    
    // Verify each entry was created correctly
    results.forEach((result, index) => {
      expect(result.name).toEqual(inputs[index].name);
      expect(result.calories).toEqual(inputs[index].calories);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
    });

    // Verify all entries are in database
    const allEntries = await db.select()
      .from(foodEntriesTable)
      .execute();

    expect(allEntries).toHaveLength(3);
  });

  it('should create entries with timestamps close to current time', async () => {
    const beforeCreate = new Date();
    const result = await addFoodEntry(testInput);
    const afterCreate = new Date();

    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });

  it('should handle high calorie values correctly', async () => {
    const highCalorieInput: AddFoodEntryInput = {
      name: 'Large Pizza',
      calories: 2500
    };

    const result = await addFoodEntry(highCalorieInput);

    expect(result.name).toEqual('Large Pizza');
    expect(result.calories).toEqual(2500);
    expect(typeof result.calories).toBe('number');
    
    // Verify in database
    const dbEntry = await db.select()
      .from(foodEntriesTable)
      .where(eq(foodEntriesTable.id, result.id))
      .execute();

    expect(dbEntry[0].calories).toEqual(2500);
  });

  it('should create multiple entries with unique IDs', async () => {
    const firstEntry = await addFoodEntry({ name: 'Food 1', calories: 100 });
    const secondEntry = await addFoodEntry({ name: 'Food 2', calories: 200 });

    expect(firstEntry.id).not.toEqual(secondEntry.id);
    expect(firstEntry.id).toBeGreaterThan(0);
    expect(secondEntry.id).toBeGreaterThan(0);
    expect(secondEntry.id).toBeGreaterThan(firstEntry.id);
  });
});