const Home = () => {
  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full mx-auto py-10">
        <div className="bg-dark-800/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glass p-8 relative overflow-hidden group">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent group-hover:animate-glow">
              Welcome to MailStorm
            </h1>
            <p className="text-gray-300 text-lg group-hover:text-white transition-colors duration-300">
              Manage companies, lists, and campaigns with a streamlined workflow.
            </p>
            
            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-dark-800/30 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:border-primary-400/30 transition-all duration-300 hover:shadow-glow group">
                <div className="text-primary-400 text-2xl mb-3">📧</div>
                <h3 className="text-lg font-semibold text-white mb-2">Email Campaigns</h3>
                <p className="text-gray-400 text-sm">Create and manage targeted email campaigns with ease.</p>
              </div>
              
              <div className="bg-dark-800/30 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:border-accent-400/30 transition-all duration-300 hover:shadow-glow group">
                <div className="text-accent-400 text-2xl mb-3">👥</div>
                <h3 className="text-lg font-semibold text-white mb-2">Contact Management</h3>
                <p className="text-gray-400 text-sm">Organize and maintain your contact lists efficiently.</p>
              </div>
              
              <div className="bg-dark-800/30 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:border-primary-400/30 transition-all duration-300 hover:shadow-glow group">
                <div className="text-primary-400 text-2xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
                <p className="text-gray-400 text-sm">Track performance and optimize your campaigns.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
