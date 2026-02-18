export type CaseStatus = 'draft' | 'calculated' | 'distributed';

export type HeirRelationship =
  | 'husband'
  | 'wife'
  | 'son'
  | 'daughter'
  | 'father'
  | 'mother'
  | 'grandfather'
  | 'grandmother'
  | 'brother'
  | 'sister'
  | 'half_brother_paternal'
  | 'half_sister_paternal'
  | 'half_brother_maternal'
  | 'half_sister_maternal'
  | 'grandson'
  | 'granddaughter'
  | 'uncle'
  | 'nephew';

export type AssetType = 'money' | 'property' | 'land' | 'valuables';

export interface InheritanceCase {
  id: string;
  deceased_name: string;
  deceased_date: string;
  notes: string;
  total_estate: number;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface Heir {
  id: string;
  case_id: string;
  name: string;
  relationship: HeirRelationship;
  share_fraction: string;
  share_amount: number;
}

export interface Asset {
  id: string;
  case_id: string;
  type: AssetType;
  description: string;
  value: number;
}

export interface FaraidResult {
  heirs: Array<{
    heir_id: string;
    name: string;
    relationship: HeirRelationship;
    fraction: string;
    percentage: number;
    amount: number;
  }>;
  total_distributed: number;
  remainder: number;
}
