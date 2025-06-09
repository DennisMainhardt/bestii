import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseConfig';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ProfileSection: React.FC = () => {
  const { currentUser, credits, monthlyResets } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to update your profile.');
      return;
    }

    if (!displayName.trim()) {
      toast.error('Display name cannot be empty.');
      return;
    }

    setIsLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, { displayName });

      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { displayName });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return <p>Loading profile...</p>; // Or a more sophisticated loader
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>View and manage your personal information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled // Email is generally not directly editable
            />
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Usage</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Credits Remaining</span>
              <span className="font-semibold text-primary">{credits ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Daily Resets Left (this month)</span>
              <span className="font-semibold text-primary">{monthlyResets !== null ? 6 - monthlyResets : '-'}</span>
            </div>
          </div>
          <CardDescription>
            You receive 5 free credits every day, up to 6 times per monthly cycle.
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection; 