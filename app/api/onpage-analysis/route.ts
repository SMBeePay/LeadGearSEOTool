import { NextRequest, NextResponse } from 'next/server';

interface OnPageAnalysisRequest {
  url: string;
  keyword: string;
  location?: string;
  language?: string;
}

interface OnPageAnalysisResult {
  url: string;
  keyword: string;
  volume: number;
  position: number;
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

// Mock DataForSEO integration - replace with real API calls
async function analyzePageWithDataForSEO(request: OnPageAnalysisRequest): Promise<OnPageAnalysisResult> {
  // This would make real DataForSEO API calls
  // For now, we'll simulate realistic analysis based on the URL and keyword
  
  const mockAnalysis: OnPageAnalysisResult = {
    url: request.url,
    keyword: request.keyword,
    volume: Math.floor(Math.random() * 10000) + 1000,
    position: Math.floor(Math.random() * 100) + 1,
    benchmarks: {
      contentLength: {
        topAvg: Math.floor(Math.random() * 1000) + 500,
        yourPage: Math.floor(Math.random() * 1000) + 300,
        status: Math.random() > 0.5 ? "good" : Math.random() > 0.5 ? "warning" : "error"
      },
      referringDomains: {
        topAvg: Math.floor(Math.random() * 100) + 50,
        yourPage: Math.floor(Math.random() * 50),
        status: Math.random() > 0.5 ? "good" : Math.random() > 0.5 ? "warning" : "error"
      },
      videoUsage: {
        topAvg: Math.random() > 0.5 ? "yes" : "no",
        yourPage: Math.random() > 0.5 ? "yes" : "no",
        status: "good"
      },
      keywordUsage: {
        topAvg: "Title, Meta, H1, Body",
        yourPage: Math.random() > 0.5 ? "Title, H1, Body" : "Title, Meta, H1, Body",
        status: Math.random() > 0.3 ? "good" : "warning"
      },
      orderedList: {
        topAvg: Math.random() > 0.5 ? "yes" : "no",
        yourPage: Math.random() > 0.5 ? "yes" : "no",
        status: "good"
      },
      markups: {
        topAvg: "WebPage, Organization",
        yourPage: Math.random() > 0.5 ? "WebPage" : "no",
        status: Math.random() > 0.5 ? "good" : "error"
      },
      readability: {
        topAvg: Math.floor(Math.random() * 30) + 30,
        yourPage: Math.floor(Math.random() * 30) + 30,
        status: Math.random() > 0.5 ? "good" : "warning"
      }
    }
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockAnalysis;
}

export async function POST(request: NextRequest) {
  try {
    const body: OnPageAnalysisRequest = await request.json();
    
    if (!body.url || !body.keyword) {
      return NextResponse.json(
        { error: 'URL and keyword are required' },
        { status: 400 }
      );
    }

    const analysis = await analyzePageWithDataForSEO(body);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in on-page analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze page' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving saved analyses
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'Client ID is required' },
      { status: 400 }
    );
  }

  // Mock saved analyses - in real app, this would come from database
  const mockSavedAnalyses = [
    {
      id: '1',
      clientId,
      url: 'https://example.com',
      keyword: 'example keyword',
      volume: 5400,
      position: 25,
      lastUpdated: new Date().toISOString(),
      ideas: 7
    }
  ];

  return NextResponse.json(mockSavedAnalyses);
}