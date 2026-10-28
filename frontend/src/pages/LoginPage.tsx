import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/authService';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { Leaf, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Mandatory first-login password change state
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useApp();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const user = await authService.login(data.email, data.password);
      refreshUser();

      if (user.mustChangePassword) {
        setMustChangePassword(true);
        setCurrentPassword(data.password);
        showToast({
          title: 'Password Update Required',
          message: 'As an administrator, you must set a new strong password before proceeding.',
          type: 'warning',
        });
        return;
      }

      showToast({
        title: 'Welcome Back!',
        message: `Signed in as ${user.name} (${(user.role || 'user').toUpperCase()})`,
        type: 'success',
      });

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from);
      }
    } catch (err: any) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setServerError('Your email is unverified. Please check your inbox or register again to verify.');
      } else if (err.code === 'INVALID_CREDENTIALS') {
        setServerError('Invalid email or password. Please check your credentials.');
      } else {
        setServerError(err.message || 'Unable to sign in. Please verify your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMandatoryPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setServerError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setServerError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    setServerError(null);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setMustChangePassword(false);
      refreshUser();
      showToast({
        title: 'Password Updated',
        message: 'Your administrator password has been set. Access granted.',
        type: 'success',
      });
      navigate('/admin');
    } catch (err: any) {
      setServerError(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsSendingReset(true);
    try {
      await authService.forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotSubmitted(true);
      showToast({
        title: 'Password Reset Initiated',
        message: 'If an account exists with this email, recovery instructions have been sent.',
        type: 'info',
      });
    } catch (err: any) {
      showToast({
        title: 'Notice',
        message: err.message || 'Request submitted.',
        type: 'info',
      });
      setForgotSubmitted(true);
    } finally {
      setIsSendingReset(false);
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
          {mustChangePassword ? 'Mandatory Password Setup' : 'Sign In to GreenPulse'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {mustChangePassword
            ? 'Set a new private password to secure your administrator account'
            : 'Access sustainability challenges and Mission LiFE tracking'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-xl rounded-2xl border border-emerald-100 sm:px-10 space-y-6">
          {serverError && <Alert type="danger">{serverError}</Alert>}

          {mustChangePassword ? (
            <form onSubmit={handleMandatoryPasswordChange} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  This administrator account was bootstrapped with a temporary password. You must establish a new password before accessing administrator tools.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Administrator Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isChangingPass}
                disabled={isChangingPass}
                className="w-full justify-center py-2.5"
              >
                Update Password & Enter Admin Portal
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  id="login-email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  {...register('email')}
                  error={errors.email?.message}
                  required
                />

                <div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      leftIcon={<Lock className="w-4 h-4" />}
                      {...register('password')}
                      error={errors.password?.message}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="mt-1 text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button
                  id="login-submit-btn"
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="w-full justify-center py-2.5 mt-2"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In
                </Button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                New to GreenPulse?{' '}
                <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-900">
                  Register for an account
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recover Password</h3>
                <p className="text-xs text-slate-500">Enter your normalized account email</p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div className="space-y-4 text-center py-2">
                <p className="text-xs text-slate-600">
                  If an account exists for <strong>{forgotEmail}</strong>, an expiring reset link was dispatched. (Check terminal in local dev mode).
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                    setForgotEmail('');
                  }}
                  className="w-full justify-center"
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 justify-center"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSendingReset}
                    className="flex-1 justify-center"
                  >
                    Send Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
