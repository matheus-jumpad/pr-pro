
import { Project, PullRequest, ProjectType, PRStatus, PRFile } from "../types";

const GITHUB_API_URL = "https://api.github.com";

const getHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
});

export const fetchGithubUser = async (token: string) => {
  const response = await fetch(`${GITHUB_API_URL}/user`, {
    headers: getHeaders(token),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Invalid Token");
  }
  return response.json();
};

export const fetchGithubRepos = async (token: string): Promise<Project[]> => {
  const response = await fetch(`${GITHUB_API_URL}/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator,organization_member`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch repositories");
  const data = await response.json();
  
  return data.map((repo: any) => ({
    id: repo.id.toString(),
    name: repo.name,
    description: repo.description || "No description provided",
    type: repo.owner.type === "Organization" ? ProjectType.COMPANY : ProjectType.PERSONAL,
    owner: repo.owner.login,
    stars: repo.stargazers_count,
    lastUpdated: new Date(repo.updated_at).toLocaleDateString(),
  }));
};

export const fetchGithubPRs = async (token: string, owner: string, repo: string): Promise<PullRequest[]> => {
  const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/pulls?state=open`, {
    headers: getHeaders(token),
  });
  if (!response.ok) return [];
  const data = await response.json();

  return data.map((pr: any) => ({
    id: pr.id.toString(),
    number: pr.number,
    projectId: pr.base.repo.id.toString(),
    repoName: repo,
    repoOwner: owner,
    title: pr.title,
    author: pr.user.login,
    authorAvatar: pr.user.avatar_url,
    status: PRStatus.OPEN,
    createdAt: pr.created_at,
    branch: pr.head.ref,
    targetBranch: pr.base.ref,
    description: pr.body || "No description provided",
    filesChanged: 0,
    additions: 0,
    deletions: 0
  }));
};

export const fetchSearchPRs = async (token: string, query: string): Promise<PullRequest[]> => {
  const response = await fetch(`${GITHUB_API_URL}/search/issues?q=${encodeURIComponent(query)}`, {
    headers: getHeaders(token),
  });
  if (!response.ok) return [];
  const data = await response.json();
  
  return data.items.map((pr: any) => {
    const repoParts = pr.repository_url.split('/');
    const repoName = repoParts[repoParts.length - 1];
    const repoOwner = repoParts[repoParts.length - 2];
    
    return {
      id: pr.id.toString(),
      number: pr.number,
      projectId: "unknown",
      repoName: repoName,
      repoOwner: repoOwner,
      title: pr.title,
      author: pr.user.login,
      authorAvatar: pr.user.avatar_url,
      status: PRStatus.OPEN,
      createdAt: pr.created_at,
      branch: "Fetching...",
      targetBranch: "Fetching...",
      description: pr.body || "",
      filesChanged: 0,
      additions: 0,
      deletions: 0
    };
  });
};

export const fetchPRDetails = async (token: string, owner: string, repo: string, pullNumber: number): Promise<Partial<PullRequest>> => {
  const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/pulls/${pullNumber}`, {
    headers: getHeaders(token),
  });
  if (!response.ok) return {};
  const data = await response.json();
  
  return {
    additions: data.additions,
    deletions: data.deletions,
    filesChanged: data.changed_files,
    branch: data.head.ref,
    targetBranch: data.base.ref,
    description: data.body || "No description provided"
  };
};

export const fetchPRFiles = async (token: string, owner: string, repo: string, pullNumber: number): Promise<PRFile[]> => {
  const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/files`, {
    headers: getHeaders(token),
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.map((f: any) => ({
    filename: f.filename,
    additions: f.additions,
    deletions: f.deletions,
    status: f.status,
    patch: f.patch
  }));
};
