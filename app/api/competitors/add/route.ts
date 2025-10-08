import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, domain, name } = body;
    
    if (!clientId || !domain) {
      return NextResponse.json(
        { error: 'Client ID and domain are required' },
        { status: 400 }
      );
    }

    const existingCompetitors = await prisma.competitor.count({
      where: { clientId }
    });

    if (existingCompetitors >= 5) {
      return NextResponse.json(
        { error: 'Maximum of 5 competitors allowed' },
        { status: 400 }
      );
    }

    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        clientId,
        domain
      }
    });

    if (existingCompetitor) {
      return NextResponse.json(
        { error: 'Competitor already tracked' },
        { status: 400 }
      );
    }

    const competitor = await prisma.competitor.create({
      data: {
        clientId,
        domain,
        name: name || domain
      }
    });

    return NextResponse.json({
      success: true,
      competitor: {
        id: competitor.id,
        domain: competitor.domain,
        name: competitor.name
      }
    });
  } catch (error) {
    console.error('Error adding competitor:', error);
    return NextResponse.json(
      { error: 'Failed to add competitor' },
      { status: 500 }
    );
  }
}
