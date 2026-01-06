
export enum ProjectType {
  PERSONAL = 'personal',
  COMPANY = 'company'
}

export enum PRStatus {
  OPEN = 'open',
  MERGED = 'merged',
  CLOSED = 'closed',
  DRAFT = 'draft'
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  owner: string;
  stars: number;
  lastUpdated: string;
}

export interface PRFile {
  filename: string;
  additions: number;
  deletions: number;
  status: string;
  patch?: string;
}

export interface PullRequest {
  id: string;
  number: number;
  projectId: string;
  repoName: string;
  repoOwner: string;
  title: string;
  author: string;
  authorAvatar: string;
  status: PRStatus;
  createdAt: string;
  branch: string;
  targetBranch: string;
  description: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  files?: PRFile[];
}

export interface AIValidationResult {
  score: number;
  summary: string;
  suggestions: string[];
  criticalIssues: string[];
  lgtm: boolean;
}
