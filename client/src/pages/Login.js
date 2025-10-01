import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiGitPullRequest, FiGitMerge, FiUsers, FiClock } from 'react-icons/fi';

const Login = () => {
  const { login, loginLoading } = useAuth();
  const [searchParams] = useSearchParams();

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

  const features = [
    {
      icon: <FiGitPullRequest className="w-6 h-6" />,
      title: "Pull Request Management",
      description: "Easily track, review, and manage all your pull requests in one place.",
      color: "from-blue-400 to-blue-600",
      border: "border-blue-500/40"
    },
    {
      icon: <FiGitMerge className="w-6 h-6" />,
      title: "Real-time Sync",
      description: "Live synchronization with GitHub repositories",
      color: "from-purple-400 to-purple-600",
      border: "border-purple-500/40"
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Collaborate with your team through code reviews and discussions.",
      color: "from-green-400 to-green-600",
      border: "border-green-500/40"
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Time Tracking",
      description: "Track time spent on PRs and manage your development workflow efficiently.",
      color: "from-amber-400 to-amber-600",
      border: "border-amber-500/40"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* GitHub-like dot pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '20px 20px'
          }} 
        />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(40px)',
              opacity: Math.random() * 0.1 + 0.05,
              animation: `pulse ${Math.random() * 10 + 10}s infinite alternate`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Feature Cards */}
          <div className="space-y-6">
            <div className="text-center md:text-left mb-8">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <FiGitPullRequest className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  GitHub PR Manager
                </h1>
              </div>
              <p className="text-gray-300 text-lg max-w-md mx-auto md:mx-0">
                Streamline your GitHub workflow with powerful pull request management tools
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`relative group bg-gray-800/50 backdrop-blur-md rounded-xl p-5 border ${feature.border} hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Login Card */}
          <div className="relative">
            <div className="relative bg-gray-900/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
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
