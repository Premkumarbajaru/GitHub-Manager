import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FolderIcon,
  StarIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch recent repositories
  const { data: reposData, isLoading: reposLoading } = useQuery(
    'recent-repositories',
    () => apiService.getRepositories({ per_page: 6 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch user organizations
  const { data: orgs, isLoading: orgsLoading } = useQuery(
    'user-organizations',
    () => apiService.getUserOrganizations(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const repositories = reposData?.repositories || [];
  const privateRepos = repositories.filter(repo => repo.private);
  const publicRepos = repositories.filter(repo => !repo.private && !repo.fork);
  const forkedRepos = repositories.filter(repo => repo.fork && !repo.private);

  const stats = [
    {
      name: 'Public Repositories',
      value: user?.publicRepos || 0,
      icon: FolderIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Followers',
      value: user?.followers || 0,
      icon: EyeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Following',
      value: user?.following || 0,
      icon: StarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.displayName}! Here's what's happening with your repositories.
        </p>
      </div>

      {/* Stats */}
      {reposLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <LoadingSpinner key={index} variant="skeleton-stats" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.name} className="group relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200/50 rounded-xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex items-center">
                <div className="flex-shrink-0">
                  <div className={`relative p-4 rounded-xl ${stat.bgColor} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                    <stat.icon className={`relative h-7 w-7 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                </div>
                <div className="ml-6 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-semibold text-gray-600 mb-1 group-hover:text-gray-700 transition-colors duration-300">
                      {stat.name}
                    </dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:to-purple-600 transition-all duration-300">
                      {stat.value.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>

              {/* Animated border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          ))}
        </div>
      )}

      {/* Public Repositories */}
      {reposLoading ? (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              Public Repositories
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <LoadingSpinner key={i} variant="skeleton-card" />
              ))}
            </div>
          </div>
        </div>
      ) : publicRepos.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                Public Repositories
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({publicRepos.length})
                </span>
              </h3>
              <Link
                to="/repositories?type=public"
                className="text-sm font-medium text-green-600 hover:text-green-500"
              >
                View all public
              </Link>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicRepos.slice(0, 6).map((repo) => (
                <Link
                  key={repo.id}
                  to={`/repositories/${repo.owner.login}/${repo.name}`}
                  className="group relative block p-6 border border-green-200/60 bg-gradient-to-br from-green-50/80 via-white to-green-50/40 rounded-xl hover:shadow-xl hover:shadow-green-500/20 hover:border-green-300/80 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-green-700 transition-colors duration-300">
                      {repo.name}
                    </h4>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200/50 shadow-sm">
                      Public
                    </span>
                  </div>

                  {repo.description && (
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                      {repo.description}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {repo.language && (
                        <span className="flex items-center text-sm">
                          <span className="w-3 h-3 rounded-full mr-2 bg-gradient-to-r from-green-400 to-green-500 shadow-sm"></span>
                          <span className="font-medium text-gray-700">{repo.language}</span>
                        </span>
                      )}
                      <span className="flex items-center text-sm text-gray-600">
                        <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                        <span className="font-semibold">{repo.stargazers_count}</span>
                      </span>
                    </div>
                    <span className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Private Repositories */}
      {reposLoading ? (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              Private Repositories
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <LoadingSpinner key={i} variant="skeleton-card" />
              ))}
            </div>
          </div>
        </div>
      ) : privateRepos.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                Private Repositories
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({privateRepos.length})
                </span>
              </h3>
              <Link
                to="/repositories?type=private"
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                View all private
              </Link>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {privateRepos.slice(0, 6).map((repo) => (
                <Link
                  key={repo.id}
                  to={`/repositories/${repo.owner.login}/${repo.name}`}
                  className="group relative block p-6 border border-red-200/60 bg-gradient-to-br from-red-50/80 via-white to-red-50/40 rounded-xl hover:shadow-xl hover:shadow-red-500/20 hover:border-red-300/80 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-red-700 transition-colors duration-300">
                      {repo.name}
                    </h4>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200/50 shadow-sm">
                      Private
                    </span>
                  </div>

                  {repo.description && (
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                      {repo.description}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {repo.language && (
                        <span className="flex items-center text-sm">
                          <span className="w-3 h-3 rounded-full mr-2 bg-gradient-to-r from-red-400 to-red-500 shadow-sm"></span>
                          <span className="font-medium text-gray-700">{repo.language}</span>
                        </span>
                      )}
                      <span className="flex items-center text-sm text-gray-600">
                        <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                        <span className="font-semibold">{repo.stargazers_count}</span>
                      </span>
                    </div>
                    <span className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Forked Repositories */}
      {reposLoading ? (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              Forked Repositories
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <LoadingSpinner key={i} variant="skeleton-card" />
              ))}
            </div>
          </div>
        </div>
      ) : forkedRepos.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                Forked Repositories
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({forkedRepos.length})
                </span>
              </h3>
              <Link
                to="/repositories?type=fork"
                className="text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                View all forks
              </Link>
            </div>
          </div>
          <div className="card-body">
            {forkedRepos.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {forkedRepos.slice(0, 6).map((repo) => (
                  <Link
                    key={repo.id}
                    to={`/repositories/${repo.owner.login}/${repo.name}`}
                    className="group relative block p-6 border border-purple-200/60 bg-gradient-to-br from-purple-50/80 via-white to-purple-50/40 rounded-xl hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-300/80 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-sm overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors duration-300">
                        {repo.name}
                      </h4>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border border-purple-200/50 shadow-sm">
                        Fork
                      </span>
                    </div>

                    {repo.description && (
                      <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                        {repo.description}
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {repo.language && (
                          <span className="flex items-center text-sm">
                            <span className="w-3 h-3 rounded-full mr-2 bg-gradient-to-r from-purple-400 to-purple-500 shadow-sm"></span>
                            <span className="font-medium text-gray-700">{repo.language}</span>
                          </span>
                        )}
                        <span className="flex items-center text-sm text-gray-600">
                          <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                          <span className="font-semibold">{repo.stargazers_count}</span>
                        </span>
                      </div>
                      <span className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Subtle hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-purple-500 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No forked repositories</h3>
                <p className="text-sm text-gray-500">
                  Fork repositories to contribute to open source projects.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Repositories Message */}
      {reposLoading ? (
        <div className="card">
          <div className="card-body">
            <LoadingSpinner className="py-8" />
          </div>
        </div>
      ) : repositories.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-8">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No repositories</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new repository on GitHub.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Organizations */}
      {orgsLoading ? (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Organizations
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : orgs && orgs.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Organizations
            </h3>
          </div>
          <div className="card-body">
            {orgsLoading ? (
              <LoadingSpinner className="py-4" />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {orgs.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg"
                  >
                    <img
                      className="h-8 w-8 rounded-full"
                      src={org.avatar_url}
                      alt={org.login}
                    />
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {org.login}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
