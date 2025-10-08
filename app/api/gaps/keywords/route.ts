import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function calculateOpportunityScore(
  searchVolume: number,
  difficulty: number,
  clientRank: number | null,
  competitorRank: number
): number {
  const volumeScore = Math.min(searchVolume / 100, 100);
  const difficultyPenalty = (100 - difficulty) / 100;
  
  let rankBonus = 0;
  if (clientRank === null) {
    rankBonus = 50;
  } else {
    const rankDiff = clientRank - competitorRank;
    rankBonus = Math.min(rankDiff * 2, 50);
  }
  
  const score = (volumeScore * difficultyPenalty) + rankBonus;
  return Math.min(Math.max(Math.round(score), 0), 100);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, clientWebsite, competitorId, competitorDomain } = body;
    
    if (!clientId || !clientWebsite || !competitorId || !competitorDomain) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let totalApiCost = 0;
    const gaps: Array<{
      keyword: string;
      clientRank: number | null;
      competitorRank: number;
      searchVolume: number;
      difficulty: number;
      cpc: number;
      gapType: string;
      opportunity: number;
    }> = [];

    const clientDomain = clientWebsite.replace(/^https?:\/\//, '').replace(/^www\./, '');

    const competitorKeywordsResponse = await fetch('http://localhost:3333/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'mcp__dataforseo-simple__dataforseo_labs_google_ranked_keywords',
        params: {
          target: competitorDomain,
          location_name: 'United States',
          language_code: 'en',
          filters: [
            ["ranked_serp_element.serp_item.rank_group", "<=", 20]
          ],
          limit: 100,
          order_by: ["keyword_data.keyword_info.search_volume,desc"]
        }
      })
    });

    if (competitorKeywordsResponse.ok) {
      const compData = await competitorKeywordsResponse.json();
      const competitorKeywords = compData?.result?.items || [];
      totalApiCost += 2.0;

      const keywordList = competitorKeywords.map((item: any) => ({
        keyword: item.keyword_data?.keyword || '',
        competitorRank: item.ranked_serp_element?.serp_item?.rank_group || 100,
        searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
        difficulty: Math.round((item.keyword_data?.keyword_info?.competition || 0) * 100),
        cpc: item.keyword_data?.keyword_info?.cpc || 0
      }));

      const clientKeywordsResponse = await fetch('http://localhost:3333/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'mcp__dataforseo-simple__dataforseo_labs_google_ranked_keywords',
          params: {
            target: clientDomain,
            location_name: 'United States',
            language_code: 'en',
            limit: 100
          }
        })
      });

      let clientKeywordMap = new Map<string, number>();
      
      if (clientKeywordsResponse.ok) {
        const clientData = await clientKeywordsResponse.json();
        const clientKeywords = clientData?.result?.items || [];
        totalApiCost += 2.0;
        
        clientKeywords.forEach((item: any) => {
          const keyword = item.keyword_data?.keyword || '';
          const rank = item.ranked_serp_element?.serp_item?.rank_group || 100;
          clientKeywordMap.set(keyword, rank);
        });
      }

      for (const kw of keywordList) {
        if (!kw.keyword || kw.searchVolume < 50) continue;

        const clientRank = clientKeywordMap.get(kw.keyword) || null;
        
        let gapType = "missing";
        if (clientRank !== null) {
          if (clientRank > kw.competitorRank) {
            gapType = "behind";
          } else {
            gapType = "ahead";
          }
        }

        const opportunity = calculateOpportunityScore(
          kw.searchVolume,
          kw.difficulty,
          clientRank,
          kw.competitorRank
        );

        if (gapType !== "ahead" && opportunity > 20) {
          const gapData = {
            keyword: kw.keyword,
            clientRank,
            competitorRank: kw.competitorRank,
            searchVolume: kw.searchVolume,
            difficulty: kw.difficulty,
            cpc: kw.cpc,
            gapType,
            opportunity
          };

          gaps.push(gapData);

          await prisma.keywordGap.create({
            data: {
              clientId,
              competitorId,
              ...gapData
            }
          });
        }
      }
    }

    await prisma.apiUsage.create({
      data: {
        clientId,
        endpoint: 'keyword-gap-analysis',
        cost: totalApiCost
      }
    });

    gaps.sort((a, b) => b.opportunity - a.opportunity);

    return NextResponse.json({
      success: true,
      gaps: gaps.slice(0, 50),
      totalGaps: gaps.length,
      apiCost: totalApiCost
    });
  } catch (error) {
    console.error('Error analyzing keyword gaps:', error);
    return NextResponse.json(
      { error: 'Failed to analyze keyword gaps' },
      { status: 500 }
    );
  }
}
