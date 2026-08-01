import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-xl tracking-tight">Masala<span className="text-primary">Garden</span></h3>
            <p className="text-sm text-muted-foreground">
              Authentic flavors, delivered to your door. Experience the taste of true spices and fresh ingredients.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/menu" className="hover:text-primary transition-colors">Our Menu</Link></li>
              <li><Link href="/track" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Contact Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>123 Flavor Street, Food City</li>
              <li>+94 763988214</li>
              <li>hello@masalagarden.com</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Opening Hours</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Mon - Fri: 11:00 AM - 10:00 PM</li>
              <li>Sat - Sun: 10:00 AM - 11:00 PM</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Masala Garden. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
