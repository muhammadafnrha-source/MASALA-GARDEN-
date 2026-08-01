export default function TermsPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Acceptance of Terms</h2>
          <p>By accessing and using Masala Garden&apos;s services, you accept and agree to be bound by these Terms of Service.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Ordering and Payment</h2>
          <p>All orders are subject to availability. Payment is required at the time of ordering for delivery and takeaway orders.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Cancellation Policy</h2>
          <p>Orders can be cancelled within 5 minutes of placement. After preparation begins, cancellation may not be possible.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Contact Information</h2>
          <p>For questions about these Terms, please contact us at hello@masalagarden.com.</p>
        </section>
      </div>
    </main>
  );
}
