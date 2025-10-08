import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { login } from '@/lib/auth';
import { getConfig } from '@/lib/config';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { useMockData } = getConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      if (useMockData) {
        // Mock authentication
        const DEMO_EMAIL = 'demo@schooltrack.com';
        const DEMO_PASSWORD = 'demo1234';

        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify({ role: 'ADMIN', name: 'Demo User' }));
          toast.success('Welcome to the SchoolTrack Demo!');
          navigate('/dashboard');
        } else {
          toast.error('Invalid credentials. Use: demo@schooltrack.com / demo1234');
        }
      } else {
        // Live API authentication
        const { user } = await login(email, password);
        localStorage.setItem('isAuthenticated', 'true');
        
        toast.success(`Welcome back, ${user.name}!`);
        
        // Route based on user role
        if (user.role === 'PARENT') {
          navigate('/parent-portal');
        } else if (user.role === 'ADMIN' || user.role === 'DRIVER' || user.role === 'ASSISTANT') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Bus className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">🎓 SchoolTrack Transport</CardTitle>
          <CardDescription>
            {useMockData ? 'Demo: demo@schooltrack.com / demo1234' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={useMockData ? "demo@schooltrack.com" : "your.email@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

