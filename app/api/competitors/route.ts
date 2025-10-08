import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const competitors = await prisma.competitor.findMany({
      where: { clientId },
      include: {
        snapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { addedAt: 'desc' }
    });

    const competitorData = competitors.map(comp => ({
      id: comp.id,
      domain: comp.domain,
      name: comp.name,
      addedAt: comp.addedAt,
      lastAnalysis: comp.lastAnalysis,
      snapshot: comp.snapshots[0] ? {
        organicKeywords: comp.snapshots[0].organicKeywords,
        organicTraffic: comp.snapshots[0].organicTraffic,
        paidKeywords: comp.snapshots[0].paidKeywords,
        backlinks: comp.snapshots[0].backlinks,
        referringDomains: comp.snapshots[0].referringDomains,
        domainRating: comp.snapshots[0].domainRating
      } : null
    }));

    return NextResponse.json({ competitors: competitorData });
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    );
  }
}
