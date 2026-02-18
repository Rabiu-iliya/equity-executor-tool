import { Heir, HeirRelationship, FaraidResult } from './types';

interface HeirGroup {
  relationship: HeirRelationship;
  count: number;
  heirs: Heir[];
}

function groupHeirs(heirs: Heir[]): Map<HeirRelationship, HeirGroup> {
  const groups = new Map<HeirRelationship, HeirGroup>();
  for (const heir of heirs) {
    const existing = groups.get(heir.relationship);
    if (existing) {
      existing.count++;
      existing.heirs.push(heir);
    } else {
      groups.set(heir.relationship, { relationship: heir.relationship, count: 1, heirs: [heir] });
    }
  }
  return groups;
}

function has(groups: Map<HeirRelationship, HeirGroup>, rel: HeirRelationship): boolean {
  return groups.has(rel);
}

function count(groups: Map<HeirRelationship, HeirGroup>, rel: HeirRelationship): number {
  return groups.get(rel)?.count ?? 0;
}

/**
 * Simplified Faraid calculation engine.
 * Implements the core rules of Islamic inheritance:
 * 1. Fixed shares (Fard) for prescribed heirs
 * 2. Residuary (Asaba) distribution
 */
export function calculateFaraid(heirs: Heir[], totalEstate: number): FaraidResult {
  if (heirs.length === 0 || totalEstate <= 0) {
    return { heirs: [], total_distributed: 0, remainder: totalEstate };
  }

  const groups = groupHeirs(heirs);
  const shares: Map<string, { fraction: number; numerator: number; denominator: number }> = new Map();

  const hasSons = has(groups, 'son');
  const hasDaughters = has(groups, 'daughter');
  const hasGrandsons = has(groups, 'grandson');
  const hasChildren = hasSons || hasDaughters;

  // === SPOUSE SHARES ===
  if (has(groups, 'husband')) {
    const share = hasChildren ? 1 / 4 : 1 / 2;
    for (const h of groups.get('husband')!.heirs) {
      shares.set(h.id, { fraction: share, numerator: hasChildren ? 1 : 1, denominator: hasChildren ? 4 : 2 });
    }
  }

  if (has(groups, 'wife')) {
    const wifeCount = count(groups, 'wife');
    const totalShare = hasChildren ? 1 / 8 : 1 / 4;
    const perWife = totalShare / wifeCount;
    for (const h of groups.get('wife')!.heirs) {
      shares.set(h.id, { fraction: perWife, numerator: hasChildren ? 1 : 1, denominator: hasChildren ? 8 * wifeCount : 4 * wifeCount });
    }
  }

  // === PARENT SHARES ===
  if (has(groups, 'father')) {
    const share = hasChildren ? 1 / 6 : (hasSons ? 1 / 6 : 1 / 6); // father always gets 1/6 as fard when children exist; residuary otherwise
    for (const h of groups.get('father')!.heirs) {
      shares.set(h.id, { fraction: hasSons ? 1 / 6 : 1 / 6, numerator: 1, denominator: 6 });
    }
  }

  if (has(groups, 'mother')) {
    const hasMultipleSiblings = (count(groups, 'brother') + count(groups, 'sister') +
      count(groups, 'half_brother_paternal') + count(groups, 'half_sister_paternal') +
      count(groups, 'half_brother_maternal') + count(groups, 'half_sister_maternal')) >= 2;
    const share = hasChildren || hasMultipleSiblings ? 1 / 6 : 1 / 3;
    for (const h of groups.get('mother')!.heirs) {
      shares.set(h.id, { fraction: share, numerator: 1, denominator: hasChildren || hasMultipleSiblings ? 6 : 3 });
    }
  }

  // === GRANDMOTHER ===
  if (has(groups, 'grandmother') && !has(groups, 'mother')) {
    for (const h of groups.get('grandmother')!.heirs) {
      shares.set(h.id, { fraction: 1 / 6, numerator: 1, denominator: 6 });
    }
  }

  // === GRANDFATHER (when no father) ===
  if (has(groups, 'grandfather') && !has(groups, 'father')) {
    for (const h of groups.get('grandfather')!.heirs) {
      shares.set(h.id, { fraction: 1 / 6, numerator: 1, denominator: 6 });
    }
  }

  // === DAUGHTERS ===
  if (hasDaughters && !hasSons) {
    const dCount = count(groups, 'daughter');
    const totalShare = dCount === 1 ? 1 / 2 : 2 / 3;
    const perDaughter = totalShare / dCount;
    for (const h of groups.get('daughter')!.heirs) {
      shares.set(h.id, { fraction: perDaughter, numerator: dCount === 1 ? 1 : 2, denominator: dCount === 1 ? 2 : 3 * dCount });
    }
  }

  // === GRANDDAUGHTERS (when no sons/daughters) ===
  if (has(groups, 'granddaughter') && !hasSons && !hasDaughters) {
    const gdCount = count(groups, 'granddaughter');
    const totalShare = gdCount === 1 ? 1 / 2 : 2 / 3;
    const perGD = totalShare / gdCount;
    for (const h of groups.get('granddaughter')!.heirs) {
      shares.set(h.id, { fraction: perGD, numerator: gdCount === 1 ? 1 : 2, denominator: gdCount === 1 ? 2 : 3 * gdCount });
    }
  }

  // === SISTERS (when no children, no father) ===
  if (has(groups, 'sister') && !hasChildren && !has(groups, 'father') && !has(groups, 'son')) {
    const sCount = count(groups, 'sister');
    if (!has(groups, 'brother')) {
      const totalShare = sCount === 1 ? 1 / 2 : 2 / 3;
      const perSister = totalShare / sCount;
      for (const h of groups.get('sister')!.heirs) {
        shares.set(h.id, { fraction: perSister, numerator: sCount === 1 ? 1 : 2, denominator: sCount === 1 ? 2 : 3 * sCount });
      }
    }
  }

  // === HALF SIBLINGS MATERNAL ===
  if (has(groups, 'half_brother_maternal') || has(groups, 'half_sister_maternal')) {
    if (!hasChildren && !has(groups, 'father') && !has(groups, 'grandfather')) {
      const maternalCount = count(groups, 'half_brother_maternal') + count(groups, 'half_sister_maternal');
      const totalShare = maternalCount === 1 ? 1 / 6 : 1 / 3;
      const perMaternal = totalShare / maternalCount;
      for (const rel of ['half_brother_maternal', 'half_sister_maternal'] as HeirRelationship[]) {
        if (has(groups, rel)) {
          for (const h of groups.get(rel)!.heirs) {
            shares.set(h.id, { fraction: perMaternal, numerator: maternalCount === 1 ? 1 : 1, denominator: maternalCount === 1 ? 6 : 3 * maternalCount });
          }
        }
      }
    }
  }

  // Calculate total fixed shares
  let totalFixed = 0;
  for (const [, s] of shares) {
    totalFixed += s.fraction;
  }

  // === RESIDUARY (ASABA) ===
  const remainder = Math.max(0, 1 - totalFixed);

  // Sons and daughters together (2:1 ratio)
  if (hasSons) {
    const sonCount = count(groups, 'son');
    const daughterCount = hasDaughters ? count(groups, 'daughter') : 0;
    const totalParts = sonCount * 2 + daughterCount;
    const perPart = remainder / totalParts;

    for (const h of groups.get('son')!.heirs) {
      shares.set(h.id, { fraction: perPart * 2, numerator: 2, denominator: totalParts });
    }
    if (hasDaughters) {
      for (const h of groups.get('daughter')!.heirs) {
        shares.set(h.id, { fraction: perPart, numerator: 1, denominator: totalParts });
      }
    }
  }

  // Brothers and sisters together as asaba (2:1 ratio) when no children
  if (has(groups, 'brother') && !hasChildren && !hasGrandsons) {
    const bCount = count(groups, 'brother');
    const sCount = has(groups, 'sister') ? count(groups, 'sister') : 0;
    const totalParts = bCount * 2 + sCount;
    const perPart = remainder / totalParts;

    for (const h of groups.get('brother')!.heirs) {
      shares.set(h.id, { fraction: perPart * 2, numerator: 2, denominator: totalParts });
    }
    if (has(groups, 'sister')) {
      for (const h of groups.get('sister')!.heirs) {
        shares.set(h.id, { fraction: perPart, numerator: 1, denominator: totalParts });
      }
    }
  }

  // Father as asaba (gets remainder after fixed shares if no sons)
  if (has(groups, 'father') && !hasSons && remainder > 0) {
    const fatherHeir = groups.get('father')!.heirs[0];
    const existing = shares.get(fatherHeir.id);
    if (existing) {
      shares.set(fatherHeir.id, {
        fraction: existing.fraction + remainder,
        numerator: existing.numerator,
        denominator: existing.denominator,
      });
    }
  }

  // Build result
  const result: FaraidResult = {
    heirs: [],
    total_distributed: 0,
    remainder: 0,
  };

  for (const heir of heirs) {
    const share = shares.get(heir.id);
    const fraction = share?.fraction ?? 0;
    const amount = Math.round(fraction * totalEstate * 100) / 100;

    result.heirs.push({
      heir_id: heir.id,
      name: heir.name,
      relationship: heir.relationship,
      fraction: share ? `${share.numerator}/${share.denominator}` : '0',
      percentage: Math.round(fraction * 10000) / 100,
      amount,
    });

    result.total_distributed += amount;
  }

  result.total_distributed = Math.round(result.total_distributed * 100) / 100;
  result.remainder = Math.round((totalEstate - result.total_distributed) * 100) / 100;

  return result;
}
