import { trpc } from '@/utils/trpc';
import { FoodEntryForm } from '@/components/FoodEntryForm';
import { DailySummary } from '@/components/DailySummary';
import { FoodEntriesList } from '@/components/FoodEntriesList';
import { useState, useEffect, useCallback } from 'react';
// Using type-only import for better TypeScript compliance
import type { FoodEntry, AddFoodEntryInput, DailyCaloriesSummary } from '../../server/src/schema';

function App() {
  // State management with proper typing
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyCaloriesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Load daily data (entries and summary)
  const loadDailyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const today = getTodayDate();
      
      // Fetch both entries and summary for today
      const [entriesResult, summaryResult] = await Promise.all([
        trpc.getDailyEntries.query({ date: today }),
        trpc.getDailyCaloriesTotal.query({ date: today })
      ]);
      
      setEntries(entriesResult);
      setDailySummary(summaryResult);
    } catch (error) {
      console.error('Failed to load daily data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getTodayDate]);

  // Load data on component mount
  useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

  // Handle adding a new food entry
  const handleAddEntry = async (data: AddFoodEntryInput): Promise<FoodEntry> => {
    setIsAddingEntry(true);
    try {
      const newEntry = await trpc.addFoodEntry.mutate(data);
      
      // Update entries list
      setEntries((prev: FoodEntry[]) => [...prev, newEntry]);
      
      // Update daily summary
      if (dailySummary) {
        setDailySummary((prev: DailyCaloriesSummary | null) => prev ? {
          ...prev,
          total_calories: prev.total_calories + data.calories,
          entry_count: prev.entry_count + 1
        } : null);
      }
      
      return newEntry;
    } catch (error) {
      console.error('Failed to add food entry:', error);
      throw error;
    } finally {
      setIsAddingEntry(false);
    }
  };

  return (
    <div className="min-h-screen calorie-tracker-gradient p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            🍎 Daily Calorie Tracker
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Track your daily food intake and monitor your calories with ease
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Add Food Entry Form */}
          <div className="lg:col-span-1">
            <FoodEntryForm 
              onAddEntry={handleAddEntry}
              isLoading={isAddingEntry}
            />
          </div>

          {/* Daily Summary and Entries */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Summary */}
            <DailySummary 
              summary={dailySummary}
              isLoading={isLoading}
            />

            {/* Food Entries List */}
            <FoodEntriesList 
              entries={entries}
              isLoading={isLoading}
              onRefresh={loadDailyData}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-y-2">
          <div className="text-gray-600 font-medium">
            Stay healthy and track your nutrition! 💪
          </div>
          <div className="text-sm text-gray-500">
            Made with ❤️ for better health tracking
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;