import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/marketplace/list - list published marketplace templates
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';

    const templates = await prisma.chartInstance.findMany({
      where: {
        marketplacePublished: true,
        marketplacePrice: { gt: 0 },
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { projectId: null }, // ensure no project (marketplace only)
        ],
      },
      select: {
        id: true,
        name: true,
        marketplacePrice: true,
        user: { select: { name: true, email: true } },
      },
      take: 50,
    });

    return NextResponse.json({ templates });
  } catch (err) {
    console.error('marketplace-list error', err);
    return NextResponse.json({ templates: [], error: 'server_error' }, { status: 500 });
  }
}
