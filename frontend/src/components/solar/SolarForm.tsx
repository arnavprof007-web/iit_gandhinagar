import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SolarAssessmentInput } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Sun, RotateCcw, Calculator } from 'lucide-react';

const solarSchema = z.object({
  city: z.string().min(2, 'City name is required'),
  monthlyKwh: z.number().min(30, 'Monthly consumption must be at least 30 kWh').max(5000, 'Must be under 5000 kWh'),
  monthlyBillInr: z.number().min(200, 'Bill must be at least ₹200'),
  tariffInrPerKwh: z.number().min(3, 'Tariff must be at least ₹3/kWh').max(20, 'Tariff must be under ₹20/kWh'),
  usableRoofSqFt: z.number().min(100, 'At least 100 sq ft shadow-free roof required').max(20000),
  targetCapacityKw: z.number().optional(),
});

type SolarFormData = z.infer<typeof solarSchema>;

interface SolarFormProps {
  initialValues: SolarAssessmentInput;
  onSubmit: (data: SolarAssessmentInput) => void;
  onReset: () => void;
}

export const SolarForm: React.FC<SolarFormProps> = ({ initialValues, onSubmit, onReset }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SolarFormData>({
    resolver: zodResolver(solarSchema),
    defaultValues: {
      city: initialValues.city,
      monthlyKwh: initialValues.monthlyKwh,
      monthlyBillInr: initialValues.monthlyBillInr,
      tariffInrPerKwh: initialValues.tariffInrPerKwh,
      usableRoofSqFt: initialValues.usableRoofSqFt,
      targetCapacityKw: initialValues.targetCapacityKw || undefined,
    },
  });

  const onFormSubmit = (data: SolarFormData) => {
    onSubmit({
      ...data,
      targetCapacityKw: data.targetCapacityKw && data.targetCapacityKw > 0 ? data.targetCapacityKw : undefined,
    });
  };

  const handleReset = () => {
    reset({
      city: 'Gandhinagar',
      monthlyKwh: 260,
      monthlyBillInr: 1980,
      tariffInrPerKwh: 7.6,
      usableRoofSqFt: 350,
      targetCapacityKw: undefined,
    });
    onReset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="City / Region"
          {...register('city')}
          error={errors.city?.message}
          options={[
            { value: 'Gandhinagar', label: 'Gandhinagar, Gujarat (High Sun)' },
            { value: 'Ahmedabad', label: 'Ahmedabad, Gujarat (High Sun)' },
            { value: 'Pune', label: 'Pune, Maharashtra (Moderate Sun)' },
            { value: 'Bengaluru', label: 'Bengaluru, Karnataka (Moderate Sun)' },
            { value: 'Delhi', label: 'New Delhi, NCR (Seasonal Sun)' },
            { value: 'Jaipur', label: 'Jaipur, Rajasthan (High Sun)' },
          ]}
        />

        <Input
          label="Average Monthly Consumption"
          type="number"
          unit="kWh"
          {...register('monthlyKwh', { valueAsNumber: true })}
          error={errors.monthlyKwh?.message}
          helperText="Check your electricity bill units"
        />

        <Input
          label="Monthly Electricity Bill"
          type="number"
          unit="₹"
          {...register('monthlyBillInr', { valueAsNumber: true })}
          error={errors.monthlyBillInr?.message}
          helperText="Average monthly billing amount"
        />

        <Input
          label="Estimated Grid Tariff Rate"
          type="number"
          step="0.1"
          unit="₹/kWh"
          {...register('tariffInrPerKwh', { valueAsNumber: true })}
          error={errors.tariffInrPerKwh?.message}
          helperText="DISCOM unit charge tier"
        />

        <Input
          label="Shadow-Free Usable Rooftop Area"
          type="number"
          unit="sq ft"
          {...register('usableRoofSqFt', { valueAsNumber: true })}
          error={errors.usableRoofSqFt?.message}
          helperText="~100 sq ft required per 1 kWp system"
        />

        <Input
          label="Target System Capacity (Optional)"
          type="number"
          step="0.5"
          unit="kW"
          {...register('targetCapacityKw', { valueAsNumber: true })}
          error={errors.targetCapacityKw?.message}
          placeholder="Leave blank for auto-recommend"
          helperText="Specify custom capacity if preferred"
        />
      </div>

      <div className="pt-2 flex items-center justify-end gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset Defaults
        </Button>
        <Button
          type="submit"
          variant="solar"
          size="sm"
          leftIcon={<Calculator className="w-4 h-4" />}
        >
          Calculate Solar Feasibility
        </Button>
      </div>
    </form>
  );
};
