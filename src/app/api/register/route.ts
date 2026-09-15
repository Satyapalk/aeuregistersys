import { NextResponse } from 'next/server';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { RGM_API_URL, type RegistrationRequest } from '@/lib/api';

interface RawRegistration {
  studentRegisterID?: string;
  [key: string]: unknown;
}

function formatRegistrationNumber(seqId: number): string {
  return `3026${String(seqId).padStart(4, '0')}`;
}

const SEQUENCE_FILE =
  process.env.REG_SEQ_FILE || path.join(process.cwd(), '.data', 'registration-seq.txt');

function nextFallbackId(): number {
  let current = 0;
  try {
    current = parseInt(readFileSync(SEQUENCE_FILE, 'utf8').trim(), 10);
  } catch {
    current = 0;
  }
  if (!Number.isFinite(current) || current < 0) current = 0;
  const next = current + 1;
  mkdirSync(path.dirname(SEQUENCE_FILE), { recursive: true });
  writeFileSync(SEQUENCE_FILE, String(next), 'utf8');
  return next;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<RegistrationRequest> & { price?: number };

    const { price, ...payload } = body;

    const required: (keyof RegistrationRequest)[] = [
      'latinName', 'genderID', 'dob', 'phone', 'nationality', 'gradeID',
      'degreeID', 'facultyID', 'majorID', 'shiftID', 'academicYear',
    ];
    for (const field of required) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
        return NextResponse.json(
          { success: false, message: `Field "${field}" is required.` },
          { status: 400 }
        );
      }
    }

    const requestBody: RegistrationRequest & { price?: number } = {
      latinName: payload.latinName as string,
      khmerName: payload.khmerName,
      nationalID: (payload.nationalID as string) || '1',
      genderID: payload.genderID as number,
      dob: payload.dob as string,
      phone: payload.phone as string,
      nationality: payload.nationality as string,
      gradeID: payload.gradeID as number,
      degreeID: payload.degreeID as number,
      facultyID: payload.facultyID as number,
      majorID: payload.majorID as number,
      shiftID: payload.shiftID as number,
      academicYear: payload.academicYear as string,
    };

    if (typeof price === 'number' && Number.isFinite(price)) {
      requestBody.price = price;
    }

    const apiRes = await fetch(`${RGM_API_URL}/api/Registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const apiJson = (await apiRes.json().catch(() => ({}))) as { success?: boolean; data?: unknown; message?: string };
    const raw = (apiJson.data ?? {}) as RawRegistration;

    if (!apiRes.ok || apiJson.success === false) {
      console.error('[register] RGM registration failed', {
        upstreamStatus: apiRes.status,
        upstreamBody: apiJson,
        requestBody,
      });
      return NextResponse.json(
        { success: false, message: apiJson.message || 'មានបញ្ហាក្នុងការចុះឈ្មោះ។' },
        { status: apiRes.status }
      );
    }

    const studentID = typeof raw?.studentRegisterID === 'string' && raw.studentRegisterID.trim() ? raw.studentRegisterID.trim() : null;
    const registrationNumber = studentID || formatRegistrationNumber(nextFallbackId());

    return NextResponse.json({ success: true, studentID, registrationNumber });
  } catch {
    return NextResponse.json(
      { success: false, message: 'មានបញ្ហាក្នុងការផ្ញើទិន្នន័យ' },
      { status: 500 }
    );
  }
}