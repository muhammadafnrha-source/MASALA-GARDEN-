"use client";

import Link from 'next/link';
import { Menu, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CartSheet } from './cart-sheet';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-primary tracking-tight">Masala<span className="text-foreground">Garden</span></span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">Home</Link>
          <Link href="/menu" className="text-sm font-medium transition-colors hover:text-primary">Menu</Link>
          <Link href="/track" className="text-sm font-medium transition-colors hover:text-primary">Track Order</Link>
          
          <CartSheet />

          {user ? (
            <Button variant="ghost" size="sm" onClick={() => { logout(); router.push('/'); }}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild nativeButton={false}>
              <Link href="/login"><User className="mr-2 h-4 w-4" /> Login</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2">
          <CartSheet />
          
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            } />
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium">Home</Link>
                <Link href="/menu" className="text-lg font-medium">Menu</Link>
                <Link href="/track" className="text-lg font-medium">Track Order</Link>
                {user ? (
                  <button onClick={() => { logout(); router.push('/'); }} className="text-lg font-medium text-left text-destructive">Logout</button>
                ) : (
                  <Link href="/login" className="text-lg font-medium">Login</Link>
                )}
                <Link href="/admin/login" className="text-lg font-medium text-muted-foreground mt-4">Staff Login</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
