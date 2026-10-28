import { z } from 'zod';

/**
 * Higher-order middleware factory for validating request bodies, queries, or params using Zod
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        for (const issue of err.issues) {
          const path = issue.path.join('.') || 'root';
          fieldErrors[path] = issue.message;
        }

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please correct the submitted information.',
            fields: fieldErrors,
          },
        });
      }
      next(err);
    }
  };
}

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255)
  .transform((v) => v.toLowerCase());

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must have at least 2 characters').max(100),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  householdSize: z.coerce.number().int().positive().optional(),
  dietType: z.string().trim().max(50).optional(),
  primaryTransportMode: z.string().trim().max(50).optional(),
  phoneNumber: z.string().trim().max(30).optional(),
  ageGroup: z.string().trim().max(30).optional(),
});

export const verifyEmailSchema = z.object({
  email: emailSchema,
  otp: z.string().trim().length(6, 'Verification code must be exactly 6 digits').regex(/^\d{6}$/, 'Code must contain only digits'),
});

export const resendOtpSchema = z.object({
  email: emailSchema,
  purpose: z.enum(['registration', 'email_verification', 'email_change']).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must have at least 8 characters').max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must have at least 8 characters').max(100),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  householdSize: z.coerce.number().int().positive().optional(),
  dietType: z.string().trim().max(50).optional(),
  primaryTransportMode: z.string().trim().max(50).optional(),
  phoneNumber: z.string().trim().max(30).optional(),
  ageGroup: z.string().trim().max(30).optional(),
});

export const createChallengeSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  category: z.enum(['energy', 'water', 'waste', 'mobility', 'lifestyle', 'solar', 'consumption']),
  instructions: z.array(z.string()).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  targetType: z.string().max(50).optional(),
  targetValue: z.coerce.number().positive(),
  targetUnit: z.string().max(50),
  proofType: z.enum(['electricity_bill', 'transport_ticket', 'photo_evidence', 'solar_generation_log', 'self_attestation']),
  verificationRules: z.record(z.any()).optional(),
  pointsReward: z.coerce.number().int().nonnegative(),
  maxSubmissionsPerUser: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const updateChallengeSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  category: z.enum(['energy', 'water', 'waste', 'mobility', 'lifestyle', 'solar', 'consumption']).optional(),
  instructions: z.array(z.string()).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pointsReward: z.coerce.number().int().nonnegative().optional(),
  verificationRules: z.record(z.any()).optional(),
});

export default {
  validate,
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  createChallengeSchema,
  updateChallengeSchema,
};
