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
              The service allows users to send emails through their Google account
              using Google OAuth authentication. All emails are sent directly from
              your authorized Google account.
            </div>
          </Section>

          <Section title="User Responsibility" icon="⚖️" number="3">
            <div className="space-y-3">
              <p className="bg-dark-800/50 p-4 rounded-lg border border-amber-500/20">
                Users are solely responsible for:
              </p>
              <ul className="list-none pl-0 space-y-2">
                <li className="flex items-start gap-3 bg-dark-800/50 p-3 rounded-lg border border-primary-500/20">
                  <span className="text-accent-400 mt-0.5 font-bold">•</span>
                  <span>The content of all emails sent through this service</span>
                </li>
                <li className="flex items-start gap-3 bg-dark-800/50 p-3 rounded-lg border border-primary-500/20">
                  <span className="text-accent-400 mt-0.5 font-bold">•</span>
                  <span>Selecting appropriate recipients for your emails</span>
                </li>
                <li className="flex items-start gap-3 bg-dark-800/50 p-3 rounded-lg border border-primary-500/20">
                  <span className="text-accent-400 mt-0.5 font-bold">•</span>
                  <span>Compliance with all applicable laws and regulations</span>
                </li>
                <li className="flex items-start gap-3 bg-dark-800/50 p-3 rounded-lg border border-primary-500/20">
                  <span className="text-accent-400 mt-0.5 font-bold">•</span>
                  <span>Anti-spam and email marketing regulations</span>
                </li>
              </ul>
            </div>
          </Section>

          <Section title="No Automated Messaging" icon="🤖" number="4">
            <div className="bg-dark-800/50 p-4 rounded-lg border border-green-500/20">
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-2xl">✓</span>
                <div>
                  <p className="font-semibold text-green-400 mb-2">User-Initiated Only</p>
                  <p>Emails are sent only after explicit user action. No automated
                  or unsolicited messaging occurs without your direct instruction.</p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Limitation of Liability" icon="⚠️" number="5">
            <div className="bg-dark-800/50 p-4 rounded-lg border border-red-500/20">
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-2xl">!</span>
                <div>
                  <p className="font-semibold text-red-400 mb-2">As-Is Service</p>
                  <p>The service is provided "as is" without warranties of any kind,
                  either express or implied. We are not liable for any damages arising
                  from the use or inability to use this service.</p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Service Modifications" icon="🔄" number="6">
            <div className="bg-dark-800/50 p-4 rounded-lg border border-primary-500/20">
              We reserve the right to modify or discontinue the service at any time
              without prior notice. Continued use of the service after changes
              constitutes acceptance of those changes.
            </div>
          </Section>

          <Section title="Account Termination" icon="🚪" number="7">
            <div className="bg-dark-800/50 p-4 rounded-lg border border-primary-500/20">
              We reserve the right to terminate or suspend access to the service
              immediately, without prior notice, for conduct that we believe
              violates these Terms of Service or is harmful to other users.
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