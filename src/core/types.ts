export interface Project {
  name: string;
  path: string;
  lastAccessedAt?: string;
}

export interface ProjectMetadata {
  lastAccessedAt?: string;
}

export interface DevHubConfig {
  projects: Record<string, ProjectMetadata>;
}

export interface GitStatus {
  isRepo: boolean;
  branch?: string;
  dirty?: boolean;
  ahead?: number;
  behind?: number;
}

export interface ProjectWithStatus extends Project {
  git: GitStatus;
}
