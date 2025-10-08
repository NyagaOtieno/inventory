import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Demo login credentials
    const DEMO_EMAIL = 'demo@schooltrack.com';
    const DEMO_PASSWORD = 'demo1234';

    if (isSignUp) {
      localStorage.setItem('isAuthenticated', 'true');
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      // Validate demo credentials
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        localStorage.setItem('isAuthenticated', 'true');
        toast.success('Welcome to the SchoolTrack Demo!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials. Use: demo@schooltrack.com / demo1234');
      }
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
            {isSignUp ? 'Create your account to get started' : 'Demo: demo@schooltrack.com / demo1234'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@schooltrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
            </div>
            <Button type="submit" className="w-full">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
