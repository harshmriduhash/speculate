import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

// POST /api/marketplace/upload - authenticated seller uploads a template
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, content, price, category } = body;

    if (!name || !content || !price) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Create a marketplace template (ChartInstance with seller/marketplace fields)
    const template = await prisma.chartInstance.create({
      data: {
        name,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        userId,
        projectId: undefined, // marketplace templates are not tied to a project
        marketplacePrice: Math.round(price),
        marketplacePublished: false,
        marketplaceSellerId: userId,
      },
    });

    return NextResponse.json({ template });
  } catch (err) {
    console.error('marketplace-upload error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
