import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { Leaf, User, Mail, Lock, ArrowRight, MapPin, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must have at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  city: z.string().trim().min(2, 'City is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      city: 'Gandhinagar',
      password: '',
    },
  });

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await authService.register(data);
      setRegisteredEmail(data.email.trim().toLowerCase());
      setStep('verify');
      setResendCooldown(60); // 60s cooldown per policy
      showToast({
        title: 'Registration Initiated',
        message: res.message || 'Verification code dispatched to your email.',
        type: 'info',
      });
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);
    try {
      await authService.verifyEmail(registeredEmail, otpCode.trim());
      showToast({
        title: 'Email Verified!',
        message: 'Your account is ready. Please sign in to continue.',
        type: 'success',
      });
      navigate('/login');
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setOtpError(null);
    try {
      await authService.resendOtp(registeredEmail, 'registration');
      setResendCooldown(60);
      showToast({
        title: 'New Code Dispatched',
        message: 'A replacement 6-digit verification code was sent.',
        type: 'info',
      });
    } catch (err: any) {
      setOtpError(err.message || 'Unable to resend verification code right now.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-hero-gradient">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-display font-extrabold text-2xl text-emerald-950 tracking-tight">
            GreenPulse
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 font-display">
          {step === 'register' ? 'Start Your Mission LiFE Journey' : 'Verify Your Email'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {step === 'register'
            ? 'Create an account to participate in sustainability challenges'
            : `Enter the 6-digit verification code sent to ${registeredEmail}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-xl rounded-2xl border border-emerald-100 sm:px-10 space-y-6">
          {step === 'register' ? (
            <>
              {serverError && <Alert type="danger">{serverError}</Alert>}

              <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
                <Input
                  id="reg-fullName"
                  label="Full Name"
                  placeholder="e.g. Aarav Sharma"
                  leftIcon={<User className="w-4 h-4" />}
                  {...register('fullName')}
                  error={errors.fullName?.message}
                  required
                />

                <Input
                  id="reg-email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  {...register('email')}
                  error={errors.email?.message}
                  required
                />

                <Input
                  id="reg-city"
                  label="City"
                  placeholder="Gandhinagar"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  {...register('city')}
                  error={errors.city?.message}
                  required
                />

                <Input
                  id="reg-password"
                  label="Create Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  {...register('password')}
                  error={errors.password?.message}
                  helperText="At least 8 characters required"
                  required
                />

                <Button
                  id="reg-submit-btn"
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="w-full justify-center py-2.5 mt-2"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Account
                </Button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-900">
                  Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              {otpError && <Alert type="danger">{otpError}</Alert>}

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Account created in database!</p>
                  <p className="mt-0.5 text-emerald-700">
                    A cryptographically generated single-use OTP was dispatched to{' '}
                    <strong>{registeredEmail}</strong>. (Check terminal dev logs if running locally).
                  </p>
                </div>
              </div>

              <form onSubmit={onVerifySubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="otp-input"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      autoFocus
                      className="block w-full pl-10 pr-4 py-2.5 text-center tracking-widest text-lg font-mono rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 text-center">
                    Enter the digits sent to your email. Expires in 10 minutes.
                  </p>
                </div>

                <Button
                  id="otp-verify-btn"
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isVerifying}
                  disabled={isVerifying || otpCode.length !== 6}
                  className="w-full justify-center py-2.5"
                >
                  Verify & Sign In
                </Button>
              </form>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ← Edit Information
                </button>

                <button
                  id="otp-resend-btn"
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isResending}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
