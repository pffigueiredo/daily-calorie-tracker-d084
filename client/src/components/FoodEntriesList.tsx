import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { FoodEntry } from '../../../server/src/schema';

interface FoodEntriesListProps {
  entries: FoodEntry[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function FoodEntriesList({ entries, isLoading = false, onRefresh }: FoodEntriesListProps) {
  const getEntryIcon = (calories: number) => {
    if (calories < 100) return '🥒'; // Light snack
    if (calories < 300) return '🍎'; // Small meal/snack
    if (calories < 500) return '🥗'; // Medium meal
    if (calories < 800) return '🍽️'; // Large meal
    return '🍕'; // Very large meal
  };

  const getCaloriesBadgeColor = (calories: number) => {
    if (calories < 100) return 'bg-green-100 text-green-800 border-green-200';
    if (calories < 300) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (calories < 500) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (calories < 800) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className="food-entry-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          🍽️ Today's Food Entries
        </CardTitle>
        <CardDescription>
          All food items logged today
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="pulse-soft text-gray-500">Loading entries...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🍎</div>
            <div className="text-gray-500 mb-2 font-medium">No entries yet today!</div>
            <div className="text-sm text-gray-400">
              Add your first food entry to get started tracking your nutrition 🌟
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry: FoodEntry, index: number) => (
              <div key={entry.id || index}>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-150 transition-all duration-200 border border-gray-200">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">
                      {getEntryIcon(entry.calories)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {entry.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Added at {entry.created_at.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getCaloriesBadgeColor(entry.calories)} font-semibold px-3 py-1`}
                  >
                    {entry.calories} cal
                  </Badge>
                </div>
                {index < entries.length - 1 && <Separator className="mt-3 opacity-30" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {entries.length > 0 && (
        <CardFooter className="text-center border-t bg-gray-50/50">
          <div className="w-full space-y-3">
            <div className="text-sm text-gray-600">
              Total items logged: <span className="font-semibold">{entries.length}</span>
            </div>
            {onRefresh && (
              <Button 
                variant="outline" 
                onClick={onRefresh}
                disabled={isLoading}
                className="w-full border-gray-300 hover:bg-gray-100"
              >
                🔄 Refresh Data
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}