import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get('clientId');
  const website = searchParams.get('website');
  
  if (!clientId || !website) {
    return NextResponse.json(
      { error: 'Client ID and website are required' },
      { status: 400 }
    );
  }

  try {
    let totalApiCost = 0;
    const suggestions: string[] = [];

    const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '');

    const competitorsResponse = await fetch('http://localhost:3333/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'mcp__dataforseo-simple__dataforseo_labs_google_competitors_domain',
        params: {
          target: domain,
          location_name: 'United States',
          language_code: 'en',
          limit: 10,
          exclude_top_domains: true
        }
      })
    });

    if (competitorsResponse.ok) {
      const data = await competitorsResponse.json();
      const items = data?.result?.items || [];
      
      for (const item of items) {
        const competitorDomain = item.domain;
        if (competitorDomain && competitorDomain !== domain) {
          suggestions.push(competitorDomain);
        }
      }
      
      totalApiCost += 2.0;
    }

    const existingCompetitors = await prisma.competitor.findMany({
      where: { clientId },
      select: { domain: true }
    });

    const existingDomains = new Set(existingCompetitors.map(c => c.domain));
    const filteredSuggestions = suggestions
      .filter(d => !existingDomains.has(d))
      .slice(0, 5);

    await prisma.apiUsage.create({
      data: {
        clientId,
        endpoint: 'competitor-discovery',
        cost: totalApiCost
      }
    });

    return NextResponse.json({
      suggestions: filteredSuggestions,
      apiCost: totalApiCost
    });
  } catch (error) {
    console.error('Error discovering competitors:', error);
    return NextResponse.json(
      { error: 'Failed to discover competitors' },
      { status: 500 }
    );
  }
}
