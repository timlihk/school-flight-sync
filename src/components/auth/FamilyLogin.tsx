import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Lock, Eye, EyeOff, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFamilyAuth } from '@/contexts/FamilyAuthContext';

const loginSchema = z.object({
  secretPhrase: z.string().min(1, 'Please enter the family secret phrase'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function FamilyLogin() {
  const { login } = useFamilyAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      secretPhrase: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = login(data.secretPhrase);
      if (!success) {
        setError('Incorrect secret phrase. Please try again.');
        form.reset();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-academic">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Family Access
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter the family secret phrase to access School Flight Sync
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Welcome Home</CardTitle>
            <CardDescription>
              This app is for family use only. Please enter the secret phrase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <FormField
                  control={form.control}
                  name="secretPhrase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Secret Phrase</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showSecret ? 'text' : 'password'}
                            placeholder="Enter family secret phrase"
                            className="pl-10 pr-10"
                            disabled={isLoading}
                            autoComplete="off"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowSecret(!showSecret)}
                            disabled={isLoading}
                          >
                            {showSecret ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Enter Family App'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          This application is for authorized family members only.
        </p>
      </div>
    </div>
  );
}