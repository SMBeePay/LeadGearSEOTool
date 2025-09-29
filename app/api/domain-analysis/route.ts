import { NextRequest, NextResponse } from 'next/server';

interface DomainAnalysisRequest {
  domain: string;
  location?: string;
  language?: string;
}

interface KeywordData {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  cpc: number;
  traffic: number;
  url: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface CompetitorData {
  domain: string;
  commonKeywords: number;
  organicTraffic: number;
  organicKeywords: number;
  competitionLevel: number;
  overlap: number;
}

interface BacklinkData {
  totalBacklinks: number;
  referringDomains: number;
  followLinks: number;
  nofollowLinks: number;
  textBacklinks: number;
  imageBacklinks: number;
  domainAuthority: number;
  toxicityScore: number;
  newBacklinks: number;
  lostBacklinks: number;
}

interface TrafficData {
  totalTraffic: number;
  trafficValue: number;
  organicKeywords: number;
  paidKeywords: number;
  monthlyTraffic: Array<{
    month: string;
    traffic: number;
    value: number;
  }>;
  topPages: Array<{
    url: string;
    traffic: number;
    keywords: number;
    value: number;
  }>;
}

interface TechnicalSEO {
  totalPages: number;
  errors: number;
  warnings: number;
  notices: number;
  crawlDepth: number;
  loadTime: number;
  mobileScore: number;
  httpsScore: number;
  issues: Array<{
    type: 'error' | 'warning' | 'notice';
    category: string;
    title: string;
    count: number;
    description: string;
  }>;
}

interface DomainAnalysisResult {
  domain: string;
  traffic: TrafficData;
  keywords: KeywordData[];
  competitors: CompetitorData[];
  backlinks: BacklinkData;
  technicalSEO: TechnicalSEO;
  lastUpdated: string;
}

// Mock data generator functions
function generateMockTrafficData(domain: string): TrafficData {
  const baseTraffic = Math.floor(Math.random() * 50000) + 5000;
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  
  return {
    totalTraffic: baseTraffic,
    trafficValue: Math.floor(baseTraffic * (Math.random() * 3 + 1)),
    organicKeywords: Math.floor(Math.random() * 5000) + 500,
    paidKeywords: Math.floor(Math.random() * 200) + 10,
    monthlyTraffic: months.map((month) => ({
      month,
      traffic: Math.floor(baseTraffic * (0.8 + Math.random() * 0.4)),
      value: Math.floor(baseTraffic * (0.8 + Math.random() * 0.4) * 2)
    })),
    topPages: [
      {
        url: `https://${domain}/`,
        traffic: Math.floor(baseTraffic * 0.3),
        keywords: Math.floor(Math.random() * 200) + 50,
        value: Math.floor(baseTraffic * 0.3 * 2)
      },
      {
        url: `https://${domain}/products/`,
        traffic: Math.floor(baseTraffic * 0.2),
        keywords: Math.floor(Math.random() * 150) + 30,
        value: Math.floor(baseTraffic * 0.2 * 2)
      },
      {
        url: `https://${domain}/services/`,
        traffic: Math.floor(baseTraffic * 0.15),
        keywords: Math.floor(Math.random() * 100) + 20,
        value: Math.floor(baseTraffic * 0.15 * 2)
      }
    ]
  };
}

function generateMockKeywords(domain: string): KeywordData[] {
  const industries = {
    'oilgear': ['hydraulic pumps', 'hydraulic systems', 'industrial pumps', 'hydraulic equipment'],
    'longhornsolar': ['solar installation', 'solar panels', 'solar energy', 'renewable energy'],
    'kwsmfg': ['material handling', 'conveyor systems', 'industrial equipment', 'manufacturing'],
    'default': ['industrial services', 'equipment', 'manufacturing', 'business solutions']
  };
  
  const domainKey = Object.keys(industries).find(key => domain.includes(key)) || 'default';
  const baseKeywords = industries[domainKey as keyof typeof industries];
  
  return baseKeywords.map((keyword) => ({
    keyword,
    position: Math.floor(Math.random() * 50) + 1,
    volume: Math.floor(Math.random() * 10000) + 500,
    difficulty: Math.floor(Math.random() * 100),
    cpc: Math.round((Math.random() * 10 + 0.5) * 100) / 100,
    traffic: Math.floor(Math.random() * 1000) + 100,
    url: `https://${domain}/${keyword.replace(/\s+/g, '-').toLowerCase()}/`,
    trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable',
    change: Math.floor(Math.random() * 20) - 10
  }));
}

function generateMockCompetitors(): CompetitorData[] {
  const competitors = [
    'competitor1.com',
    'competitor2.com', 
    'competitor3.com',
    'industry-leader.com',
    'market-challenger.com'
  ];
  
  return competitors.map(comp => ({
    domain: comp,
    commonKeywords: Math.floor(Math.random() * 500) + 50,
    organicTraffic: Math.floor(Math.random() * 100000) + 10000,
    organicKeywords: Math.floor(Math.random() * 10000) + 1000,
    competitionLevel: Math.floor(Math.random() * 100),
    overlap: Math.floor(Math.random() * 30) + 5
  }));
}

function generateMockBacklinks(): BacklinkData {
  const total = Math.floor(Math.random() * 10000) + 1000;
  
  return {
    totalBacklinks: total,
    referringDomains: Math.floor(total * 0.3),
    followLinks: Math.floor(total * 0.7),
    nofollowLinks: Math.floor(total * 0.3),
    textBacklinks: Math.floor(total * 0.8),
    imageBacklinks: Math.floor(total * 0.2),
    domainAuthority: Math.floor(Math.random() * 40) + 30,
    toxicityScore: Math.floor(Math.random() * 20),
    newBacklinks: Math.floor(Math.random() * 100) + 10,
    lostBacklinks: Math.floor(Math.random() * 50) + 5
  };
}

function generateMockTechnicalSEO(): TechnicalSEO {
  return {
    totalPages: Math.floor(Math.random() * 1000) + 100,
    errors: Math.floor(Math.random() * 50),
    warnings: Math.floor(Math.random() * 100) + 20,
    notices: Math.floor(Math.random() * 200) + 50,
    crawlDepth: Math.floor(Math.random() * 5) + 2,
    loadTime: Math.round((Math.random() * 3 + 1) * 100) / 100,
    mobileScore: Math.floor(Math.random() * 30) + 70,
    httpsScore: Math.random() > 0.8 ? 100 : Math.floor(Math.random() * 20) + 80,
    issues: [
      {
        type: 'error',
        category: 'Indexability',
        title: 'Pages blocked by robots.txt',
        count: Math.floor(Math.random() * 10),
        description: 'Some pages are blocked from indexing by robots.txt file'
      },
      {
        type: 'warning',
        category: 'Content',
        title: 'Duplicate meta descriptions',
        count: Math.floor(Math.random() * 30) + 5,
        description: 'Multiple pages have identical meta descriptions'
      },
      {
        type: 'warning',
        category: 'Performance',
        title: 'Slow loading pages',
        count: Math.floor(Math.random() * 20) + 3,
        description: 'Pages taking longer than 3 seconds to load'
      },
      {
        type: 'notice',
        category: 'Images',
        title: 'Missing alt attributes',
        count: Math.floor(Math.random() * 50) + 10,
        description: 'Images without alt text for accessibility'
      }
    ]
  };
}

async function analyzeDomainWithDataForSEO(request: DomainAnalysisRequest): Promise<DomainAnalysisResult> {
  // This would make real DataForSEO API calls
  // For now, we'll simulate realistic analysis
  
  const domain = request.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    domain,
    traffic: generateMockTrafficData(domain),
    keywords: generateMockKeywords(domain),
    competitors: generateMockCompetitors(),
    backlinks: generateMockBacklinks(),
    technicalSEO: generateMockTechnicalSEO(),
    lastUpdated: new Date().toISOString()
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: DomainAnalysisRequest = await request.json();
    
    if (!body.domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeDomainWithDataForSEO(body);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in domain analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze domain' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving saved domain analyses
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');
  
  if (!domain) {
    return NextResponse.json(
      { error: 'Domain is required' },
      { status: 400 }
    );
  }

  // Mock saved analysis - in real app, this would come from database
  try {
    const analysis = await analyzeDomainWithDataForSEO({ domain });
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(
      { error: 'Failed to retrieve domain analysis' },
      { status: 500 }
    );
  }
}