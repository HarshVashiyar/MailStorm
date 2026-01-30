const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary-400/20 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-40 -left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary-400/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-20 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
            
            <div className="inline-block mb-6 px-6 py-2 bg-glass-dark backdrop-blur-lg border border-primary-500/30 rounded-full shadow-glow">
              <span className="text-primary-400 font-semibold text-sm">⚡ Next-Gen Email Management Platform</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-primary-300 via-accent-400 to-primary-500 bg-clip-text text-transparent animate-glow">
                MailStorm
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The complete email orchestration platform for managing clients, campaigns, and communications with unprecedented power and simplicity.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button onClick={() => window.location.href = '/signin'} className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  🚀 Get Started Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button onClick={() => window.location.href = '/privacy'} className="px-8 py-4 bg-glass-dark backdrop-blur-lg border border-primary-500/30 text-white font-semibold rounded-xl hover:border-primary-400/60 transition-all duration-300 hover:shadow-glow">
                📖 View Privacy Policy
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="bg-glass-dark backdrop-blur-lg border border-primary-500/20 rounded-2xl px-6 py-4 shadow-glow">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">5+</div>
                <div className="text-gray-400 text-sm">Email Accounts</div>
              </div>
              <div className="bg-glass-dark backdrop-blur-lg border border-primary-500/20 rounded-2xl px-6 py-4 shadow-glow">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">∞</div>
                <div className="text-gray-400 text-sm">Bulk Emails</div>
              </div>
              <div className="bg-glass-dark backdrop-blur-lg border border-primary-500/20 rounded-2xl px-6 py-4 shadow-glow">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">AI</div>
                <div className="text-gray-400 text-sm">Powered Tone</div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-4">
                ✨ Powerful Features
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Everything you need to manage professional email campaigns at scale
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Feature Card 1 */}
              <FeatureCard
                icon="🔐"
                title="Secure Authentication"
                description="Create your account with email verification using OTP for maximum security. Your data is protected from the very first step."
                gradient="from-blue-500/20 to-cyan-500/20"
                borderGradient="from-blue-500/30 to-cyan-500/30"
              />

              {/* Feature Card 2 */}
              <FeatureCard
                icon="👤"
                title="Personalized Profile"
                description="Customize your profile with a picture and manage your professional identity within the platform."
                gradient="from-purple-500/20 to-pink-500/20"
                borderGradient="from-purple-500/30 to-pink-500/30"
              />

              {/* Feature Card 3 */}
              <FeatureCard
                icon="📧"
                title="5 Email Accounts"
                description="Connect up to 5 email accounts via OAuth (Google, Yahoo, Outlook) or custom SMTP. Centralize all your communication channels."
                gradient="from-primary-500/20 to-accent-500/20"
                borderGradient="from-primary-500/30 to-accent-500/30"
              />

              {/* Feature Card 4 */}
              <FeatureCard
                icon="🎯"
                title="Smart Client Management"
                description="Add, edit, and remove clients with powerful keyword search and procurement team filters. Find anyone instantly."
                gradient="from-emerald-500/20 to-teal-500/20"
                borderGradient="from-emerald-500/30 to-teal-500/30"
              />

              {/* Feature Card 5 */}
              <FeatureCard
                icon="📋"
                title="Dynamic Client Lists"
                description="Create, edit, and manage client lists effortlessly. Organize your contacts for targeted campaigns."
                gradient="from-orange-500/20 to-red-500/20"
                borderGradient="from-orange-500/30 to-red-500/30"
              />

              {/* Feature Card 6 */}
              <FeatureCard
                icon="🚀"
                title="Bulk Email & Scheduling"
                description="Send bulk emails with attachments or schedule them for specific times in your timezone. Maximum efficiency, zero hassle."
                gradient="from-indigo-500/20 to-purple-500/20"
                borderGradient="from-indigo-500/30 to-purple-500/30"
              />

              {/* Feature Card 7 */}
              <FeatureCard
                icon="🎨"
                title="HTML Template Editor"
                description="Create stunning email templates with a rich text editor. Design once, reuse forever with instant subject and body filling."
                gradient="from-pink-500/20 to-rose-500/20"
                borderGradient="from-pink-500/30 to-rose-500/30"
              />

              {/* Feature Card 8 */}
              <FeatureCard
                icon="🤖"
                title="AI-Powered Tone Adjuster"
                description="Transform your email tone instantly with Gemini AI. Choose from Formal, Neutral, or Informal modes for perfect communication."
                gradient="from-violet-500/20 to-fuchsia-500/20"
                borderGradient="from-violet-500/30 to-fuchsia-500/30"
              />

              {/* Feature Card 9 */}
              <FeatureCard
                icon="📊"
                title="Complete Email History"
                description="Track every email sent to each client with full subject, date, and time records. Never lose track of your communications."
                gradient="from-cyan-500/20 to-blue-500/20"
                borderGradient="from-cyan-500/30 to-blue-500/30"
              />

              {/* Feature Card 10 */}
              <FeatureCard
                icon="📝"
                title="Custom Client Notes"
                description="Add personal notes to each client for better relationship management. Keep important context at your fingertips."
                gradient="from-lime-500/20 to-green-500/20"
                borderGradient="from-lime-500/30 to-green-500/30"
              />

            </div>
          </div>

          {/* Workflow Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-4">
                🔄 Simple Workflow
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                From signup to sending emails in minutes
              </p>
            </div>

            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/30 via-accent-500/30 to-primary-500/30 transform -translate-y-1/2 hidden lg:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <WorkflowStep
                  number="1"
                  icon="✉️"
                  title="Sign Up"
                  description="Create account with OTP email verification"
                />
                <WorkflowStep
                  number="2"
                  icon="⚙️"
                  title="Setup Profile"
                  description="Add profile picture & connect email accounts"
                />
                <WorkflowStep
                  number="3"
                  icon="📁"
                  title="Manage Clients"
                  description="Add clients, create lists, build templates"
                />
                <WorkflowStep
                  number="4"
                  icon="📤"
                  title="Send Emails"
                  description="Bulk send or schedule with AI-enhanced tone"
                />
              </div>
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="mb-20">
            <div className="bg-glass-dark backdrop-blur-lg border border-primary-500/30 rounded-3xl p-8 md:p-12 shadow-glow">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-4">
                  🔧 Integrated Technologies
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <TechBadge icon="🔑" name="OAuth 2.0" />
                <TechBadge icon="📮" name="SMTP" />
                <TechBadge icon="🤖" name="Gemini AI" />
                <TechBadge icon="📅" name="Smart Scheduling" />
                <TechBadge icon="🔒" name="OTP Security" />
                <TechBadge icon="☁️" name="Cloud Storage" />
                <TechBadge icon="⚡" name="Real-time Sync" />
                <TechBadge icon="📱" name="Responsive UI" />
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="mb-20">
            <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 backdrop-blur-lg border border-primary-500/30 rounded-3xl p-8 md:p-12 shadow-glow text-center">
              <div className="inline-block mb-6 px-6 py-2 bg-glass-dark backdrop-blur-lg border border-accent-500/30 rounded-full shadow-glow">
                <span className="text-accent-400 font-semibold text-sm">🚧 Coming Soon</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-6">
                More Features on the Horizon
              </h2>
              
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                We're constantly innovating to bring you more powerful tools for email management and client communications
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <span className="bg-dark-800/50 backdrop-blur-lg border border-primary-500/20 px-4 py-2 rounded-full text-gray-300 text-sm">
                  📈 Advanced Analytics
                </span>
                <span className="bg-dark-800/50 backdrop-blur-lg border border-primary-500/20 px-4 py-2 rounded-full text-gray-300 text-sm">
                  🔔 Real-time Notifications
                </span>
                <span className="bg-dark-800/50 backdrop-blur-lg border border-primary-500/20 px-4 py-2 rounded-full text-gray-300 text-sm">
                  🌐 API Integration
                </span>
                <span className="bg-dark-800/50 backdrop-blur-lg border border-primary-500/20 px-4 py-2 rounded-full text-gray-300 text-sm">
                  📧 Email Tracking
                </span>
                <span className="bg-dark-800/50 backdrop-blur-lg border border-primary-500/20 px-4 py-2 rounded-full text-gray-300 text-sm">
                  🎯 A/B Testing
                </span>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-glass-dark backdrop-blur-lg border border-primary-500/30 rounded-3xl p-12 shadow-glow relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-300 to-accent-400 bg-clip-text text-transparent mb-6">
                  Ready to Transform Your Email Workflow?
                </h2>
                
                <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
                  Join MailStorm today and experience the future of email management
                </p>
                
                <button onClick={() => window.location.href = '/signin'} className="group relative px-10 py-5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-lg rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Now
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, gradient, borderGradient }) => {
  return (
    <div className="group relative bg-glass-dark backdrop-blur-lg border border-primary-500/20 rounded-2xl p-6 hover:border-primary-400/40 transition-all duration-300 hover:shadow-glow overflow-hidden">
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-300 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${borderGradient} rounded-bl-full opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
    </div>
  );
};

// Workflow Step Component
const WorkflowStep = ({ number, icon, title, description }) => {
  return (
    <div className="relative bg-glass-dark backdrop-blur-lg border border-primary-500/30 rounded-2xl p-6 text-center shadow-glow hover:border-accent-400/50 transition-all duration-300 hover:scale-105">
      {/* Number badge */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-glow">
        {number}
      </div>
      
      <div className="text-5xl mb-4 mt-2">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

// Tech Badge Component
const TechBadge = ({ icon, name }) => {
  return (
    <div className="bg-dark-800/50 backdrop-blur-lg border border-primary-500/20 rounded-xl p-4 text-center hover:border-accent-400/40 transition-all duration-300 hover:shadow-glow group">
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div className="text-gray-300 text-sm font-semibold group-hover:text-primary-300 transition-colors duration-300">{name}</div>
    </div>
  );
};

export default Home;