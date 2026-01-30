export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-zinc-100 px-6 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary-400/20 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating orbs for extra ambiance */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent mb-4">
            🔒 Privacy Policy
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <span className="bg-glass-dark backdrop-blur-lg px-4 py-2 rounded-full border border-primary-500/30 shadow-glow">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-glass-dark backdrop-blur-lg border border-primary-500/30 rounded-2xl p-8 shadow-glow">
          <Section title="Purpose of the Application" icon="🎯">
            This application allows users to send emails using their own Google
            account only after explicit user action.
          </Section>

          <Section title="Google OAuth Access" icon="🔐">
            Google OAuth is used only to send emails on the user's behalf exactly
            as instructed by the user.
          </Section>

          <Section title="Data Accessed" icon="📊">
            <ul className="list-none pl-0 space-y-3">
              <li className="flex items-start gap-3 bg-dark-800/50 p-3 rounded-lg border border-primary-500/20">
                <span className="text-primary-400 mt-0.5">✓</span>
                <span>Email address (account identification)</span>
              </li>
              <li className="flex items-start gap-3 bg-dark-800/50 p-3 rounded-lg border border-primary-500/20">
                <span className="text-primary-400 mt-0.5">✓</span>
                <span>Permission to send emails via Gmail</span>
              </li>
            </ul>
          </Section>

          <Section title="What We Do NOT Do" icon="🚫">
            <ul className="list-none pl-0 space-y-3">
              <li className="flex items-start gap-3 bg-dark-800/50 p-3 rounded-lg border border-red-500/20">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>Do not read inbox emails</span>
              </li>
              <li className="flex items-start gap-3 bg-dark-800/50 p-3 rounded-lg border border-red-500/20">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>Do not store email content</span>
              </li>
              <li className="flex items-start gap-3 bg-dark-800/50 p-3 rounded-lg border border-red-500/20">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>Do not send emails automatically</span>
              </li>
              <li className="flex items-start gap-3 bg-dark-800/50 p-3 rounded-lg border border-red-500/20">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>Do not sell or share user data</span>
              </li>
            </ul>
          </Section>

          <Section title="User Control" icon="🎮">
            Users decide the email content, recipients, and timing.
          </Section>

          <Section title="Revoking Access" icon="🔓">
            <div className="bg-dark-800/50 p-4 rounded-lg border border-accent-500/30">
              Access can be revoked anytime from{" "}
              <a
                className="text-accent-400 hover:text-accent-300 underline font-semibold transition-colors duration-200"
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Account Permissions
              </a>
              .
            </div>
          </Section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <div className="bg-glass-dark backdrop-blur-lg border border-primary-500/20 rounded-xl p-4 shadow-glow inline-block">
            <p className="text-gray-400 text-sm">
              💡 Your privacy and security are our top priorities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      <div className="text-gray-200 leading-relaxed">{children}</div>
    </section>
  );
}