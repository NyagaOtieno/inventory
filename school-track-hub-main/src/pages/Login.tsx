import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

// ✅ Backend base URLs
const API_URL = 'https://schooltransport-production.up.railway.app/api/auth/login';
const FORGOT_URL = 'https://schooltransport-production.up.railway.app/api/auth/forgot-password';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(API_URL, { email, password });
      const data = response.data;

      if (!data || !data.user || !data.token) {
        toast.error('Invalid login response from server.');
        return;
      }

      const { user, token } = data;

      // ✅ Save token & user to localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success(`Welcome back, ${user.name || 'User'}!`);

      // ✅ Redirect by role
      switch (user.role) {
        case 'PARENT':
          navigate('/parent-portal');
          break;
        case 'DRIVER':
          navigate('/driver-portal');
          break;
        case 'ASSISTANT':
          navigate('/assistant-portal');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email.');
      return;
    }
    try {
      await axios.post(FORGOT_URL, { email: forgotEmail });
      toast.success('Password reset link sent to your email.');
      setIsForgotOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            🎓 SchoolTrack Transport
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 relative">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setIsForgotOpen(true)}
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Forgot Password Modal */}
          {isForgotOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-lg w-[90%] max-w-sm">
                <h2 className="text-lg font-semibold mb-2 text-center">Reset Password</h2>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Enter your email to receive a password reset link.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="w-full">
                      Send Link
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsForgotOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
