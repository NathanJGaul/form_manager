import { BuildInfo, RuntimeInfo } from '@/types/build-info';

export function detectRuntime(): RuntimeInfo {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const protocol = window.location.protocol;
  
  const isDevServer = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
  const isGitHubPages = hostname.includes('github.io') || pathname.includes('/form_manager/');
  const isSingleFile = protocol === 'file:' || (document.currentScript === null && !isDevServer);
  const isProduction = !isDevServer && !isSingleFile;
  
  return {
    isDevServer,
    isSingleFile,
    isGitHubPages,
    isProduction,
    baseUrl: window.location.origin + pathname.replace(/\/[^/]*$/, '')
  };
}

export function getEnvironmentLabel(runtime: RuntimeInfo, buildInfo?: BuildInfo): string {
  if (runtime.isDevServer) return 'Development Server';
  if (runtime.isSingleFile) return 'Single File Build';
  if (runtime.isGitHubPages) return 'GitHub Pages';
  if (buildInfo?.environment === 'production') return 'Production';
  return 'Unknown Environment';
}

export function getBuildInfo(): BuildInfo {
  if (typeof window !== 'undefined' && window.__BUILD_INFO__) {
    return window.__BUILD_INFO__;
  }
  
  // Fallback for development
  return {
    version: 'dev',
    commit: 'local',
    commitShort: 'local',
    branch: 'local',
    buildTime: new Date().toISOString(),
    environment: 'development',
    buildMode: 'development'
  };
}