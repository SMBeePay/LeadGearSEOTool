import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorId } = body;
    
    if (!competitorId) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    const competitor = await prisma.competitor.findUnique({
      where: { id: competitorId }
    });

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    let totalApiCost = 0;

    const domainAnalysisResponse = await fetch('http://localhost:3333/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'mcp__dataforseo-simple__dataforseo_labs_google_domain_rank_overview',
        params: {
          target: competitor.domain,
          location_name: 'United States',
          language_code: 'en'
        }
      })
    });

    let organicKeywords = 0;
    let organicTraffic = 0;
    let paidKeywords = 0;
    let domainRating = 0;

    if (domainAnalysisResponse.ok) {
      const data = await domainAnalysisResponse.json();
      const metrics = data?.result?.items?.[0]?.metrics;
      
      if (metrics) {
        organicKeywords = metrics.organic?.count || 0;
        organicTraffic = metrics.organic?.etv || 0;
        paidKeywords = metrics.paid?.count || 0;
      }
      
      totalApiCost += 0.5;
    }

    const backlinksResponse = await fetch('http://localhost:3333/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'mcp__dataforseo-simple__backlinks_bulk_ranks',
        params: {
          targets: [competitor.domain]
        }
      })
    });

    let backlinks = 0;
    let referringDomains = 0;

    if (backlinksResponse.ok) {
      const data = await backlinksResponse.json();
      const item = data?.result?.items?.[0];
      
      if (item) {
        backlinks = item.backlinks || 0;
        referringDomains = item.referring_domains || 0;
        domainRating = item.rank || 0;
      }
      
      totalApiCost += 0.1;
    }

    await prisma.competitorSnapshot.create({
      data: {
        competitorId: competitor.id,
        organicKeywords,
        organicTraffic,
        paidKeywords,
        backlinks,
        referringDomains,
        domainRating
      }
    });

    await prisma.competitor.update({
      where: { id: competitor.id },
      data: {
        lastAnalysis: new Date()
      }
    });

    await prisma.apiUsage.create({
      data: {
        clientId: competitor.clientId,
        endpoint: 'competitor-analysis',
        cost: totalApiCost
      }
    });

    return NextResponse.json({
      success: true,
      snapshot: {
        organicKeywords,
        organicTraffic,
        paidKeywords,
        backlinks,
        referringDomains,
        domainRating
      },
      apiCost: totalApiCost
    });
  } catch (error) {
    console.error('Error analyzing competitor:', error);
    return NextResponse.json(
      { error: 'Failed to analyze competitor' },
      { status: 500 }
    );
  }
}
