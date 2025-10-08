import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, keyword } = body;
    
    if (!clientId || !keyword) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let totalApiCost = 0;

    const serpResponse = await fetch('http://localhost:3333/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'mcp__dataforseo-simple__serp_organic_live_advanced',
        params: {
          keyword: keyword,
          location_name: 'United States',
          language_code: 'en',
          depth: 20,
          people_also_ask_click_depth: 3
        }
      })
    });

    const topCompetitors: Array<{
      url: string;
      rank: number;
      wordCount: number;
      h2Count: number;
      imagesCount: number;
      keyStrengths: string[];
    }> = [];
    let paaQuestions: string[] = [];
    
    if (serpResponse.ok) {
      const serpData = await serpResponse.json();
      const items = serpData?.result?.items?.[0]?.items || [];
      totalApiCost += 1.5;

      items.forEach((item: { type?: string; title?: string; items?: Array<{ title?: string }> }) => {
        if (item.type === 'people_also_ask') {
          const questions = item.items?.map((q: { title?: string }) => q.title).filter((t): t is string => Boolean(t)) || [];
          paaQuestions = [...paaQuestions, ...questions];
        }
      });

      for (const item of items.slice(0, 10) as Array<{ type?: string; url?: string; rank_group?: number; rank_absolute?: number }>) {
        if (item.type === 'organic' && item.url) {
          const pageAnalysisResponse = await fetch('http://localhost:3333/mcp/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'mcp__dataforseo-simple__on_page_instant_pages',
              params: {
                url: item.url
              }
            })
          });

          if (pageAnalysisResponse.ok) {
            const pageData = await pageAnalysisResponse.json();
            const page = pageData?.result?.items?.[0];
            if (page) {
              const strengths: string[] = [];
              const wordCount = page.meta?.content?.plain_text_word_count || 0;
              const h2Count = page.meta?.htags?.h2?.length || 0;
              const imagesCount = page.meta?.images_count || 0;
              
              if (wordCount > 2000) strengths.push("Comprehensive content");
              if (h2Count > 8) strengths.push("Well-structured");
              if (imagesCount > 5) strengths.push("Visual rich");
              if (page.meta?.internal_links_count > 10) strengths.push("Strong internal linking");

              topCompetitors.push({
                url: item.url,
                rank: item.rank_group || item.rank_absolute || 0,
                wordCount,
                h2Count,
                imagesCount,
                keyStrengths: strengths
              });
              totalApiCost += 0.5;
            }
          }

          if (topCompetitors.length >= 3) break;
        }
      }
    }

    const relatedKeywordsResponse = await fetch('http://localhost:3333/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'mcp__dataforseo-simple__dataforseo_labs_google_related_keywords',
        params: {
          keyword: keyword,
          location_name: 'United States',
          language_code: 'en',
          depth: 1,
          limit: 20
        }
      })
    });

    const relatedKeywords: string[] = [];
    if (relatedKeywordsResponse.ok) {
      const relatedData = await relatedKeywordsResponse.json();
      const items = relatedData?.result?.items || [];
      totalApiCost += 2.0;
      
      items.forEach((item: { keyword_data?: { keyword?: string } }) => {
        const kw = item.keyword_data?.keyword;
        if (kw && kw !== keyword) {
          relatedKeywords.push(kw);
        }
      });
    }

    const avgWordCount = topCompetitors.length > 0
      ? Math.round(topCompetitors.reduce((sum, c) => sum + c.wordCount, 0) / topCompetitors.length)
      : 2000;

    const recommendedSections = [
      {
        title: "Introduction",
        description: `Open with the main problem/question. Include primary keyword "${keyword}" in the first 100 words.`,
        priority: "high"
      },
      {
        title: `What is ${keyword}?`,
        description: "Define the topic clearly for readers who may be unfamiliar.",
        priority: "high"
      },
      {
        title: "Key Benefits/Features",
        description: "List the main advantages or important aspects. Use bullet points for readability.",
        priority: "high"
      },
      {
        title: "How-To / Step-by-Step Guide",
        description: "Provide actionable steps or instructions. Include visuals where possible.",
        priority: "high"
      },
      {
        title: "Common Mistakes to Avoid",
        description: "Address potential pitfalls or misconceptions.",
        priority: "medium"
      },
      {
        title: "Best Practices",
        description: "Share expert tips and recommendations.",
        priority: "medium"
      },
      {
        title: "FAQs",
        description: "Answer common questions (use PAA questions below).",
        priority: "medium"
      },
      {
        title: "Conclusion",
        description: "Summarize key points and include a clear call-to-action.",
        priority: "high"
      }
    ];

    const internalLinkSuggestions = [
      `/${keyword.toLowerCase().replace(/\s+/g, '-')}-guide`,
      `/${keyword.toLowerCase().split(' ')[0]}-services`,
      `/blog/${keyword.toLowerCase().replace(/\s+/g, '-')}`,
      `/resources/${keyword.toLowerCase().split(' ')[0]}`,
      `/contact-us`
    ];

    const briefStructure = {
      primaryKeyword: keyword,
      relatedKeywords: relatedKeywords.slice(0, 10),
      targetWordCount: avgWordCount,
      recommendedSections,
      questionsToAnswer: paaQuestions.slice(0, 8),
      internalLinkSuggestions,
      metaRecommendations: {
        title: `${keyword} - Complete Guide | ${new Date().getFullYear()}`,
        description: `Learn everything about ${keyword}. Expert tips, best practices, and actionable advice. ${avgWordCount}+ word comprehensive guide.`
      },
      competitorInsights: topCompetitors
    };

    const brief = await prisma.contentBrief.create({
      data: {
        clientId,
        keyword,
        targetWordCount: avgWordCount,
        briefData: JSON.stringify(briefStructure),
        serpAnalysis: JSON.stringify(topCompetitors),
        status: 'draft'
      }
    });

    await prisma.apiUsage.create({
      data: {
        clientId,
        endpoint: 'content-brief-generation',
        cost: totalApiCost
      }
    });

    return NextResponse.json({
      id: brief.id,
      keyword: brief.keyword,
      targetWordCount: brief.targetWordCount,
      status: brief.status,
      createdAt: brief.createdAt,
      briefStructure,
      apiCost: totalApiCost
    });
  } catch (error) {
    console.error('Error generating content brief:', error);
    return NextResponse.json(
      { error: 'Failed to generate content brief' },
      { status: 500 }
    );
  }
}
