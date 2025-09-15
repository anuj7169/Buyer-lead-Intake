import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { leadSchema } from '../../../lib/validation';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const exportCsv = url.searchParams.get('exportCsv');

  type Lead = {
    id: number | string;
    name: string;
    email: string;
    phone?: string | null;
    notes?: string | null;
    [key: string]: any;
  };

  const leads: Lead[] = search
    ? await prisma.lead.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      })
    : await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });

  if (exportCsv === 'true') {
    const csv = stringify(
      leads.map(({ id, name, email, phone, notes }: Lead) => ({
        id,
        name,
        email,
        phone: phone || '',
        notes: notes || '',
      })),
      { header: true }
    );

    return new Response(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=leads.csv' },
    });
  }
  
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      // Normal single lead create
      const body = await req.json();
      const validated = leadSchema.parse(body);
      const lead = await prisma.lead.create({ data: validated });
      return NextResponse.json(lead, { status: 201 });
    } else if (contentType.includes('text/csv') || contentType.includes('multipart/form-data')) {
      // CSV import
      const text = await req.text();

      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
      });

      let createdCount = 0;
      for (const record of records) {
        try {
          const validated = leadSchema.parse(record);
          await prisma.lead.create({ data: validated });
          createdCount++;
        } catch (e) {
          // Skip invalid rows, optionally collect to report errors
          continue;
        }
      }
      return NextResponse.json({ message: `${createdCount} leads imported` });
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
