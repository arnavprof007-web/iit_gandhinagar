import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  Users,
  Home,
  Zap,
  Bike,
  Flame,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { calculateElectricityEmissions, calculateTransportEmissions, calculateCookingEmissions, calculateTotalFootprint } from '../utils/footprintCalculations';

const onboardingSchema = z.object({
  // Step 1: Household
  city: z.string().min(2, 'City is required'),
  householdSize: z.number().min(1).max(20),
  homeType: z.enum(['apartment', 'independent_house', 'villa']),

  // Step 2: Energy
  electricityKwh: z.number().min(20, 'Must be at least 20 kWh').max(4000),
  monthlyBillInr: z.number().min(100),
  tariffInrPerKwh: z.number().min(3).max(20),

  // Step 3: Mobility
  primaryTransport: z.enum(['petrol_car', 'diesel_car', 'ev', 'two_wheeler', 'public_transit', 'active_transit']),
  commuteDistanceKmDaily: z.number().min(0).max(300),

  // Step 4: Cooking & Diet
  cookingFuel: z.enum(['lpg', 'piped_gas', 'electric_induction']),
  dietType: z.enum(['vegetarian', 'vegan', 'non_vegetarian']),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      city: user.city || 'Gandhinagar',
      householdSize: user.householdSize || 4,
      homeType: user.homeType || 'independent_house',
      electricityKwh: user.electricityKwh || 260,
      monthlyBillInr: user.monthlyBillInr || 1980,
      tariffInrPerKwh: user.tariffInrPerKwh || 7.6,
      primaryTransport: user.primaryTransport || 'two_wheeler',
      commuteDistanceKmDaily: user.commuteDistanceKmDaily || 14,
      cookingFuel: user.cookingFuel || 'piped_gas',
      dietType: user.dietType || 'vegetarian',
    },
  });

  const formValues = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof OnboardingFormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ['city', 'householdSize', 'homeType'];
    if (currentStep === 2) fieldsToValidate = ['electricityKwh', 'monthlyBillInr', 'tariffInrPerKwh'];
    if (currentStep === 3) fieldsToValidate = ['primaryTransport', 'commuteDistanceKmDaily'];
    if (currentStep === 4) fieldsToValidate = ['cookingFuel', 'dietType'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const onFinish = (data: OnboardingFormData) => {
    updateUser(data);
    showToast({
      title: 'Onboarding Complete!',
      message: 'Your personal sustainability baseline has been established.',
      type: 'success',
    });
    navigate('/dashboard');
  };

  // Live estimated footprint calculation for Step 5 Review
  const estElecKg = calculateElectricityEmissions(formValues.electricityKwh || 260);
  const estTransKg = calculateTransportEmissions(
    formValues.primaryTransport || 'two_wheeler',
    (formValues.commuteDistanceKmDaily || 14) * 25 // 25 working days
  );
  const estCookKg = calculateCookingEmissions(formValues.cookingFuel || 'piped_gas', 12);
  const estTotalKg = calculateTotalFootprint(estElecKg, estTransKg, estCookKg);

  return (
    <div className="min-h-screen bg-[#f8faf8] py-12 px-4 sm:px-6 lg:px-8 bg-hero-gradient flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Step Progress Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Step {currentStep} of {totalSteps}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 font-display">
            {currentStep === 1 && 'Household & Location'}
            {currentStep === 2 && 'Electricity & Energy Profile'}
            {currentStep === 3 && 'Daily Commute & Transport'}
            {currentStep === 4 && 'Cooking & Diet Habits'}
            {currentStep === 5 && 'Review Your Green Baseline'}
          </h2>
          <ProgressBar value={(currentStep / totalSteps) * 100} size="sm" color="emerald" />
        </div>

        {/* Wizard Form Card */}
        <Card className="p-6 sm:p-8 bg-white/95 backdrop-blur-md shadow-xl border-emerald-100">
          <form onSubmit={handleSubmit(onFinish)} className="space-y-5">
            {/* STEP 1: Household */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <Input
                  label="City or Urban Location"
                  placeholder="Gandhinagar"
                  {...register('city')}
                  error={errors.city?.message}
                  helperText="Used to map solar insolation and local DISCOM tariffs"
                  required
                />

                <Input
                  label="Household Size (Persons)"
                  type="number"
                  unit="people"
                  {...register('householdSize', { valueAsNumber: true })}
                  error={errors.householdSize?.message}
                  required
                />

                <Select
                  label="Dwelling / Residence Type"
                  {...register('homeType')}
                  options={[
                    { value: 'independent_house', label: 'Independent House (Own Rooftop)' },
                    { value: 'apartment', label: 'Apartment / High-rise Flat (Shared Terrace)' },
                    { value: 'villa', label: 'Row House / Villa' },
                  ]}
                />
              </div>
            )}

            {/* STEP 2: Energy */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <Input
                  label="Average Monthly Electricity Consumption"
                  type="number"
                  unit="kWh"
                  {...register('electricityKwh', { valueAsNumber: true })}
                  error={errors.electricityKwh?.message}
                  helperText="Units consumed (check your recent electricity bills)"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Average Monthly Bill"
                    type="number"
                    unit="₹"
                    {...register('monthlyBillInr', { valueAsNumber: true })}
                    error={errors.monthlyBillInr?.message}
                    required
                  />

                  <Input
                    label="Tariff Rate"
                    type="number"
                    step="0.1"
                    unit="₹/kWh"
                    {...register('tariffInrPerKwh', { valueAsNumber: true })}
                    error={errors.tariffInrPerKwh?.message}
                    helperText="Average DISCOM unit charge"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Mobility */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <Select
                  label="Primary Commute Mode"
                  {...register('primaryTransport')}
                  options={[
                    { value: 'two_wheeler', label: 'Petrol Two-Wheeler / Scooter' },
                    { value: 'petrol_car', label: 'Petrol Car (Solo Occupancy)' },
                    { value: 'diesel_car', label: 'Diesel Car' },
                    { value: 'ev', label: 'Electric Vehicle (EV Scooter / Car)' },
                    { value: 'public_transit', label: 'Public Transit (Metro / Bus)' },
                    { value: 'active_transit', label: 'Active Transit (Cycling / Walking)' },
                  ]}
                />

                <Input
                  label="Approximate Daily Commute Distance"
                  type="number"
                  unit="km/day"
                  {...register('commuteDistanceKmDaily', { valueAsNumber: true })}
                  error={errors.commuteDistanceKmDaily?.message}
                  helperText="Round trip daily travel distance"
                  required
                />
              </div>
            )}

            {/* STEP 4: Cooking & Diet */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <Select
                  label="Primary Cooking Fuel"
                  {...register('cookingFuel')}
                  options={[
                    { value: 'piped_gas', label: 'Piped Natural Gas (PNG)' },
                    { value: 'lpg', label: 'LPG Cylinders (14.2 kg)' },
                    { value: 'electric_induction', label: 'Electric Induction Cooktop' },
                  ]}
                />

                <Select
                  label="Dietary Pattern"
                  {...register('dietType')}
                  options={[
                    { value: 'vegetarian', label: 'Vegetarian (Plant & Dairy rich)' },
                    { value: 'vegan', label: '100% Plant-Based Vegan' },
                    { value: 'non_vegetarian', label: 'Non-Vegetarian (Includes poultry/meat)' },
                  ]}
                />
              </div>
            )}

            {/* STEP 5: Review Baseline */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Estimated Monthly Baseline Footprint
                  </span>
                  <div className="text-3xl font-black text-emerald-950 font-display mt-1">
                    {estTotalKg} kg CO₂e / month
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Based on {formValues.electricityKwh} kWh power draw and {formValues.commuteDistanceKmDaily} km daily travel.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Electricity</span>
                    <span className="font-bold text-slate-800">{estElecKg} kg</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Transport</span>
                    <span className="font-bold text-slate-800">{estTransKg} kg</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Cooking</span>
                    <span className="font-bold text-slate-800">{estCookKg} kg</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    By completing onboarding, GreenPulse has customized your Mission LiFE challenges and calibrated your rooftop solar potential!
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Complete & Open Dashboard
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
