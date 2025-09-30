import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  CodeBracketIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const PullRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch user repositories to get all PRs
  const { data: repositories = [], isLoading: reposLoading } = useQuery(
    ['repositories'],
    () => apiService.getRepositories({ per_page: 100 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch pull requests for each repository
  const { data: allPullRequests = [], isLoading: prsLoading, error } = useQuery(
    ['allPullRequests', repositories],
    async () => {
      if (!repositories.repositories || repositories.repositories.length === 0) {
        return [];
      }

      const prPromises = repositories.repositories.map(async (repo) => {
        try {
          const prs = await apiService.getPullRequests(repo.owner.login, repo.name, {
            state: statusFilter === 'all' ? 'all' : statusFilter,
            per_page: 50
          });
          return prs.pull_requests?.map(pr => ({
            ...pr,
            repository: repo
          })) || [];
        } catch (error) {
          console.error(`Error fetching PRs for ${repo.full_name}:`, error);
          return [];
        }
      });

      const results = await Promise.all(prPromises);
      return results.flat().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    },
    {
      enabled: repositories.repositories && repositories.repositories.length > 0,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // getPRStatusColor was unused

  const getPRStatusText = (state, merged) => {
    if (merged) return 'Merged';
    return state === 'open' ? 'Open' : 'Closed';
  };

  const getPRStatusIcon = (state, merged) => {
    if (merged) return <CheckCircleIcon className="h-4 w-4" />;
    if (state === 'open') return <ArrowPathIcon className="h-4 w-4" />;
    return <XCircleIcon className="h-4 w-4" />;
  };

  // Filter pull requests based on search term and status
  const filteredPRs = allPullRequests.filter(pr => {
    const matchesSearch = searchTerm === '' || 
      pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.repository.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.user.login.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'open' && pr.state === 'open' && !pr.merged) ||
      (statusFilter === 'closed' && pr.state === 'closed' && !pr.merged) ||
      (statusFilter === 'merged' && pr.merged);
    
    return matchesSearch && matchesStatus;
  });

  const isLoading = reposLoading || prsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="sm:w-48">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* PR List Skeleton */}
        <div className="card">
          <div className="card-header">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <LoadingSpinner key={i} variant="skeleton-pr-card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading pull requests</h3>
        <p className="mt-1 text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pull Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            All pull requests across your repositories
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search pull requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 py-3 text-sm rounded-xl border-gray-200/60 focus:border-primary-300 focus:ring-primary-500/20 shadow-sm bg-white/80 backdrop-blur-sm"
                />
                {prsLoading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input py-2 px-4 text-sm rounded-xl border-gray-200/60 focus:border-primary-300 focus:ring-primary-500/20 shadow-sm bg-white/80 backdrop-blur-sm hover:border-primary-200 transition-colors duration-300 w-full"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="merged">Merged</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Pull Requests List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Pull Requests ({filteredPRs.length})
          </h3>
        </div>
        
        <div className="card-body">
          {filteredPRs.length > 0 ? (
            <div className="space-y-4">
              {filteredPRs.map((pr) => (
                <div
                  key={`${pr.repository.id}-${pr.id}`}
                  className={`group relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200/50 rounded-xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-sm ${
                    pr.merged
                      ? 'hover:shadow-purple-500/20'
                      : pr.state === 'open'
                      ? 'hover:shadow-green-500/20'
                      : 'hover:shadow-red-500/20'
                  }`}
                >
                  {/* Subtle background pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    pr.merged
                      ? 'from-purple-50/30 via-transparent to-purple-50/30'
                      : pr.state === 'open'
                      ? 'from-green-50/30 via-transparent to-green-50/30'
                      : 'from-red-50/30 via-transparent to-red-50/30'
                  }`}></div>

                  <div className="relative flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <Link
                          to={`/repositories/${pr.repository.owner.login}/${pr.repository.name}/pulls/${pr.number}`}
                          className="text-lg font-bold text-gray-900 hover:text-primary-700 transition-colors duration-300"
                        >
                          #{pr.number} {pr.title}
                        </Link>
                        <span className={`badge flex items-center space-x-1 ${
                          pr.merged
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : pr.state === 'open'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {getPRStatusIcon(pr.state, pr.merged)}
                          <span className="font-semibold">{getPRStatusText(pr.state, pr.merged)}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        <Link
                          to={`/repositories/${pr.repository.owner.login}/${pr.repository.name}`}
                          className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-300"
                        >
                          {pr.repository.full_name}
                        </Link>
                        <span className="flex items-center text-gray-500">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {pr.user.login}
                        </span>
                        <span className="flex items-center text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDistanceToNow(new Date(pr.updated_at), { addSuffix: true })}
                        </span>
                      </div>

                      {pr.head && pr.base && (
                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200/50">
                          <CodeBracketIcon className="h-4 w-4 mr-2 text-primary-500" />
                          <span className="font-mono text-gray-700">
                            {pr.head.ref} → {pr.base.ref}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 ml-6">
                      <Link
                        to={`/repositories/${pr.repository.owner.login}/${pr.repository.name}/pulls/${pr.number}`}
                        className="btn-primary text-sm px-4 py-2 hover:scale-105 transition-all duration-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Animated border */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
                    pr.merged
                      ? 'from-purple-500 via-purple-600 to-pink-500'
                      : pr.state === 'open'
                      ? 'from-green-500 via-primary-500 to-blue-500'
                      : 'from-red-500 via-red-600 to-pink-500'
                  }`}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pull requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'No pull requests found across your repositories.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PullRequests;
