
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import { Project, ProjectType, PullRequest, PRStatus, PRFile } from './types';
import { MOCK_PROJECTS, MOCK_PRS, CURRENT_USER } from './constants';
import { validatePullRequest } from './services/geminiService';
import * as github from './services/githubService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'all-prs' | 'my-prs'>('dashboard');
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showFiles, setShowFiles] = useState(true);
  
  // GitHub Integration State
  const [githubToken, setGithubToken] = useState<string | null>(localStorage.getItem('gh_token'));
  const [githubUser, setGithubUser] = useState<any>(null);
  const [liveProjects, setLiveProjects] = useState<Project[]>([]);
  const [livePRs, setLivePRs] = useState<PullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Connection UI states
  const [isConnecting, setIsConnecting] = useState(false);
  const [tempToken, setTempToken] = useState('');

  useEffect(() => {
    if (githubToken) {
      loadGithubData(githubToken);
    }
  }, [githubToken]);

  useEffect(() => {
    if (githubToken && githubUser) {
      if (activeTab === 'all-prs') {
        loadGlobalPRs(githubToken, `is:pr is:open author:${githubUser.login}`);
      } else if (activeTab === 'my-prs') {
        loadGlobalPRs(githubToken, `is:pr is:open author:${githubUser.login}`);
      }
    }
  }, [activeTab, githubToken, githubUser]);

  const loadGithubData = async (token: string) => {
    setIsLoading(true);
    try {
      const user = await github.fetchGithubUser(token);
      setGithubUser(user);
      const repos = await github.fetchGithubRepos(token);
      setLiveProjects(repos);
      localStorage.setItem('gh_token', token);
      setIsConnecting(false);
    } catch (err) {
      console.error("GitHub Auth Error", err);
      setGithubToken(null);
      localStorage.removeItem('gh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGlobalPRs = async (token: string, query: string) => {
    setIsLoading(true);
    try {
      const prs = await github.fetchSearchPRs(token, query);
      setLivePRs(prs);
    } catch (err) {
      console.error("Error loading PRs", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectConfirm = () => {
    if (tempToken.trim()) {
      setGithubToken(tempToken.trim());
    }
  };

  const handleDisconnect = () => {
    setGithubToken(null);
    setGithubUser(null);
    setLiveProjects([]);
    setLivePRs([]);
    setTempToken('');
    localStorage.removeItem('gh_token');
  };

  const displayProjects = githubToken ? liveProjects : MOCK_PROJECTS;
  const filteredProjects = useMemo(() => {
    return displayProjects.filter(p => selectedProjectType === 'all' || p.type === selectedProjectType);
  }, [selectedProjectType, displayProjects]);

  const pageTitle = useMemo(() => {
    if (activeTab === 'all-prs') return 'All Active Pull Requests';
    if (activeTab === 'my-prs') return 'My Open Contributions';
    if (selectedPR) return `Validating PR #${selectedPR.number}`;
    if (selectedProject) return `${selectedProject.name} Dashboard`;
    return githubToken ? 'GitHub Repositories' : 'Mock Project Repository';
  }, [activeTab, selectedPR, selectedProject, githubToken]);

  const handleProjectSelect = async (project: Project) => {
    setSelectedProject(project);
    setSelectedPR(null);
    setValidationResult(null);
    
    if (githubToken) {
      setIsLoading(true);
      try {
        const prs = await github.fetchGithubPRs(githubToken, project.owner, project.name);
        setLivePRs(prs);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePRSelect = async (pr: PullRequest) => {
    setIsValidating(true);
    setValidationResult(null);
    
    let updatedPR = { ...pr };
    
    if (githubToken) {
      try {
        const details = await github.fetchPRDetails(githubToken, pr.repoOwner, pr.repoName, pr.number);
        const files = await github.fetchPRFiles(githubToken, pr.repoOwner, pr.repoName, pr.number);
        updatedPR = { ...pr, ...details, files };
      } catch (err) {
        console.error("Failed to fetch detailed PR stats", err);
      }
    }
    
    setSelectedPR(updatedPR);
    const result = await validatePullRequest(updatedPR, updatedPR.repoName || "Repository");
    setValidationResult(result);
    setIsValidating(false);
  };

  const clearSelection = () => {
    setSelectedProject(null);
    setSelectedPR(null);
    setValidationResult(null);
  };

  const DiffLine = ({ line }: { line: string }) => {
    const isAdded = line.startsWith('+') && !line.startsWith('+++');
    const isRemoved = line.startsWith('-') && !line.startsWith('---');
    const isMeta = line.startsWith('@@') || line.startsWith('diff') || line.startsWith('index');

    let bgColor = '';
    let textColor = 'text-slate-600';
    if (isAdded) { bgColor = 'bg-emerald-50'; textColor = 'text-emerald-700'; }
    if (isRemoved) { bgColor = 'bg-rose-50'; textColor = 'text-rose-700'; }
    if (isMeta) { bgColor = 'bg-slate-100'; textColor = 'text-slate-400 font-bold'; }

    return (
      <div className={`${bgColor} ${textColor} px-4 py-0.5 whitespace-pre font-mono text-xs border-l-4 ${isAdded ? 'border-emerald-400' : isRemoved ? 'border-rose-400' : 'border-transparent'}`}>
        {line}
      </div>
    );
  };

  const renderValidation = () => (
    <div className="max-w-5xl mx-auto space-y-6 animate-in zoom-in-95 duration-300 pb-20">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setSelectedPR(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to list
        </button>
        <div className="flex gap-2">
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">PR #{selectedPR?.number}</span>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
            {selectedPR?.repoOwner}/{selectedPR?.repoName}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Info & Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">{selectedPR?.title}</h3>
              <div className="mb-6">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</span>
                 <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 font-mono text-sm overflow-auto max-h-40 whitespace-pre-wrap italic">
                   {selectedPR?.description || "No description provided."}
                 </p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">From</span>
                  <span className="text-sm font-bold text-indigo-600">{selectedPR?.branch}</span>
                </div>
                <div className="flex items-center flex-1 justify-center px-4">
                  <div className="h-0.5 bg-slate-200 flex-1 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Into</span>
                  <span className="text-sm font-bold text-slate-800">{selectedPR?.targetBranch}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="bg-white p-3 rounded-lg text-center border border-slate-200 shadow-sm">
                   <span className="block text-xs text-slate-400 mb-1">Files</span>
                   <span className="text-lg font-bold text-slate-800">{selectedPR?.filesChanged}</span>
                 </div>
                 <div className="bg-white p-3 rounded-lg text-center border border-emerald-200 shadow-sm">
                   <span className="block text-xs text-emerald-500 mb-1">Additions</span>
                   <span className="text-lg font-bold text-emerald-600">+{selectedPR?.additions}</span>
                 </div>
                 <div className="bg-white p-3 rounded-lg text-center border border-rose-200 shadow-sm">
                   <span className="block text-xs text-rose-500 mb-1">Deletions</span>
                   <span className="text-lg font-bold text-rose-600">-{selectedPR?.deletions}</span>
                 </div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border-2 transition-all p-8 relative ${
            isValidating ? 'bg-slate-50 border-slate-200 border-dashed animate-pulse' :
            validationResult?.lgtm ? 'bg-emerald-50 border-emerald-200 shadow-xl shadow-emerald-100' : 'bg-amber-50 border-amber-200 shadow-xl shadow-amber-100'
          }`}>
            {isValidating ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-700 font-bold text-xl">Gemini Code Reviewing...</p>
                <p className="text-sm text-slate-500">Scanning diffs for vulnerabilities and logic errors.</p>
              </div>
            ) : validationResult ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-black ${
                      validationResult.score > 80 ? 'border-emerald-500 text-emerald-600' : 
                      validationResult.score > 50 ? 'border-amber-500 text-amber-600' : 'border-rose-500 text-rose-600'
                    }`}>
                      {validationResult.score}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">AI Review Result</h3>
                      <p className="text-sm text-slate-600 mt-1">{validationResult.summary}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {validationResult.lgtm ? (
                      <span className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md">LGTM</span>
                    ) : (
                      <span className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md">Revision Needed</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="bg-white/60 p-4 rounded-xl border border-white/60">
                    <h4 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-3">Suggestions</h4>
                    <ul className="space-y-2">
                      {validationResult.suggestions.map((s: string, i: number) => (
                        <li key={i} className="text-xs text-slate-600 flex gap-2">
                          <span className="text-indigo-400">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-xs text-rose-500 uppercase tracking-widest mb-3">Security & Logic</h4>
                    {validationResult.criticalIssues.length > 0 ? (
                      <ul className="space-y-2">
                        {validationResult.criticalIssues.map((issue: string, i: number) => (
                          <li key={i} className="text-xs text-rose-700 font-medium">⚠️ {issue}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-600 italic">Code looks clean.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Col: Files Explorer */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-full max-h-[800px] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Files Analysis
              </h4>
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{selectedPR?.files?.length} files</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedPR?.files?.map((file, i) => (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:border-indigo-300">
                  <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-slate-700 truncate">{file.filename}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{file.status}</span>
                    </div>
                    <div className="flex gap-2 text-[10px] font-bold">
                       <span className="text-emerald-500">+{file.additions}</span>
                       <span className="text-rose-500">-{file.deletions}</span>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto bg-slate-950">
                    {file.patch ? file.patch.split('\n').map((line, li) => (
                      <DiffLine key={li} line={line} />
                    )) : (
                      <div className="p-4 text-slate-500 italic text-xs text-center">No diff available for this file.</div>
                    )}
                  </div>
                </div>
              ))}
              {(!selectedPR?.files || selectedPR.files.length === 0) && (
                <div className="text-center py-20 text-slate-400 italic">No files changed found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPRList = (prs: PullRequest[], emptyMessage: string) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {isLoading ? (
        [1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse"></div>)
      ) : prs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="text-slate-500 font-medium">{emptyMessage}</p>
        </div>
      ) : (
        prs.map(pr => (
          <div 
            key={pr.id}
            onClick={() => handlePRSelect(pr)}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <img src={pr.authorAvatar} className="w-10 h-10 rounded-full" alt={pr.author} />
                <div>
                  <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{pr.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    #{pr.number} in <span className="text-slate-600 font-medium">{pr.repoOwner}/{pr.repoName}</span> opened {new Date(pr.createdAt).toLocaleDateString()} by <span className="text-indigo-500 font-medium">@{pr.author}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button className="text-xs text-indigo-500 font-semibold group-hover:translate-x-1 transition-transform">
                  AI Validate →
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className={`${githubToken ? 'bg-slate-800' : 'bg-indigo-700'} rounded-2xl p-8 text-white shadow-xl transition-all duration-300`}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">
              {isLoading ? 'Fetching your GitHub profile...' : `Welcome, ${githubUser?.name || githubUser?.login || 'Developer'}!`}
            </h2>
            <p className="text-indigo-100 mb-6">
              {githubToken 
                ? `Successfully connected as @${githubUser?.login}. Viewing ${liveProjects.length} repos.` 
                : "Using simulation mode. Connect GitHub to analyze real code diffs."}
            </p>
            
            {isConnecting && !githubToken ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 animate-in zoom-in-95">
                <label className="block text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2">GitHub Personal Access Token (PAT)</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value={tempToken}
                    onChange={(e) => setTempToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx..."
                    className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button onClick={handleConnectConfirm} className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors">Confirm</button>
                  <button onClick={() => setIsConnecting(false)} className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/20 transition-colors">Cancel</button>
                </div>
              </div>
            ) : null}
          </div>
          {!isConnecting && (
            <button 
              onClick={githubToken ? handleDisconnect : () => setIsConnecting(true)}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${githubToken ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white' : 'bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-105'}`}
            >
              {githubToken ? 'Disconnect GitHub' : 'Connect GitHub'}
            </button>
          )}
        </div>
        {!isConnecting && (
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1">
              <span className="block text-sm text-indigo-200 uppercase tracking-wider font-semibold">Filter Repositories</span>
              <select 
                value={selectedProjectType}
                onChange={(e) => setSelectedProjectType(e.target.value as any)}
                className="mt-2 bg-transparent text-xl font-bold outline-none border-b-2 border-indigo-400 w-full focus:border-white transition-colors cursor-pointer"
              >
                <option value="all" className="text-slate-900">All Repositories</option>
                <option value={ProjectType.COMPANY} className="text-slate-900">Organizations / Company</option>
                <option value={ProjectType.PERSONAL} className="text-slate-900">Personal Projects</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {isLoading && displayProjects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div 
              key={project.id}
              onClick={() => handleProjectSelect(project)}
              className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${project.type === ProjectType.COMPANY ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {project.type === ProjectType.COMPANY ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                </div>
                <h3 className="text-lg font-bold text-slate-800 truncate pr-6">{project.name}</h3>
              </div>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">{project.description}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-4 uppercase font-bold tracking-widest">
                <span>@{project.owner}</span>
                <span>Updated {project.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const mainContent = () => {
    if (selectedPR) return renderValidation();

    if (activeTab === 'dashboard') {
      if (selectedProject) {
        const prs = githubToken ? livePRs : MOCK_PRS.filter(p => p.projectId === selectedProject.id);
        return (
          <div className="space-y-6">
            <button onClick={clearSelection} className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-4 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7m0 0l7-7" /></svg>
              Back to Repositories
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h2 className="text-3xl font-bold text-slate-800">{selectedProject.name}</h2>
                 <p className="text-slate-500">{selectedProject.description}</p>
               </div>
               <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">{prs.length} Open PRs</div>
            </div>
            {renderPRList(prs, "This repository has no open pull requests.")}
          </div>
        );
      }
      return renderHome();
    }

    if (activeTab === 'all-prs') {
      const prs = githubToken ? livePRs : MOCK_PRS;
      return (
        <div className="space-y-6">
          <p className="text-slate-500">Overview of all active development threads.</p>
          {renderPRList(prs, "No active pull requests found.")}
        </div>
      );
    }

    if (activeTab === 'my-prs') {
      const prs = githubToken ? livePRs : MOCK_PRS.filter(p => p.author === CURRENT_USER);
      return (
        <div className="space-y-6">
          <p className="text-slate-500">Your contributions pending review.</p>
          {renderPRList(prs, "You don't have any open pull requests.")}
        </div>
      );
    }

    return null;
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab !== 'dashboard') {
          setSelectedProject(null);
          setSelectedPR(null);
        }
      }}
      title={pageTitle}
      isConnected={!!githubToken}
    >
      {mainContent()}
    </Layout>
  );
};

export default App;
