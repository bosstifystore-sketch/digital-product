export default function TermsAndConditions() {
  return (
    <div className="container" style={{ maxWidth: 800, paddingTop: 48, paddingBottom: 64 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Terms & Conditions</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 40 }}>Last updated: April 2025</p>

      {[
        {
          title: '1. Acceptance of Terms',
          body: `By accessing or using Bosstify Store, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.`
        },
        {
          title: '2. Products & Services',
          body: `Bosstify Store provides digital products including Instagram accounts and Instagram follower packages. All products are digital in nature and delivered electronically.`
        },
        {
          title: '3. Payment Policy',
          body: `• All payments are made via UPI.
• You must upload a valid payment screenshot after making the payment.
• Orders are processed only after admin verification of your payment.
• We reserve the right to cancel any order if payment cannot be verified.`
        },
        {
          title: '4. Delivery Policy',
          body: `• Instagram account credentials are delivered via email after payment verification.
• Follower packages are delivered to your Instagram profile within 24 hours of order approval.
• Delivery times may vary. We are not responsible for delays caused by Instagram platform changes.`
        },
        {
          title: '5. Refund Policy',
          body: `• Due to the digital nature of our products, all sales are final.
• Refunds will only be considered if:
  - The product was not delivered within 48 hours
  - The account credentials provided were incorrect
• To request a refund, contact us via the Support section within 48 hours of purchase.`
        },
        {
          title: '6. Account Responsibility',
          body: `• You are responsible for keeping your account credentials secure.
• Do not share your Bosstify Store account with others.
• We are not responsible for any loss due to your own negligence.`
        },
        {
          title: '7. Prohibited Activities',
          body: `You agree not to:
• Use our services for any illegal purpose
• Attempt to reverse-engineer or hack our platform
• Place fraudulent orders or upload fake payment screenshots
• Abuse our support system`
        },
        {
          title: '8. Changes to Terms',
          body: `We reserve the right to modify these terms at any time. Continued use of our platform after changes constitutes acceptance of the new terms.`
        },
        {
          title: '9. Contact Us',
          body: `For any questions regarding these terms, contact us at: support@bosstifystore.in`
        },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10, color: 'var(--accent-light)' }}>{section.title}</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '0.9rem' }}>{section.body}</p>
        </div>
      ))}
    </div>
  )
}
