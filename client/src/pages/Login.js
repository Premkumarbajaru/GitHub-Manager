import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const { login, loginLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [currentSlogan, setCurrentSlogan] = useState(0);

  const slogans = [
    "Where Code Meets Collaboration",
    "Unleash Your Development Potential", 
    "Build the Future, One Commit at a Time",
    "Code Together, Ship Faster",
    "Your Gateway to Open Source Excellence"
  ];

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error === 'auth_failed') {
      toast.error('Authentication failed. Please try again.');
    } else if (error === 'oauth_error') {
      toast.error(`OAuth Error: ${message || 'Unknown error occurred'}`);
    } else if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [searchParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slogans.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Floating Code Symbols */}
        <div className="absolute top-1/4 left-1/4 text-cyan-400/30 text-6xl font-mono animate-bounce delay-500">{'<>'}</div>
        <div className="absolute top-1/3 right-1/4 text-purple-400/30 text-4xl font-mono animate-bounce delay-1000">{'{ }'}</div>
        <div className="absolute bottom-1/3 left-1/5 text-pink-400/30 text-5xl font-mono animate-bounce delay-1500">{'[]'}</div>
        <div className="absolute bottom-1/4 right-1/3 text-green-400/30 text-3xl font-mono animate-bounce delay-2000">{'()'}</div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-xl opacity-75 animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-full border-2 border-cyan-400/50 flex items-center space-x-2 shadow-2xl">
                <svg className="h-10 w-10 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-lg font-bold text-gray-900">GitHub PR Manager</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              GitHub PR Manager
            </h1>

            {/* Rotating Slogans */}
            <div className="h-16 mb-6 flex items-center justify-center">
              <p className="text-lg lg:text-xl font-semibold text-transparent bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text transition-all duration-1000 transform">
                {slogans[currentSlogan]}
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border-2 border-cyan-500/40 rounded-xl p-4 hover:border-cyan-400/70 hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-cyan-500/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-lg">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Lightning Fast</h3>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed ml-11">Blazing fast repository browsing and PR management</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border-2 border-purple-500/40 rounded-xl p-4 hover:border-purple-400/70 hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-purple-500/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-lg">🔒</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Secure OAuth</h3>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed ml-11">Enterprise-grade security with GitHub OAuth</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-cyan-500/30 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border-2 border-pink-500/40 rounded-xl p-4 hover:border-pink-400/70 hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-pink-500/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Real-time Sync</h3>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed ml-11">Live synchronization with GitHub repositories</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-cyan-500/30 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border-2 border-green-500/40 rounded-xl p-4 hover:border-green-400/70 hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-green-500/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Smart Analytics</h3>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed ml-11">Intelligent insights for development workflow</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="relative">
            {/* Enhanced Neon Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-2xl"></div>

            <div className="relative bg-gray-900/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-300 text-base">
                  Connect with GitHub to unlock your potential
                </p>
              </div>

              {/* GitHub Login Button */}
              <button
                onClick={login}
                disabled={loginLoading}
                className={`group relative w-full overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${
                  loginLoading
                    ? 'bg-gray-700 border-gray-600 text-gray-400'
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white border-cyan-500/60 hover:border-cyan-400'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3 py-3 px-4">
                  {loginLoading ? (
                    <>
                      <LoadingSpinner size="sm" variant="dots" />
                      <span className="text-base">Connecting to GitHub...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span className="text-base">Continue with GitHub</span>
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></div>
                    </>
                  )}
                </div>
              </button>

              {/* Security Badge */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 bg-green-500/15 border border-green-500/40 rounded-full px-3 py-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">Secured by GitHub OAuth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
