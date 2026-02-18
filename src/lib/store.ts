import { v4 as uuidv4 } from 'uuid';
import { InheritanceCase, Heir, Asset, CaseStatus } from './types';

const CASES_KEY = 'gadopro_cases';
const HEIRS_KEY = 'gadopro_heirs';
const ASSETS_KEY = 'gadopro_assets';

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// === CASES ===
export function getCases(): InheritanceCase[] {
  return load<InheritanceCase>(CASES_KEY).sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function getCase(id: string): InheritanceCase | undefined {
  return load<InheritanceCase>(CASES_KEY).find(c => c.id === id);
}

export function createCase(data: Pick<InheritanceCase, 'deceased_name' | 'deceased_date' | 'notes' | 'total_estate'>): InheritanceCase {
  const cases = load<InheritanceCase>(CASES_KEY);
  const now = new Date().toISOString();
  const newCase: InheritanceCase = {
    id: uuidv4(),
    ...data,
    status: 'draft',
    created_at: now,
    updated_at: now,
  };
  cases.push(newCase);
  save(CASES_KEY, cases);
  return newCase;
}

export function updateCase(id: string, data: Partial<InheritanceCase>): InheritanceCase | undefined {
  const cases = load<InheritanceCase>(CASES_KEY);
  const idx = cases.findIndex(c => c.id === id);
  if (idx === -1) return undefined;
  cases[idx] = { ...cases[idx], ...data, updated_at: new Date().toISOString() };
  save(CASES_KEY, cases);
  return cases[idx];
}

export function deleteCase(id: string) {
  save(CASES_KEY, load<InheritanceCase>(CASES_KEY).filter(c => c.id !== id));
  save(HEIRS_KEY, load<Heir>(HEIRS_KEY).filter(h => h.case_id !== id));
  save(ASSETS_KEY, load<Asset>(ASSETS_KEY).filter(a => a.case_id !== id));
}

// === HEIRS ===
export function getHeirs(caseId: string): Heir[] {
  return load<Heir>(HEIRS_KEY).filter(h => h.case_id === caseId);
}

export function addHeir(data: Pick<Heir, 'case_id' | 'name' | 'relationship'>): Heir {
  const heirs = load<Heir>(HEIRS_KEY);
  const newHeir: Heir = { id: uuidv4(), ...data, share_fraction: '', share_amount: 0 };
  heirs.push(newHeir);
  save(HEIRS_KEY, heirs);
  return newHeir;
}

export function updateHeir(id: string, data: Partial<Heir>): void {
  const heirs = load<Heir>(HEIRS_KEY);
  const idx = heirs.findIndex(h => h.id === id);
  if (idx !== -1) {
    heirs[idx] = { ...heirs[idx], ...data };
    save(HEIRS_KEY, heirs);
  }
}

export function deleteHeir(id: string) {
  save(HEIRS_KEY, load<Heir>(HEIRS_KEY).filter(h => h.id !== id));
}

// === ASSETS ===
export function getAssets(caseId: string): Asset[] {
  return load<Asset>(ASSETS_KEY).filter(a => a.case_id === caseId);
}

export function addAsset(data: Pick<Asset, 'case_id' | 'type' | 'description' | 'value'>): Asset {
  const assets = load<Asset>(ASSETS_KEY);
  const newAsset: Asset = { id: uuidv4(), ...data };
  assets.push(newAsset);
  save(ASSETS_KEY, assets);
  return newAsset;
}

export function updateAsset(id: string, data: Partial<Asset>): void {
  const assets = load<Asset>(ASSETS_KEY);
  const idx = assets.findIndex(a => a.id === id);
  if (idx !== -1) {
    assets[idx] = { ...assets[idx], ...data };
    save(ASSETS_KEY, assets);
  }
}

export function deleteAsset(id: string) {
  save(ASSETS_KEY, load<Asset>(ASSETS_KEY).filter(a => a.id !== id));
}
