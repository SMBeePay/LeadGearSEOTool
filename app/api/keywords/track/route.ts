import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RankCheckRequest {
  clientId: string;
  keywords: string[];
  location?: string;
  language?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'Client ID is required' },
      { status: 400 }
    );
  }

  try {
    const keywords = await prisma.keywordTracked.findMany({
      where: { clientId },
      include: {
        rankings: {
          orderBy: { checkedAt: 'desc' },
          take: 30
        }
      }
    });

    const keywordData = keywords.map(kw => {
      const latestRanking = kw.rankings[0];
      const previousRanking = kw.rankings[1];
      
      const currentPosition = latestRanking?.rank || 100;
      const previousPosition = previousRanking?.rank || currentPosition;
      const positionChange = previousPosition - currentPosition;
      
      let trend: "up" | "down" | "stable" = "stable";
      if (positionChange > 0) trend = "up";
      else if (positionChange < 0) trend = "down";

      const bestPosition = Math.min(
        ...kw.rankings.map(r => r.rank).filter(p => p > 0),
        currentPosition
      );

      return {
        id: kw.id,
        keyword: kw.keyword,
        currentPosition,
        previousPosition,
        bestPosition,
        url: latestRanking?.url || kw.url || '',
        searchVolume: kw.volume,
        difficulty: kw.difficulty,
        cpc: kw.cpc,
        traffic: latestRanking?.estimatedTraffic || 0,
        trend,
        positionChange,
        serpFeatures: latestRanking?.serpFeatures ? latestRanking.serpFeatures.split(', ').filter(Boolean) : [],
        lastChecked: latestRanking?.checkedAt || new Date()
      };
    });

    return NextResponse.json({ keywords: keywordData });
  } catch (error) {
    console.error('Error fetching keywords:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RankCheckRequest = await request.json();
    
    if (!body.clientId || !body.keywords || body.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Client ID and keywords are required' },
        { status: 400 }
      );
    }

    const location = body.location || 'United States';
    const language = body.language || 'en';
    let totalApiCost = 0;
    const results = [];

    for (const keyword of body.keywords) {
      try {
        // Check if keyword already exists
        let trackedKeyword = await prisma.keywordTracked.findFirst({
          where: {
            clientId: body.clientId,
            keyword: keyword
          }
        });

        // Get search volume and keyword data
        const keywordDataResponse = await fetch('http://localhost:3333/mcp/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'mcp__dataforseo-simple__dataforseo_labs_google_keyword_overview',
            params: {
              keywords: [keyword],
              location_name: location,
              language_code: language
            }
          })
        });

        let searchVolume = 0;
        let difficulty = 0;
        let cpc = 0;

        if (keywordDataResponse.ok) {
          const kwData = await keywordDataResponse.json();
          const kwInfo = kwData?.result?.items?.[0];
          if (kwInfo) {
            searchVolume = kwInfo.keyword_info?.search_volume || 0;
            difficulty = Math.round((kwInfo.keyword_info?.competition || 0) * 100);
            cpc = kwInfo.keyword_info?.cpc || 0;
          }
          totalApiCost += 0.02;
        }

        // Get current SERP rankings
        const serpResponse = await fetch('http://localhost:3333/mcp/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'mcp__dataforseo-simple__serp_organic_live_advanced',
            params: {
              keyword: keyword,
              location_name: location,
              language_code: language,
              depth: 50
            }
          })
        });

        let position = 100;
        let url = '';
        const serpFeatures: string[] = [];
        let estimatedTraffic = 0;

        if (serpResponse.ok) {
          const serpData = await serpResponse.json();
          const items = serpData?.result?.items?.[0]?.items || [];
          
          // Find client's ranking
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type === 'organic') {
              position = item.rank_group || (i + 1);
              url = item.url || '';
              
              // Check for SERP features
              if (item.featured_snippet) serpFeatures.push('Featured Snippet');
              if (item.faq) serpFeatures.push('FAQ');
              if (item.recipes) serpFeatures.push('Recipe');
              
              break;
            }
          }

          // Calculate estimated traffic based on CTR curve
          const ctrByPosition: Record<number, number> = {
            1: 0.315, 2: 0.159, 3: 0.101, 4: 0.072, 5: 0.053,
            6: 0.041, 7: 0.032, 8: 0.026, 9: 0.022, 10: 0.019
          };
          const ctr = position <= 10 ? (ctrByPosition[position] || 0.01) : 0.005;
          estimatedTraffic = Math.round(searchVolume * ctr);

          totalApiCost += 0.5;
        }

        // Create or update keyword tracking
        if (!trackedKeyword) {
          trackedKeyword = await prisma.keywordTracked.create({
            data: {
              clientId: body.clientId,
              keyword,
              volume: searchVolume,
              difficulty,
              cpc,
              url: url
            }
          });
        } else {
          await prisma.keywordTracked.update({
            where: { id: trackedKeyword.id },
            data: {
              volume: searchVolume,
              difficulty,
              cpc,
              url: url
            }
          });
        }

        // Store ranking history
        await prisma.rankingHistory.create({
          data: {
            keywordId: trackedKeyword.id,
            rank: position,
            url,
            serpFeatures: serpFeatures.length > 0 ? serpFeatures.join(', ') : null,
            estimatedTraffic
          }
        });

        results.push({
          keyword,
          position,
          url,
          searchVolume,
          difficulty,
          cpc,
          estimatedTraffic,
          serpFeatures
        });

      } catch (kwError) {
        console.error(`Error processing keyword "${keyword}":`, kwError);
        results.push({
          keyword,
          error: 'Failed to check ranking'
        });
      }
    }

    // Track API usage
    await prisma.apiUsage.create({
      data: {
        clientId: body.clientId,
        endpoint: 'keyword-tracking',
        cost: totalApiCost
      }
    });

    return NextResponse.json({
      success: true,
      results,
      apiCost: totalApiCost,
      keywordsChecked: body.keywords.length
    });

  } catch (error) {
    console.error('Error in keyword tracking:', error);
    return NextResponse.json(
      { error: 'Failed to process keyword tracking' },
      { status: 500 }
    );
  }
}
