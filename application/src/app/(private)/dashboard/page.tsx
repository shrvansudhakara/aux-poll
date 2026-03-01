"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!isPending && !session && !isSigningOut) {
      router.replace("/");
    }
  }, [isPending, session, isSigningOut, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show redirecting state if not authenticated
  if (!session && !isSigningOut) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  // Show loading state during sign out
  if (isSigningOut) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Signing out...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome, {session?.user?.name || session?.user?.email || "User"}!
      </p>
      <Button variant="outline" onClick={handleSignOut}>
        Logout
      </Button>
    </div>
  );
}
