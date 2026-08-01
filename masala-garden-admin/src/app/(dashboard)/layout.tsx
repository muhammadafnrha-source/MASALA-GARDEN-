"use client";
import { useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, ShoppingCart, Calculator, Tag, Users, LogOut, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/firebase/admin-auth-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, loading, logout } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/login');
    }
  }, [admin, loading, router]);

  if (loading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Live Orders', href: '/orders', icon: ShoppingCart },
    { name: 'POS System', href: '/pos', icon: Calculator },
    { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
    { name: 'Offers', href: '/offers', icon: Tag },
    { name: 'Customers', href: '/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-background border-r min-h-screen sticky top-0 z-10">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <Store className="h-6 w-6" />
            <span>Masala Garden</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Menu</p>
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <span className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <item.icon className="h-5 w-5" />
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t space-y-2">
          <Button variant="outline" className="w-full justify-start text-muted-foreground" asChild nativeButton={false}>
            <Link href="http://localhost:3000"><LogOut className="mr-2 h-4 w-4" /> Exit Admin</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 border-b bg-background sticky top-0 z-20">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Store className="h-5 w-5" />
            <span>Masala Garden</span>
          </Link>
          <Button variant="ghost" size="sm" asChild nativeButton={false}>
            <Link href="http://localhost:3000">Storefront</Link>
          </Button>
        </header>
        
        {/* Mobile Nav Scrollable */}
        <div className="md:hidden bg-background border-b overflow-x-auto whitespace-nowrap sticky top-16 z-10">
          <div className="flex px-2 py-2 gap-1">
            {navItems.map((item) => (
              <Button key={item.name} variant="ghost" size="sm" asChild nativeButton={false} className="flex-shrink-0">
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
