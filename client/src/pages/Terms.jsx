export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-zinc-100 px-6 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary-400/20 via-transparent to-transparent pointer-events-none"></div>

      {/* Floating orbs for extra ambiance */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent mb-4">
            📜 Terms of Service
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <span className="bg-glass-dark backdrop-blur-lg px-4 py-2 rounded-full border border-primary-500/30 shadow-glow">
              Effective immediately upon use
            </span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-glass-dark backdrop-blur-lg border border-primary-500/30 rounded-2xl p-8 shadow-glow">
          <Section title="Acceptance of Terms" icon="✅" number="1">
            <div className="bg-dark-800/50 p-4 rounded-lg border border-primary-500/20">
              By using this application, you agree to these terms and acknowledge
              that you have read and understood all provisions outlined herein.
            </div>
          </Section>

          <Section title="Service Description" icon="📧" number="2">
            <div className="bg-dark-800/50 p-4 rounded-lg border border-primary-500/20">
              The service allows users to send emails through connected email providers,
              including Google (Gmail), Microsoft Outlook, and custom SMTP servers.
              All emails are sent directly from the user’s authorized email account.
            </div>
          </Section>

          <Section title="User Responsibility" icon="⚖️" number="3">
            <div className="space-y-3">
              <p>Users are responsible for:</p>
              <ul className="space-y-2">
                <li>• Email content</li>
                <li>• Selecting recipients</li>
                <li>• Ensuring recipient consent</li>
                <li>• Compliance with laws (CAN-SPAM, GDPR, etc.)</li>
              </ul>
            </div>
          </Section>

          <Section title="Anti-Spam Policy" icon="🚫" number="4">
            <div className="bg-dark-800/50 p-4 rounded-lg border border-red-500/30">
              Users must not send unsolicited emails. Sending emails to recipients without consent is strictly prohibited.
            </div>
          </Section>

          <Section title="Account Termination" icon="🚪" number="5">
            <div className="bg-dark-800/50 p-4 rounded-lg border border-red-500/30">
              Accounts violating email consent rules may be suspended or terminated immediately.
            </div>
          </Section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <div className="bg-glass-dark backdrop-blur-lg border border-primary-500/20 rounded-xl p-4 shadow-glow inline-block">
            <p className="text-gray-400 text-sm">
              📞 Questions? Contact us for clarification on any terms
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, number, children }) {
  return (
    <section className="mb-8 last:mb-0">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-glow flex-shrink-0">
          {number}
        </div>
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent flex items-center gap-2 flex-1">
          <span>{icon}</span>
          <span>{title}</span>
        </h2>
      </div>
      <div className="text-gray-200 leading-relaxed pl-11">{children}</div>
    </section>
  );
}