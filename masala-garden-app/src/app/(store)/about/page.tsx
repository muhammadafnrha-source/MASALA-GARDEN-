import { Card, CardContent } from '@/components/ui/card';
import { Utensils, Heart, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="flex-1">
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About Masala Garden</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bringing authentic Indian flavors to your table since 2020
          </p>
        </div>
      </section>

      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Utensils className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Our Mission</h3>
              <p className="text-muted-foreground">
                To serve authentic Indian cuisine made with freshest ingredients and traditional recipes
              </p>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Our Passion</h3>
              <p className="text-muted-foreground">
                Every dish is crafted with love, following family recipes passed down through generations
              </p>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Our Team</h3>
              <p className="text-muted-foreground">
                Experienced chefs dedicated to delivering exceptional dining experiences
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
