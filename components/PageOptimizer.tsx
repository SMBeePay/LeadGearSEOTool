"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui/simple-components";

interface OptimizationRecommendation {
  category: string;
  priority: "high" | "medium" | "low";
  title: string;
  current: string;
  recommended: string;
  impact: string;
}

interface CompetitorPageData {
  url: string;
  rank: number;
  wordCount: number;
  titleLength: number;
  descLength: number;
  headings: {
    h1: number;
    h2: number;
    h3: number;
  };
  internalLinks: number;
  externalLinks: number;
  images: number;
}

interface PageAnalysis {
  url: string;
  targetKeyword: string;
  currentScore: number;
  wordCount: number;
  titleLength: number;
  descLength: number;
  headings: {
    h1: number;
    h2: number;
    h3: number;
  };
  internalLinks: number;
  externalLinks: number;
  images: number;
  missingAltTags: number;
  readabilityScore: number;
  recommendations: OptimizationRecommendation[];
  competitors: CompetitorPageData[];
  competitorAverages: {
    wordCount: number;
    titleLength: number;
    descLength: number;
    h2Count: number;
    internalLinks: number;
    images: number;
  };
}

interface PageOptimizerProps {
  clientId: string;
  clientName: string;
  clientWebsite: string;
  onBack: () => void;
}

export function PageOptimizer({ clientId, clientName, clientWebsite, onBack }: PageOptimizerProps) {
  const [url, setUrl] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PageAnalysis | null>(null);

  const analyzePage = async () => {
    if (!url || !targetKeyword) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/optimization/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          url,
          targetKeyword
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Failed to analyze page:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
          ← Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Page Optimizer</h2>
        <p className="text-sm text-gray-500">
          Analyze and optimize your pages against top-ranking competitors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Page</CardTitle>
          <CardDescription>Enter a URL and target keyword to get optimization recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Keyword</label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="e.g., artificial turf maintenance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button 
              onClick={analyzePage}
              disabled={isAnalyzing || !url || !targetKeyword}
              className="w-full"
            >
              {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze Page'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="px-4 py-6">
                <div className={`text-3xl font-bold mb-1 ${getScoreColor(analysis.currentScore)}`}>
                  {analysis.currentScore}
                </div>
                <div className="text-xs text-gray-600">Overall Score</div>
                <Progress value={analysis.currentScore} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="px-4 py-6">
                <div className="text-2xl font-bold text-gray-900 mb-1">{analysis.wordCount}</div>
                <div className="text-xs text-gray-600">Word Count</div>
                <div className="text-xs text-blue-600 mt-1">
                  Target: {analysis.competitorAverages.wordCount}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="px-4 py-6">
                <div className="text-2xl font-bold text-gray-900 mb-1">{analysis.headings.h2}</div>
                <div className="text-xs text-gray-600">H2 Headings</div>
                <div className="text-xs text-blue-600 mt-1">
                  Target: {analysis.competitorAverages.h2Count}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="px-4 py-6">
                <div className="text-2xl font-bold text-gray-900 mb-1">{analysis.readabilityScore}</div>
                <div className="text-xs text-gray-600">Readability</div>
                <div className="text-xs text-gray-500 mt-1">Flesch score</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>{analysis.recommendations.length} recommendations to improve ranking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-600">{rec.category}</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">{rec.impact}</span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                    
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 min-w-20">Current:</span>
                        <span className="text-gray-700">{rec.current}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 min-w-20">Recommended:</span>
                        <span className="text-gray-700">{rec.recommended}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competitor Comparison</CardTitle>
              <CardDescription>How your page compares to top 10 ranking pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Rank</th>
                      <th className="text-left py-2 px-2">URL</th>
                      <th className="text-right py-2 px-2">Words</th>
                      <th className="text-right py-2 px-2">H2s</th>
                      <th className="text-right py-2 px-2">Links</th>
                      <th className="text-right py-2 px-2">Images</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.competitors.map((comp, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium text-blue-600">#{comp.rank}</td>
                        <td className="py-2 px-2 text-gray-700 truncate max-w-xs">{comp.url}</td>
                        <td className="py-2 px-2 text-right">{comp.wordCount}</td>
                        <td className="py-2 px-2 text-right">{comp.headings.h2}</td>
                        <td className="py-2 px-2 text-right">{comp.internalLinks}</td>
                        <td className="py-2 px-2 text-right">{comp.images}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 bg-blue-50">
                    <tr>
                      <td className="py-2 px-2 font-bold" colSpan={2}>Average</td>
                      <td className="py-2 px-2 text-right font-bold">{analysis.competitorAverages.wordCount}</td>
                      <td className="py-2 px-2 text-right font-bold">{analysis.competitorAverages.h2Count}</td>
                      <td className="py-2 px-2 text-right font-bold">{analysis.competitorAverages.internalLinks}</td>
                      <td className="py-2 px-2 text-right font-bold">{analysis.competitorAverages.images}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button size="sm">📄 Export Report</Button>
            <Button size="sm" variant="outline">📋 Create Task</Button>
            <Button size="sm" variant="outline">✍️ Generate Content Brief</Button>
          </div>
        </>
      )}
    </div>
  );
}
