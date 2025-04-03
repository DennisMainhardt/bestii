import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

const FinishVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const actionCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');
    let ignore = false; // Flag to prevent state updates after cleanup

    const handleVerifyEmail = async (code: string) => {
      // Reset state for this attempt
      setIsLoading(true);
      setError(null);
      setMessage('Verifying your email...');

      try {
        // Verify the code first
        await checkActionCode(auth, code);
        if (ignore) return;

        // Apply the action code
        await applyActionCode(auth, code);
        if (ignore) return;

        // Reload the user state
        if (auth.currentUser) {
          await auth.currentUser.reload();

          if (auth.currentUser?.emailVerified) {
            navigate('/chat', { replace: true });
            return;
          } else {
            if (!ignore) {
              setError('Verification processed, but status not updated. Please try logging in.');
              setIsLoading(false);
            }
          }
        } else {
          if (!ignore) {
            setError('Verification successful, but user session not found. Please log in.');
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError('Failed to verify email. The link may be expired or invalid. Please try resending the verification email from the login page.');
          setIsLoading(false);
        }
      }
    };

    // Initial check for valid mode and code
    if (mode !== 'verifyEmail' || !actionCode) {
      setError('Invalid verification link. Please try signing up again or requesting a new verification email.');
      setIsLoading(false);
    } else {
      // Start the verification process
      handleVerifyEmail(actionCode);
    }

    // Cleanup function to set the ignore flag
    return () => {
      ignore = true;
    };

  }, [searchParams, navigate]); // Dependencies remain the same

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>{message}</p>
            </div>
          ) : error ? (
            <div className="text-destructive space-y-4">
              <p>{error}</p>
              <Button onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
          ) : isVerified ? (
            <div className="text-green-600 space-y-4">
              <p>{message}</p>
              <Button onClick={() => navigate('/chat')}>Go to Chat Now</Button>
            </div>
          ) : (
            <p>Something went wrong. Please return to the login page.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinishVerification; 