export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-zinc-100 px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary-400/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="absolute top-20 left-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent mb-4">
            🔒 Privacy Policy
          </h1>
        </div>

        <div className="bg-glass-dark backdrop-blur-lg border border-primary-500/30 rounded-2xl p-8 shadow-glow">

          <Section title="Purpose of the Application" icon="🎯">
            MailStorm allows users to connect their own email accounts (Google Gmail, Microsoft Outlook, or custom SMTP providers) to send emails after explicit user action.
          </Section>

          <Section title="Data Accessed" icon="📊">
            We may access the following data:
            <ul className="mt-4 space-y-2">
              <li>• Email address (account identification)</li>
              <li>• OAuth authorization tokens (Google / Outlook)</li>
              <li>• SMTP credentials provided by the user</li>
              <li>• Email content created by the user</li>
              <li>• Recipient email addresses provided by the user</li>
            </ul>
          </Section>

          <Section title="Data Usage" icon="⚙️">
            The collected data is used only to:
            <ul className="mt-4 space-y-2">
              <li>• Send emails on behalf of the user</li>
              <li>• Authenticate connected email accounts</li>
              <li>• Process scheduled email delivery</li>
              <li>• Maintain suppression lists (unsubscribe handling)</li>
            </ul>
            We do not use data for advertising or profiling.
          </Section>

          <Section title="Data Sharing" icon="🔗">
            We do not sell or share user data with third parties.
            Data is only transmitted to:
            <ul className="mt-4 space-y-2">
              <li>• Google Gmail API (for sending emails)</li>
              <li>• Microsoft Outlook API (if connected)</li>
              <li>• SMTP servers configured by the user</li>
            </ul>
          </Section>

          <Section title="Data Storage & Protection" icon="🛡️">
            We implement industry-standard security practices:
            <ul className="mt-4 space-y-2">
              <li>• Secure storage of tokens and credentials</li>
              <li>• Encrypted transmission (HTTPS)</li>
              <li>• Access control to prevent unauthorized access</li>
            </ul>
          </Section>

          <Section title="Data Retention & Deletion" icon="🗑️">
            <ul className="mt-4 space-y-2">
              <li>• Data is retained only as long as the account is active</li>
              <li>• Users can delete their data by deleting their account</li>
              <li>• Users may request deletion by contacting support</li>
            </ul>
          </Section>

          <Section title="What We Do NOT Do" icon="🚫">
            <ul className="mt-4 space-y-2">
              <li>• Do not read inbox emails</li>
              <li>• Do not modify existing emails</li>
              <li>• Do not send emails without user action</li>
              <li>• Do not sell or share user data</li>
            </ul>
          </Section>

          <Section title="User Control" icon="🎮">
            Users fully control:
            <ul className="mt-4 space-y-2">
              <li>• Email content</li>
              <li>• Recipients</li>
              <li>• Sending account</li>
              <li>• Scheduling</li>
            </ul>
          </Section>

          <Section title="Compliance & Enforcement" icon="⚖️">
            Users must only send emails to recipients who have consented.
            Accounts violating this may be suspended.
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      <div>{children}</div>
    </section>
  );
}