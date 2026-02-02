import { useState } from "react";
import { useFamilyAuth } from "@/contexts/FamilyAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import {
  Plane,
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Car,
} from "lucide-react";

export function FamilyLogin() {
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useFamilyAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(passcode);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Visual */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-primary via-primary to-primary-foreground/20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-benenden/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-wycombe/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Plane illustrations */}
          <div className="absolute top-20 right-20 opacity-20">
            <Plane className="w-32 h-32 text-white rotate-[-30deg]" />
          </div>
          <div className="absolute bottom-32 left-20 opacity-10">
            <Plane className="w-48 h-48 text-white rotate-[15deg]" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="space-y-8">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Flight Sync</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Journey Planning
                <br />
                <span className="text-white/80">Made Simple</span>
              </h1>
              <p className="text-lg text-white/70 max-w-md">
                Manage school terms, flights, and transport for your children in one beautiful place.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4 pt-4">
              {[
                { icon: Calendar, text: "Track term dates across schools" },
                { icon: Plane, text: "Manage flight bookings" },
                { icon: Car, text: "Coordinate ground transport" },
                { icon: GraduationCap, text: "Multi-school support" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-white/80 animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/20 to-transparent" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col bg-background relative">
        {/* Mobile background */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 lg:p-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Flight Sync</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Login Form */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 lg:px-16 xl:px-24 -mt-20 lg:mt-0">
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Welcome Back</span>
            </div>

            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Family Login</h2>
              <p className="text-muted-foreground">
                Enter your family passcode to access your journey dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="passcode" className="text-sm font-medium">
                  Passcode
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="passcode"
                    type={showPasscode ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter your passcode"
                    className={cn(
                      "pl-10 pr-12 h-14 text-lg tracking-widest rounded-xl",
                      "border-2 transition-all duration-200",
                      "focus:border-primary focus:ring-4 focus:ring-primary/10",
                      error && "border-journey-missing focus:border-journey-missing focus:ring-journey-missing/10"
                    )}

                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasscode ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-journey-missing flex items-center gap-1.5 animate-slide-in">
                    <Shield className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || passcode.length === 0}
                className={cn(
                  "w-full h-14 text-base font-semibold rounded-xl",
                  "transition-all duration-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  passcode.length > 0 && "shadow-glow-primary"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Access Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            {/* Security note */}
            <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-muted/50">
              <CheckCircle2 className="w-5 h-5 text-journey-complete flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Your data is securely encrypted and only accessible with your family passcode.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-6 lg:p-8 text-center lg:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} School Flight Sync. Private family access only.
          </p>
        </div>
      </div>
    </div>
  );
}

// Default export for lazy loading
export default FamilyLogin;
