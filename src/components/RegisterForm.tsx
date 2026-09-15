'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ACADEMIC_YEAR, BACHELOR_FALLBACK_MAJORS, MAJOR_DETAIL_BASE, pricingForMajor, type BrochureGradeCode } from '@/lib/constants';
import {
  type Grade,
  type Lookups,
  type Major,
  type RegistrationRequest,
  type RegistrationResult,
} from '@/lib/api';

function brochureGradeCode(grade: Grade | undefined): BrochureGradeCode | undefined {
  const code = (grade?.gradeCode ?? grade?.gradeName ?? '').toUpperCase();
  if (code === 'A' || code === 'B' || code === 'C' || code === 'D') return code;
  if (code === 'E' || code === 'F' || code === 'E&F') return 'E&F';
  return undefined;
}

interface FormState {
  nameLatin: string;
  khmerName: string;
  genderID: number | '';
  dob: string;
  phone: string;
  nationality: string;
  degreeID: number | '';
  facultyID: number | '';
  majorID: number | '';
  gradeID: number | '';
  shiftID: number | '';
}

const INITIAL_FORM: FormState = {
  nameLatin: '',
  khmerName: '',
  genderID: '',
  dob: '',
  phone: '',
  nationality: 'ខ្មែរ',
  degreeID: '',
  facultyID: '',
  majorID: '',
  gradeID: '',
  shiftID: '',
};

const STORAGE_KEY = 'registerFormDraft';

function loadDraft(): FormState {
  if (typeof window === 'undefined') return INITIAL_FORM;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_FORM;
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return { ...INITIAL_FORM, ...parsed };
  } catch {
    return INITIAL_FORM;
  }
}

const GENDER_ICONS: Record<number, { cls: string; color: string }> = {
  1: { cls: 'fa-mars', color: '#3b82f6' },
  2: { cls: 'fa-venus', color: '#ec4899' },
  3: { cls: 'fa-dharmachakra', color: '#f59e0b' },
};

const SHIFT_ICONS: Record<number, { cls: string; color: string }> = {
  1: { cls: 'fa-sun', color: '#f59e0b' },
  2: { cls: 'fa-cloud-sun', color: '#f97316' },
  3: { cls: 'fa-moon', color: '#6366f1' },
  4: { cls: 'fa-calendar-week', color: '#8b5cf6' },
};

function shiftIconFor(shiftID: number, index: number): { cls: string; color: string } {
  return SHIFT_ICONS[shiftID] ?? SHIFT_ICONS[(index % 4) + 1] ?? { cls: 'fa-clock', color: '#64748b' };
}

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(loadDraft);
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [lookupsError, setLookupsError] = useState(false);
  const [lookupsWarning, setLookupsWarning] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isProgramMenuOpen, setIsProgramMenuOpen] = useState(false);
  const [degreeMajorsFetched, setDegreeMajorsFetched] = useState<Major[]>([]);
  const [degreeMajorsLoading, setDegreeMajorsLoading] = useState(false);
  const [majorSearch, setMajorSearch] = useState('');
  const majorSearchRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    let attempts = 0;
    const load = async () => {
      if (active) setLookupsError(false);
      try {
        const res = await fetch('/api/lookups');
        const json = (await res.json()) as { success?: boolean; data?: Lookups; warning?: string };
        if (!active) return;
        if (json?.success) {
          setLookups(json.data as Lookups);
          setLookupsError(false);
          setLookupsWarning(json.warning ?? null);
          if (json.data && json.data.degrees.length === 0 && attempts < 3) {
            attempts++;
            window.setTimeout(load, 1200);
            return;
          }
        } else {
          if (attempts < 3) {
            attempts++;
            window.setTimeout(load, 1200);
            return;
          }
          setLookupsError(true);
        }
      } catch {
        if (attempts < 3) {
          attempts++;
          window.setTimeout(load, 1200);
          return;
        }
        if (active) setLookupsError(true);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const degreeMajors = useMemo<Major[]>(() => {
    const degreeID = formData.degreeID;
    if (!degreeID) return [];
    const map = lookups?.degreeMajorIDs;
    if (map && Array.isArray(map[String(degreeID)])) {
      const ids = new Set(map[String(degreeID)]);
      const base = (lookups?.majors ?? []).filter(
        (m) => ids.has(m.majorID) && m.isActive !== false
      );
      return degreeID === 2
        ? [
            ...base,
            ...BACHELOR_FALLBACK_MAJORS.filter((fb) => !base.some((b) => b.majorID === fb.majorID)),
          ]
        : base;
    }
    return degreeMajorsFetched;
  }, [lookups, formData.degreeID, degreeMajorsFetched]);

  const majorsByFaculty = useMemo(() => {
    const map = new Map<number, Major[]>();
    for (const major of degreeMajors) {
      const list = map.get(major.facultyID) ?? [];
      list.push(major);
      map.set(major.facultyID, list);
    }
    return map;
  }, [degreeMajors]);

  const selectedGender = lookups?.genders.find((g) => g.genderID === formData.genderID);
  const selectedDegree = lookups?.degrees.find((d) => d.degreeID === formData.degreeID);
  const selectedFaculty = lookups?.faculties.find((f) => f.facultyID === formData.facultyID);
  const selectedMajor = degreeMajors.find((m) => m.majorID === formData.majorID);
  const selectedGrade = lookups?.grades.find((g) => g.gradeID === formData.gradeID);
  const selectedShift = lookups?.shifts.find((s) => s.shiftID === formData.shiftID);
  const degreeOptions = lookups?.degrees ?? [];

  const majorPricing = pricingForMajor(selectedMajor?.majorName);
  const selectedBrochureGrade = brochureGradeCode(selectedGrade);
  const selectedGradePrice = selectedBrochureGrade
    ? majorPricing.gradePrices[selectedBrochureGrade]
    : undefined;

  useEffect(() => {
    const degreeID = formData.degreeID;
    if (!degreeID) return;
    const map = lookups?.degreeMajorIDs;
    if (map && Array.isArray(map[String(degreeID)])) {
      return;
    }
    let active = true;
    (async () => {
      setDegreeMajorsLoading(true);
      try {
        const res = await fetch(`/api/degrees/${degreeID}/majors`);
        const json = (await res.json()) as { success: boolean; data?: Major[] };
        if (active && json?.success) {
          const list = json.data ?? [];
          setDegreeMajorsFetched(list);
          setFormData((cur) =>
            cur.majorID && !list.some((m) => m.majorID === cur.majorID)
              ? { ...cur, facultyID: '', majorID: '' }
              : cur
          );
        }
      } catch {
        if (active) setDegreeMajorsFetched([]);
      } finally {
        if (active) setDegreeMajorsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [formData.degreeID, lookups?.degreeMajorIDs]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {}
  }, [formData]);

  const handleDegreeChange = (degreeID: number | '') => {
    if (!degreeID) {
      setDegreeMajorsFetched([]);
      setDegreeMajorsLoading(false);
    }
    setMajorSearch('');
    setFormData({ ...formData, degreeID, facultyID: '', majorID: '' });
    setIsProgramMenuOpen(false);
  };

  const handleProgramChange = (facultyID: number, majorID: number) => {
    setFormData({ ...formData, facultyID, majorID });
    setIsProgramMenuOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookups || !selectedMajor) return;

    setLoading(true);
    setStatusMsg(null);
    const payload: RegistrationRequest = {
      latinName: formData.nameLatin,
      khmerName: formData.khmerName,
      genderID: Number(formData.genderID),
      dob: formData.dob ? `${formData.dob}T00:00:00.000Z` : '',
      phone: formData.phone,
      nationality: formData.nationality,
      gradeID: Number(formData.gradeID),
      degreeID: Number(formData.degreeID),
      facultyID: Number(formData.facultyID),
      majorID: Number(formData.majorID),
      shiftID: Number(formData.shiftID),
      academicYear: ACADEMIC_YEAR,
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          genderName: selectedGender?.genderKh ?? selectedGender?.genderName ?? '',
          gradeName: selectedGrade?.gradeCode ?? '',
          price: selectedGradePrice,
          degreeName: selectedDegree?.degreeKh ?? selectedDegree?.degreeName ?? '',
          facultyName: selectedFaculty?.facultyKh ?? selectedFaculty?.facultyName ?? '',
          majorName: selectedMajor.majorKh ?? selectedMajor.majorName,
          shift: selectedShift?.shiftKh ?? selectedShift?.shift ?? '',
        }),
      });

      const result = (await res.json()) as RegistrationResult & { success?: boolean };

      if (res.ok && result.success) {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {}
        sessionStorage.setItem(
          'registerData',
          JSON.stringify({
            nameLatin: formData.nameLatin,
            khmerName: formData.khmerName,
            gender: selectedGender?.genderKh ?? selectedGender?.genderName ?? '',
            dob: formData.dob,
            phone: formData.phone,
            nationality: formData.nationality,
            degree: selectedDegree?.degreeKh ?? selectedDegree?.degreeName ?? '',
            faculty: selectedFaculty?.facultyKh ?? selectedFaculty?.facultyName ?? '',
            major: selectedMajor.majorKh ?? selectedMajor.majorName,
            grade: selectedGrade?.gradeCode ?? '',
            price: selectedGradePrice,
            registrationNumber: result.registrationNumber,
            studentID: result.studentID,
          })
        );
        router.push(
          `/register/thanks?code=${encodeURIComponent(result.registrationNumber)}&id=${encodeURIComponent(result.studentID ?? '')}`
        );
      } else {
        setStatusMsg({ text: result.message || 'មានបញ្ហាក្នុងការចុះឈ្មោះ។', isError: true });
      }
    } catch {
      setStatusMsg({ text: 'មិនអាចតភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ (Server) បានទេ។', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const disabled = !lookups || loading;

  return (
    <div className="register-shell">
      <div className="glass-card">
        <header className="glass-header">
          <div className="register-logo header-icon"><Image src="/images/aeu-logo.png" alt="Asia Euro University logo" width={726} height={956} /></div>
          <div>
            <span className="register-kicker"><i className="fa-solid fa-sparkles" /> ឆ្នាំសិក្សាថ្មី {ACADEMIC_YEAR}</span>
            <h1>ប្រព័ន្ធចុះឈ្មោះសិក្សាអនឡាញ</h1>
            <p>សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប - Software Development Department</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="register-fields">
          {statusMsg && (
            <div className={`form-status ${statusMsg.isError ? 'error' : 'success'}`}>
              {statusMsg.text}
            </div>
          )}

          {lookupsError && (
            <div className="form-status error">
              មិនអាចផ្ទុកទិន្នន័យពីម៉ាស៊ីនបម្រើបានទេ។{' '}
              <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="underline">
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          )}

          {lookups && lookupsWarning && (
            <div className="form-status error">
              {lookupsWarning}{' '}
              <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="underline">
                ផ្ទុកឡើងវិញ
              </button>
            </div>
          )}

          {!lookups && !lookupsError && (
            <div className="form-status success">
              កំពុងផ្ទុកទិន្នន័យប្រព័ន្ធ...
            </div>
          )}

          <div className="register-section-heading">
            <h2>
              <span>1</span>ព័ត៌មានផ្ទាល់ខ្លួន (Personal Information)
            </h2>
            <small>* តម្រូវឱ្យបំពេញ</small>
          </div>

          <div className="register-grid">
            <div className="field">
              <label>ឈ្មោះឡាតាំង (Latin Name) *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-user" />
                <input
                  type="text"
                  required
                  placeholder="ឧ. SOK CHAN"
                  value={formData.nameLatin}
                  onChange={(e) => setFormData({ ...formData, nameLatin: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label>ឈ្មោះខ្មែរ (Khmer Name) *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-user-pen" />
                <input
                  type="text"
                  required
                  placeholder="ឧ. សុខ ចាន់"
                  value={formData.khmerName}
                  onChange={(e) => setFormData({ ...formData, khmerName: e.target.value })}
                />
              </div>
            </div>

            <fieldset className="choice-group full-width">
              <legend>ភេទ (Gender) *</legend>
              <div>
                {(lookups?.genders ?? []).map((g) => {
                  const gi = GENDER_ICONS[g.genderID];
                  return (
                    <label
                      key={g.genderID}
                      className={formData.genderID === g.genderID ? 'selected' : ''}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g.genderID}
                        required
                        checked={formData.genderID === g.genderID}
                        onChange={() => setFormData({ ...formData, genderID: g.genderID })}
                      />
                      {gi && <i className={`fa-solid ${gi.cls}`} style={{ color: gi.color }} />}
                      {g.genderKh ?? g.genderName}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="field">
              <label>ថ្ងៃខែឆ្នាំកំណើត (DOB) *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-calendar-days" />
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label>លេខទូរស័ព្ទ (Phone Number) *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-phone" />
                <input
                  type="tel"
                  required
                  placeholder="ឧ. 012 345 678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="register-section-heading">
            <h2>
              <span>2</span>ព័ត៌មានការសិក្សា (Academic Selection)
            </h2>
          </div>

          <div className="register-grid grid-major">
            <div className="field">
              <label>កម្រិតសិក្សា (Degree) *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-award" />
                <i className="fa-solid fa-chevron-down input-icon-right" />
                <select
                  className="input-caret"
                  required
                  disabled={disabled}
                  value={formData.degreeID}
                  onChange={(e) =>
                    handleDegreeChange(e.target.value ? Number(e.target.value) : '')
                  }
                >
                  <option value="">-- ជ្រើសរើសកម្រិតសិក្សា --</option>
                  {degreeOptions.map((d) => (
                    <option key={d.degreeID} value={d.degreeID}>
                      {d.degreeKh ?? d.degreeName} ({d.degreeName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field select-field">
              <label>មហាវិទ្យាល័យ និងជំនាញ (Faculty & Major) *</label>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isProgramMenuOpen}
                disabled={disabled || !formData.degreeID || degreeMajorsLoading}
                onClick={() => {
                  if (!isProgramMenuOpen) setMajorSearch('');
                  setIsProgramMenuOpen(!isProgramMenuOpen);
                  window.setTimeout(() => majorSearchRef.current?.focus(), 30);
                }}
                className="select-trigger"
              >
                <span className={formData.majorID ? '' : 'placeholder'}>
                  <i className="fa-solid fa-book-bookmark" />
                  {degreeMajorsLoading
                    ? 'កំពុងផ្ទុកជំនាញ...'
                    : selectedMajor
                      ? `${selectedMajor.majorKh || selectedMajor.majorName}`
                      : formData.degreeID
                        ? '-- សូមជ្រើសរើសមហាវិទ្យាល័យ និងជំនាញ --'
                        : '-- សូមជ្រើសរើសកម្រិតសិក្សាជាមុនសិន --'}
                </span>
                <span aria-hidden="true" className="select-caret">▾</span>
              </button>

              {isProgramMenuOpen && lookups && degreeMajors.length > 0 && (
                <div
                  role="listbox"
                  aria-label="Faculty and major"
                  className="select-menu"
                >
                  <div className="select-menu-search">
                    <i className="fa-solid fa-magnifying-glass" />
                    <input
                      ref={majorSearchRef}
                      type="text"
                      value={majorSearch}
                      placeholder="ស្វែងរកជំនាញ..."
                      aria-label="Search majors"
                      onChange={(e) => setMajorSearch(e.target.value)}
                    />
                    {majorSearch && (
                      <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => setMajorSearch('')}
                      >
                        <i className="fa-solid fa-circle-xmark" />
                      </button>
                    )}
                  </div>
                  {(() => {
                    const q = majorSearch.trim().toLowerCase();
                    const matches = (m: Major) =>
                      !q || `${m.majorKh ?? ''} ${m.majorName}`.toLowerCase().includes(q);
                    const groups = lookups.faculties.filter((f) =>
                      (majorsByFaculty.get(f.facultyID) ?? []).some(matches),
                    );
                    if (groups.length === 0) {
                      return (
                        <div className="select-menu-empty">
                          មិនមានជំនាញដែលត្រូវគ្នាទេ
                        </div>
                      );
                    }
                    return groups.map((fac) => (
                      <div key={fac.facultyID}>
                        <div className="select-menu-heading">
                          {fac.facultyKh || fac.facultyName}
                        </div>
                        {(majorsByFaculty.get(fac.facultyID) ?? [])
                          .filter(matches)
                          .map((major) => (
                          <div
                            key={major.majorID}
                            className="select-menu-option-wrap"
                            role="option"
                            aria-selected={formData.majorID === major.majorID}
                          >
                            <button
                              type="button"
                              onClick={() => handleProgramChange(fac.facultyID, major.majorID)}
                              className="select-menu-option"
                            >
                              {major.majorKh || major.majorName} ({major.majorName})
                            </button>
                            <a
                              href={`${MAJOR_DETAIL_BASE}${encodeURIComponent(
                                major.majorName.toLowerCase().replace(/\s+/g, '-'),
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="select-menu-detail"
                              aria-label={`មើលព័ត៌មានលម្អិត ${major.majorName}`}
                            >
                              <i className="fa-solid fa-circle-info" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            <fieldset className="choice-group full-width cols-4">
              <legend>វេនសិក្សា (Shift) *</legend>
              <div>
                {(lookups?.shifts ?? []).map((s, idx) => {
                  const si = shiftIconFor(s.shiftID, idx);
                  return (
                    <label
                      key={s.shiftID}
                      className={formData.shiftID === s.shiftID ? 'selected' : ''}
                    >
                      <input
                        type="radio"
                        name="shift"
                        value={s.shiftID}
                        required
                        checked={formData.shiftID === s.shiftID}
                        onChange={() => setFormData({ ...formData, shiftID: s.shiftID })}
                      />
                      <i className={`fa-solid ${si.cls}`} style={{ color: si.color }} />
                      {s.shiftKh ?? s.shift}
                    </label>
                  );
                })}
              </div>
            </fieldset>
 <fieldset className="choice-group full-width cols-5 stacked">
              <legend>និទ្ទេសបាក់ឌុប (Bac-II Grade) *</legend>
              <div>
                {(lookups?.grades ?? []).map((g) => {
                  const code = (g.gradeCode || '').toUpperCase();
                  return (
                    <label
                      key={g.gradeID}
                      className={formData.gradeID === g.gradeID ? 'selected' : ''}
                    >
                      <input
                        type="radio"
                        name="grade"
                        value={g.gradeID}
                        required
                        checked={formData.gradeID === g.gradeID}
                        onChange={() => setFormData({ ...formData, gradeID: g.gradeID })}
                      />
                      <b>{code || g.gradeName}</b>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="field full-width">
              <label>តម្លៃតាមជំនាញ និងនិទ្ទេស (Major & Grade Price)</label>
              <div className="fee-card">
                <div className="fee-main">
                  <div className="fee-icon"><i className="fa-solid fa-file-invoice-dollar" /></div>
                  <div>
                    <small>
                      {selectedMajor ? selectedMajor.majorName : 'សូមជ្រើសរើសជំនាញ'}
                    </small>
                    <strong>
                      {selectedGradePrice === undefined || !Number.isFinite(selectedGradePrice)
                        ? '--'
                        : `$${selectedGradePrice.toFixed(2)}`}
                    </strong>
                  </div>
                </div>
             
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedMajor}
            className="register-submit"
          >
            <span>{loading ? 'កំពុងផ្ញើទិន្នន័យ...' : `ចុះឈ្មោះសិក្សា (Register) · ${ACADEMIC_YEAR}`}</span>
            <i className="fa-solid fa-paper-plane" />
          </button>
        </form>

        <footer>© 2026 Software Development Department. All rights reserved.</footer>
      </div>
    </div>
  );
}