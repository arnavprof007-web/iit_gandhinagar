import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Frontend Form Schema Validation', () => {
  const solarFormSchema = z.object({
    city: z.string().min(2, 'City is required'),
    monthlyKwh: z.number().min(30, 'Consumption must be at least 30 kWh').max(5000),
    monthlyBillInr: z.number().min(200, 'Bill must be at least ₹200'),
    tariffInrPerKwh: z.number().min(3).max(20),
    usableRoofSqFt: z.number().min(100, 'At least 100 sq ft shadow-free roof required'),
  });

  const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  it('validates correct solar assessment inputs', () => {
    const valid = {
      city: 'Gandhinagar',
      monthlyKwh: 260,
      monthlyBillInr: 1980,
      tariffInrPerKwh: 7.6,
      usableRoofSqFt: 350,
    };
    expect(() => solarFormSchema.parse(valid)).not.toThrow();
  });

  it('rejects invalid or negative electricity numbers', () => {
    const invalidNegative = {
      city: 'Gandhinagar',
      monthlyKwh: -50, // negative not allowed
      monthlyBillInr: 1980,
      tariffInrPerKwh: 7.6,
      usableRoofSqFt: 350,
    };
    expect(() => solarFormSchema.parse(invalidNegative)).toThrow();
  });

  it('validates email format in auth schema', () => {
    expect(() =>
      loginSchema.parse({ email: 'aarav@example.com', password: 'secretpassword' })
    ).not.toThrow();

    expect(() =>
      loginSchema.parse({ email: 'not-an-email', password: 'secretpassword' })
    ).toThrow();

    expect(() =>
      loginSchema.parse({ email: 'aarav@example.com', password: '123' }) // too short
    ).toThrow();
  });
});
