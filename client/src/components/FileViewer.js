import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/apiService';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const FileViewer = ({ owner, repo, filePath, onBack, sidebarMode = false }) => {
  const [copied, setCopied] = useState(false);

  // Fetch file content
  const { data: fileContent, isLoading, error } = useQuery(
    ['fileContent', owner, repo, filePath],
    () => apiService.getFileContent(owner, repo, filePath),
    {
      enabled: !!filePath,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getLanguageFromExtension = (extension) => {
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'ps1': 'powershell',
      'dockerfile': 'dockerfile',
      'gitignore': 'gitignore'
    };
    return languageMap[extension] || 'text';
  };

  const copyToClipboard = async () => {
    if (fileContent?.decodedContent) {
      try {
        await navigator.clipboard.writeText(fileContent.decodedContent);
        setCopied(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy code');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderLineNumbers = (content) => {
    const lines = content.split('\n');
    return lines.map((_, index) => (
      <div key={index + 1} className="text-gray-400 text-right pr-4 select-none">
        {index + 1}
      </div>
    ));
  };

  if (isLoading) {
    return <LoadingSpinner className="py-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading file</h3>
        <p className="mt-1 text-sm text-gray-500">{error.message}</p>
        <button
          onClick={onBack}
          className="mt-4 btn-outline"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to files
        </button>
      </div>
    );
  }

  if (!fileContent) {
    return (
      <div className="text-center py-8">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">File not found</h3>
        <button
          onClick={onBack}
          className="mt-4 btn-outline"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to files
        </button>
      </div>
    );
  }

  const fileName = filePath.split('/').pop();
  const extension = getFileExtension(fileName);
  const language = getLanguageFromExtension(extension);

  // Check if file is binary or too large
  const isBinary = !fileContent.decodedContent || fileContent.size > 1000000; // 1MB limit

  return (
    <div className={sidebarMode ? "flex flex-col h-full" : "space-y-4"}>
      {/* File Header */}
      <div className={`flex items-center justify-between ${sidebarMode ? 'bg-gray-50 p-3 border-b border-gray-200' : 'bg-gray-50 p-4 rounded-lg'}`}>
        <div className="flex items-center space-x-3">
          {!sidebarMode && (
            <button
              onClick={onBack}
              className="btn-outline text-sm"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>
          )}
          <div>
            <h3 className={`${sidebarMode ? 'text-sm' : 'text-lg'} font-medium text-gray-900 flex items-center`}>
              <DocumentTextIcon className={`${sidebarMode ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-gray-500`} />
              {fileName}
            </h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(fileContent.size)} • {language}
            </p>
          </div>
        </div>
        
        {!isBinary && (
          <button
            onClick={copyToClipboard}
            className={`btn-outline text-xs ${copied ? 'bg-green-50 text-green-700' : ''}`}
          >
            <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>

      {/* File Content */}
      <div className={`bg-white ${sidebarMode ? 'flex-1 overflow-hidden' : 'border border-gray-200 rounded-lg overflow-hidden'}`}>
        {isBinary ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {fileContent.size > 1000000 ? 'File too large to display' : 'Binary file'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {fileContent.size > 1000000 
                ? 'Files larger than 1MB cannot be displayed in the browser.'
                : 'This file appears to be binary and cannot be displayed as text.'
              }
            </p>
            <a
              href={fileContent.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 btn-primary inline-flex"
            >
              Download File
            </a>
          </div>
        ) : (
          <div className={`flex ${sidebarMode ? 'h-full' : ''}`}>
            {/* Line Numbers */}
            <div className={`bg-gray-50 border-r border-gray-200 text-xs font-mono leading-5 min-w-[50px] ${sidebarMode ? 'py-2' : 'py-4'}`}>
              <div className={sidebarMode ? 'px-2' : 'px-3'}>
                {renderLineNumbers(fileContent.decodedContent)}
              </div>
            </div>
            
            {/* Code Content */}
            <div className={`flex-1 text-xs font-mono leading-5 ${sidebarMode ? 'overflow-auto py-2 px-3' : 'p-4 overflow-x-auto'}`}>
              <pre className="whitespace-pre-wrap break-words">
                <code className={`language-${language}`}>
                  {fileContent.decodedContent}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;
