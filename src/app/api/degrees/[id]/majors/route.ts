import { NextResponse } from 'next/server';
import { RGM_API_URL, type Major } from '@/lib/api';
import { BACHELOR_FALLBACK_MAJORS } from '@/lib/constants';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const [degreeRes, majorsRes] = await Promise.all([
      fetch(`${RGM_API_URL}/api/MajorDegrees/degree/${encodeURIComponent(id)}`, {
        cache: 'no-store',
      }),
      fetch(`${RGM_API_URL}/api/Majors`, { cache: 'no-store' }),
    ]);
    if (!degreeRes.ok || !majorsRes.ok)
      throw new Error(`HTTP degree=${degreeRes.status} majors=${majorsRes.status}`);

    const degreeJson = (await degreeRes.json()) as {
      success: boolean;
      data?: { majorID: number; isActive?: boolean }[];
      message?: string;
    };
    const majorsJson = (await majorsRes.json()) as {
      success: boolean;
      data?: Major[];
      message?: string;
    };
    if (!degreeJson.success || !majorsJson.success)
      throw new Error(degreeJson.message || majorsJson.message || 'Majors fetch failed');

    const allowed = new Set(
      (degreeJson.data ?? []).filter((d) => d.isActive !== false).map((d) => d.majorID)
    );
    const majors = (majorsJson.data ?? []).filter(
      (m) => allowed.has(m.majorID) && m.isActive !== false
    );

    const merged = id === '2'
      ? [ ...majors, ...BACHELOR_FALLBACK_MAJORS.filter(
          (fb) => !majors.some((m) => m.majorID === fb.majorID)
        ) ]
      : majors;

    return NextResponse.json({ success: true, data: merged }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'មិនអាចផ្ទុកទិន្នន័យជំនាញបានទេ។' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}