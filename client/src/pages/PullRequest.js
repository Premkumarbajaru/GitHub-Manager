import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  CodeBracketIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const PullRequest = () => {
  const { owner, repo, number } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pull request details
  const { data: pullRequest, isLoading: prLoading, error: prError } = useQuery(
    ['pull-request', owner, repo, number],
    () => apiService.getPullRequest(owner, repo, parseInt(number)),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch pull request comments
  const { data: commentsData, isLoading: commentsLoading } = useQuery(
    ['pull-request-comments', owner, repo, number],
    () => apiService.getPullRequestComments(owner, repo, parseInt(number)),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  );

  // Create comment mutation
  const createCommentMutation = useMutation(
    (commentBody) => apiService.addPullRequestComment(owner, repo, parseInt(number), commentBody),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pull-request-comments', owner, repo, number]);
        setNewComment('');
        setIsSubmitting(false);
        toast.success('Comment added successfully!');
      },
      onError: (error) => {
        console.error('Full comment submission error:', {
          message: error.message,
          response: error.response,
          data: error.response?.data,
          status: error.response?.status
        });
        setIsSubmitting(false);
        toast.error(`Failed to add comment: ${error.response?.data?.error || error.message}`);
      }
    }
  );

  const comments = commentsData?.comments || [];

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    createCommentMutation.mutate(newComment.trim());
  };

  const getPRStatusColor = (state, merged) => {
    if (merged) return 'text-purple-600 bg-purple-100';
    if (state === 'open') return 'text-green-600 bg-green-100';
    return 'text-red-600 bg-red-100';
  };

  const getPRStatusText = (state, merged) => {
    if (merged) return 'Merged';
    if (state === 'open') return 'Open';
    return 'Closed';
  };

  const getPRStatusIcon = (state, merged) => {
    if (merged) return CheckCircleIcon;
    if (state === 'open') return CheckCircleIcon;
    return XCircleIcon;
  };

  if (prLoading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb Skeleton */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <span>/</span>
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
          <span>/</span>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </nav>

        {/* PR Header Skeleton */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                </div>

                <div className="flex items-center space-x-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>

              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* PR Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section Skeleton */}
        <div className="card">
          <div className="card-header">
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>

          <div className="card-body">
            <div className="space-y-6">
              {/* Existing Comments Skeleton */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-lg animate-pulse">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Comment Skeleton */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <div className="border border-gray-300 rounded-lg animate-pulse">
                      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="p-3">
                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end">
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (prError) {
    return (
      <div className="text-center py-8">
        <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading pull request</h3>
        <p className="mt-1 text-sm text-gray-500">{prError.message}</p>
        <Link
          to={`/repositories/${owner}/${repo}`}
          className="mt-4 inline-flex items-center btn-primary"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Repository
        </Link>
      </div>
    );
  }

  const StatusIcon = getPRStatusIcon(pullRequest.state, pullRequest.merged);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/repositories" className="hover:text-gray-700">Repositories</Link>
        <span>/</span>
        <Link to={`/repositories/${owner}/${repo}`} className="hover:text-gray-700">
          {owner}/{repo}
        </Link>
        <span>/</span>
        <span className="text-gray-900">Pull Request #{number}</span>
      </nav>

      {/* Pull Request Header */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {pullRequest.title}
                </h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPRStatusColor(pullRequest.state, pullRequest.merged)}`}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {getPRStatusText(pullRequest.state, pullRequest.merged)}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <img
                    className="h-5 w-5 rounded-full mr-2"
                    src={pullRequest.user.avatar_url}
                    alt={pullRequest.user.login}
                  />
                  {pullRequest.user.login}
                </span>
                <span>
                  opened {formatDistanceToNow(new Date(pullRequest.created_at), { addSuffix: true })}
                </span>
                {pullRequest.head && pullRequest.base && (
                  <span className="flex items-center">
                    <CodeBracketIcon className="h-4 w-4 mr-1" />
                    {pullRequest.head.ref} → {pullRequest.base.ref}
                  </span>
                )}
              </div>

              {pullRequest.body && (
                <div className="prose max-w-none">
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {pullRequest.body}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3 ml-6">
              <a
                href={pullRequest.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                View on GitHub
              </a>
            </div>
          </div>

          {/* PR Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{pullRequest.additions || 0}</div>
              <div className="text-sm text-gray-500">Additions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">-{pullRequest.deletions || 0}</div>
              <div className="text-sm text-gray-500">Deletions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{pullRequest.changed_files || 0}</div>
              <div className="text-sm text-gray-500">Files Changed</div>
            </div>
          </div>
        </div>
      </div>

        {/* Comments Section */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                Comments ({commentsLoading ? '...' : comments.length})
              </h3>
              {commentsLoading && (
                <LoadingSpinner size="sm" variant="dots" />
              )}
            </div>
          </div>
        
        <div className="card-body">
          {commentsLoading ? (
            <LoadingSpinner className="py-4" />
          ) : (
            <div className="space-y-6">
              {/* Existing Comments */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={comment.user.avatar_url}
                        alt={comment.user.login}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border border-gray-200 rounded-lg">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{comment.user.login}</span>
                                <span className="text-sm text-gray-500">
                                  commented {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="px-4 py-3">
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {comment.body}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Be the first to comment on this pull request.
                  </p>
                </div>
              )}

              {/* Add New Comment */}
              <div className="border-t border-gray-200 pt-6">
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <div className="flex space-x-3">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=3b82f6&color=fff`}
                      alt={user?.displayName}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="border border-gray-300 rounded-lg">
                        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                          <span className="text-sm font-medium text-gray-900">Add a comment</span>
                        </div>
                        <div className="p-3">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Leave a comment..."
                            rows={4}
                            className="w-full border-0 resize-none focus:ring-0 focus:outline-none text-sm"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim()}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Comment
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PullRequest;
