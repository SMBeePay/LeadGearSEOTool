"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui/simple-components";
import { formatDate } from "@/lib/utils";

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

interface KeywordData {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  cpc: number;
  traffic: number;
  url: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface CompetitorData {
  domain: string;
  commonKeywords: number;
  organicTraffic: number;
  organicKeywords: number;
  competitionLevel: number;
  overlap: number;
}

interface BacklinkData {
  totalBacklinks: number;
  referringDomains: number;
  followLinks: number;
  nofollowLinks: number;
  textBacklinks: number;
  imageBacklinks: number;
  domainAuthority: number;
  toxicityScore: number;
  newBacklinks: number;
  lostBacklinks: number;
}

interface TrafficData {
  totalTraffic: number;
  trafficValue: number;
  organicKeywords: number;
  paidKeywords: number;
  monthlyTraffic: Array<{
    month: string;
    traffic: number;
    value: number;
  }>;
  topPages: Array<{
    url: string;
    traffic: number;
    keywords: number;
    value: number;
  }>;
}

interface TechnicalSEO {
  totalPages: number;
  errors: number;
  warnings: number;
  notices: number;
  crawlDepth: number;
  loadTime: number;
  mobileScore: number;
  httpsScore: number;
  issues: Array<{
    type: 'error' | 'warning' | 'notice';
    category: string;
    title: string;
    count: number;
    description: string;
  }>;
}

interface DomainAnalysisResult {
  domain: string;
  traffic: TrafficData;
  keywords: KeywordData[];
  competitors: CompetitorData[];
  backlinks: BacklinkData;
  technicalSEO: TechnicalSEO;
  lastUpdated: string;
}

interface SEODomainDashboardProps {
  client: Client;
  onBack: () => void;
}

export function SEODomainDashboard({ client, onBack }: SEODomainDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [analysis, setAnalysis] = useState<DomainAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDomainAnalysis();
  }, [client]);

  const loadDomainAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/domain-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: client.website,
          location: 'Dallas, Texas, United States',
          language: 'en'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load domain analysis');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
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
            <h2 className="text-xl font-semibold text-gray-900">Loading Analysis...</h2>
            <p className="text-sm text-gray-500">Analyzing {client.name}</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Gathering SEO data for {client.website}</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments...</p>
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
            <Button onClick={loadDomainAnalysis}>Try Again</Button>
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
            <h2 className="text-xl font-semibold text-gray-900">{client.name} - SEO Analysis</h2>
            <p className="text-sm text-gray-500">
              {analysis.domain} • Last updated: {formatDate(new Date(analysis.lastUpdated))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getTierBadgeVariant(client.serviceTier)}>
            {client.serviceTier}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadDomainAnalysis}>
            🔄 Refresh
          </Button>
          <Button size="sm">📊 Export Report</Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8">
          {["overview", "organic-research", "competitors", "backlinks", "technical-seo"].map((tab) => (
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
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Organic Traffic</CardTitle>
                <span className="text-2xl">📈</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.traffic.totalTraffic.toLocaleString()}</div>
                <p className="text-xs text-gray-500">monthly visits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Traffic Value</CardTitle>
                <span className="text-2xl">💰</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analysis.traffic.trafficValue.toLocaleString()}</div>
                <p className="text-xs text-gray-500">estimated monthly value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Organic Keywords</CardTitle>
                <span className="text-2xl">🔑</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.traffic.organicKeywords.toLocaleString()}</div>
                <p className="text-xs text-gray-500">ranking keywords</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Backlinks</CardTitle>
                <span className="text-2xl">🔗</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.backlinks.totalBacklinks.toLocaleString()}</div>
                <p className="text-xs text-gray-500">total backlinks</p>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Trend & Top Pages */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Trend (6 months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.traffic.monthlyTraffic.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(month.traffic / Math.max(...analysis.traffic.monthlyTraffic.map(m => m.traffic))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right">
                          {month.traffic.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages by Traffic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.traffic.topPages.map((page, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="font-medium text-blue-600 hover:underline cursor-pointer text-sm">
                        {page.url}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>Traffic: {page.traffic.toLocaleString()}</span>
                        <span>Keywords: {page.keywords}</span>
                        <span>Value: ${page.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Technical Health */}
          <Card>
            <CardHeader>
              <CardTitle>Technical SEO Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analysis.technicalSEO.errors}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{analysis.technicalSEO.warnings}</div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.technicalSEO.mobileScore}</div>
                  <div className="text-sm text-gray-600">Mobile Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.technicalSEO.loadTime}s</div>
                  <div className="text-sm text-gray-600">Load Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Organic Research Tab */}
      {activeTab === "organic-research" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Organic Keywords</CardTitle>
              <CardDescription>Keywords driving the most traffic to your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{keyword.keyword}</div>
                      <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                        {keyword.url}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Position</div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">#{keyword.position}</span>
                          <span className={`text-xs ${getTrendColor(keyword.trend)}`}>
                            {getTrendIcon(keyword.trend)}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Volume</div>
                        <div className="font-medium">{keyword.volume.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Traffic</div>
                        <div className="font-medium">{keyword.traffic.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">CPC</div>
                        <div className="font-medium">${keyword.cpc}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">KD</div>
                        <div className="font-medium">{keyword.difficulty}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Competitors Tab */}
      {activeTab === "competitors" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Main Organic Competitors</CardTitle>
              <CardDescription>Domains competing for similar keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-blue-600 hover:underline cursor-pointer">
                        {competitor.domain}
                      </div>
                      <div className="text-sm text-gray-500">
                        {competitor.overlap}% keyword overlap
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Common Keywords</div>
                        <div className="font-medium">{competitor.commonKeywords.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">SE Keywords</div>
                        <div className="font-medium">{competitor.organicKeywords.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">SE Traffic</div>
                        <div className="font-medium">{competitor.organicTraffic.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Competition</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${competitor.competitionLevel}%` }}
                          ></div>
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

      {/* Backlinks Tab */}
      {activeTab === "backlinks" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{analysis.backlinks.totalBacklinks.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Backlinks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{analysis.backlinks.referringDomains.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Referring Domains</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{analysis.backlinks.domainAuthority}</div>
                <div className="text-sm text-gray-600">Domain Authority</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{analysis.backlinks.toxicityScore}%</div>
                <div className="text-sm text-gray-600">Toxicity Score</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Backlink Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Follow Links</span>
                    <span className="font-medium">{analysis.backlinks.followLinks.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">NoFollow Links</span>
                    <span className="font-medium">{analysis.backlinks.nofollowLinks.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Text Backlinks</span>
                    <span className="font-medium">{analysis.backlinks.textBacklinks.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Image Backlinks</span>
                    <span className="font-medium">{analysis.backlinks.imageBacklinks.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">New Backlinks</div>
                      <div className="text-sm text-green-600">Last 30 days</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      +{analysis.backlinks.newBacklinks}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-red-800">Lost Backlinks</div>
                      <div className="text-sm text-red-600">Last 30 days</div>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      -{analysis.backlinks.lostBacklinks}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Technical SEO Tab */}
      {activeTab === "technical-seo" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{analysis.technicalSEO.totalPages.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Pages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{analysis.technicalSEO.errors}</div>
                <div className="text-sm text-gray-600">Critical Errors</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{analysis.technicalSEO.warnings}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">{analysis.technicalSEO.notices}</div>
                <div className="text-sm text-gray-600">Notices</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Technical Issues</CardTitle>
              <CardDescription>Issues that may impact your SEO performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.technicalSEO.issues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={
                          issue.type === "error" ? "destructive" :
                          issue.type === "warning" ? "warning" : "secondary"
                        }
                        className="text-xs"
                      >
                        {issue.type}
                      </Badge>
                      <div>
                        <div className="font-medium text-gray-900">{issue.title}</div>
                        <div className="text-sm text-gray-500">{issue.description}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{issue.count}</div>
                      <div className="text-xs text-gray-500">{issue.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Page Load Time</span>
                    <span className="font-medium">{analysis.technicalSEO.loadTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Crawl Depth</span>
                    <span className="font-medium">{analysis.technicalSEO.crawlDepth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mobile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analysis.technicalSEO.mobileScore}
                  </div>
                  <div className="text-sm text-gray-600">Mobile Score</div>
                  <Progress value={analysis.technicalSEO.mobileScore} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analysis.technicalSEO.httpsScore}
                  </div>
                  <div className="text-sm text-gray-600">HTTPS Score</div>
                  <Progress value={analysis.technicalSEO.httpsScore} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}