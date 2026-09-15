export const RGM_API_URL = process.env.RGM_API_URL || 'https://rgm.palsatya.site';
export const ACADEMIC_YEAR = '2026-2027';

export interface LookupEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Gender {
  genderID: number;
  genderName: string;
  genderKh: string | null;
  isActive: boolean;
}

export interface Degree {
  degreeID: number;
  degreeName: string;
  degreeKh: string | null;
  isActive: boolean;
}

export interface Faculty {
  facultyID: number;
  facultyName: string;
  facultyKh: string | null;
  isActive: boolean;
}

export interface Grade {
  gradeID: number;
  gradeCode: string;
  gradeName: string;
  isActive: boolean;
}

export interface Shift {
  shiftID: number;
  shift: string;
  shiftKh: string | null;
}

export type MajorDegreeRef = number | string | Degree;

export interface Major {
  majorID: number;
  facultyID: number;
  deptID: number | null;
  majorName: string;
  majorKh: string | null;
  isActive: boolean;
  availableDegrees?: MajorDegreeRef[] | null;
  majorDegrees?: MajorDegreeRef[] | null;
}

export function resolveMajorDegreeIDs(
  source: MajorDegreeRef[] | null | undefined,
  degrees: Degree[]
): number[] {
  if (!Array.isArray(source) || source.length === 0) return [];
  const byName = new Map<string, number>();
  for (const d of degrees) {
    if (d.degreeName) byName.set(d.degreeName.trim().toLowerCase(), d.degreeID);
  }
  const ids: number[] = [];
  for (const entry of source) {
    if (typeof entry === 'number' && Number.isFinite(entry)) {
      ids.push(entry);
    } else if (typeof entry === 'string') {
      const id = byName.get(entry.trim().toLowerCase());
      if (id !== undefined) ids.push(id);
    } else if (entry && typeof entry === 'object' && 'degreeID' in entry) {
      const id = (entry as Degree).degreeID;
      if (Number.isFinite(id)) ids.push(id);
    }
  }
  return [...new Set(ids)];
}

export interface Lookups {
  genders: Gender[];
  degrees: Degree[];
  faculties: Faculty[];
  grades: Grade[];
  majors: Major[];
  shifts: Shift[];
  degreeMajorIDs?: Record<string, number[]>;
}

export interface RegistrationRequest {
  latinName: string;
  khmerName?: string;
  nationalID?: string;
  genderID: number;
  dob: string;
  phone: string;
  nationality: string;
  gradeID: number;
  degreeID: number;
  facultyID: number;
  majorID: number;
  shiftID: number;
  academicYear: string;
}

export interface RegistrationResult {
  success: boolean;
  studentID: string | null;
  registrationNumber: string;
  message?: string;
}