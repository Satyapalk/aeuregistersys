import { NextResponse } from 'next/server';
import {
  RGM_API_URL,
  type Degree,
  type Faculty,
  type Gender,
  type Grade,
  type LookupEnvelope,
  type Lookups,
  type Major,
  type Shift,
} from '@/lib/api';

const MAX_ATTEMPTS = 3;

async function getData<T>(path: string, attempts = MAX_ATTEMPTS): Promise<T[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(`${RGM_API_URL}${path}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as LookupEnvelope<T[]>;
      if (!json.success) throw new Error(json.message || 'Lookup failed');
      return json.data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export async function GET() {
  const failed: (keyof Lookups)[] = [];

  const safeGet = async <T>(key: keyof Lookups, path: string): Promise<T[]> => {
    try {
      return await getData<T>(path);
    } catch {
      failed.push(key);
      return [] as T[];
    }
  };

  const [genders, degrees, faculties, grades, majors, shifts] = await Promise.all([
    safeGet<Gender>('genders', '/api/Genders'),
    safeGet<Degree>('degrees', '/api/Degrees'),
    safeGet<Faculty>('faculties', '/api/Faculties'),
    safeGet<Grade>('grades', '/api/Grades'),
    safeGet<Major>('majors', '/api/Majors'),
    safeGet<Shift>('shifts', '/api/Shifts'),
  ]);

  const activeDegrees = degrees.filter((d) => d.isActive !== false);
  const degreeMajorEntries = await Promise.all(
    activeDegrees.map(async (d) => {
      try {
        const refs = await getData<{ majorID: number; isActive?: boolean }>(
          `/api/MajorDegrees/degree/${d.degreeID}`
        );
        return [
          String(d.degreeID),
          refs.filter((r) => r.isActive !== false).map((r) => r.majorID),
        ] as const;
      } catch {
        return [String(d.degreeID), [] as number[]] as const;
      }
    })
  );
  const degreeMajorIDs = Object.fromEntries(degreeMajorEntries) as Record<string, number[]>;

  const data: Lookups = {
    genders: genders.filter((g) => g.isActive !== false),
    degrees: activeDegrees,
    faculties: faculties.filter((f) => f.isActive !== false),
    grades: grades.filter((g) => g.isActive !== false),
    majors: majors.filter((m) => m.isActive !== false),
    shifts: shifts,
    degreeMajorIDs,
  };

  if (failed.length > 0) {
    return NextResponse.json({
      success: true,
      data,
      warning: `មិនអាចផ្ទុកផ្នែកខ្លះនៃទិន្នន័យបានទេ (${failed.join(', ')})។ សូមសាកល្បងម្តងទៀត។`,
    });
  }

  return NextResponse.json({ success: true, data });
}