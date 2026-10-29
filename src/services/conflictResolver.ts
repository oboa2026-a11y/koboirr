import { SurveyRecord, ConflictDetail, IrrigationScheme } from '../types/survey';

export interface ConflictResolutionResult {
  hasConflict: boolean;
  resolvedRecord: SurveyRecord;
  conflicts: ConflictDetail[];
}

/**
 * Automatically resolves conflicts between an incoming offline submission
 * and an existing server/synced record for the same Kebele, Reporting Week, and Year.
 */
export const resolveSubmissionConflict = (
  serverRecord: SurveyRecord,
  clientRecord: SurveyRecord
): ConflictResolutionResult => {
  const conflicts: ConflictDetail[] = [];
  const now = new Date().toISOString();

  // Clone client record as base resolved record
  const resolved: SurveyRecord = JSON.parse(JSON.stringify(clientRecord));

  // 1. Cumulative Sown Area: Monotonic Progress Principle
  if (serverRecord.area_sown_cum_ha !== clientRecord.area_sown_cum_ha) {
    const maxSown = Math.max(serverRecord.area_sown_cum_ha, clientRecord.area_sown_cum_ha);
    conflicts.push({
      id: `conf_${Date.now()}_sown`,
      recordId: clientRecord.id,
      field: 'area_sown_cum_ha',
      fieldLabel: 'Cumulative Area Sown (ha)',
      serverValue: serverRecord.area_sown_cum_ha,
      clientValue: clientRecord.area_sown_cum_ha,
      resolvedValue: maxSown,
      strategyUsed: 'monotonic_max',
      reason: `Monotonic Progress: Preserved highest verified cumulative hectares (${maxSown} ha) to prevent regressive reporting.`,
      detectedAt: now,
      resolvedAt: now,
    });
    resolved.area_sown_cum_ha = maxSown;
    // Recompute percentage and gap
    resolved.ach_sown_pct = Number(((maxSown / resolved.plan_area_ha) * 100).toFixed(1));
    resolved.area_gap_ha = Math.max(0, resolved.plan_area_ha - maxSown);
  }

  // 2. Cumulative Land Prepared: Monotonic Max
  if (serverRecord.land_prepared_cum_ha !== clientRecord.land_prepared_cum_ha) {
    const maxPrep = Math.max(serverRecord.land_prepared_cum_ha, clientRecord.land_prepared_cum_ha);
    conflicts.push({
      id: `conf_${Date.now()}_prep`,
      recordId: clientRecord.id,
      field: 'land_prepared_cum_ha',
      fieldLabel: 'Land Prepared Cumulative (ha)',
      serverValue: serverRecord.land_prepared_cum_ha,
      clientValue: clientRecord.land_prepared_cum_ha,
      resolvedValue: maxPrep,
      strategyUsed: 'monotonic_max',
      reason: `Monotonic Progress: Preserved maximum land preparation area (${maxPrep} ha).`,
      detectedAt: now,
      resolvedAt: now,
    });
    resolved.land_prepared_cum_ha = maxPrep;
  }

  // 3. Participating Households: Monotonic Max
  if (serverRecord.hh_part_total !== clientRecord.hh_part_total) {
    const maxHh = Math.max(serverRecord.hh_part_total, clientRecord.hh_part_total);
    conflicts.push({
      id: `conf_${Date.now()}_hh`,
      recordId: clientRecord.id,
      field: 'hh_part_total',
      fieldLabel: 'Participating Beneficiary Farmers',
      serverValue: serverRecord.hh_part_total,
      clientValue: clientRecord.hh_part_total,
      resolvedValue: maxHh,
      strategyUsed: 'monotonic_max',
      reason: `Highest recorded beneficiary count preserved (${maxHh} households).`,
      detectedAt: now,
      resolvedAt: now,
    });
    resolved.hh_part_total = maxHh;
    resolved.hh_part_pct = Number(((maxHh / resolved.plan_hh_total) * 100).toFixed(1));
  }

  // 4. Seed Distribution & Usage: Monotonic Max
  if (serverRecord.seed_dist_total_qt !== clientRecord.seed_dist_total_qt) {
    const maxSeed = Math.max(serverRecord.seed_dist_total_qt, clientRecord.seed_dist_total_qt);
    conflicts.push({
      id: `conf_${Date.now()}_seed`,
      recordId: clientRecord.id,
      field: 'seed_dist_total_qt',
      fieldLabel: 'Seed Distributed Total (Quintals)',
      serverValue: serverRecord.seed_dist_total_qt,
      clientValue: clientRecord.seed_dist_total_qt,
      resolvedValue: maxSeed,
      strategyUsed: 'monotonic_max',
      reason: `Seed consignment totals monotonic max applied (${maxSeed} qt).`,
      detectedAt: now,
      resolvedAt: now,
    });
    resolved.seed_dist_total_qt = maxSeed;
  }

  // 5. Irrigation Schemes Smart Merge
  const mergedSchemes: IrrigationScheme[] = [];
  const serverSchemesMap = new Map<string, IrrigationScheme>();
  serverRecord.schemes.forEach((s) => serverSchemesMap.set(s.id || s.name, s));

  clientRecord.schemes.forEach((clientScheme) => {
    const key = clientScheme.id || clientScheme.name;
    const serverScheme = serverSchemesMap.get(key);

    if (serverScheme) {
      serverSchemesMap.delete(key);
      const schemeCopy: IrrigationScheme = { ...clientScheme };

      // Check pump maintenance discrepancies
      if (
        serverScheme.pumps_under_maintenance !== clientScheme.pumps_under_maintenance ||
        serverScheme.pumps_broken !== clientScheme.pumps_broken
      ) {
        // Last write wins for physical equipment inspection
        const clientDate = new Date(clientRecord.updatedAt || clientRecord.createdAt).getTime();
        const serverDate = new Date(serverRecord.updatedAt || serverRecord.createdAt).getTime();

        if (clientDate >= serverDate) {
          conflicts.push({
            id: `conf_${Date.now()}_pump_${clientScheme.id}`,
            recordId: clientRecord.id,
            field: `scheme_${clientScheme.name}_pumps`,
            fieldLabel: `Pump Status: ${clientScheme.name}`,
            serverValue: `Broken: ${serverScheme.pumps_broken}, Maint: ${serverScheme.pumps_under_maintenance}`,
            clientValue: `Broken: ${clientScheme.pumps_broken}, Maint: ${clientScheme.pumps_under_maintenance}`,
            resolvedValue: `Broken: ${clientScheme.pumps_broken}, Maint: ${clientScheme.pumps_under_maintenance}`,
            strategyUsed: 'last_write_wins',
            reason: `Field Ground-Truth Inspection: Recent on-site technician audit from client accepted.`,
            detectedAt: now,
            resolvedAt: now,
          });
        } else {
          schemeCopy.pumps_functional = serverScheme.pumps_functional;
          schemeCopy.pumps_broken = serverScheme.pumps_broken;
          schemeCopy.pumps_under_maintenance = serverScheme.pumps_under_maintenance;
          conflicts.push({
            id: `conf_${Date.now()}_pump_${clientScheme.id}`,
            recordId: clientRecord.id,
            field: `scheme_${clientScheme.name}_pumps`,
            fieldLabel: `Pump Status: ${clientScheme.name}`,
            serverValue: `Broken: ${serverScheme.pumps_broken}, Maint: ${serverScheme.pumps_under_maintenance}`,
            clientValue: `Broken: ${clientScheme.pumps_broken}, Maint: ${clientScheme.pumps_under_maintenance}`,
            resolvedValue: `Broken: ${serverScheme.pumps_broken}, Maint: ${serverScheme.pumps_under_maintenance}`,
            strategyUsed: 'last_write_wins',
            reason: `Server had more recent pump workshop log.`,
            detectedAt: now,
            resolvedAt: now,
          });
        }
      }
      mergedSchemes.push(schemeCopy);
    } else {
      // New scheme added by client
      mergedSchemes.push(clientScheme);
    }
  });

  // Any server schemes not present in client submission are retained
  serverSchemesMap.forEach((s) => mergedSchemes.push(s));
  resolved.schemes = mergedSchemes;

  // 6. Fertilizer and Chemical Inputs: Field-level 3-way merge
  if (serverRecord.inputs && clientRecord.inputs) {
    const ureaUsed = Math.max(serverRecord.inputs.urea_used_qt, clientRecord.inputs.urea_used_qt);
    const npsUsed = Math.max(serverRecord.inputs.nps_used_qt, clientRecord.inputs.nps_used_qt);
    const fungicideUsed = Math.max(serverRecord.inputs.fungicide_used_l, clientRecord.inputs.fungicide_used_l);

    if (ureaUsed !== clientRecord.inputs.urea_used_qt) {
      conflicts.push({
        id: `conf_${Date.now()}_urea`,
        recordId: clientRecord.id,
        field: 'inputs.urea_used_qt',
        fieldLabel: 'Urea Fertilizer Applied (qt)',
        serverValue: serverRecord.inputs.urea_used_qt,
        clientValue: clientRecord.inputs.urea_used_qt,
        resolvedValue: ureaUsed,
        strategyUsed: 'field_merge',
        reason: 'Consolidated maximum fertilizer distribution log.',
        detectedAt: now,
        resolvedAt: now,
      });
      resolved.inputs.urea_used_qt = ureaUsed;
    }
    resolved.inputs.nps_used_qt = npsUsed;
    resolved.inputs.fungicide_used_l = fungicideUsed;
  }

  // 7. Challenges & Remarks: Union Merge
  resolved.challenges.water_shortage = serverRecord.challenges.water_shortage || clientRecord.challenges.water_shortage;
  resolved.challenges.fuel_power_shortage =
    serverRecord.challenges.fuel_power_shortage || clientRecord.challenges.fuel_power_shortage;
  resolved.challenges.fertilizer_shortage =
    serverRecord.challenges.fertilizer_shortage || clientRecord.challenges.fertilizer_shortage;
  resolved.challenges.pest_rust_outbreak =
    serverRecord.challenges.pest_rust_outbreak || clientRecord.challenges.pest_rust_outbreak;
  resolved.challenges.pump_breakdown = serverRecord.challenges.pump_breakdown || clientRecord.challenges.pump_breakdown;

  // Combine remarks if different
  if (
    serverRecord.challenges.remarks &&
    clientRecord.challenges.remarks &&
    serverRecord.challenges.remarks !== clientRecord.challenges.remarks
  ) {
    resolved.challenges.remarks = `${clientRecord.challenges.remarks} | [Server Note]: ${serverRecord.challenges.remarks}`;
  }

  // Update sync metadata
  resolved.syncStatus = conflicts.length > 0 ? 'conflict_resolved' : 'synced';
  resolved.syncedAt = now;
  resolved.conflicts = [...(resolved.conflicts || []), ...conflicts];

  return {
    hasConflict: conflicts.length > 0,
    resolvedRecord: resolved,
    conflicts,
  };
};
