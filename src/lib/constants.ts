export const ACADEMIC_YEAR = '2026-2027';
export const MAJOR_DETAIL_BASE =
  process.env.MAJOR_DETAIL_BASE || 'https://www.aeu.edu.kh/programs/';

import type { Major } from '@/lib/api';

export const BACHELOR_FALLBACK_MAJORS: Major[] = [
  { majorID: 60, facultyID: 4, deptID: null, majorName: 'Cybersecurity', majorKh: null, isActive: true },
  { majorID: 61, facultyID: 4, deptID: null, majorName: 'AI & Machine Learning', majorKh: null, isActive: true },
  { majorID: 64, facultyID: 4, deptID: null, majorName: 'Data Science', majorKh: null, isActive: true },
];

export type BrochureGradeCode = 'A' | 'B' | 'C' | 'D' | 'E&F';

export interface MajorPricing {
  enrollmentFee: number;
  annualTuition: number;
  gradePrices: Record<BrochureGradeCode, number>;
}

const STANDARD_GRADE_PRICES: Record<BrochureGradeCode, number> = {
  A: 0,
  B: 290,
  C: 410,
  D: 465,
  'E&F': 525,
};

const CS_IT_EEE_GRADE_PRICES: Record<BrochureGradeCode, number> = {
  A: 0,
  B: 340,
  C: 475,
  D: 545,
  'E&F': 615,
};

const STANDARD_PRICING: MajorPricing = {
  enrollmentFee: 580,
  annualTuition: 3000,
  gradePrices: STANDARD_GRADE_PRICES,
};

const CS_IT_EEE_PRICING: MajorPricing = {
  enrollmentFee: 680,
  annualTuition: 3000,
  gradePrices: CS_IT_EEE_GRADE_PRICES,
};

const DS_AI_CY_GRADE_PRICES: Record<BrochureGradeCode, number> = {
  A: 830,
  B: 830,
  C: 830,
  D: 830,
  'E&F': 830,
};

const DS_AI_CY_PRICING: MajorPricing = {
  enrollmentFee: 830,
  annualTuition: 3000,
  gradePrices: DS_AI_CY_GRADE_PRICES,
};

export function pricingForMajor(majorName: string | undefined): MajorPricing {
  const name = (majorName ?? '').toLowerCase();
  if (/computer science|information technology|electronic and electrical engineering/.test(name)) {
    return CS_IT_EEE_PRICING;
  }
  if (/data science|ai|cybersecurity/.test(name)) return DS_AI_CY_PRICING;
  return STANDARD_PRICING;
}