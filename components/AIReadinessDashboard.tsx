"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui/simple-components";
import { formatDate } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  website: string;
  industry: string;
  status: "active" | "inactive";
  serviceTier: "Pro" | "Business" | "Starter" | "Legacy";
}

interface AIIssue {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

interface AIRecommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
}

interface AIReadinessScore {
  category: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  description: string;
  issues: AIIssue[];
  recommendations: AIRecommendation[];
}

interface AIReadinessResult {
  url: string;
  overallScore: number;
  aiReadinessLevel: 'AI-Ready' | 'Partially Ready' | 'Needs Work' | 'Not Ready';
  categories: AIReadinessScore[];
  keyFindings: string[];
  priorityActions: AIRecommendation[];
  competitorComparison?: {
    yourScore: number;
    industryAverage: number;
    topPerformer: number;
  };
  lastAnalyzed: string;
}

interface AIReadinessDashboardProps {
  client: Client;
  onBack: () => void;
}

export function AIReadinessDashboard({ client, onBack }: AIReadinessDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [analysis, setAnalysis] = useState<AIReadinessResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAIReadinessAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-readiness-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: client.website,
          location: 'Dallas, Texas, United States',
          language: 'en'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load AI readiness analysis');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [client.website]);

  useEffect(() => {
    loadAIReadinessAnalysis();
  }, [loadAIReadinessAnalysis]);

  const getReadinessLevelColor = (level: AIReadinessResult['aiReadinessLevel']) => {
    switch (level) {
      case 'AI-Ready': return 'text-green-700 bg-green-100 border-green-300';
      case 'Partially Ready': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'Needs Work': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'Not Ready': return 'text-red-700 bg-red-100 border-red-300';
    }
  };

  const getStatusColor = (status: AIReadinessScore['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-100';
      case 'good': return 'text-blue-700 bg-blue-100';
      case 'needs-improvement': return 'text-yellow-700 bg-yellow-100';
      case 'critical': return 'text-red-700 bg-red-100';
    }
  };

  const getSeverityColor = (severity: AIIssue['severity']) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
    }
  };

  const getPriorityColor = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Readiness Analysis</h2>
            <p className="text-sm text-gray-500">Analyzing {client.name}</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing AI readiness for {client.website}</p>
            <p className="text-sm text-gray-500 mt-2">Checking structured data, content optimization, and voice search readiness...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Error Loading Analysis</h2>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-800 mb-4">{error}</p>
            <Button onClick={loadAIReadinessAnalysis}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{client.name} - AI Readiness Analysis</h2>
            <p className="text-sm text-gray-500">
              {analysis.url} • Last analyzed: {formatDate(new Date(analysis.lastAnalyzed))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getReadinessLevelColor(analysis.aiReadinessLevel)}`}>
            {analysis.aiReadinessLevel}
          </div>
          <Button variant="outline" size="sm" onClick={loadAIReadinessAnalysis}>
            🔄 Refresh
          </Button>
          <Button size="sm">📊 Export Report</Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{analysis.overallScore}/100</div>
              <div className="text-sm text-gray-600">AI Readiness Score</div>
              <Progress value={analysis.overallScore} className="mt-2" />
            </div>
            
            {analysis.competitorComparison && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 mb-2">{analysis.competitorComparison.industryAverage}/100</div>
                  <div className="text-sm text-gray-600">Industry Average</div>
                  <Progress value={analysis.competitorComparison.industryAverage} className="mt-2" />
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">{analysis.competitorComparison.topPerformer}/100</div>
                  <div className="text-sm text-gray-600">Top Performer</div>
                  <Progress value={analysis.competitorComparison.topPerformer} className="mt-2" />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8">
          {["overview", "categories", "recommendations", "priority-actions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
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
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Findings */}
          <Card>
            <CardHeader>
              <CardTitle>Key Findings</CardTitle>
              <CardDescription>Summary of your AI readiness assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.keyFindings.map((finding, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-700">{finding}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.categories.map((category, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{category.category}</CardTitle>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(category.status)}`}>
                    {category.status}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{category.score}/{category.maxScore}</span>
                    <span className="text-sm text-gray-500">
                      {Math.round((category.score / category.maxScore) * 100)}%
                    </span>
                  </div>
                  <Progress value={(category.score / category.maxScore) * 100} className="mb-2" />
                  <p className="text-xs text-gray-600">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {analysis.categories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{category.category}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{category.score}/{category.maxScore}</div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(category.status)}`}>
                      {category.status}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Issues */}
                  {category.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Issues Found</h4>
                      <div className="space-y-3">
                        {category.issues.map((issue, issueIndex) => (
                          <div key={issueIndex} className="border-l-4 border-red-400 pl-4 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                                {issue.severity}
                              </Badge>
                              <span className="font-medium text-gray-900">{issue.title}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{issue.description}</p>
                            <p className="text-xs text-gray-500">Impact: {issue.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {category.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                      <div className="space-y-3">
                        {category.recommendations.map((rec, recIndex) => (
                          <div key={recIndex} className="border-l-4 border-green-400 pl-4 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                                {rec.priority}
                              </Badge>
                              <span className="font-medium text-gray-900">{rec.title}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p><strong>Implementation:</strong> {rec.implementation}</p>
                              <p><strong>Expected Impact:</strong> {rec.expectedImpact}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Optimization Recommendations</CardTitle>
              <CardDescription>Complete list of improvements to enhance AI readiness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.categories.flatMap(category => 
                  category.recommendations.map((rec, index) => (
                    <div key={`${category.category}-${index}`} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {category.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-2">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="font-medium text-blue-800 mb-1">Implementation</div>
                          <div className="text-sm text-blue-700">{rec.implementation}</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="font-medium text-green-800 mb-1">Expected Impact</div>
                          <div className="text-sm text-green-700">{rec.expectedImpact}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Priority Actions Tab */}
      {activeTab === "priority-actions" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>High Priority Actions</CardTitle>
              <CardDescription>Critical improvements to implement first for maximum AI readiness impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.priorityActions.map((action, index) => (
                  <div key={index} className="border-l-4 border-red-400 pl-4 py-3 bg-red-50 rounded-r">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                        Priority #{index + 1}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        High Impact
                      </Badge>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                    <p className="text-sm text-gray-700 mb-3">{action.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">How to implement:</span>
                        <p className="text-gray-600">{action.implementation}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Expected outcome:</span>
                        <p className="text-gray-600">{action.expectedImpact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {analysis.priorityActions.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-gray-600">No high priority actions needed!</p>
                  <p className="text-sm text-gray-500">Your site is well-optimized for AI search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}