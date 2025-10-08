"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui/simple-components";

interface ContentBrief {
  id: string;
  keyword: string;
  targetWordCount: number;
  status: string;
  createdAt: Date;
  briefStructure: {
    primaryKeyword: string;
    relatedKeywords: string[];
    targetWordCount: number;
    recommendedSections: Array<{
      title: string;
      description: string;
      priority: string;
    }>;
    questionsToAnswer: string[];
    internalLinkSuggestions: string[];
    metaRecommendations: {
      title: string;
      description: string;
    };
    competitorInsights: Array<{
      url: string;
      rank: number;
      wordCount: number;
      keyStrengths: string[];
    }>;
  };
}

interface ContentBriefGeneratorProps {
  clientId: string;
  clientName: string;
  clientWebsite: string;
  onBack: () => void;
}

export function ContentBriefGenerator({ 
  clientId,
  onBack 
}: ContentBriefGeneratorProps) {
  const [keyword, setKeyword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentBrief, setCurrentBrief] = useState<ContentBrief | null>(null);
  const [savedBriefs, setSavedBriefs] = useState<ContentBrief[]>([]);
  const [view, setView] = useState<"generator" | "brief">("generator");

  const generateBrief = async () => {
    if (!keyword) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/briefs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          keyword
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentBrief(data);
        setView("brief");
      }
    } catch (error) {
      console.error('Failed to generate brief:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSavedBriefs = async () => {
    try {
      const response = await fetch(`/api/briefs?clientId=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setSavedBriefs(data.briefs || []);
      }
    } catch (error) {
      console.error('Failed to load briefs:', error);
    }
  };

  const updateBriefStatus = async (briefId: string, status: string) => {
    try {
      await fetch(`/api/briefs/${briefId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadSavedBriefs();
    } catch (error) {
      console.error('Failed to update brief:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-700";
      case "approved": return "bg-green-100 text-green-700";
      case "in-progress": return "bg-blue-100 text-blue-700";
      case "published": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "🔴";
      case "medium": return "🟡";
      case "low": return "🟢";
      default: return "⚪";
    }
  };

  if (view === "brief" && currentBrief) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="outline" size="sm" onClick={() => setView("generator")} className="mb-2">
            ← Back to Generator
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Content Brief: {currentBrief.keyword}</h2>
              <p className="text-sm text-gray-500">
                Target: {currentBrief.targetWordCount} words • Created {new Date(currentBrief.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className={getStatusColor(currentBrief.status)}>
              {currentBrief.status}
            </Badge>
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>📝 Meta Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Title</label>
                <div className="p-3 bg-white rounded border border-blue-200 text-sm">
                  {currentBrief.briefStructure.metaRecommendations.title}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Description</label>
                <div className="p-3 bg-white rounded border border-blue-200 text-sm">
                  {currentBrief.briefStructure.metaRecommendations.description}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Primary: </span>
                <Badge className="bg-blue-100 text-blue-700">{currentBrief.briefStructure.primaryKeyword}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Related: </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {currentBrief.briefStructure.relatedKeywords.map((kw, index) => (
                    <Badge key={index} variant="secondary">{kw}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Recommended Content Structure</CardTitle>
            <CardDescription>Sections to include based on top-ranking content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentBrief.briefStructure.recommendedSections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{getPriorityIcon(section.priority)}</span>
                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>❓ Questions to Answer</CardTitle>
            <CardDescription>Based on &quot;People Also Ask&quot; and competitor content</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentBrief.briefStructure.questionsToAnswer.map((question, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-sm text-gray-700">{question}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔗 Internal Linking Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentBrief.briefStructure.internalLinkSuggestions.map((link, index) => (
                <li key={index} className="text-sm text-blue-600 hover:underline cursor-pointer">
                  {link}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔍 Competitor Insights</CardTitle>
            <CardDescription>Top 3 ranking pages analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentBrief.briefStructure.competitorInsights.map((comp, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      #{comp.rank} - {comp.url}
                    </a>
                    <span className="text-sm text-gray-600">{comp.wordCount} words</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {comp.keyStrengths.map((strength, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{strength}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button size="sm">📄 Export as PDF</Button>
          <Button size="sm" variant="outline">📋 Copy to Clipboard</Button>
          <Button size="sm" variant="outline" onClick={() => updateBriefStatus(currentBrief.id, "approved")}>
            ✅ Mark Approved
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
          ← Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Content Brief Generator</h2>
        <p className="text-sm text-gray-500">
          Generate AI-powered content briefs based on SERP analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Brief</CardTitle>
          <CardDescription>Enter a target keyword to analyze and create a comprehensive content brief</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Keyword</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., artificial turf maintenance tips"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button 
              onClick={generateBrief}
              disabled={isGenerating || !keyword}
              className="w-full"
            >
              {isGenerating ? '⏳ Generating Brief...' : '✨ Generate Content Brief'}
            </Button>

            <div className="text-xs text-gray-500 mt-2">
              <p>This will analyze:</p>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Top 10 ranking pages for the keyword</li>
                <li>Common content sections and structure</li>
                <li>Related keywords and topics</li>
                <li>People Also Ask questions</li>
                <li>Target word count and formatting</li>
              </ul>
              <p className="mt-2 text-blue-600">Est. API Cost: $5-7</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Saved Briefs</CardTitle>
            <Button size="sm" variant="outline" onClick={loadSavedBriefs}>
              🔄 Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {savedBriefs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No saved briefs yet</p>
              <p className="text-sm mt-1">Generate your first brief above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedBriefs.map((brief) => (
                <div key={brief.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{brief.keyword}</div>
                    <div className="text-sm text-gray-500">
                      {brief.targetWordCount} words • {new Date(brief.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(brief.status)}>{brief.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => {
                      setCurrentBrief(brief);
                      setView("brief");
                    }}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
