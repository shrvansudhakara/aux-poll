"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

/**
 * Navigation bar component
 * Features logo, navigation links, and auth buttons with smooth animations
 *
 * @returns {JSX.Element} The fixed top navigation bar
 */
export default function Navbar() {
  return (
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
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
