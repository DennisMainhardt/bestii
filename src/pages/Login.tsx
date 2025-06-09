import { useState, ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  signInWithPopup,
  AuthError,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/firebase/firebaseConfig";
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Loader2 } from 'lucide-react';
import { FieldErrors } from 'react-hook-form';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";

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

type LoginFormInputs = z.infer<typeof loginSchema>;
type SignUpFormInputs = z.infer<typeof signUpSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ReactNode | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [isAwaitingVerification, setIsAwaitingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentSchema = isSignUp ? signUpSchema : loginSchema;
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<LoginFormInputs | SignUpFormInputs>({
    resolver: zodResolver(currentSchema),
    mode: 'onBlur',
  });

  const emailValue = watch("email");

  useEffect(() => {
    if (location.state?.from === 'register') {
      setIsSignUp(true);
    } else if (location.state?.from === 'login') {
      setIsSignUp(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (!loading && currentUser && currentUser.emailVerified) {
      setIsAwaitingVerification(false);
      const from = location.state?.from?.pathname || '/chat';
      navigate(from, { replace: true });
    }
  }, [currentUser, loading, navigate, location.state]);

  useEffect(() => {
    const needsVerificationFlag = location.state?.needsVerification;

    if (needsVerificationFlag && currentUser && !currentUser.emailVerified) {
      toast.error(
        <span className="flex flex-col items-center gap-2 text-center">
          <span>Your email address is not verified. Please check your inbox for the verification link.</span>
          <button
            type="button"
            className="text-xs px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50"
            onClick={() => handleResendVerification(currentUser)}
            disabled={isLoading}
          >
            Resend verification
          </button>
        </span>,
        { duration: 6000 }
      );
      setIsAwaitingVerification(true);
      navigate(location.pathname, { state: { ...location.state, needsVerification: false }, replace: true });
    } else {
      setIsAwaitingVerification(false);
    }
  }, [location.state, currentUser, isLoading, navigate]);

  const onSubmit: SubmitHandler<LoginFormInputs | SignUpFormInputs> = (data) => {
    setError(null);
    if (isSignUp) {
      handleSignUpSubmit(data as SignUpFormInputs);
    } else {
      handleEmailLoginSubmit(data as LoginFormInputs);
    }
  };

  const handleEmailLoginSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        console.log("Client state shows email not verified, attempting reload...");
        try {
          await userCredential.user.reload();
          const refreshedUser = auth.currentUser;

          if (refreshedUser?.emailVerified) {
            console.log("Email verified after reload during login attempt!");
            setIsAwaitingVerification(false);
            try {
              const userDocRef = doc(db, 'users', refreshedUser.uid);
              await updateDoc(userDocRef, { lastLoginAt: serverTimestamp() });
              console.log(`Updated lastLoginAt for user ${refreshedUser.uid}`);
            } catch (updateError) {
              console.error("Failed to update lastLoginAt after verification:", updateError);
            }
            navigate("/chat");
            return;
          }
        } catch (reloadError) {
          console.error("Error reloading user during login check:", reloadError);
        }

        console.log("Still not verified after reload, showing prompt.");
        setError(
          <span className="flex flex-col items-center gap-2 text-center">
            <span>Please verify your email address before signing in. Check your inbox.</span>
            <button
              type="button"
              className="text-xs px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50"
              onClick={() => handleResendVerification(userCredential.user)}
              disabled={isLoading}
            >
              Resend verification
            </button>
          </span>
        );
        setIsAwaitingVerification(true);
        setIsLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { lastLoginAt: serverTimestamp() });
        console.log(`Updated lastLoginAt for user ${user.uid}`);
      } catch (updateError) {
        console.error("Failed to update lastLoginAt:", updateError);
      }

      setIsAwaitingVerification(false);
      navigate("/chat");
    } catch (err) {
      const error = err as AuthError;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(`Login failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (data: SignUpFormInputs) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      console.log('Auth user created:', user.uid);

      try {
        console.log(`Creating Firestore document for user ${user.uid}...`);
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.email?.split('@')[0] || `User_${user.uid.substring(0, 5)}`,
          createdAt: serverTimestamp(),
          providerId: 'password',
          lastLoginAt: serverTimestamp(),
        });
        console.log(`Firestore document created successfully for user ${user.uid}.`);
      } catch (firestoreError) {
        console.error(`Failed to create Firestore document for user ${user.uid}:`, firestoreError);
        setError(`Account created, but failed to save profile: ${firestoreError.message}`);
        setIsLoading(false);
        return;
      }

      const actionCodeSettings = {
        url: `${window.location.origin}/finish-verification`,
        handleCodeInApp: true,
      };

      console.log(`Sending verification email to ${user.email}...`);
      await sendEmailVerification(user, actionCodeSettings);
      console.log(`Verification email sent.`);

      setShowVerificationMessage(true);
      reset();
    } catch (err) {
      const error = err as AuthError;
      console.error("Sign up failed:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError("This email address is already in use. Please sign in or use a different email.");
      } else {
        setError(`Failed to create account: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const providerData = user.providerData[0];
      console.log('Google Sign-in successful for:', user.uid, user.email);

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          console.log(`Firestore document for user ${user.uid} does not exist. Creating...`);
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || `User_${user.uid.substring(0, 5)}`,
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            providerId: providerData?.providerId || 'google.com',
            lastLoginAt: serverTimestamp(),
          });
          console.log(`Firestore document created successfully for Google user ${user.uid}.`);
        } else {
          console.log(`Firestore document already exists for user ${user.uid}. Updating lastLoginAt...`);
          await updateDoc(userDocRef, { lastLoginAt: serverTimestamp() });
          console.log(`Updated lastLoginAt for user ${user.uid}`);
        }
      } catch (firestoreError) {
        console.error(`Failed to check/create Firestore document for Google user ${user.uid}:`, firestoreError);
      }

      if (!user.emailVerified) {
        console.log("Google user email not verified (uncommon). Handling...");
        setError(
          <span className="flex flex-col items-center gap-2 text-center">
            <span>Your Google account email needs verification. Please check your inbox.</span>
            <button
              type="button"
              className="text-xs px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50"
              onClick={() => handleResendVerification(user)}
              disabled={isLoading}
            >
              Resend verification
            </button>
          </span>
        );
        setIsAwaitingVerification(true);
        setIsLoading(false);
        return;
      }

      console.log("Navigating Google user to chat...");
      navigate("/chat");
    } catch (err) {
      const error = err as AuthError;
      console.error("Google Sign-in failed:", error);
      setError(`Failed to sign in with Google: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (user: User) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await sendEmailVerification(user);
      toast.success("Verification email sent again. Please check your inbox.");
    } catch (err) {
      toast.error(`Failed to resend verification email: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = emailValue;
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    const emailValidation = z.string().email().safeParse(email);
    if (!emailValidation.success) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (err) {
      const error = err as AuthError;
      if (error.code === 'auth/user-not-found') {
        toast.success("Password reset email sent if the account exists. Please check your inbox.");
      } else {
        toast.error(`Failed to send password reset email: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    reset();
    setShowVerificationMessage(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
                {isSignUp ? "Create an account" : "Login"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showVerificationMessage ? (
                <div className="space-y-4 text-center">
                  <p className="text-green-600 font-medium">
                    Account created successfully!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A verification email has been sent to your email address.
                    Please check your inbox (and spam folder) and click the link to verify your account.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowVerificationMessage(false);
                      setIsSignUp(false);
                    }}
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email address"
                        className="w-full"
                        {...register("email")}
                        disabled={isLoading}
                      />
                      {errors.email && <p className="text-xs text-destructive pt-1">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        {!isSignUp && (
                          <button
                            type="button"
                            onClick={handlePasswordReset}
                            className="text-xs text-primary hover:underline disabled:opacity-50"
                            disabled={isLoading || !emailValue}
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={isSignUp ? "Create a password" : "Your password"}
                          className="w-full pr-10"
                          {...register("password")}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground disabled:opacity-50"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive pt-1">{errors.password.message}</p>}
                    </div>
                    {isSignUp && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative flex items-center">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="w-full pr-10"
                            {...register("confirmPassword")}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground disabled:opacity-50"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {isSignUp && errors['confirmPassword'] && (
                          <p className="text-xs text-destructive pt-1">
                            {errors['confirmPassword'].message}
                          </p>
                        )}
                      </div>
                    )}
                    {error && (
                      <div className="text-sm text-destructive text-center">
                        {typeof error === 'string' ? error : <>{error}</>}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-white text-black hover:bg-white/90 flex items-center justify-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
                    className="w-full bg-muted hover:bg-muted/80 flex items-center justify-center gap-2"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {!isLoading && (
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
                    )}
                    {isLoading ? "Connecting..." : "Continue with Google"}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <span
                      className="text-primary hover:underline cursor-pointer"
                      onClick={toggleSignUp}
                    >
                      {isSignUp ? "Login" : "Register"}
                    </span>
                  </div>
                </>
              )}
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