import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Clock, Utensils } from 'lucide-react';

export const metadata = {
  title: 'Masala Garden | Authentic Spices & Fresh Food',
  description: 'Order online from Masala Garden. Enjoy the finest cuisine made with fresh ingredients and authentic spices.',
};

export default function Home() {
  const heroImages = [
    '/assets/shop/shop-1.jpeg',
    '/assets/shop/shop-2.jpeg',
    '/assets/shop/shop-3.jpeg',
    '/assets/shop/shop-4.jpeg',
    '/assets/shop/shop-5.jpeg',
    '/assets/shop/shop-6.jpeg',
    '/assets/shop/shop-7.jpeg',
    '/assets/shop/shop-8.jpeg',
    '/assets/shop/shop-9.jpeg',
    '/assets/shop/shop-10.jpeg',
    '/assets/shop/shop-11.jpeg',
    '/assets/shop/shop-12.jpeg',
    '/assets/shop/shop-13.jpeg',
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-white via-yellow-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-yellow-950 pt-16 md:pt-24 lg:pt-28 pb-14 text-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                  <Star className="mr-1 h-3.5 w-3.5 fill-primary" />
                  Rated 4.9/5 by 1000+ customers
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl/none">
                  Authentic Flavors, <br />
                  <span className="text-primary">Delivered to You</span>
                </h1>
                <p className="max-w-[600px] text-zinc-200 text-lg md:text-xl leading-relaxed">
                  Experience the taste of true spices and fresh ingredients. Order online for delivery, takeaway, or dine-in.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="h-12 px-8" asChild>
                  <Link href="/menu">
                    Order Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" className="h-12 px-8 bg-green-500 text-black hover:bg-green-400" asChild>
                  <Link href="/track">Track Order</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm font-medium text-zinc-200 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Fast Preparation
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  Freshly prepared meals
                </div>
              </div>
            </div>
            
            <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none aspect-square">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/30 to-white/10 rounded-full blur-3xl" />
              <div className="relative h-full w-full rounded-xl overflow-hidden border border-yellow-400/30 bg-zinc-900 shadow-2xl">
                {heroImages.map((image, index) => (
                  <div
                    key={image}
                    className="hero-slide absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${image})`,
                      animationDelay: `${index * 3}s`,
                    }}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore Our Menu</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-lg">
              Discover our carefully crafted dishes, from appetizers to desserts.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {['Wrap', 'Kothu', 'BBQ', 'Nasi Goreng'].map((category) => (
              <Link 
                key={category} 
                href="/menu"
                className="group relative overflow-hidden rounded-xl bg-background border p-6 hover:shadow-md transition-all hover:border-primary/50 text-center flex flex-col items-center justify-center gap-4"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">{category}</h3>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/menu">View Full Menu</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
