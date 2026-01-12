import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FilterDropdownsProps {
  categories: string[];
  paymentMethods: string[];
  selectedCategory: string;
  selectedPaymentMethod: string;
  onCategoryChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
}

export const FilterDropdowns = ({
  categories,
  paymentMethods,
  selectedCategory,
  selectedPaymentMethod,
  onCategoryChange,
  onPaymentMethodChange,
}: FilterDropdownsProps) => {
  const uniqueCategories = useMemo(() => {
    return ['All', ...Array.from(new Set(categories.filter(Boolean)))];
  }, [categories]);

  const uniquePaymentMethods = useMemo(() => {
    return ['All', ...Array.from(new Set(paymentMethods.filter(Boolean)))];
  }, [paymentMethods]);

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2">
        <Label htmlFor="category-filter" className="text-sm font-medium">
          Category
        </Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger id="category-filter" className="w-[180px] bg-background">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            {uniqueCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-filter" className="text-sm font-medium">
          Payment Method
        </Label>
        <Select value={selectedPaymentMethod} onValueChange={onPaymentMethodChange}>
          <SelectTrigger id="payment-filter" className="w-[180px] bg-background">
            <SelectValue placeholder="Select Payment" />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            {uniquePaymentMethods.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
