// Bar-owner data: venue claims (ownership, pending admin approval), the
// specials owners post, and the "other info" overrides they can correct
// (description/phone/website/hours). All three require Supabase — there's
// no in-memory fallback here, since a real multi-user login system with no
// persistence would be meaningless. See supabase/schema.sql.
import crypto from "node:crypto";
import { hasSupabase, supabaseRequest } from "./supabaseClient";

export function isOwnerStoreConfigured() {
  return hasSupabase;
}

function inList(ids) {
  return ids.map((id) => `"${String(id).replace(/"/g, '\\"')}"`).join(",");
}

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

function rowToClaim(row) {
  return {
    id: row.id,
    venueId: row.venue_id,
    venueName: row.venue_name,
    venueCity: row.venue_city || undefined,
    venueCountryCode: row.venue_country_code || undefined,
    ownerId: row.owner_id,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined,
  };
}

export async function createClaim({ venueId, venueName, venueCity, venueCountryCode, ownerId }) {
  const row = {
    id: crypto.randomUUID(),
    venue_id: venueId,
    venue_name: venueName,
    venue_city: venueCity || null,
    venue_country_code: venueCountryCode || null,
    owner_id: ownerId,
    status: "pending",
  };
  await supabaseRequest("venue_claims", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
}

export async function listClaimsForOwner(ownerId) {
  const rows = (await supabaseRequest(`venue_claims?owner_id=eq.${ownerId}&order=created_at.desc`)) || [];
  return rows.map(rowToClaim);
}

export async function listPendingClaims() {
  const rows = (await supabaseRequest(`venue_claims?status=eq.pending&order=created_at.desc`)) || [];
  return rows.map(rowToClaim);
}

export async function setClaimStatus(id, status) {
  const rows = await supabaseRequest(`venue_claims?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status }),
  });
  return Boolean(rows && rows.length);
}

export async function isVenueApprovedForOwner(venueId, ownerId) {
  const rows = (await supabaseRequest(
    `venue_claims?venue_id=eq.${encodeURIComponent(venueId)}&owner_id=eq.${ownerId}&status=eq.approved&limit=1`
  )) || [];
  return rows.length > 0;
}

export async function listApprovedClaimedVenueIds(venueIds) {
  if (!venueIds.length) return new Set();
  const rows = (await supabaseRequest(
    `venue_claims?venue_id=in.(${inList(venueIds)})&status=eq.approved&select=venue_id`
  )) || [];
  return new Set(rows.map((r) => r.venue_id));
}

// ---------------------------------------------------------------------------
// Specials
// ---------------------------------------------------------------------------

function rowToSpecial(row) {
  return {
    id: row.id,
    venueId: row.venue_id,
    title: row.title,
    description: row.description || undefined,
    startsAt: row.starts_at || undefined,
    endsAt: row.ends_at || undefined,
  };
}

export async function listSpecialsForVenue(venueId) {
  const rows = (await supabaseRequest(`venue_specials?venue_id=eq.${encodeURIComponent(venueId)}&order=created_at.desc`)) || [];
  return rows.map(rowToSpecial);
}

export async function listSpecialsForVenues(venueIds) {
  if (!venueIds.length) return [];
  const rows = (await supabaseRequest(`venue_specials?venue_id=in.(${inList(venueIds)})&order=created_at.desc`)) || [];
  return rows.map(rowToSpecial);
}

export async function createSpecial({ venueId, ownerId, title, description, startsAt, endsAt }) {
  const row = {
    id: crypto.randomUUID(),
    venue_id: venueId,
    owner_id: ownerId,
    title,
    description: description || null,
    starts_at: startsAt || null,
    ends_at: endsAt || null,
  };
  await supabaseRequest("venue_specials", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
}

export async function deleteSpecial(id, ownerId) {
  await supabaseRequest(`venue_specials?id=eq.${id}&owner_id=eq.${ownerId}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

// ---------------------------------------------------------------------------
// Overrides ("other info": description / phone / website / hours)
// ---------------------------------------------------------------------------

function rowToOverride(row) {
  return {
    venueId: row.venue_id,
    description: row.description || undefined,
    phone: row.phone || undefined,
    website: row.website || undefined,
    hoursText: row.hours_text || undefined,
  };
}

export async function getOverride(venueId) {
  const rows = (await supabaseRequest(`venue_overrides?venue_id=eq.${encodeURIComponent(venueId)}&limit=1`)) || [];
  return rows.length ? rowToOverride(rows[0]) : null;
}

export async function getOverridesForVenues(venueIds) {
  if (!venueIds.length) return [];
  const rows = (await supabaseRequest(`venue_overrides?venue_id=in.(${inList(venueIds)})`)) || [];
  return rows.map(rowToOverride);
}

export async function upsertOverride({ venueId, ownerId, description, phone, website, hoursText }) {
  const row = {
    venue_id: venueId,
    owner_id: ownerId,
    description: description || null,
    phone: phone || null,
    website: website || null,
    hours_text: hoursText || null,
    updated_at: new Date().toISOString(),
  };
  await supabaseRequest("venue_overrides?on_conflict=venue_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
}

// ---------------------------------------------------------------------------
// Merges owner-provided data onto public search results.
// ---------------------------------------------------------------------------

export async function attachOwnerData(results) {
  if (!hasSupabase || !results.length) return results;
  const ids = results.map((r) => r.id);
  const [specials, overrides, claimedIds] = await Promise.all([
    listSpecialsForVenues(ids).catch(() => []),
    getOverridesForVenues(ids).catch(() => []),
    listApprovedClaimedVenueIds(ids).catch(() => new Set()),
  ]);

  const specialsByVenue = new Map();
  for (const s of specials) {
    if (!specialsByVenue.has(s.venueId)) specialsByVenue.set(s.venueId, []);
    specialsByVenue.get(s.venueId).push(s);
  }
  const overrideByVenue = new Map(overrides.map((o) => [o.venueId, o]));

  return results.map((r) => {
    const override = overrideByVenue.get(r.id);
    return {
      ...r,
      description: override?.description || r.description,
      phone: override?.phone || r.phone,
      website: override?.website || r.website,
      hoursText: override?.hoursText,
      specials: specialsByVenue.get(r.id) || [],
      claimed: claimedIds.has(r.id),
    };
  });
}
