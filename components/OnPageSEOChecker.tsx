"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui/simple-components";
import { formatDate } from "@/lib/utils";
import { useOnPageSEO, OnPageAnalysis } from "@/lib/hooks/useOnPageSEO";

interface Client {
  id: string;
  name: string;
  website: string;
  industry: string;
  status: "active" | "inactive";
  serviceTier: "Pro" | "Business" | "Starter" | "Legacy";
  lastAuditScore?: number;
  monthlyKeywords?: number;
  lastAuditDate?: Date;
  nextAuditDate?: Date;
}

interface OnPageSEOCheckerProps {
  clients: Client[];
  selectedClient: Client | null;
  onClientSelect: (client: Client | null) => void;
}

export function OnPageSEOChecker({ clients, selectedClient, onClientSelect }: OnPageSEOCheckerProps) {
  const [onPageTab, setOnPageTab] = useState("overview");
  const [analysisKeyword, setAnalysisKeyword] = useState("");
  const [newAnalysisUrl, setNewAnalysisUrl] = useState("");
  const [newAnalysisKeyword, setNewAnalysisKeyword] = useState("");
  const [showAddAnalysis, setShowAddAnalysis] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
  const [detailedIdeas, setDetailedIdeas] = useState<Record<string, any[]>>({});

  const {
    analyses,
    ideas,
    overview,
    isLoading,
    error,
    runAnalysis,
    loadSavedAnalyses,
    updateIdeaStatus,
    removeAnalysis,
    clearError
  } = useOnPageSEO(selectedClient?.id || null);

  useEffect(() => {
    if (selectedClient) {
      loadSavedAnalyses();
    }
  }, [selectedClient, loadSavedAnalyses]);

  const handleRunNewAnalysis = async () => {
    if (!newAnalysisUrl || !newAnalysisKeyword) return;
    
    await runAnalysis(newAnalysisUrl, newAnalysisKeyword);
    setNewAnalysisUrl("");
    setNewAnalysisKeyword("");
    setShowAddAnalysis(false);
  };

  const handleRerunAnalysis = async (analysis: OnPageAnalysis) => {
    await runAnalysis(analysis.url, analysis.keyword);
  };

  const loadDetailedIdeas = async (analysisId: string, url: string, keyword: string) => {
    if (detailedIdeas[analysisId]) {
      return; // Already loaded
    }

    try {
      const response = await fetch('/api/detailed-optimization-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          keyword,
          location: 'Dallas, Texas, United States',
          language: 'en'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load detailed ideas');
      }

      const ideas = await response.json();
      setDetailedIdeas(prev => ({
        ...prev,
        [analysisId]: ideas
      }));
    } catch (err) {
      console.error('Failed to load detailed ideas:', err);
    }
  };

  const toggleAnalysisExpansion = (analysis: OnPageAnalysis) => {
    const analysisId = analysis.id || `${analysis.url}-${analysis.keyword}`;
    
    if (expandedAnalysis === analysisId) {
      setExpandedAnalysis(null);
    } else {
      setExpandedAnalysis(analysisId);
      loadDetailedIdeas(analysisId, analysis.url, analysis.keyword);
    }
  };

  const getTierBadgeVariant = (tier: Client["serviceTier"]) => {
    switch (tier) {
      case "Pro": return "default";
      case "Business": return "success";
      case "Starter": return "warning";
      case "Legacy": return "secondary";
    }
  };

  const getStatusColor = (status: "good" | "warning" | "error") => {
    const colors = {
      good: "text-green-600 bg-green-50 border-green-200",
      warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
      error: "text-red-600 bg-red-50 border-red-200"
    };
    return colors[status];
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Client Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">On-Page SEO Checker</h2>
          <p className="text-sm text-gray-500">Comprehensive on-page SEO analysis and optimization recommendations</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={selectedClient?.id || ""}
            onChange={(e) => {
              const client = clients.find(c => c.id === e.target.value);
              onClientSelect(client || null);
            }}
          >
            <option value="">Select a client...</option>
            {clients.filter(c => c.serviceTier !== 'Legacy').map(client => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.serviceTier})
              </option>
            ))}
          </select>
          {selectedClient && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddAnalysis(true)}
                disabled={isLoading}
              >
                ➕ Add Analysis
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadSavedAnalyses}
                disabled={isLoading}
              >
                🔄 Refresh
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-red-800">{error}</span>
              </div>
              <Button size="sm" variant="outline" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Analysis Modal */}
      {showAddAnalysis && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Add New Analysis</CardTitle>
            <CardDescription>Enter a URL and target keyword to analyze</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page URL
              </label>
              <input
                type="url"
                value={newAnalysisUrl}
                onChange={(e) => setNewAnalysisUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Keyword
              </label>
              <input
                type="text"
                value={newAnalysisKeyword}
                onChange={(e) => setNewAnalysisKeyword(e.target.value)}
                placeholder="target keyword"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRunNewAnalysis}
                disabled={!newAnalysisUrl || !newAnalysisKeyword || isLoading}
              >
                {isLoading ? "Analyzing..." : "Run Analysis"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddAnalysis(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedClient ? (
        <div className="space-y-6">
          {/* Client Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-blue-600">{selectedClient.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>📍 Dallas, Texas, United States - English</span>
                    <span>🌐 {selectedClient.website}</span>
                    <span>📅 Last update: {formatDate(selectedClient.lastAuditDate || new Date())}</span>
                  </div>
                </div>
                <Badge variant={getTierBadgeVariant(selectedClient.serviceTier)}>
                  {selectedClient.serviceTier}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Running on-page analysis...</p>
              </CardContent>
            </Card>
          )}

          {/* On-Page SEO Tabs */}
          <div className="bg-white border-b border-gray-200">
            <nav className="flex space-x-8">
              {["overview", "optimization-ideas", "top-10-benchmarking", "idea-tasks"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setOnPageTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    onPageTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.replace("-", " ")}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {onPageTab === "overview" && overview && (
            <div className="space-y-6">
              {/* Total Ideas and Traffic Potential */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Ideas ({overview.totalIdeas})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(overview.categoryBreakdown).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600">{category} Ideas</span>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Potential</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Our ideas may help you increase your organic traffic</p>
                        <div className="text-3xl font-bold text-green-600 mb-4">{overview.trafficPotential.improvement}</div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Current</span>
                          <span className="font-medium">{overview.trafficPotential.current.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-400 h-2 rounded-full" style={{ width: "20%" }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Potential</span>
                          <span className="font-medium">{overview.trafficPotential.potential.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Pages to Optimize */}
              <Card>
                <CardHeader>
                  <CardTitle>Top pages to optimize</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overview.topPages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-8 rounded ${getPriorityColor(page.priority)}`}></div>
                          <div>
                            <div className="font-medium text-blue-600 hover:underline cursor-pointer">
                              {page.url}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Total Volume</div>
                            <div className="font-medium">{page.volume.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Ideas</div>
                            <div className="font-medium">
                              <Badge variant="default">{page.ideas} ideas</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Optimization Ideas Tab */}
          {onPageTab === "optimization-ideas" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Analyses</CardTitle>
                  <CardDescription>URLs and keywords being tracked for {selectedClient.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyses.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-gray-600 mb-4">No analyses yet</p>
                        <Button onClick={() => setShowAddAnalysis(true)}>
                          Add Your First Analysis
                        </Button>
                      </div>
                    ) : (
                      analyses.map((analysis, index) => {
                        const analysisId = analysis.id || `${analysis.url}-${analysis.keyword}`;
                        const isExpanded = expandedAnalysis === analysisId;
                        const ideas = detailedIdeas[analysisId] || [];
                        
                        return (
                          <div key={index} className="border rounded-lg">
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-4">
                                <div className={`w-3 h-8 rounded ${
                                  analysis.position <= 10 ? 'bg-green-500' : 
                                  analysis.position <= 30 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                                <div className="flex-1">
                                  <div 
                                    className="font-medium text-blue-600 hover:underline cursor-pointer mb-1"
                                    onClick={() => toggleAnalysisExpansion(analysis)}
                                  >
                                    {analysis.url}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {analysis.keyword} • Position #{analysis.position}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-center">
                                  <div className="text-sm text-gray-500">Volume</div>
                                  <div className="font-medium">{analysis.volume.toLocaleString()}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-gray-500">Ideas</div>
                                  <div 
                                    className="cursor-pointer"
                                    onClick={() => toggleAnalysisExpansion(analysis)}
                                  >
                                    <Badge variant="default">{analysis.ideas || 0} ideas</Badge>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-gray-500">Last Update</div>
                                  <div className="text-sm">{formatDate(new Date(analysis.lastUpdated || ''))}</div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toggleAnalysisExpansion(analysis)}
                                  >
                                    {isExpanded ? '▲' : '▼'}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleRerunAnalysis(analysis)}
                                    disabled={isLoading}
                                  >
                                    🔄
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => analysis.id && removeAnalysis(analysis.id)}
                                  >
                                    🗑️
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="border-t bg-gray-50 p-6">
                                <h4 className="font-semibold text-lg mb-4">Optimization Ideas for {analysis.keyword}</h4>
                                {ideas.length === 0 ? (
                                  <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-gray-600">Loading detailed optimization ideas...</p>
                                  </div>
                                ) : (
                                  <div className="space-y-6">
                                    {ideas.map((idea: any, ideaIndex: number) => (
                                      <div key={ideaIndex} className="bg-white border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <Badge 
                                              variant={
                                                idea.priority === "high" ? "destructive" :
                                                idea.priority === "medium" ? "warning" : "secondary"
                                              }
                                              className="text-xs"
                                            >
                                              {idea.priority} priority
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                              {idea.category}
                                            </Badge>
                                          </div>
                                          <Badge 
                                            variant={
                                              idea.difficulty === "easy" ? "success" :
                                              idea.difficulty === "medium" ? "warning" : "destructive"
                                            }
                                            className="text-xs"
                                          >
                                            {idea.difficulty}
                                          </Badge>
                                        </div>
                                        
                                        <h5 className="font-medium text-gray-900 mb-2">{idea.title}</h5>
                                        <p className="text-sm text-gray-600 mb-4">{idea.description}</p>
                                        
                                        <div className="grid gap-4 md:grid-cols-2">
                                          <div className="bg-red-50 border border-red-200 rounded p-3">
                                            <div className="font-medium text-red-800 mb-2">Current State</div>
                                            <div className="text-sm text-red-700">{idea.currentState}</div>
                                          </div>
                                          <div className="bg-green-50 border border-green-200 rounded p-3">
                                            <div className="font-medium text-green-800 mb-2">Proposed Solution</div>
                                            <div className="text-sm text-green-700">{idea.proposedSolution}</div>
                                          </div>
                                        </div>
                                        
                                        {idea.alternatives && idea.alternatives.length > 0 && (
                                          <div className="mt-4">
                                            <div className="font-medium text-gray-900 mb-2">Alternative Options:</div>
                                            <div className="space-y-2">
                                              {idea.alternatives.map((alt: string, altIndex: number) => (
                                                <div key={altIndex} className="bg-blue-50 border border-blue-200 rounded p-2">
                                                  <div className="text-sm text-blue-700">{alt}</div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                          <span>Impact: {idea.impact}</span>
                                          <span>Effort: {idea.effort}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top 10 Benchmarking Tab */}
          {onPageTab === "top-10-benchmarking" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SERP Analysis for Your Target Keywords</CardTitle>
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Filter by keyword"
                      value={analysisKeyword}
                      onChange={(e) => setAnalysisKeyword(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analyses
                      .filter(analysis => 
                        !analysisKeyword || 
                        analysis.keyword.toLowerCase().includes(analysisKeyword.toLowerCase())
                      )
                      .map((analysis, index) => (
                        <div key={index} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{analysis.keyword}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Volume {analysis.volume.toLocaleString()}</span>
                                <span>Position #{analysis.position}</span>
                                <span className="text-blue-600">{analysis.url}</span>
                              </div>
                            </div>
                            <Button size="sm">View full analysis</Button>
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-4">
                            {Object.entries(analysis.benchmarks).map(([key, data]) => {
                              const statusColor = getStatusColor(data.status);
                              
                              return (
                                <div key={key} className={`p-3 border rounded-lg ${statusColor}`}>
                                  <div className="font-medium text-sm capitalize mb-2">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </div>
                                  <div className="text-xs space-y-1">
                                    <div>Top 10 avg: {data.topAvg}</div>
                                    <div className="font-medium">
                                      Your page: {data.yourPage}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {index < analyses.length - 1 && <hr className="my-6" />}
                        </div>
                      ))}
                      
                    {analyses.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">📊</div>
                        <p className="text-gray-600">Run some analyses to see SERP benchmarking data</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Idea Tasks Tab */}
          {onPageTab === "idea-tasks" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Optimization Ideas & Tasks</CardTitle>
                    <Button variant="outline" size="sm">📄 Export to PDF</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {ideas.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-gray-600 mb-4">No optimization ideas yet.</p>
                      <p className="text-sm text-gray-500 mb-6">Run some page analyses to generate optimization recommendations.</p>
                      <Button onClick={() => setShowAddAnalysis(true)}>🔍 Add New Analysis</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-sm text-gray-600">All</span>
                        <Badge variant="outline">{ideas.length}</Badge>
                        <span className="text-sm text-gray-600">To do</span>
                        <Badge variant="outline">{ideas.filter(i => i.status === "pending").length}</Badge>
                        <span className="text-sm text-gray-600">In Progress</span>
                        <Badge variant="outline">{ideas.filter(i => i.status === "in-progress").length}</Badge>
                        <span className="text-sm text-gray-600">Done</span>
                        <Badge variant="outline">{ideas.filter(i => i.status === "completed").length}</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {ideas.map((idea) => (
                          <div key={idea.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <Badge 
                                variant={
                                  idea.category === "Semantic" ? "default" :
                                  idea.category === "Content" ? "success" :
                                  idea.category === "Backlinks" ? "warning" : "secondary"
                                }
                                className="text-xs"
                              >
                                {idea.category}
                              </Badge>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{idea.title}</div>
                                <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                                  {idea.page}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {idea.description}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="text-sm text-gray-500">Priority</div>
                                <Badge 
                                  variant={
                                    idea.priority === "high" ? "destructive" :
                                    idea.priority === "medium" ? "warning" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {idea.priority}
                                </Badge>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500">Status</div>
                                <select
                                  value={idea.status}
                                  onChange={(e) => updateIdeaStatus(idea.id, e.target.value as any)}
                                  className="text-xs px-2 py-1 border rounded"
                                >
                                  <option value="pending">To Do</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="completed">Done</option>
                                </select>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500">Discovered</div>
                                <div className="text-sm">{formatDate(new Date(idea.discoveredDate))}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Client</h3>
            <p className="text-gray-600 mb-6">Choose a client from the dropdown above to view their on-page SEO analysis</p>
            <p className="text-sm text-gray-500">Note: Legacy tier clients have limited on-page SEO features</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}