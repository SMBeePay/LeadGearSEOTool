"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui/simple-components";

interface KeywordOpportunity {
  keyword: string;
  currentPosition: number;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  potentialTraffic: number;
  trafficValue: number;
  competitorCount: number;
  opportunityScore: number;
  reason: string;
}

interface KeywordOpportunityFinderProps {
  clientId: string;
  clientName: string;
  clientWebsite: string;
  onBack?: () => void;
}

export function KeywordOpportunityFinder({ clientId, clientName, clientWebsite, onBack }: KeywordOpportunityFinderProps) {
  const [opportunities, setOpportunities] = useState<KeywordOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score");

  const loadOpportunities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/keywords/opportunities?clientId=${clientId}&website=${encodeURIComponent(clientWebsite)}`);
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOpportunityBadge = (reason: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      "quick-win": { label: "Quick Win", color: "bg-green-100 text-green-700" },
      "low-hanging": { label: "Low Hanging Fruit", color: "bg-yellow-100 text-yellow-700" },
      "high-value": { label: "High Value", color: "bg-purple-100 text-purple-700" },
      "competitor-gap": { label: "Competitor Gap", color: "bg-blue-100 text-blue-700" },
      "trending": { label: "Trending", color: "bg-orange-100 text-orange-700" }
    };
    return badges[reason] || badges["quick-win"];
  };

  const filteredOpportunities = opportunities
    .filter(opp => {
      if (filterType === "all") return true;
      if (filterType === "quick-wins") return opp.currentPosition > 10 && opp.currentPosition <= 20;
      if (filterType === "high-value") return opp.trafficValue > 100;
      if (filterType === "low-difficulty") return opp.difficulty < 50;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.opportunityScore - a.opportunityScore;
      if (sortBy === "traffic") return b.potentialTraffic - a.potentialTraffic;
      if (sortBy === "value") return b.trafficValue - a.trafficValue;
      if (sortBy === "position") return a.currentPosition - b.currentPosition;
      return 0;
    });

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back to Dashboard
        </Button>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>🎯 Keyword Opportunities</CardTitle>
              <CardDescription>Easy wins and high-value keywords to target for {clientName}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={loadOpportunities}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Analyzing...' : '🔍 Find Opportunities'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Opportunities</option>
                <option value="quick-wins">Quick Wins (Positions 11-20)</option>
                <option value="high-value">High Value ($100+ traffic value)</option>
                <option value="low-difficulty">Low Difficulty (&lt;50&#37;)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="score">Opportunity Score</option>
                <option value="traffic">Potential Traffic</option>
                <option value="value">Traffic Value</option>
                <option value="position">Current Position</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredOpportunities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">🔍 No opportunities found</p>
                <p className="text-sm">Click &quot;Find Opportunities&quot; to analyze keyword potential.</p>
              </div>
            ) : (
              filteredOpportunities.map((opp, index) => {
                const badge = getOpportunityBadge(opp.reason);
                
                return (
                  <div key={index} className="border rounded-lg p-4 hover:border-blue-300 transition-colors bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{opp.keyword}</h3>
                          <Badge className={`text-xs ${badge.color}`}>
                            {badge.label}
                          </Badge>
                          <Badge className="text-xs bg-gray-100 text-gray-700">
                            Position #{opp.currentPosition}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-6 gap-4 text-xs mb-3">
                          <div>
                            <span className="text-gray-500 block">Search Volume</span>
                            <span className="font-medium text-gray-900">{opp.searchVolume.toLocaleString()}/mo</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Difficulty</span>
                            <span className="font-medium text-gray-900">{opp.difficulty}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">CPC</span>
                            <span className="font-medium text-gray-900">${opp.cpc.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Potential Traffic</span>
                            <span className="font-medium text-green-600">+{opp.potentialTraffic}/mo</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Traffic Value</span>
                            <span className="font-medium text-purple-600">${opp.trafficValue.toFixed(0)}/mo</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Competitors</span>
                            <span className="font-medium text-gray-900">{opp.competitorCount}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">Opportunity Score</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" 
                                style={{ width: `${opp.opportunityScore}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-gray-900">{opp.opportunityScore}</span>
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
                      <Button size="sm" variant="outline">
                        🔍 Competitor Analysis
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
          <h4 className="font-semibold text-blue-900 mb-2">💡 How Opportunity Score Works</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Quick Wins (11-20):</strong> Already on page 2, small improvements can push to page 1</p>
            <p>• <strong>High Value:</strong> Keywords with significant search volume and traffic potential</p>
            <p>• <strong>Low Difficulty:</strong> Less competitive keywords easier to rank for</p>
            <p>• <strong>Score Formula:</strong> (Search Volume × CTR Potential) ÷ (Difficulty × Position)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
