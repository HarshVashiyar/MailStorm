const DummyDataBanner = ({ isVisible, onRefresh }) => {
  if (!isVisible) return null;

  return (
    <div className="relative">
      {/* Glow effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-accent-500/15 to-primary-600/20 blur-lg animate-pulse-slow"></div>
      
      {/* Main banner */}
      <div className="relative bg-glass-dark backdrop-blur-lg border border-primary-500/30 rounded-2xl mx-6 mb-4 shadow-glow">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Animated icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center animate-glow">
                <span className="text-xl">⚡</span>
              </div>
              
              {/* Banner text */}
              <div>
                <h3 className="text-white font-bold text-lg">
                  🚀 Demo Mode Active
                </h3>
                <p className="text-gray-300 text-sm">
                  Using sample data - API connection unavailable. All changes are local only.
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Try Refresh Button */}
              <button
                onClick={onRefresh}
                className="group relative bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-accent-400/30"
              >
                <span className="flex items-center space-x-2">
                  <span className="group-hover:animate-spin">🔄</span>
                  <span>Try Refresh</span>
                </span>
              </button>
              
              {/* Info indicator */}
              <div className="hidden md:flex items-center space-x-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                <span>Live Demo</span>
              </div>
            </div>
          </div>
          
          {/* Features indicator */}
          <div className="mt-3 pt-3 border-t border-primary-500/20">
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span className="flex items-center space-x-1">
                <span>✅</span>
                <span>Full UI Demo</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>🎯</span>
                <span>Local CRUD</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>📱</span>
                <span>Responsive</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>🎨</span>
                <span>Dark Glow Theme</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-shimmer"></div>
      </div>
    </div>
  );
};

export default DummyDataBanner;