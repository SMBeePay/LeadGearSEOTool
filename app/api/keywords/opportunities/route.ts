import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

function calculateOpportunityScore(
  searchVolume: number,
  currentPosition: number,
  difficulty: number,
  cpc: number
): number {
  const positionWeight = currentPosition > 10 && currentPosition <= 20 ? 2 : 1;
  const volumeScore = Math.min(searchVolume / 1000, 100);
  const difficultyPenalty = (100 - difficulty) / 100;
  const valueBonus = Math.min(cpc * 10, 50);
  
  const score = (volumeScore * positionWeight * difficultyPenalty) + valueBonus;
  return Math.min(Math.round(score), 100);
}

function getOpportunityReason(
  currentPosition: number,
  searchVolume: number,
  difficulty: number,
  trafficValue: number
): string {
  if (currentPosition > 10 && currentPosition <= 20) return "quick-win";
  if (trafficValue > 100) return "high-value";
  if (difficulty < 50) return "low-hanging";
  if (searchVolume > 1000) return "high-value";
  return "quick-win";
}

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
    const opportunities: KeywordOpportunity[] = [];

    // Step 1: Get current ranked keywords for the domain
    const rankedKeywordsResponse = await fetch('http://localhost:3333/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'mcp__dataforseo-simple__dataforseo_labs_google_ranked_keywords',
        params: {
          target: website.replace(/^https?:\/\//, '').replace(/^www\./, ''),
          location_name: 'United States',
          language_code: 'en',
          filters: [
            ["ranked_serp_element.serp_item.rank_group", ">", 10],
            "and",
            ["ranked_serp_element.serp_item.rank_group", "<=", 20]
          ],
          limit: 50,
          order_by: ["keyword_data.keyword_info.search_volume,desc"]
        }
      })
    });

    if (rankedKeywordsResponse.ok) {
      const rankedData = await rankedKeywordsResponse.json();
      const items = rankedData?.result?.items || [];
      totalApiCost += 2.0;

      for (const item of items) {
        const keyword = item.keyword_data?.keyword || '';
        const searchVolume = item.keyword_data?.keyword_info?.search_volume || 0;
        const cpc = item.keyword_data?.keyword_info?.cpc || 0;
        const competition = item.keyword_data?.keyword_info?.competition || 0;
        const difficulty = Math.round(competition * 100);
        const currentPosition = item.ranked_serp_element?.serp_item?.rank_group || 100;

        // Calculate potential traffic if we move to position 1-3
        const currentCTR = 0.005; // ~0.5% for positions 11-20
        const targetCTR = 0.20; // ~20% for positions 1-3
        const potentialTraffic = Math.round(searchVolume * (targetCTR - currentCTR));
        const trafficValue = potentialTraffic * cpc;

        const opportunityScore = calculateOpportunityScore(
          searchVolume,
          currentPosition,
          difficulty,
          cpc
        );

        const reason = getOpportunityReason(
          currentPosition,
          searchVolume,
          difficulty,
          trafficValue
        );

        if (opportunityScore > 30 && searchVolume > 50) {
          opportunities.push({
            keyword,
            currentPosition,
            searchVolume,
            difficulty,
            cpc,
            potentialTraffic,
            trafficValue,
            competitorCount: Math.round(competition * 100),
            opportunityScore,
            reason
          });
        }
      }
    }

    // Step 2: Get related keywords with high volume but no current ranking
    if (opportunities.length < 20) {
      const relatedKeywordsResponse = await fetch('http://localhost:3333/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'mcp__dataforseo-simple__dataforseo_labs_google_keyword_ideas',
          params: {
            keywords: opportunities.slice(0, 3).map(o => o.keyword),
            location_name: 'United States',
            language_code: 'en',
            filters: [
              ["keyword_info.search_volume", ">", 100],
              "and",
              ["keyword_info.competition", "<", 0.7]
            ],
            limit: 30,
            order_by: ["keyword_info.search_volume,desc"]
          }
        })
      });

      if (relatedKeywordsResponse.ok) {
        const relatedData = await relatedKeywordsResponse.json();
        const items = relatedData?.result?.items || [];
        totalApiCost += 1.0;

        for (const item of items) {
          const keyword = item.keyword || '';
          const searchVolume = item.keyword_info?.search_volume || 0;
          const cpc = item.keyword_info?.cpc || 0;
          const competition = item.keyword_info?.competition || 0;
          const difficulty = Math.round(competition * 100);

          // These are keywords we don't rank for yet
          const currentPosition = 100;
          const potentialTraffic = Math.round(searchVolume * 0.15); // Assume 15% CTR if we rank top 3
          const trafficValue = potentialTraffic * cpc;

          const opportunityScore = calculateOpportunityScore(
            searchVolume,
            50, // Weight as medium opportunity since we don't rank yet
            difficulty,
            cpc
          );

          if (opportunityScore > 40 && searchVolume > 200) {
            opportunities.push({
              keyword,
              currentPosition,
              searchVolume,
              difficulty,
              cpc,
              potentialTraffic,
              trafficValue,
              competitorCount: Math.round(competition * 100),
              opportunityScore,
              reason: "competitor-gap"
            });
          }
        }
      }
    }

    // Track API usage
    await prisma.apiUsage.create({
      data: {
        clientId,
        endpoint: 'keyword-opportunities',
        cost: totalApiCost
      }
    });

    // Sort by opportunity score and return top results
    const sortedOpportunities = opportunities
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 50);

    return NextResponse.json({
      opportunities: sortedOpportunities,
      apiCost: totalApiCost,
      totalFound: sortedOpportunities.length
    });

  } catch (error) {
    console.error('Error finding keyword opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to find opportunities' },
      { status: 500 }
    );
  }
}
