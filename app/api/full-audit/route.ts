import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface FullAuditRequest {
  clientId: string;
  website: string;
  location?: string;
  language?: string;
}

interface OnPageResult {
  meta?: {
    title?: string;
    description?: string;
    htags?: {
      h1?: string[];
      h2?: string[];
      h3?: string[];
    };
    images_count?: number;
    content?: {
      plain_text_word_count?: number;
      flesch_kincaid_readability_index?: number;
    };
    internal_links_count?: number;
    external_links_count?: number;
  };
  page_timing?: {
    time_to_interactive?: number;
    dom_complete?: number;
  };
  checks?: Record<string, boolean | null>;
  url?: string;
}

async function runComprehensiveAudit(request: FullAuditRequest) {
  const startTime = Date.now();
  let totalApiCost = 0;

  console.log(`Starting comprehensive audit for ${request.website}`);

  try {
    // Step 1: On-Page Analysis using DataForSEO
    const onPageResponse = await fetch('http://localhost:3333/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'mcp__dataforseo-simple__on_page_instant_pages',
        params: { url: request.website }
      })
    });

    let onPageData: OnPageResult | null = null;
    if (onPageResponse.ok) {
      const result = await onPageResponse.json();
      onPageData = result?.result?.items?.[0] as OnPageResult | null;
      totalApiCost += 1.5; // Estimated cost
    }

    // Step 2: Lighthouse Performance Analysis
    const lighthouseResponse = await fetch('http://localhost:3333/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'mcp__dataforseo-simple__on_page_lighthouse',
        params: { url: request.website }
      })
    });

    let lighthouseData = null;
    if (lighthouseResponse.ok) {
      const result = await lighthouseResponse.json();
      lighthouseData = result?.result?.items?.[0];
      totalApiCost += 0.5;
    }

    // Calculate audit scores
    const technicalScore = calculateTechnicalScore(onPageData, lighthouseData);
    const contentScore = calculateContentScore(onPageData);
    const uxScore = calculateUXScore();
    const overallScore = Math.round((technicalScore + contentScore + uxScore) / 3);

    // Create audit run in database
    const auditRun = await prisma.auditRun.create({
      data: {
        clientId: request.clientId,
        overallScore,
        technicalScore,
        contentScore,
        backlinkScore: 0, // Will be calculated in Phase 3
        uxScore,
        apiCost: totalApiCost,
      }
    });

    // Extract and store technical issues
    const technicalIssues = extractTechnicalIssues(onPageData, lighthouseData, request.website);
    if (technicalIssues.length > 0) {
      await prisma.technicalIssue.createMany({
        data: technicalIssues.map(issue => ({
          auditId: auditRun.id,
          ...issue
        }))
      });
    }

    // Extract and store meta tag issues
    const metaTagIssues = extractMetaTagIssues(onPageData, request.website);
    if (metaTagIssues.length > 0) {
      await prisma.metaTag.createMany({
        data: metaTagIssues.map(tag => ({
          auditId: auditRun.id,
          ...tag
        }))
      });
    }

    // Extract and store content scores
    if (onPageData?.url) {
      await prisma.contentScore.create({
        data: {
          auditId: auditRun.id,
          pageUrl: onPageData.url,
          qualityScore: contentScore,
          readability: onPageData.meta?.content?.flesch_kincaid_readability_index || 0,
          wordCount: onPageData.meta?.content?.plain_text_word_count || 0,
          keywordDensity: 0, // Calculate based on target keywords
          internalLinks: onPageData.meta?.internal_links_count || 0,
          externalLinks: onPageData.meta?.external_links_count || 0,
          images: onPageData.meta?.images_count || 0,
          missingAltTags: 0, // Would need deeper analysis
          recommendations: generateContentRecommendations(onPageData)
        }
      });
    }

    // Track API usage
    await prisma.apiUsage.create({
      data: {
        clientId: request.clientId,
        endpoint: 'full-audit',
        cost: totalApiCost
      }
    });

    const duration = Date.now() - startTime;
    console.log(`Audit completed in ${duration}ms, API cost: $${totalApiCost.toFixed(2)}`);

    return {
      success: true,
      auditId: auditRun.id,
      overallScore,
      technicalScore,
      contentScore,
      uxScore,
      technicalIssuesCount: technicalIssues.length,
      metaTagIssuesCount: metaTagIssues.length,
      apiCost: totalApiCost,
      duration
    };

  } catch (error) {
    console.error('Audit error:', error);
    throw error;
  }
}

function calculateTechnicalScore(onPageData: OnPageResult | null, lighthouseData: Record<string, unknown> | null): number {
  let score = 100;
  
  if (!onPageData) return 50;

  // Check critical technical factors
  const checks = onPageData.checks || {};
  
  if (checks.no_title === false) score -= 10;
  if (checks.no_description === false) score -= 10;
  if (checks.no_h1_tag === false) score -= 5;
  if (checks.is_https === false) score -= 15;
  if (checks.is_redirect === true) score -= 5;
  if (checks.canonical === false) score -= 5;
  
  // Page speed
  const loadTime = onPageData.page_timing?.time_to_interactive || 5000;
  if (loadTime > 3000) score -= 10;
  if (loadTime > 5000) score -= 10;

  return Math.max(score, 0);
}

function calculateContentScore(onPageData: OnPageResult | null): number {
  let score = 100;
  
  if (!onPageData?.meta) return 50;

  const wordCount = onPageData.meta.content?.plain_text_word_count || 0;
  if (wordCount < 300) score -= 20;
  else if (wordCount < 600) score -= 10;

  if (!onPageData.meta.title) score -= 15;
  else if (onPageData.meta.title.length < 30) score -= 10;
  else if (onPageData.meta.title.length > 60) score -= 5;

  if (!onPageData.meta.description) score -= 15;
  else if (onPageData.meta.description.length < 120) score -= 10;
  else if (onPageData.meta.description.length > 160) score -= 5;

  if (!onPageData.meta.htags?.h1 || onPageData.meta.htags.h1.length === 0) score -= 10;

  return Math.max(score, 0);
}

function calculateUXScore(): number {
  const score = 85; // Default good score
  
  // Would calculate based on Lighthouse metrics:
  // - First Contentful Paint
  // - Largest Contentful Paint
  // - Cumulative Layout Shift
  // - Time to Interactive
  
  return score;
}

function extractTechnicalIssues(onPageData: OnPageResult | null, lighthouseData: Record<string, unknown> | null, url: string) {
  const issues: Array<{
    issueType: string;
    severity: string;
    category: string;
    title: string;
    description: string;
    url: string;
    howToFix: string;
  }> = [];

  if (!onPageData) return issues;

  const checks = onPageData.checks || {};

  // Missing title
  if (checks.no_title === false || !onPageData.meta?.title) {
    issues.push({
      issueType: 'missing-title',
      severity: 'error',
      category: 'Meta Tags',
      title: 'Missing Title Tag',
      description: 'This page does not have a title tag, which is critical for SEO.',
      url,
      howToFix: 'Add a <title> tag within the <head> section of your HTML. The title should be 30-60 characters long and include your target keyword.\n\nExample:\n<title>Your Page Title - Brand Name</title>'
    });
  }

  // Missing meta description
  if (checks.no_description === false || !onPageData.meta?.description) {
    issues.push({
      issueType: 'missing-description',
      severity: 'error',
      category: 'Meta Tags',
      title: 'Missing Meta Description',
      description: 'This page lacks a meta description, which impacts click-through rates from search results.',
      url,
      howToFix: 'Add a <meta name="description"> tag within the <head> section. Keep it between 120-160 characters.\n\nExample:\n<meta name="description" content="Your compelling page description here that entices users to click.">'
    });
  }

  // Missing H1
  if (checks.no_h1_tag === false || !onPageData.meta?.htags?.h1 || onPageData.meta.htags.h1.length === 0) {
    issues.push({
      issueType: 'missing-h1',
      severity: 'warning',
      category: 'Content Structure',
      title: 'Missing H1 Heading',
      description: 'This page does not have an H1 heading, which is important for content hierarchy.',
      url,
      howToFix: 'Add a single <h1> tag to your page that describes the main topic. There should only be one H1 per page.\n\nExample:\n<h1>Main Page Heading</h1>'
    });
  }

  // No HTTPS
  if (checks.is_https === false) {
    issues.push({
      issueType: 'no-https',
      severity: 'error',
      category: 'Security',
      title: 'Not Using HTTPS',
      description: 'This page is not served over HTTPS, which is a ranking factor and security issue.',
      url,
      howToFix: '1. Purchase and install an SSL certificate from your hosting provider\n2. Update all internal links to use https://\n3. Set up 301 redirects from http:// to https://\n4. Update your sitemap and robots.txt'
    });
  }

  // Slow page load
  const loadTime = onPageData.page_timing?.time_to_interactive || 0;
  if (loadTime > 3000) {
    issues.push({
      issueType: 'slow-load',
      severity: loadTime > 5000 ? 'error' : 'warning',
      category: 'Performance',
      title: 'Slow Page Load Time',
      description: `Page takes ${(loadTime / 1000).toFixed(1)}s to become interactive, which may hurt user experience and rankings.`,
      url,
      howToFix: '1. Optimize and compress images\n2. Minify CSS and JavaScript\n3. Enable browser caching\n4. Use a CDN\n5. Reduce server response time\n6. Eliminate render-blocking resources'
    });
  }

  // Thin content
  const wordCount = onPageData.meta?.content?.plain_text_word_count || 0;
  if (wordCount < 300) {
    issues.push({
      issueType: 'thin-content',
      severity: 'warning',
      category: 'Content Quality',
      title: 'Thin Content',
      description: `Page has only ${wordCount} words, which may be considered thin content by search engines.`,
      url,
      howToFix: 'Expand the content to at least 300-500 words by:\n1. Adding more detailed information\n2. Including relevant examples or case studies\n3. Answering common questions about the topic\n4. Adding unique insights or perspectives'
    });
  }

  return issues;
}

function extractMetaTagIssues(onPageData: OnPageResult | null, url: string) {
  const issues: Array<{
    pageUrl: string;
    currentTitle: string | null;
    currentDesc: string | null;
    recommendedTitle: string;
    recommendedDesc: string;
    missingTags: string;
  }> = [];

  if (!onPageData) return issues;

  const title = onPageData.meta?.title || null;
  const desc = onPageData.meta?.description || null;
  const missingTags: string[] = [];

  if (!title) missingTags.push('title');
  if (!desc) missingTags.push('description');

  // Generate recommendations
  const recommendedTitle = title || 'Add Your Page Title Here - Brand Name (30-60 chars)';
  const recommendedDesc = desc || 'Write a compelling meta description that summarizes this page and includes your target keyword. Aim for 120-160 characters to ensure it displays fully in search results.';

  issues.push({
    pageUrl: url,
    currentTitle: title,
    currentDesc: desc,
    recommendedTitle,
    recommendedDesc,
    missingTags: missingTags.join(',')
  });

  return issues;
}

function generateContentRecommendations(onPageData: OnPageResult | null): string {
  const recommendations: string[] = [];

  if (!onPageData?.meta) return 'No specific recommendations available.';

  const wordCount = onPageData.meta.content?.plain_text_word_count || 0;
  if (wordCount < 600) {
    recommendations.push(`Expand content from ${wordCount} to at least 600 words for better topical coverage.`);
  }

  const h2Count = onPageData.meta.htags?.h2?.length || 0;
  if (h2Count < 3) {
    recommendations.push('Add more H2 subheadings to improve content structure and scannability.');
  }

  const images = onPageData.meta.images_count || 0;
  if (images < 2) {
    recommendations.push('Add relevant images to make content more engaging (aim for 2-5 images).');
  }

  const internalLinks = onPageData.meta.internal_links_count || 0;
  if (internalLinks < 3) {
    recommendations.push('Add more internal links to related pages to improve site architecture.');
  }

  return recommendations.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body: FullAuditRequest = await request.json();
    
    if (!body.clientId || !body.website) {
      return NextResponse.json(
        { error: 'Client ID and website are required' },
        { status: 400 }
      );
    }

    const result = await runComprehensiveAudit(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in full audit:', error);
    return NextResponse.json(
      { error: 'Failed to complete audit' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const auditId = searchParams.get('auditId');
  
  if (!auditId) {
    return NextResponse.json(
      { error: 'Audit ID is required' },
      { status: 400 }
    );
  }

  try {
    const audit = await prisma.auditRun.findUnique({
      where: { id: auditId },
      include: {
        technicalIssues: true,
        metaTags: true,
        contentScores: true,
        client: true
      }
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(audit);
  } catch (error) {
    console.error('Error fetching audit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit' },
      { status: 500 }
    );
  }
}
