import { DateField, MoneyField, TextField } from '@/components/ui/fields';
import { AppText } from '@/components/ui/app-text';
import { useToday } from '@/hooks/use-today';
import { formatRupiah } from '@/lib/currency';
import type { Purchase } from '@/types/gift';

type PurchaseFieldsProps = {
  value: Purchase;
  onChange: (value: Purchase) => void;
  budget: number;
  priceError?: string;
};

export function PurchaseFields({ value, onChange, budget, priceError }: PurchaseFieldsProps) {
  const today = useToday();
  return (
    <>
      <MoneyField
        label="Price paid"
        amount={value.price}
        onChangeAmount={(price) => onChange({ ...value, price })}
        error={priceError}
        helper={<BudgetDifference budget={budget} price={value.price} />}
      />
      <DateField
        label="Bought on"
        value={value.date}
        onChange={(date) => onChange({ ...value, date })}
        maxDate={today}
        shortcuts={[{ label: 'Today', value: today }]}
      />
      <TextField
        label="Store"
        optional
        value={value.store}
        onChangeText={(store) => onChange({ ...value, store })}
        placeholder="E.g. Mall, online shop"
        maxLength={60}
      />
    </>
  );
}

export function BudgetDifference({ budget, price }: { budget: number; price: number }) {
  if (budget <= 0 || price <= 0) return null;
  const difference = budget - price;
  if (difference === 0) {
    return (
      <AppText variant="caption" color="success">
        Exactly on budget
      </AppText>
    );
  }
  return (
    <AppText variant="caption" color={difference > 0 ? 'success' : 'rose'}>
      {formatRupiah(Math.abs(difference))} {difference > 0 ? 'under' : 'over'} your {formatRupiah(budget)} budget
    </AppText>
  );
}
