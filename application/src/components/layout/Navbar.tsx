"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import Login from "@/components/auth/Login";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { useAuthModal } from "@/lib/context/auth-modal";

/**
 * Navigation bar component
 * Features logo and auth button with a slide-in animation
 *
 * @returns {JSX.Element} The fixed top navigation bar
 */
export default function Navbar() {
  const { open, setOpen } = useAuthModal();
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-12 w-12">
              <Image
                src="/logo-icon.svg"
                alt="AuxPoll"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">AuxPoll</span>
          </Link>

          {/* Navigation Links & Auth */}
          <div className="flex items-center space-x-4">
            {session ? (
              <Button variant="outline" onClick={handleSignOut}>
                Logout
              </Button>
            ) : (
              <Button onClick={() => setOpen(true)}>Login</Button>
            )}
          </div>
        </div>
      </motion.nav>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 border-none gap-0 [&>button]:hidden">
          <VisuallyHidden>
            <DialogTitle>Login</DialogTitle>
          </VisuallyHidden>
          <Login />
        </DialogContent>
      </Dialog>
    </>
  );
}
