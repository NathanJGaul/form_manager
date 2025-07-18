export interface BuildInfo {
  version: string;
  commit: string;
  commitShort: string;
  branch: string;
  buildTime: string;
  environment: 'development' | 'production' | 'single-file' | 'github-pages';
  buildMode: string;
}

export interface RuntimeInfo {
  isDevServer: boolean;
  isSingleFile: boolean;
  isGitHubPages: boolean;
  isProduction: boolean;
  baseUrl: string;
}

declare global {
  interface Window {
    __BUILD_INFO__: BuildInfo;
  }
}