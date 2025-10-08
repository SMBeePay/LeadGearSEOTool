"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui/simple-components";

interface KeywordGap {
  keyword: string;
  clientRank: number | null;
  competitorRank: number;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  gapType: string;
  opportunity: number;
}

interface KeywordGapAnalysisProps {
  clientId: string;
  clientName: string;
  clientWebsite: string;
  competitor: {
    id: string;
    domain: string;
    name: string;
  };
  onBack: () => void;
}

export function KeywordGapAnalysis({ 
  clientId, 
  clientName, 
  clientWebsite,
  competitor,
  onBack 
}: KeywordGapAnalysisProps) {
  const [gaps, setGaps] = useState<KeywordGap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("opportunity");

  const analyzeGaps = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gaps/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientWebsite,
          competitorId: competitor.id,
          competitorDomain: competitor.domain
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGaps(data.gaps || []);
      }
    } catch (error) {
      console.error('Failed to analyze gaps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGapTypeBadge = (gapType: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      "missing": { label: "Missing", color: "bg-red-100 text-red-700" },
      "behind": { label: "Behind", color: "bg-yellow-100 text-yellow-700" },
      "ahead": { label: "Ahead", color: "bg-green-100 text-green-700" }
    };
    return badges[gapType] || badges["missing"];
  };

  const filteredGaps = gaps
    .filter(gap => {
      if (filterType === "all") return true;
      return gap.gapType === filterType;
    })
    .sort((a, b) => {
      if (sortBy === "opportunity") return b.opportunity - a.opportunity;
      if (sortBy === "volume") return b.searchVolume - a.searchVolume;
      if (sortBy === "difficulty") return a.difficulty - b.difficulty;
      if (sortBy === "value") return (b.searchVolume * b.cpc) - (a.searchVolume * a.cpc);
      return 0;
    });

  const stats = {
    total: gaps.length,
    missing: gaps.filter(g => g.gapType === "missing").length,
    behind: gaps.filter(g => g.gapType === "behind").length,
    ahead: gaps.filter(g => g.gapType === "ahead").length,
    avgOpportunity: gaps.length > 0 
      ? Math.round(gaps.reduce((sum, g) => sum + g.opportunity, 0) / gaps.length)
      : 0
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
          ← Back to Competitors
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Keyword Gap Analysis</h2>
        <p className="text-sm text-gray-500">
          {clientName} vs {competitor.name} - Identify keyword opportunities
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Gaps</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-red-600 mb-1">{stats.missing}</div>
            <div className="text-xs text-gray-600">Missing Keywords</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.behind}</div>
            <div className="text-xs text-gray-600">Rank Behind</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.ahead}</div>
            <div className="text-xs text-gray-600">Rank Ahead</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.avgOpportunity}</div>
            <div className="text-xs text-gray-600">Avg Opportunity</div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gap Analysis</CardTitle>
              <CardDescription>Find keywords where {competitor.name} outranks you</CardDescription>
            </div>
            <Button 
              onClick={analyzeGaps}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Analyzing...' : '🔍 Run Analysis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Gaps</option>
                <option value="missing">Missing (Not Ranking)</option>
                <option value="behind">Behind (Lower Rank)</option>
                <option value="ahead">Ahead (Higher Rank)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="opportunity">Opportunity Score</option>
                <option value="volume">Search Volume</option>
                <option value="value">Traffic Value</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap List */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Gaps</CardTitle>
          <CardDescription>{filteredGaps.length} opportunities found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredGaps.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">🔍 No gaps analyzed yet</p>
                <p className="text-sm">Click &quot;Run Analysis&quot; to find keyword opportunities.</p>
              </div>
            ) : (
              filteredGaps.map((gap, index) => {
                const badge = getGapTypeBadge(gap.gapType);
                const trafficValue = gap.searchVolume * gap.cpc;
                
                return (
                  <div key={index} className="border rounded-lg p-4 hover:border-blue-300 transition-colors bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{gap.keyword}</h3>
                          <Badge className={`text-xs ${badge.color}`}>
                            {badge.label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-4 text-xs mb-3">
                          <div>
                            <span className="text-gray-500 block">Your Rank</span>
                            <span className="font-medium text-gray-900">
                              {gap.clientRank ? `#${gap.clientRank}` : 'Not Ranking'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Their Rank</span>
                            <span className="font-medium text-blue-600">#{gap.competitorRank}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Search Volume</span>
                            <span className="font-medium text-gray-900">{gap.searchVolume.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Difficulty</span>
                            <span className="font-medium text-gray-900">{gap.difficulty}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">CPC</span>
                            <span className="font-medium text-gray-900">${gap.cpc.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Traffic Value</span>
                            <span className="font-medium text-purple-600">${trafficValue.toFixed(0)}/mo</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Opportunity</span>
                            <span className="font-medium text-green-600">{gap.opportunity}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">Opportunity Score</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full" 
                                style={{ width: `${gap.opportunity}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button size="sm" variant="outline">
                        🎯 Track Keyword
                      </Button>
                      <Button size="sm" variant="outline">
                        📊 View SERP
                      </Button>
                      <Button size="sm" variant="outline">
                        ✍️ Create Content
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Gap Types Explained</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Missing:</strong> Keywords your competitor ranks for but you don&apos;t</p>
            <p>• <strong>Behind:</strong> Keywords where you rank lower than your competitor</p>
            <p>• <strong>Ahead:</strong> Keywords where you rank higher (protect these!)</p>
            <p>• <strong>Opportunity Score:</strong> Based on volume, difficulty, and rank difference</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
