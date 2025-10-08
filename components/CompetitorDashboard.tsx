"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui/simple-components";

interface Competitor {
  id: string;
  domain: string;
  name: string;
  addedAt: Date;
  lastAnalysis: Date | null;
  snapshot?: {
    organicKeywords: number;
    organicTraffic: number;
    paidKeywords: number;
    backlinks: number;
    referringDomains: number;
    domainRating: number;
  };
}

interface CompetitorDashboardProps {
  clientId: string;
  clientName: string;
  clientWebsite: string;
  onBack: () => void;
  onViewKeywordGap: (competitor: Competitor) => void;
}

export function CompetitorDashboard({ 
  clientId, 
  clientName, 
  clientWebsite,
  onBack,
  onViewKeywordGap 
}: CompetitorDashboardProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCompetitorDomain, setNewCompetitorDomain] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<string[]>([]);

  const loadCompetitors = async () => {
    try {
      const response = await fetch(`/api/competitors?clientId=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setCompetitors(data.competitors || []);
      }
    } catch (error) {
      console.error('Failed to load competitors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, [clientId]);

  const discoverCompetitors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/competitors/discover?clientId=${clientId}&website=${encodeURIComponent(clientWebsite)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestedCompetitors(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to discover competitors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCompetitor = async (domain: string) => {
    setIsAdding(true);
    try {
      const response = await fetch('/api/competitors/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          domain: domain.replace(/^https?:\/\//, '').replace(/^www\./, ''),
          name: domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0]
        })
      });
      
      if (response.ok) {
        setNewCompetitorDomain("");
        setSuggestedCompetitors(prev => prev.filter(d => d !== domain));
        await loadCompetitors();
      }
    } catch (error) {
      console.error('Failed to add competitor:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const analyzeCompetitor = async (competitorId: string) => {
    setIsAnalyzing(competitorId);
    try {
      const response = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorId })
      });
      
      if (response.ok) {
        await loadCompetitors();
      }
    } catch (error) {
      console.error('Failed to analyze competitor:', error);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const removeCompetitor = async (competitorId: string) => {
    if (!confirm('Remove this competitor? Gap analysis data will be preserved.')) return;
    
    try {
      const response = await fetch(`/api/competitors/${competitorId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadCompetitors();
      }
    } catch (error) {
      console.error('Failed to remove competitor:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
          ← Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Competitor Intelligence</h2>
        <p className="text-sm text-gray-500">{clientName} - Track and analyze your competition</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">{competitors.length}</div>
            <div className="text-xs text-gray-600">Competitors Tracked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {competitors.filter(c => c.lastAnalysis).length}
            </div>
            <div className="text-xs text-gray-600">Analyzed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {competitors.reduce((sum, c) => sum + (c.snapshot?.organicKeywords || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Competitor Keywords</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-6">
            <div className="text-2xl font-bold text-purple-600 mb-1">5</div>
            <div className="text-xs text-gray-600">Max Competitors</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Competitor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add Competitor</CardTitle>
              <CardDescription>Track up to 5 competitors for comprehensive analysis</CardDescription>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={discoverCompetitors}
              disabled={isLoading}
            >
              🔍 Discover Competitors
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="competitor-domain.com"
              value={newCompetitorDomain}
              onChange={(e) => setNewCompetitorDomain(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={competitors.length >= 5}
            />
            <Button 
              onClick={() => addCompetitor(newCompetitorDomain)}
              disabled={!newCompetitorDomain || competitors.length >= 5 || isAdding}
            >
              {isAdding ? '⏳ Adding...' : '➕ Add'}
            </Button>
          </div>

          {suggestedCompetitors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Suggested Competitors:</h4>
              <div className="flex flex-wrap gap-2">
                {suggestedCompetitors.map((domain) => (
                  <Button
                    key={domain}
                    size="sm"
                    variant="outline"
                    onClick={() => addCompetitor(domain)}
                    disabled={competitors.length >= 5}
                  >
                    + {domain}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competitor List */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked Competitors</CardTitle>
          <CardDescription>Monitor competitor performance and identify opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">🎯 No competitors tracked yet</p>
                <p className="text-sm">Add competitors above to start tracking their performance.</p>
              </div>
            ) : (
              competitors.map((competitor) => (
                <div key={competitor.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {competitor.domain}
                        </Badge>
                        {competitor.lastAnalysis && (
                          <Badge className="text-xs bg-green-100 text-green-700">
                            ✓ Analyzed
                          </Badge>
                        )}
                      </div>
                      
                      {competitor.snapshot && (
                        <div className="grid grid-cols-6 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500 block">Organic Keywords</span>
                            <span className="font-medium text-gray-900">{competitor.snapshot.organicKeywords.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Monthly Traffic</span>
                            <span className="font-medium text-gray-900">{competitor.snapshot.organicTraffic.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Paid Keywords</span>
                            <span className="font-medium text-gray-900">{competitor.snapshot.paidKeywords.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Backlinks</span>
                            <span className="font-medium text-gray-900">{competitor.snapshot.backlinks.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Ref. Domains</span>
                            <span className="font-medium text-gray-900">{competitor.snapshot.referringDomains.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Domain Rating</span>
                            <span className="font-medium text-gray-900">{competitor.snapshot.domainRating}</span>
                          </div>
                        </div>
                      )}

                      {!competitor.lastAnalysis && (
                        <p className="text-sm text-gray-500 mt-2">
                          Not yet analyzed - Click &quot;Analyze&quot; to fetch competitor data
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      size="sm"
                      onClick={() => analyzeCompetitor(competitor.id)}
                      disabled={isAnalyzing === competitor.id}
                    >
                      {isAnalyzing === competitor.id ? '⏳ Analyzing...' : '🔄 Analyze'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewKeywordGap(competitor)}
                      disabled={!competitor.lastAnalysis}
                    >
                      🎯 Keyword Gaps
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={!competitor.lastAnalysis}
                    >
                      📊 Content Gaps
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={!competitor.lastAnalysis}
                    >
                      🔗 Backlink Gaps
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => removeCompetitor(competitor.id)}
                    >
                      🗑️ Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Competitor Intelligence Tips</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Analyze Regularly:</strong> Run analysis weekly to track competitor changes</p>
            <p>• <strong>Keyword Gaps:</strong> Find keywords competitors rank for that you don&apos;t</p>
            <p>• <strong>Content Gaps:</strong> Discover topics competitors cover but you miss</p>
            <p>• <strong>Backlink Gaps:</strong> Identify link opportunities from competitor sources</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
