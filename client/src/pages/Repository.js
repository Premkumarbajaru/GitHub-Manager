import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import CreatePullRequestModal from '../components/CreatePullRequestModal';
import FileViewer from '../components/FileViewer';
import { 
  StarIcon,
  EyeIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  LockClosedIcon,
  TagIcon,
  PlusIcon,
  DocumentTextIcon,
  FolderIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const Repository = () => {
  const { owner, repo } = useParams();
  const [activeTab, setActiveTab] = useState('code');
  const [showCreatePRModal, setShowCreatePRModal] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [viewingFile, setViewingFile] = useState(null);

  // Fetch repository details
  const { data: repository, isLoading: repoLoading, error: repoError } = useQuery(
    ['repository', owner, repo],
    () => apiService.getRepository(owner, repo),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch pull requests
  const { data: pullRequests = [], isLoading: pullsLoading, error: pullsError } = useQuery(
    ['pullRequests', owner, repo],
    () => apiService.getPullRequests(owner, repo),
    {
      enabled: activeTab === 'pulls',
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch issues
  const { data: issues = [], isLoading: issuesLoading, error: issuesError } = useQuery(
    ['issues', owner, repo],
    () => apiService.getIssues(owner, repo),
    {
      enabled: activeTab === 'issues',
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch repository contents
  const { data: contents = [], isLoading: contentsLoading, error: contentsError } = useQuery(
    ['contents', owner, repo, currentPath],
    () => apiService.getRepositoryContents(owner, repo, currentPath),
    {
      enabled: activeTab === 'code',
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const getPRStatusColor = (state, merged) => {
    if (merged) return 'bg-purple-100 text-purple-800';
    if (state === 'open') return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getPRStatusText = (state, merged) => {
    if (merged) return 'Merged';
    return state === 'open' ? 'Open' : 'Closed';
  };

  if (repoLoading) {
    return <LoadingSpinner className="py-8" />;
  }

  if (repoError) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading repository</h3>
        <p className="mt-1 text-sm text-gray-500">{repoError.message}</p>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="text-center py-8">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Repository not found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Repository Header */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {repository.full_name}
                </h1>
                {repository.private && (
                  <LockClosedIcon className="h-5 w-5 text-gray-400" title="Private repository" />
                )}
              </div>
              
              {repository.description && (
                <p className="text-gray-600 mb-4">{repository.description}</p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                {repository.language && (
                  <span className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                    {repository.language}
                  </span>
                )}
                
                <span className="flex items-center">
                  <StarIcon className="h-4 w-4 mr-1" />
                  {repository.stargazers_count?.toLocaleString() || 0}
                </span>
                
                <span className="flex items-center">
                  <CodeBracketIcon className="h-4 w-4 mr-1" />
                  {repository.forks_count?.toLocaleString() || 0}
                </span>
                
                <span className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {repository.watchers_count?.toLocaleString() || 0}
                </span>
                
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Updated {formatDistanceToNow(new Date(repository.updated_at), { addSuffix: true })}
                </span>
              </div>
              
              {repository.topics && repository.topics.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {repository.topics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreatePRModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Pull Request
              </button>
              <a
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'code'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CodeBracketIcon className="h-4 w-4 mr-1 inline" />
            Code
          </button>
          <button
            onClick={() => setActiveTab('pulls')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pulls'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pull Requests
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'issues'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Issues
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {activeTab === 'code' ? 'Repository Files' : activeTab === 'pulls' ? 'Pull Requests' : 'Issues'}
            </h3>
          </div>
        </div>
        
        <div className="card-body">
          {activeTab === 'code' && (
            <>
              {contentsLoading ? (
                <LoadingSpinner className="py-8" />
              ) : contentsError ? (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading repository contents</h3>
                  <p className="mt-1 text-sm text-gray-500">{contentsError.message}</p>
                </div>
              ) : (
                <div className="flex h-[650px] border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
                  {/* File Explorer Sidebar */}
                  <div className="w-72 bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col">
                    {/* Sidebar Header */}
                    <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center">
                          <FolderIcon className="h-4 w-4 mr-2 text-blue-600" />
                          Files
                        </h4>
                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                          {Array.isArray(contents) ? contents.length : 0} items
                        </span>
                      </div>
                      {/* Breadcrumb */}
                      <div className="mt-2 flex items-center space-x-1 text-xs">
                        <button
                          onClick={() => {
                            setCurrentPath('');
                            setViewingFile(null);
                          }}
                          className="flex items-center space-x-1 hover:text-blue-600 font-medium px-2 py-1 rounded-md hover:bg-white/50 transition-all"
                        >
                          <span>🏠</span>
                          <span className="text-slate-700">{repository.name}</span>
                        </button>
                        {currentPath && currentPath.split('/').map((segment, index, array) => (
                          <div key={index} className="flex items-center space-x-1">
                            <ChevronRightIcon className="h-3 w-3 text-slate-400" />
                            <button
                              onClick={() => {
                                const newPath = array.slice(0, index + 1).join('/');
                                setCurrentPath(newPath);
                                setViewingFile(null);
                              }}
                              className="hover:text-blue-600 px-2 py-1 rounded-md hover:bg-white/50 transition-all text-slate-600"
                            >
                              {segment}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* File Tree */}
                    <div className="flex-1 overflow-y-auto">
                      {Array.isArray(contents) ? (
                        <div className="p-2 space-y-0.5">
                          {/* Sort: directories first, then files */}
                          {contents
                            .sort((a, b) => {
                              if (a.type === 'dir' && b.type === 'file') return -1;
                              if (a.type === 'file' && b.type === 'dir') return 1;
                              return a.name.localeCompare(b.name);
                            })
                            .map((item) => {
                              const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
                              const isSelected = viewingFile === filePath;
                              
                              const getFileIcon = (name, type) => {
                                if (type === 'dir') return { icon: '📁', color: 'text-blue-600' };
                                const ext = name.split('.').pop()?.toLowerCase();
                                const iconMap = {
                                  'js': { icon: '⚡', color: 'text-yellow-600' },
                                  'jsx': { icon: '⚛️', color: 'text-blue-500' },
                                  'ts': { icon: '🔷', color: 'text-blue-600' },
                                  'tsx': { icon: '🔷', color: 'text-blue-600' },
                                  'py': { icon: '🐍', color: 'text-green-600' },
                                  'java': { icon: '☕', color: 'text-orange-600' },
                                  'cpp': { icon: '⚙️', color: 'text-gray-600' },
                                  'c': { icon: '⚙️', color: 'text-gray-600' },
                                  'html': { icon: '🌐', color: 'text-orange-500' },
                                  'css': { icon: '🎨', color: 'text-blue-500' },
                                  'scss': { icon: '🎨', color: 'text-pink-500' },
                                  'json': { icon: '📋', color: 'text-gray-600' },
                                  'xml': { icon: '📄', color: 'text-gray-600' },
                                  'md': { icon: '📝', color: 'text-gray-700' },
                                  'png': { icon: '🖼️', color: 'text-purple-500' },
                                  'jpg': { icon: '🖼️', color: 'text-purple-500' },
                                  'gif': { icon: '🖼️', color: 'text-purple-500' },
                                  'pdf': { icon: '📕', color: 'text-red-500' },
                                  'zip': { icon: '📦', color: 'text-gray-600' },
                                  'txt': { icon: '📄', color: 'text-gray-500' },
                                  'gitignore': { icon: '🚫', color: 'text-gray-500' },
                                  'env': { icon: '🔐', color: 'text-green-600' },
                                  'yml': { icon: '⚙️', color: 'text-blue-600' },
                                  'yaml': { icon: '⚙️', color: 'text-blue-600' }
                                };
                                return iconMap[ext] || { icon: '📄', color: 'text-gray-500' };
                              };

                              const fileInfo = getFileIcon(item.name, item.type);
                              
                              return (
                                <div
                                  key={item.name}
                                  className={`group flex items-center space-x-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-all duration-150 ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                      : 'hover:bg-white/80 hover:shadow-sm text-slate-700 hover:text-slate-900'
                                  }`}
                                  onClick={() => {
                                    if (item.type === 'dir') {
                                      setCurrentPath(filePath);
                                      setViewingFile(null);
                                    } else {
                                      setViewingFile(filePath);
                                    }
                                  }}
                                >
                                  <span className={`text-sm flex-shrink-0 ${isSelected ? 'grayscale-0' : fileInfo.color}`}>
                                    {fileInfo.icon}
                                  </span>
                                  <span className={`flex-1 truncate ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                                    {item.name}
                                  </span>
                                  {item.type === 'file' && item.size && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                      isSelected 
                                        ? 'bg-white/20 text-blue-100' 
                                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                    }`}>
                                      {item.size > 1024 
                                        ? `${(item.size / 1024).toFixed(1)}KB`
                                        : `${item.size}B`
                                      }
                                    </span>
                                  )}
                                  {item.type === 'dir' && (
                                    <ChevronRightIcon className={`h-3 w-3 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${
                                      isSelected ? 'text-white' : 'text-slate-400'
                                    }`} />
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                          <DocumentTextIcon className="h-12 w-12 mb-3 text-slate-300" />
                          <p className="text-sm font-medium">No files found</p>
                          <p className="text-xs text-slate-400">This directory appears to be empty</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Code Viewer */}
                  <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
                    {viewingFile ? (
                      <FileViewer
                        owner={owner}
                        repo={repo}
                        filePath={viewingFile}
                        onBack={() => setViewingFile(null)}
                        sidebarMode={true}
                      />
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center max-w-lg">
                          <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-40 h-40 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full opacity-30 animate-pulse"></div>
                            </div>
                            <div className="relative">
                              <DocumentTextIcon className="mx-auto h-20 w-20 text-slate-400 mb-4" />
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">📝</span>
                              </div>
                            </div>
                          </div>
                          
                          <h3 className="text-2xl font-bold text-slate-800 mb-4">
                            🚀 Code Explorer Ready
                          </h3>
                          <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                            Click on any file from the explorer to view its contents with professional 
                            syntax highlighting and interactive features.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                <span className="text-green-600 text-sm">🎨</span>
                              </div>
                              <h4 className="font-semibold text-slate-800 mb-1">Syntax Highlighting</h4>
                              <p className="text-xs text-slate-600">Language-specific coloring</p>
                            </div>
                            
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                <span className="text-blue-600 text-sm">📊</span>
                              </div>
                              <h4 className="font-semibold text-slate-800 mb-1">Line Numbers</h4>
                              <p className="text-xs text-slate-600">Easy code navigation</p>
                            </div>
                            
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                <span className="text-purple-600 text-sm">📋</span>
                              </div>
                              <h4 className="font-semibold text-slate-800 mb-1">Copy Code</h4>
                              <p className="text-xs text-slate-600">One-click copying</p>
                            </div>
                          </div>
                          
                          <div className="text-sm text-slate-500 bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
                            <span className="font-medium">💡 Tip:</span> Use the file explorer on the left to browse through folders and files
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'pulls' && (
            <>
              {pullsLoading ? (
                <LoadingSpinner className="py-8" />
              ) : pullsError ? (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading pull requests</h3>
                  <p className="mt-1 text-sm text-gray-500">{pullsError.message}</p>
                </div>
              ) : pullRequests.length > 0 ? (
                <div className="space-y-4">
                  {pullRequests.map((pr) => (
                    <div
                      key={pr.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Link
                              to={`/repositories/${owner}/${repo}/pulls/${pr.number}`}
                              className="text-lg font-medium text-primary-600 hover:text-primary-800 truncate"
                            >
                              #{pr.number} {pr.title}
                            </Link>
                            <span className={`badge ${getPRStatusColor(pr.state, pr.merged)}`}>
                              {getPRStatusText(pr.state, pr.merged)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>by {pr.user.login}</span>
                            <span>
                              {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })}
                            </span>
                            {pr.head && pr.base && (
                              <span className="flex items-center">
                                <CodeBracketIcon className="h-4 w-4 mr-1" />
                                {pr.head.ref} → {pr.base.ref}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            to={`/repositories/${owner}/${repo}/pulls/${pr.number}`}
                            className="btn-outline text-xs"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pull requests</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No open pull requests found for this repository.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'issues' && (
            <>
              {issuesLoading ? (
                <LoadingSpinner className="py-8" />
              ) : issuesError ? (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading issues</h3>
                  <p className="mt-1 text-sm text-gray-500">{issuesError.message}</p>
                </div>
              ) : issues.length > 0 ? (
                <div className="space-y-4">
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <a
                              href={issue.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-medium text-primary-600 hover:text-primary-800 truncate"
                            >
                              #{issue.number} {issue.title}
                            </a>
                            <span className={`badge ${issue.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {issue.state}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>by {issue.user.login}</span>
                            <span>
                              {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                            </span>
                            {issue.labels && issue.labels.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {issue.labels.slice(0, 3).map((label) => (
                                  <span
                                    key={label.id}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                    style={{
                                      backgroundColor: `#${label.color}20`,
                                      color: `#${label.color}`
                                    }}
                                  >
                                    {label.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No issues</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No issues found for this repository.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Pull Request Modal */}
      <CreatePullRequestModal
        owner={owner}
        repo={repo}
        isOpen={showCreatePRModal}
        onClose={() => setShowCreatePRModal(false)}
      />
    </div>
  );
};

export default Repository;
