
import { Project, PullRequest, ProjectType, PRStatus } from './types';

export const CURRENT_USER = "john_developer";

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Gemini-UI-Components',
    description: 'A React library for building GenAI interfaces.',
    type: ProjectType.PERSONAL,
    owner: 'john_developer',
    stars: 124,
    lastUpdated: '2 hours ago'
  },
  {
    id: 'p2',
    name: 'Personal-Blog-CMS',
    description: 'Next.js based blog platform with Markdown support.',
    type: ProjectType.PERSONAL,
    owner: 'john_developer',
    stars: 45,
    lastUpdated: '1 day ago'
  },
  {
    id: 'c1',
    name: 'Enterprise-Auth-Service',
    description: 'Core authentication module for internal corporate apps.',
    type: ProjectType.COMPANY,
    owner: 'acme-corp',
    stars: 0,
    lastUpdated: '15 mins ago'
  },
  {
    id: 'c2',
    name: 'Sales-Data-Pipeline',
    description: 'ETL processes for aggregating worldwide sales data.',
    type: ProjectType.COMPANY,
    owner: 'acme-corp',
    stars: 0,
    lastUpdated: '5 hours ago'
  },
  {
    id: 'c3',
    name: 'Legacy-Inventory-Sync',
    description: 'Synchronization service for brick and mortar stores.',
    type: ProjectType.COMPANY,
    owner: 'acme-corp',
    stars: 0,
    lastUpdated: '3 days ago'
  }
];

export const MOCK_PRS: PullRequest[] = [
  {
    id: 'pr1',
    // Added missing number, repoName, and repoOwner properties
    number: 101,
    projectId: 'p1',
    repoName: 'Gemini-UI-Components',
    repoOwner: 'john_developer',
    title: 'feat: Add streaming support to Chat component',
    author: 'john_developer',
    authorAvatar: 'https://picsum.photos/seed/john/40/40',
    status: PRStatus.OPEN,
    createdAt: '2023-10-25T10:00:00Z',
    branch: 'feat/streaming',
    targetBranch: 'main',
    description: 'This PR adds real-time streaming capabilities to the chat UI using the new API hooks.',
    filesChanged: 12,
    additions: 450,
    deletions: 20
  },
  {
    id: 'pr2',
    // Added missing number, repoName, and repoOwner properties
    number: 102,
    projectId: 'p1',
    repoName: 'Gemini-UI-Components',
    repoOwner: 'john_developer',
    title: 'fix: Button hover state in dark mode',
    author: 'alice_smith',
    authorAvatar: 'https://picsum.photos/seed/alice/40/40',
    status: PRStatus.OPEN,
    createdAt: '2023-10-26T14:30:00Z',
    branch: 'fix/dark-mode-buttons',
    targetBranch: 'main',
    description: 'Buttons were invisible in dark mode due to lack of border contrast.',
    filesChanged: 2,
    additions: 5,
    deletions: 5
  },
  {
    id: 'pr3',
    // Added missing number, repoName, and repoOwner properties
    number: 201,
    projectId: 'c1',
    repoName: 'Enterprise-Auth-Service',
    repoOwner: 'acme-corp',
    title: 'security: Upgrade JWT library to v9',
    author: 'security_bot',
    authorAvatar: 'https://picsum.photos/seed/bot/40/40',
    status: PRStatus.OPEN,
    createdAt: '2023-10-27T09:00:00Z',
    branch: 'patch/security-update',
    targetBranch: 'develop',
    description: 'Critical patch for CVE-2023-XXXXX.',
    filesChanged: 1,
    additions: 1,
    deletions: 1
  },
  {
    id: 'pr4',
    // Added missing number, repoName, and repoOwner properties
    number: 45,
    projectId: 'c2',
    repoName: 'Sales-Data-Pipeline',
    repoOwner: 'acme-corp',
    title: 'refactor: Optimize data aggregation queries',
    author: 'john_developer',
    authorAvatar: 'https://picsum.photos/seed/john/40/40',
    status: PRStatus.OPEN,
    createdAt: '2023-10-27T16:45:00Z',
    branch: 'perf/query-opt',
    targetBranch: 'staging',
    description: 'Reducing query latency by adding composite indexes.',
    filesChanged: 4,
    additions: 80,
    deletions: 12
  },
  {
    id: 'pr5',
    // Added missing number, repoName, and repoOwner properties
    number: 205,
    projectId: 'c1',
    repoName: 'Enterprise-Auth-Service',
    repoOwner: 'acme-corp',
    title: 'docs: Update API documentation',
    author: 'bob_manager',
    authorAvatar: 'https://picsum.photos/seed/bob/40/40',
    status: PRStatus.OPEN,
    createdAt: '2023-10-24T11:00:00Z',
    branch: 'docs/api-update',
    targetBranch: 'main',
    description: 'Updated README with latest endpoints.',
    filesChanged: 1,
    additions: 20,
    deletions: 0
  }
];
