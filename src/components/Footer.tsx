import React, { useState } from 'react';
import { detectRuntime, getEnvironmentLabel, getBuildInfo } from '@/utils/environment';
import { Info, X, GitBranch, Clock, Server, Package } from 'lucide-react';

export function Footer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const runtime = detectRuntime();
  const buildInfo = getBuildInfo();
  const envLabel = getEnvironmentLabel(runtime, buildInfo);
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white text-sm z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:text-blue-300 transition-colors"
            aria-label="Toggle build information"
          >
            {isExpanded ? <X size={16} /> : <Info size={16} />}
            <span className="font-medium">{envLabel}</span>
          </button>
          
          {!isExpanded && (
            <>
              <span className="text-gray-400">v{buildInfo.version}</span>
              {buildInfo.commit !== 'local' && (
                <span className="text-gray-400 font-mono">
                  {buildInfo.commitShort}
                </span>
              )}
            </>
          )}
        </div>
        
        {!isExpanded && (
          <div className="text-gray-400 text-xs">
            Form Manager {buildInfo.environment === 'production' ? 'Pro' : 'Dev'}
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-700 px-4 py-3 bg-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-6xl">
            <div className="flex items-start gap-2">
              <Server size={16} className="text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium text-gray-300">Environment</div>
                <div className="text-gray-400">{envLabel}</div>
                {runtime.isDevServer && (
                  <div className="text-xs text-blue-400">HMR Enabled</div>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Package size={16} className="text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium text-gray-300">Version</div>
                <div className="text-gray-400">{buildInfo.version}</div>
                <div className="text-xs text-gray-500">Build: {buildInfo.buildMode}</div>
              </div>
            </div>
            
            {buildInfo.commit !== 'local' && (
              <div className="flex items-start gap-2">
                <GitBranch size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-300">Git Info</div>
                  <div className="text-gray-400 font-mono text-xs">
                    {buildInfo.branch} @ {buildInfo.commitShort}
                  </div>
                  <div className="text-xs text-gray-500">{buildInfo.commit}</div>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <Clock size={16} className="text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium text-gray-300">Build Time</div>
                <div className="text-gray-400 text-xs">
                  {formatDate(buildInfo.buildTime)}
                </div>
              </div>
            </div>
            
            {runtime.isGitHubPages && (
              <div className="flex items-start gap-2">
                <Info size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-300">Deployment</div>
                  <div className="text-gray-400 text-xs">GitHub Pages</div>
                  <div className="text-xs text-gray-500">{runtime.baseUrl}</div>
                </div>
              </div>
            )}
            
            {runtime.isSingleFile && (
              <div className="flex items-start gap-2">
                <Info size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-300">Bundle</div>
                  <div className="text-gray-400 text-xs">Single HTML File</div>
                  <div className="text-xs text-gray-500">All assets inlined</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}