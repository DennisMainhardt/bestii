import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

interface LoginFormData {
  email: string;
  password: string;
}

interface SignUpFormData extends LoginFormData {
  confirmPassword: string;
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [signUpFormData, setSignUpFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isSignUp: boolean
  ) => {
    const { name, value } = e.target;
    if (isSignUp) {
      setSignUpFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setLoginFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(loginFormData);

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Login attempt with:", loginFormData);
      navigate("/chat");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signUpSchema.safeParse(signUpFormData);

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Sign up attempt with:", signUpFormData);
      navigate("/chat");
    } catch (err) {
      setError("Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate Google auth flow
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Google login attempt");
      navigate("/chat");
    } catch (err) {
      setError("Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header hideNav />
      <main className="container flex flex-col items-center justify-center min-h-screen px-4 pt-16">
        <div className="flex flex-col items-center w-full">
          <Card className="w-full max-w-[480px] border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-4 px-8">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                {isSignUp ? "Create an account" : "Sign in"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={isSignUp ? handleSignUp : handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your email address"
                    className="w-full"
                    value={isSignUp ? signUpFormData.email : loginFormData.email}
                    onChange={(e) => handleInputChange(e, isSignUp)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={isSignUp ? "Create a password" : "Your password"}
                    className="w-full"
                    value={isSignUp ? signUpFormData.password : loginFormData.password}
                    onChange={(e) => handleInputChange(e, isSignUp)}
                    disabled={isLoading}
                  />
                </div>
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="w-full"
                      value={signUpFormData.confirmPassword}
                      onChange={(e) => handleInputChange(e, true)}
                      disabled={isLoading}
                    />
                  </div>
                )}
                {error && (
                  <div className="text-sm text-destructive text-center">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-white/90"
                  disabled={isLoading}
                >
                  {isLoading
                    ? isSignUp
                      ? "Creating account..."
                      : "Signing in..."
                    : isSignUp
                      ? "Create account"
                      : "Continue"}
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full bg-muted hover:bg-muted/80"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                {isLoading ? "Connecting..." : "Continue with Google"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <span
                  className="text-primary hover:underline cursor-pointer"
                  onClick={toggleSignUp}
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </span>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login; 