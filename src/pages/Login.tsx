import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { login } from '@/lib/auth';

// Demo credentials for all user types
const DEMO_CREDENTIALS = {
  admin: { email: 'admin@schooltrack.com', password: 'admin123', role: 'ADMIN' },
  parent: { email: 'parent@schooltrack.com', password: 'parent123', role: 'PARENT' },
  driver: { email: 'driver@schooltrack.com', password: 'driver123', role: 'DRIVER' },
  assistant: { email: 'assistant@schooltrack.com', password: 'assistant123', role: 'ASSISTANT' }
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check for demo credentials first
      const demoUser = Object.values(DEMO_CREDENTIALS).find(
        cred => cred.email === email && cred.password === password
      );

      if (demoUser) {
        // Mock login for demo
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({ 
          email: demoUser.email, 
          role: demoUser.role,
          name: demoUser.role.charAt(0) + demoUser.role.slice(1).toLowerCase()
        }));
        
        toast.success(`Welcome to SchoolTrack Demo! (${demoUser.role})`);
        
        // Route based on role
        if (demoUser.role === 'PARENT') {
          navigate('/parent-portal');
        } else if (demoUser.role === 'DRIVER') {
          navigate('/driver-portal');
        } else if (demoUser.role === 'ASSISTANT') {
          navigate('/assistant-portal');
        } else {
          navigate('/dashboard');
        }
        return;
      }

      // Try live API authentication
      const result = await login(email, password);
      
      if (!result.user) {
        toast.error('Login failed. Please check your credentials.');
        return;
      }

      const user = result.user;
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Login successful!');
      
      // Route based on role
      if (user.role === 'PARENT') {
        navigate('/parent-portal');
      } else if (user.role === 'DRIVER') {
        navigate('/driver-portal');
      } else if (user.role === 'ASSISTANT') {
        navigate('/assistant-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
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
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
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

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-semibold mb-3 text-center">Demo Credentials:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-muted p-2 rounded">
                <strong>Admin:</strong> admin@schooltrack.com / admin123
              </div>
              <div className="bg-muted p-2 rounded">
                <strong>Parent:</strong> parent@schooltrack.com / parent123
              </div>
              <div className="bg-muted p-2 rounded">
                <strong>Driver:</strong> driver@schooltrack.com / driver123
              </div>
              <div className="bg-muted p-2 rounded">
                <strong>Assistant:</strong> assistant@schooltrack.com / assistant123
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
