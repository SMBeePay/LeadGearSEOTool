"use client";

import { useState, useCallback } from 'react';

export interface OnPageAnalysis {
  id?: string;
  url: string;
  keyword: string;
  volume: number;
  position: number;
  lastUpdated?: string;
  ideas?: number;
  benchmarks: {
    contentLength: { topAvg: number; yourPage: number; status: "good" | "warning" | "error" };
    referringDomains: { topAvg: number; yourPage: number; status: "good" | "warning" | "error" };
    videoUsage: { topAvg: string; yourPage: string; status: "good" | "warning" | "error" };
    keywordUsage: { topAvg: string; yourPage: string; status: "good" | "warning" | "error" };
    orderedList: { topAvg: string; yourPage: string; status: "good" | "warning" | "error" };
    markups: { topAvg: string; yourPage: string; status: "good" | "warning" | "error" };
    readability: { topAvg: number; yourPage: number; status: "good" | "warning" | "error" };
  };
}

export interface OnPageIdea {
  id: string;
  category: "Strategy" | "SERP Features" | "Backlinks" | "Semantic" | "Content" | "User Experience" | "Technical SEO";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  page: string;
  keywords: string[];
  volume: number;
  status: "pending" | "in-progress" | "completed";
  difficulty: "easy" | "medium" | "hard";
  discoveredDate: string;
}

export interface OnPageOverview {
  totalIdeas: number;
  categoryBreakdown: Record<string, number>;
  trafficPotential: {
    current: number;
    potential: number;
    improvement: string;
  };
  topPages: Array<{
    url: string;
    priority: "high" | "medium" | "low";
    volume: number;
    ideas: number;
  }>;
}

export function useOnPageSEO(clientId: string | null) {
  const [analyses, setAnalyses] = useState<OnPageAnalysis[]>([]);
  const [ideas, setIdeas] = useState<OnPageIdea[]>([]);
  const [overview, setOverview] = useState<OnPageOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (url: string, keyword: string) => {
    if (!clientId) {
      setError('No client selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onpage-analysis', {
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
        throw new Error('Failed to analyze page');
      }

      const analysis: OnPageAnalysis = await response.json();
      analysis.id = Date.now().toString();
      analysis.lastUpdated = new Date().toISOString();
      analysis.ideas = Math.floor(Math.random() * 10) + 3;

      setAnalyses(prev => {
        const filtered = prev.filter(a => !(a.url === url && a.keyword === keyword));
        return [analysis, ...filtered];
      });

      // Generate mock ideas for this analysis
      const mockIdeas = generateMockIdeas(url, keyword, analysis.volume);
      setIdeas(prev => [...mockIdeas, ...prev.filter(idea => idea.page !== url)]);
      
      // Update overview
      updateOverview();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  const generateMockIdeas = (url: string, keyword: string, volume: number): OnPageIdea[] => {
    const categories: OnPageIdea['category'][] = [
      "Content", "Semantic", "Backlinks", "Technical SEO", "SERP Features"
    ];
    
    const ideaTemplates = [
      { category: "Content", title: "Expand content length to match top competitors", description: "Add more comprehensive information to reach the average content length of top-ranking pages." },
      { category: "Semantic", title: "Add related keywords and phrases", description: "Include semantically related terms to improve content relevance and topical authority." },
      { category: "Backlinks", title: "Earn more quality backlinks", description: "Increase the number of referring domains to match competitor link profiles." },
      { category: "Technical SEO", title: "Implement structured data markup", description: "Add schema markup to enhance search engine understanding and enable rich snippets." },
      { category: "SERP Features", title: "Optimize for featured snippets", description: "Structure content to target featured snippet opportunities for this keyword." },
      { category: "Content", title: "Improve readability score", description: "Enhance content readability to match or exceed top-ranking pages." },
      { category: "Content", title: "Update meta description", description: "Write a more compelling and keyword-optimized meta description." }
    ];

    return ideaTemplates.slice(0, Math.floor(Math.random() * 5) + 3).map((template, index) => ({
      id: `${Date.now()}-${index}`,
      category: template.category,
      title: template.title,
      description: template.description,
      priority: Math.random() > 0.6 ? "high" : Math.random() > 0.3 ? "medium" : "low",
      page: url,
      keywords: [keyword],
      volume,
      status: "pending",
      difficulty: Math.random() > 0.5 ? "easy" : Math.random() > 0.5 ? "medium" : "hard",
      discoveredDate: new Date().toISOString()
    }));
  };

  const updateOverview = useCallback(() => {
    if (analyses.length === 0) return;

    const categoryBreakdown: Record<string, number> = {};
    ideas.forEach(idea => {
      categoryBreakdown[idea.category] = (categoryBreakdown[idea.category] || 0) + 1;
    });

    const totalVolume = analyses.reduce((sum, analysis) => sum + analysis.volume, 0);
    const topPages = analyses.slice(0, 4).map(analysis => ({
      url: analysis.url,
      priority: analysis.position > 50 ? "high" : analysis.position > 20 ? "medium" : "low",
      volume: analysis.volume,
      ideas: ideas.filter(idea => idea.page === analysis.url).length
    }));

    setOverview({
      totalIdeas: ideas.length,
      categoryBreakdown,
      trafficPotential: {
        current: Math.floor(totalVolume * 0.1),
        potential: totalVolume * 2,
        improvement: "200%+"
      },
      topPages
    });
  }, [analyses, ideas]);

  const loadSavedAnalyses = useCallback(async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/onpage-analysis?clientId=${clientId}`);
      if (response.ok) {
        const savedAnalyses = await response.json();
        setAnalyses(savedAnalyses);
      }
    } catch (err) {
      console.error('Failed to load saved analyses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  const updateIdeaStatus = useCallback((ideaId: string, status: OnPageIdea['status']) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId ? { ...idea, status } : idea
    ));
  }, []);

  const removeAnalysis = useCallback((analysisId: string) => {
    setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
    setIdeas(prev => prev.filter(idea => !analyses.find(a => a.id === analysisId && a.url === idea.page)));
  }, [analyses]);

  return {
    analyses,
    ideas,
    overview,
    isLoading,
    error,
    runAnalysis,
    loadSavedAnalyses,
    updateIdeaStatus,
    removeAnalysis,
    clearError: () => setError(null)
  };
}