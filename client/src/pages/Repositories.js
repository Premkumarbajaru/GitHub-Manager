import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MagnifyingGlassIcon,
  FolderIcon,
  StarIcon,
  CodeBracketIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

// Memoized Repository Card Component for better performance
const RepositoryCard = React.memo(({ repo }) => {

  return (
    <div className={`group relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200/50 rounded-xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-sm ${
      repo.fork
        ? 'hover:shadow-purple-500/20'
        : repo.private
        ? 'hover:shadow-red-500/20'
        : 'hover:shadow-green-500/20'
    }`}>
      {/* Subtle background pattern */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        repo.fork
          ? 'from-purple-50/30 via-transparent to-purple-50/30'
          : repo.private
          ? 'from-red-50/30 via-transparent to-red-50/30'
          : 'from-green-50/30 via-transparent to-green-50/30'
      }`}></div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <Link
              to={`/repositories/${repo.owner.login}/${repo.name}`}
              className="text-lg font-semibold text-primary-600 hover:text-primary-800 truncate"
            >
              {repo.full_name}
            </Link>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
              repo.fork
                ? 'bg-purple-100 text-purple-800 border-purple-200'
                : repo.private
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'bg-green-100 text-green-800 border-green-200'
            }`}>
              {repo.fork ? 'Fork' : repo.private ? 'Private' : 'Public'}
            </span>
          </div>

          {repo.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {repo.description}
            </p>
          )}

          <div className="flex items-center space-x-6 text-sm text-gray-500">
            {repo.language && (
              <span className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${
                  repo.fork ? 'bg-purple-400' : repo.private ? 'bg-red-400' : 'bg-green-400'
                }`}></span>
                {repo.language}
              </span>
            )}

            <span className="flex items-center">
              <StarIcon className="h-4 w-4 mr-1" />
              {repo.stargazers_count?.toLocaleString() || 0}
            </span>

            <span className="flex items-center">
              <CodeBracketIcon className="h-4 w-4 mr-1" />
              {repo.forks_count?.toLocaleString() || 0}
            </span>

            <span className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Updated {repo.formattedUpdatedAt}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Link
            to={`/repositories/${repo.owner.login}/${repo.name}`}
            className="btn-outline text-xs"
          >
            View Details
          </Link>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Animated border */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
        repo.fork
          ? 'from-purple-500 via-purple-600 to-pink-500'
          : repo.private
          ? 'from-red-500 via-red-600 to-pink-500'
          : 'from-green-500 via-primary-500 to-blue-500'
      }`}></div>
    </div>
  );
});

RepositoryCard.displayName = 'RepositoryCard';

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Repositories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('updated');
  const [filterBy, setFilterBy] = useState('all');
  const perPage = 20;

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, sortBy, filterBy]);

  // Keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[placeholder="Search repositories..."]')?.focus();
      }
      // Clear search on Escape
      if (e.key === 'Escape' && searchTerm) {
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm]);

  // Fetch repositories with search, sorting, and filtering
  const { data, isLoading, error, isFetching } = useQuery(
    ['repositories', debouncedSearchTerm, page, sortBy, filterBy],
    () => apiService.getRepositories({ 
      search: debouncedSearchTerm || undefined, 
      page, 
      per_page: perPage,
      sort: sortBy,
      type: filterBy
    }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const repositories = useMemo(() => data?.repositories || [], [data?.repositories]);
  const totalCount = data?.total_count;

  // removed unused handlers and language color map

  // Memoize filtered and sorted repositories for better performance
  const processedRepositories = useMemo(() => {
    if (!repositories.length) return [];

    let processed = repositories.map(repo => ({
      ...repo,
      formattedUpdatedAt: formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })
    }));

    // Client-side sorting for better responsiveness (when not searching)
    if (!debouncedSearchTerm && sortBy === 'stargazers_count') {
      processed = processed.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
    }

    return processed;
  }, [repositories, debouncedSearchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200/50 rounded-xl p-8 shadow-sm backdrop-blur-sm">
        <div className="relative">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Repositories
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Browse and manage your GitHub repositories
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-20"></div>
      </div>
      
      {/* Quick Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-7">
          {[...Array(7)].map((_, i) => (
            <LoadingSpinner key={i} variant="skeleton-stats" />
          ))}
        </div>
      ) : processedRepositories.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-7">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-2xl font-bold text-blue-600">{processedRepositories.length}</div>
              <div className="text-xs text-gray-500">Total Repos</div>
            </div>
            <div className="bg-white rounded-lg border border-green-200 bg-green-50/30 p-3">
              <div className="text-2xl font-bold text-green-600">
                {processedRepositories.filter(repo => !repo.private && !repo.fork).length}
              </div>
              <div className="text-xs text-green-700">Public</div>
            </div>
            <div className="bg-white rounded-lg border border-red-200 bg-red-50/30 p-3">
              <div className="text-2xl font-bold text-red-600">
                {processedRepositories.filter(repo => repo.private).length}
              </div>
              <div className="text-xs text-red-700">Private</div>
            </div>
            <div className="bg-white rounded-lg border border-purple-200 bg-purple-50/30 p-3">
              <div className="text-2xl font-bold text-purple-600">
                {processedRepositories.filter(repo => repo.fork && !repo.private).length}
              </div>
              <div className="text-xs text-purple-700">Forks</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-2xl font-bold text-yellow-600">
                {processedRepositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)}
              </div>
              <div className="text-xs text-gray-500">Total Stars</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-2xl font-bold text-green-600">
                {processedRepositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0)}
              </div>
              <div className="text-xs text-gray-500">Total Forks</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(processedRepositories.map(repo => repo.language).filter(Boolean)).size}
              </div>
              <div className="text-xs text-gray-500">Languages</div>
            </div>
          </div>
        )}

      
      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search repositories... (Ctrl+K)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 pr-20 py-3 text-sm rounded-xl border-gray-200/60 focus:border-primary-300 focus:ring-primary-500/20 shadow-sm bg-white/80 backdrop-blur-sm"
                />
                {isFetching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Filters and Sorting */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="sort-by-select" className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  id="sort-by-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort by"
                  className="input py-2 px-4 text-sm rounded-xl border-gray-200/60 focus:border-primary-300 focus:ring-primary-500/20 shadow-sm bg-white/80 backdrop-blur-sm hover:border-primary-200 transition-colors duration-300"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="created">Recently Created</option>
                  <option value="pushed">Recently Pushed</option>
                  <option value="full_name">Name</option>
                  <option value="stargazers_count">Stars</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="type-filter-select" className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  id="type-filter-select"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  aria-label="Type"
                  className="input py-2 px-4 text-sm rounded-xl border-gray-200/60 focus:border-primary-300 focus:ring-primary-500/20 shadow-sm bg-white/80 backdrop-blur-sm hover:border-primary-200 transition-colors duration-300"
                >
                  <option value="all">All</option>
                  <option value="owner">Owner</option>
                  <option value="member">Member</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="forks">Forks</option>
                </select>
              </div>
              
              {(debouncedSearchTerm || sortBy !== 'updated' || filterBy !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSortBy('updated');
                    setFilterBy('all');
                    setPage(1);
                  }}
                  disabled={isFetching}
                  className="btn-outline text-sm disabled:opacity-50 flex items-center space-x-2 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20 bg-white/80 backdrop-blur-sm"
                >
                  {isFetching ? (
                    <>
                      <LoadingSpinner size="sm" variant="dots" />
                      <span className="ml-2">Clearing...</span>
                    </>
                  ) : (
                    'Clear Filters'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
        
        {/* Repository Sections */}
        {debouncedSearchTerm ? (
        /* Search Results */
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Search Results for "{debouncedSearchTerm}"
                </h3>
                {isFetching && (
                  <div className="flex items-center text-sm text-gray-500">
                    <LoadingSpinner size="sm" className="mr-1" />
                    Loading...
                  </div>
                )}
              </div>
              {totalCount && (
                <div className="text-sm text-gray-500">
                  {processedRepositories.length} of {totalCount.toLocaleString()} repositories
                </div>
              )}
            </div>
          </div>
          
          <div className="card-body">
            {isLoading ? (
              <LoadingSpinner className="py-8" />
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.398 0 2.63-1.1 2.63-2.456 0-.357-.078-.709-.23-1.033L12.72 3.577c-.304-.558-.897-.927-1.564-.927-.667 0-1.26.369-1.564.927L2.974 15.511c-.152.324-.23.676-.23 1.033 0 1.356 1.232 2.456 2.63 2.456z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading repositories</h3>
                <p className="text-sm text-gray-500">{error.message}</p>
              </div>
            ) : processedRepositories.length > 0 ? (
              <div className="space-y-4">
                {processedRepositories.map((repo) => (
                  <RepositoryCard key={repo.id} repo={repo} />
                ))}
                
                {/* Pagination */}
                {totalCount && totalCount > perPage && (
                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1 || isFetching}
                        className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isFetching ? (
                          <>
                            <LoadingSpinner size="sm" variant="dots" />
                            <span className="ml-2">Loading...</span>
                          </>
                        ) : (
                          'Previous'
                        )}
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page * perPage >= totalCount || isFetching}
                        className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isFetching ? (
                          <>
                            <LoadingSpinner size="sm" variant="dots" />
                            <span className="ml-2">Loading...</span>
                          </>
                        ) : (
                          'Next'
                        )}
                      </button>
                    </div>
                    
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">{(page - 1) * perPage + 1}</span>
                          {' '}to{' '}
                          <span className="font-medium">
                            {Math.min(page * perPage, totalCount)}
                          </span>
                          {' '}of{' '}
                          <span className="font-medium">{totalCount.toLocaleString()}</span>
                          {' '}results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1 || isFetching}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isFetching ? (
                              <LoadingSpinner size="sm" variant="dots" />
                            ) : (
                              'Previous'
                            )}
                          </button>
                          <button
                            onClick={() => setPage(page + 1)}
                            disabled={page * perPage >= totalCount || isFetching}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isFetching ? (
                              <LoadingSpinner size="sm" variant="dots" />
                            ) : (
                              'Next'
                            )}
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No repositories found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search terms.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Repository Type Sections */
        <>
          {/* Public Repositories */}
          {processedRepositories.filter(repo => !repo.private && !repo.fork).length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    Public Repositories
                    <span className="ml-2 text-sm text-gray-500 font-normal">
                      ({processedRepositories.filter(repo => !repo.private && !repo.fork).length})
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
                <div className="space-y-4">
                  {processedRepositories.filter(repo => !repo.private && !repo.fork).map((repo) => (
                    <RepositoryCard key={repo.id} repo={repo} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Private Repositories */}
          {processedRepositories.filter(repo => repo.private).length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    Private Repositories
                    <span className="ml-2 text-sm text-gray-500 font-normal">
                      ({processedRepositories.filter(repo => repo.private).length})
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
                <div className="space-y-4">
                  {processedRepositories.filter(repo => repo.private).map((repo) => (
                    <RepositoryCard key={repo.id} repo={repo} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Forked Repositories */}
          {processedRepositories.filter(repo => repo.fork && !repo.private).length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    Forked Repositories
                    <span className="ml-2 text-sm text-gray-500 font-normal">
                      ({processedRepositories.filter(repo => repo.fork && !repo.private).length})
                    </span>
                  </h3>
                  <Link
                    to="/repositories?type=forks"
                    className="text-sm font-medium text-purple-600 hover:text-purple-500"
                  >
                    View all forks
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {processedRepositories.filter(repo => repo.fork && !repo.private).map((repo) => (
                    <RepositoryCard key={repo.id} repo={repo} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No Repositories Message */}
          {isLoading ? (
            <div className="card">
              <div className="card-body">
                <LoadingSpinner className="py-8" />
              </div>
            </div>
          ) : processedRepositories.length === 0 ? (
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
        </>
      )}
    </div>
  );
};

export default Repositories;
