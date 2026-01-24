export interface Project {
  id: string;
  name: string;
  path: string;
  addedAt: string;
  lastAccessedAt?: string;
}

export interface ProjectsData {
  projects: Project[];
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
