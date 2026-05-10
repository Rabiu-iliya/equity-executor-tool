import { supabase } from '@/integrations/supabase/client';
import { InheritanceCase, Heir, Asset, HeirRelationship, AssetType, CaseStatus } from './types';

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

// === CASES ===
export async function getCases(): Promise<InheritanceCase[]> {
  const { data, error } = await supabase
    .from('cases').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapCase);
}

export async function getCase(id: string): Promise<InheritanceCase | null> {
  const { data, error } = await supabase.from('cases').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapCase(data) : null;
}

export async function createCase(d: Pick<InheritanceCase, 'deceased_name' | 'deceased_date' | 'notes' | 'total_estate'>) {
  const admin_id = await uid();
  const { data, error } = await supabase.from('cases').insert({
    admin_id,
    deceased_name: d.deceased_name,
    deceased_date: d.deceased_date || null,
    notes: d.notes || null,
    total_estate: d.total_estate,
    status: 'draft',
  }).select().single();
  if (error) throw error;
  return mapCase(data);
}

export async function updateCase(id: string, d: Partial<InheritanceCase>) {
  const patch: any = {};
  if (d.deceased_name !== undefined) patch.deceased_name = d.deceased_name;
  if (d.deceased_date !== undefined) patch.deceased_date = d.deceased_date || null;
  if (d.notes !== undefined) patch.notes = d.notes;
  if (d.total_estate !== undefined) patch.total_estate = d.total_estate;
  if (d.status !== undefined) patch.status = d.status;
  const { error } = await supabase.from('cases').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteCase(id: string) {
  const { error } = await supabase.from('cases').delete().eq('id', id);
  if (error) throw error;
}

// === HEIRS ===
export async function getHeirs(case_id: string): Promise<Heir[]> {
  const { data, error } = await supabase.from('heirs').select('*').eq('case_id', case_id).order('created_at');
  if (error) throw error;
  return (data || []).map(mapHeir);
}

export async function addHeir(d: Pick<Heir, 'case_id' | 'name' | 'relationship'>) {
  const admin_id = await uid();
  const { error } = await supabase.from('heirs').insert({
    admin_id, case_id: d.case_id, name: d.name, relationship: d.relationship,
  });
  if (error) throw error;
}

export async function deleteHeir(id: string) {
  const { error } = await supabase.from('heirs').delete().eq('id', id);
  if (error) throw error;
}

// === ASSETS ===
export async function getAssets(case_id: string): Promise<Asset[]> {
  const { data, error } = await supabase.from('assets').select('*').eq('case_id', case_id).order('created_at');
  if (error) throw error;
  return (data || []).map(mapAsset);
}

export async function addAsset(d: Pick<Asset, 'case_id' | 'type' | 'description' | 'value'>) {
  const admin_id = await uid();
  const { error } = await supabase.from('assets').insert({
    admin_id, case_id: d.case_id, type: d.type, description: d.description, value: d.value,
  });
  if (error) throw error;
}

export async function deleteAsset(id: string) {
  const { error } = await supabase.from('assets').delete().eq('id', id);
  if (error) throw error;
}

// mappers
function mapCase(r: any): InheritanceCase {
  return {
    id: r.id, admin_id: r.admin_id,
    deceased_name: r.deceased_name,
    deceased_date: r.deceased_date || '',
    notes: r.notes || '',
    total_estate: Number(r.total_estate) || 0,
    status: r.status as CaseStatus,
    created_at: r.created_at, updated_at: r.updated_at,
  };
}
function mapHeir(r: any): Heir {
  return {
    id: r.id, case_id: r.case_id, name: r.name,
    relationship: r.relationship as HeirRelationship,
    share_fraction: r.share_fraction || '',
    share_amount: Number(r.share_amount) || 0,
  };
}
function mapAsset(r: any): Asset {
  return {
    id: r.id, case_id: r.case_id,
    type: r.type as AssetType, description: r.description,
    value: Number(r.value) || 0,
  };
}
