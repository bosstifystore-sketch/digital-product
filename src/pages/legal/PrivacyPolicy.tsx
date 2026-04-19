export default function PrivacyPolicy() {
  return (
    <div className="container" style={{ maxWidth: 800, paddingTop: 48, paddingBottom: 64 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 40 }}>Last updated: April 2025</p>

      {[
        {
          title: '1. Information We Collect',
          body: `When you use Bosstify Store, we may collect the following information:
• Email address (for account creation and order delivery)
• Payment screenshots (uploaded by you for order verification)
• Instagram profile URL (for follower delivery orders)
• Order history and usage data`
        },
        {
          title: '2. How We Use Your Information',
          body: `We use your information to:
• Process and deliver your orders
• Send order confirmation and delivery emails
• Verify payments made by you
• Improve our services and user experience
• Respond to your support requests`
        },
        {
          title: '3. Data Storage & Security',
          body: `Your data is stored securely on Supabase infrastructure. We do not sell or share your personal information with any third parties. Payment screenshots are stored only for admin verification purposes and are not shared publicly.`
        },
        {
          title: '4. Cookies',
          body: `We use essential cookies to keep you logged in and maintain your session. No tracking or advertising cookies are used.`
        },
        {
          title: '5. Third-Party Services',
          body: `We use the following trusted third-party services:
• Supabase — Database & authentication
• Resend — Email delivery
• Vercel — Website hosting
Each of these services has their own privacy policies.`
        },
        {
          title: '6. Your Rights',
          body: `You have the right to:
• Access your personal data
• Request deletion of your account and data
• Withdraw consent at any time
To exercise these rights, contact us at support@bosstifystore.in`
        },
        {
          title: '7. Changes to This Policy',
          body: `We may update this Privacy Policy from time to time. Changes will be posted on this page with a new "Last updated" date.`
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
