import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import type { AddFoodEntryInput, FoodEntry } from '../../../server/src/schema';

interface FoodEntryFormProps {
  onAddEntry: (data: AddFoodEntryInput) => Promise<FoodEntry>;
  isLoading?: boolean;
}

export function FoodEntryForm({ onAddEntry, isLoading = false }: FoodEntryFormProps) {
  const [formData, setFormData] = useState<AddFoodEntryInput>({
    name: '',
    calories: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.calories <= 0) {
      return;
    }

    try {
      await onAddEntry(formData);
      // Reset form after successful submission
      setFormData({
        name: '',
        calories: 0
      });
    } catch (error) {
      console.error('Failed to add food entry:', error);
    }
  };

  const isFormValid = formData.name.trim().length > 0 && formData.calories > 0;

  return (
    <Card className="food-entry-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          ✨ Add Food Entry
        </CardTitle>
        <CardDescription>
          Log what you've eaten today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Food name (e.g., Apple, Sandwich)"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: AddFoodEntryInput) => ({ ...prev, name: e.target.value }))
              }
              className="border-green-200 focus:border-green-400"
              required
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Calories"
              value={formData.calories || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: AddFoodEntryInput) => ({ 
                  ...prev, 
                  calories: parseInt(e.target.value) || 0 
                }))
              }
              className="border-green-200 focus:border-green-400"
              min="1"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !isFormValid}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Adding...' : '+ Add Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}