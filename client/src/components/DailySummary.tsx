import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyCaloriesSummary } from '../../../server/src/schema';

interface DailySummaryProps {
  summary: DailyCaloriesSummary | null;
  isLoading?: boolean;
}

export function DailySummary({ summary, isLoading = false }: DailySummaryProps) {
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCalorieGoalProgress = (calories: number) => {
    const dailyGoal = 2000; // Standard daily calorie goal
    const percentage = Math.min((calories / dailyGoal) * 100, 100);
    return {
      percentage,
      isOnTrack: calories <= dailyGoal * 1.1, // Within 10% of goal
      isOver: calories > dailyGoal
    };
  };

  return (
    <Card className="food-entry-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          📊 Today's Summary
        </CardTitle>
        <CardDescription>
          {formatDate()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="pulse-soft text-gray-500">Loading daily summary...</div>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="calories-stat">
                <div className="text-3xl font-bold text-green-600">
                  {summary.total_calories}
                </div>
                <div className="text-sm text-green-700 font-medium">Total Calories</div>
                {summary.total_calories > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    {(() => {
                      const progress = getCalorieGoalProgress(summary.total_calories);
                      if (progress.isOver) return "Above daily goal";
                      if (progress.percentage > 80) return "Close to daily goal";
                      if (progress.percentage > 50) return "Halfway to daily goal";
                      return "Getting started!";
                    })()}
                  </div>
                )}
              </div>
              <div className="items-stat">
                <div className="text-3xl font-bold text-blue-600">
                  {summary.entry_count}
                </div>
                <div className="text-sm text-blue-700 font-medium">Food Items</div>
                <div className="text-xs text-blue-600 mt-1">
                  {summary.entry_count === 0 && "No entries yet"}
                  {summary.entry_count === 1 && "First entry logged!"}
                  {summary.entry_count > 1 && summary.entry_count < 5 && "Keep tracking!"}
                  {summary.entry_count >= 5 && "Great logging!"}
                </div>
              </div>
            </div>
            
            {summary.total_calories > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Daily Goal Progress</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(getCalorieGoalProgress(summary.total_calories).percentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      getCalorieGoalProgress(summary.total_calories).isOver 
                        ? 'bg-red-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${getCalorieGoalProgress(summary.total_calories).percentage}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: 2000 calories/day
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No data available</div>
            <div className="text-sm text-gray-400">
              Add your first entry to see your daily summary! 🌟
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}