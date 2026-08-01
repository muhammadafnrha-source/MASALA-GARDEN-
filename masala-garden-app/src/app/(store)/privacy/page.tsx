export default function PrivacyPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Information We Collect</h2>
          <p>We collect information you provide directly when placing orders, including name, phone number, and delivery address.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">How We Use Your Information</h2>
          <p>Your information is used to process orders, provide customer support, and improve our services.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at hello@masalagarden.com.</p>
        </section>
      </div>
    </main>
  );
}
