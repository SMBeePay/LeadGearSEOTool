"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui/simple-components";

interface KeywordRanking {
  id: string;
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  bestPosition: number;
  url: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  traffic: number;
  trend: "up" | "down" | "stable";
  positionChange: number;
  serpFeatures: string[];
  lastChecked: Date;
}

interface KeywordGroup {
  name: string;
  count: number;
  avgPosition: number;
}

interface KeywordTrackingDashboardProps {
  clientId: string;
  clientName: string;
  onBack: () => void;
}

export function KeywordTrackingDashboard({ clientId, clientName, onBack }: KeywordTrackingDashboardProps) {
  const [keywords, setKeywords] = useState<KeywordRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterTrend, setFilterTrend] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [showAddKeywordModal, setShowAddKeywordModal] = useState(false);

  useEffect(() => {
    async function loadKeywords() {
      try {
        const response = await fetch(`/api/keywords/track?clientId=${clientId}`);
        if (response.ok) {
          const data = await response.json();
          setKeywords(data.keywords || []);
        }
      } catch (error) {
        console.error('Failed to load keywords:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadKeywords();
  }, [clientId]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "📈";
      case "down": return "📉";
      case "stable": return "➡️";
      default: return "➡️";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      case "stable": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return "text-green-600 bg-green-50";
    if (position <= 10) return "text-blue-600 bg-blue-50";
    if (position <= 20) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getPositionLabel = (position: number) => {
    if (position <= 3) return "Top 3";
    if (position <= 10) return "Top 10";
    if (position <= 20) return "Top 20";
    if (position <= 50) return "Top 50";
    return "50+";
  };

  const filteredKeywords = keywords.filter(kw => {
    const positionMatch = 
      filterPosition === "all" ||
      (filterPosition === "top3" && kw.currentPosition <= 3) ||
      (filterPosition === "top10" && kw.currentPosition <= 10) ||
      (filterPosition === "page1" && kw.currentPosition <= 10) ||
      (filterPosition === "page2" && kw.currentPosition > 10 && kw.currentPosition <= 20) ||
      (filterPosition === "opportunities" && kw.currentPosition > 10 && kw.currentPosition <= 20);
    
    const trendMatch = filterTrend === "all" || kw.trend === filterTrend;
    
    const searchMatch = searchQuery === "" || 
      kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kw.url.toLowerCase().includes(searchQuery.toLowerCase());
    
    return positionMatch && trendMatch && searchMatch;
  });

  const stats = {
    total: keywords.length,
    top3: keywords.filter(k => k.currentPosition <= 3).length,
    top10: keywords.filter(k => k.currentPosition <= 10).length,
    page1: keywords.filter(k => k.currentPosition <= 10).length,
    improved: keywords.filter(k => k.trend === "up").length,
    declined: keywords.filter(k => k.trend === "down").length,
    avgPosition: keywords.length > 0 
      ? Math.round(keywords.reduce((sum, k) => sum + k.currentPosition, 0) / keywords.length)
      : 0,
    totalTraffic: keywords.reduce((sum, k) => sum + k.traffic, 0)
  };

  const exportToCSV = () => {
    const headers = ["Keyword", "Position", "Change", "Best Position", "URL", "Search Volume", "Difficulty", "CPC", "Traffic", "SERP Features", "Last Checked"];
    const rows = filteredKeywords.map(kw => [
      kw.keyword,
      kw.currentPosition,
      kw.positionChange,
      kw.bestPosition,
      kw.url,
      kw.searchVolume,
      kw.difficulty,
      kw.cpc,
      kw.traffic,
      kw.serpFeatures.join("; "),
      new Date(kw.lastChecked).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clientName}-keywords-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Keyword Tracking</h2>
          <p className="text-sm text-gray-500">{clientName} - Monitor Rankings & Find Opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddKeywordModal(true)}>
            ➕ Add Keywords
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            📥 Export CSV
          </Button>
          <Button size="sm">
            🔄 Run Rank Check
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-8">
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Keywords</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.top3}</div>
            <div className="text-xs text-gray-600">Top 3</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.top10}</div>
            <div className="text-xs text-gray-600">Top 10</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.page1}</div>
            <div className="text-xs text-gray-600">Page 1</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-green-600 mb-1">+{stats.improved}</div>
            <div className="text-xs text-gray-600">Improved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-red-600 mb-1">-{stats.declined}</div>
            <div className="text-xs text-gray-600">Declined</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-orange-600 mb-1">{stats.avgPosition}</div>
            <div className="text-xs text-gray-600">Avg Position</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalTraffic}</div>
            <div className="text-xs text-gray-600">Est. Traffic</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter & Search</CardTitle>
            <div className="text-sm text-gray-500">{filteredKeywords.length} keywords shown</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Positions</option>
                <option value="top3">Top 3 Only</option>
                <option value="top10">Top 10 Only</option>
                <option value="page1">Page 1 (1-10)</option>
                <option value="page2">Page 2 (11-20)</option>
                <option value="opportunities">Opportunities (11-20)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trend</label>
              <select
                value={filterTrend}
                onChange={(e) => setFilterTrend(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Trends</option>
                <option value="up">Improved ↑</option>
                <option value="down">Declined ↓</option>
                <option value="stable">Stable →</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search keywords or URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyword Rankings</CardTitle>
          <CardDescription>Click any keyword to see historical ranking data and SERP features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredKeywords.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">🔍 No keywords found</p>
                <p className="text-sm">Try adjusting your filters or add keywords to track.</p>
              </div>
            ) : (
              filteredKeywords.map((kw) => (
                <div
                  key={kw.id}
                  className="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer bg-white"
                  onClick={() => setSelectedKeyword(selectedKeyword === kw.id ? null : kw.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{kw.keyword}</h3>
                        <Badge className={`text-xs ${getPositionColor(kw.currentPosition)}`}>
                          #{kw.currentPosition}
                        </Badge>
                        <span className={`text-xl ${getTrendColor(kw.trend)}`}>
                          {getTrendIcon(kw.trend)}
                        </span>
                        {kw.positionChange !== 0 && (
                          <span className={`text-xs font-semibold ${getTrendColor(kw.trend)}`}>
                            {kw.positionChange > 0 ? '+' : ''}{kw.positionChange}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-blue-600 hover:underline mb-2">
                        {kw.url}
                      </div>

                      <div className="grid grid-cols-5 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">Volume:</span>
                          <span className="ml-1 font-medium">{kw.searchVolume.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Difficulty:</span>
                          <span className="ml-1 font-medium">{kw.difficulty}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">CPC:</span>
                          <span className="ml-1 font-medium">${kw.cpc.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Traffic:</span>
                          <span className="ml-1 font-medium">{kw.traffic}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Best:</span>
                          <span className="ml-1 font-medium">#{kw.bestPosition}</span>
                        </div>
                      </div>

                      {kw.serpFeatures.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {kw.serpFeatures.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <span className="text-2xl">{selectedKeyword === kw.id ? "−" : "+"}</span>
                    </div>
                  </div>

                  {selectedKeyword === kw.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Position History</h4>
                          <div className="text-sm text-gray-600">
                            <p>Current: #{kw.currentPosition}</p>
                            <p>Previous: #{kw.previousPosition}</p>
                            <p>Best Ever: #{kw.bestPosition}</p>
                            <p>Change: {kw.positionChange > 0 ? '+' : ''}{kw.positionChange} positions</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Opportunity Score</h4>
                          <div className="text-sm text-gray-600">
                            <p>Search Volume: {kw.searchVolume.toLocaleString()}/mo</p>
                            <p>Est. Traffic: {kw.traffic} visits/mo</p>
                            <p>Traffic Value: ${(kw.traffic * kw.cpc).toFixed(2)}/mo</p>
                            <p>Last Checked: {new Date(kw.lastChecked).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          📊 View SERP
                        </Button>
                        <Button size="sm" variant="outline">
                          📈 View Chart
                        </Button>
                        <Button size="sm" variant="outline">
                          🎯 Optimize Content
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(kw.url, "_blank")}>
                          🔗 View Page
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
