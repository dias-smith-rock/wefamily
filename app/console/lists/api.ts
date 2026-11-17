import { requireAuthenticatedSession } from "@/lib/auth/require-session";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type {
  CreateListInput,
  CreateListItemInput,
  FetchListItemsResult,
  FetchListsResult,
  HouseholdListRow,
  ListItemRow,
  ListKind,
  MutationResult,
} from "./types";

const LIST_COLUMNS =
  "id, household_id, creator_id, title, kind, trip_start_date, trip_end_date, sort_order, created_at, updated_at";

const ITEM_COLUMNS =
  "id, list_id, household_id, title, is_checked, note, sort_order, creator_id, completed_by, completed_at, created_at, updated_at";

function normalizeKind(raw: unknown): ListKind {
  const k = String(raw ?? "custom").trim().toLowerCase();
  if (k === "shopping" || k === "trip" || k === "custom") return k;
  return "custom";
}

function normalizeList(raw: Record<string, unknown>): HouseholdListRow {
  return {
    id: String(raw.id),
    household_id: String(raw.household_id),
    creator_id: (raw.creator_id as string | null) ?? null,
    title: String(raw.title ?? ""),
    kind: normalizeKind(raw.kind),
    trip_start_date: (raw.trip_start_date as string | null) ?? null,
    trip_end_date: (raw.trip_end_date as string | null) ?? null,
    sort_order: Number(raw.sort_order ?? 0),
    created_at: (raw.created_at as string | null) ?? null,
    updated_at: (raw.updated_at as string | null) ?? null,
  };
}

function normalizeItem(raw: Record<string, unknown>): ListItemRow {
  return {
    id: String(raw.id),
    list_id: String(raw.list_id),
    household_id: String(raw.household_id),
    title: String(raw.title ?? ""),
    is_checked: Boolean(raw.is_checked),
    note: (raw.note as string | null) ?? null,
    sort_order: Number(raw.sort_order ?? 0),
    creator_id: (raw.creator_id as string | null) ?? null,
    completed_by: (raw.completed_by as string | null) ?? null,
    completed_at: (raw.completed_at as string | null) ?? null,
    created_at: (raw.created_at as string | null) ?? null,
    updated_at: (raw.updated_at as string | null) ?? null,
  };
}

async function guardSession(): Promise<
  | { ok: true }
  | {
      ok: false;
      reason: "no_client" | "no_session" | "expired";
      message: string;
    }
> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, reason: "no_client", message: "missingConfig" };
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return { ok: false, reason: "no_session", message: "pleaseSignIn" };
  }
  const guard = await requireAuthenticatedSession(supabase);
  if (!guard.ok) {
    if (guard.reason === "expired") {
      return { ok: false, reason: "expired", message: "sessionExpired" };
    }
    return { ok: false, reason: "no_session", message: "pleaseSignIn" };
  }
  return { ok: true };
}

export async function fetchHouseholdLists(
  householdId: string,
): Promise<FetchListsResult> {
  const supabase = getSupabaseBrowserClient();
  const session = await guardSession();
  if (!session.ok) return session;
  if (!supabase) {
    return { ok: false, reason: "no_client", message: "missingConfig" };
  }

  const { data, error } = await supabase
    .from("household_lists")
    .select(LIST_COLUMNS)
    .eq("household_id", householdId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, reason: "error", message: error.message };
  }

  return {
    ok: true,
    data: (data ?? []).map((r) =>
      normalizeList(r as unknown as Record<string, unknown>),
    ),
  };
}

export async function fetchListItems(
  listId: string,
): Promise<FetchListItemsResult> {
  const supabase = getSupabaseBrowserClient();
  const session = await guardSession();
  if (!session.ok) return session;
  if (!supabase) {
    return { ok: false, reason: "no_client", message: "missingConfig" };
  }

  const { data, error } = await supabase
    .from("list_items")
    .select(ITEM_COLUMNS)
    .eq("list_id", listId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return { ok: false, reason: "error", message: error.message };
  }

  return {
    ok: true,
    data: (data ?? []).map((r) =>
      normalizeItem(r as unknown as Record<string, unknown>),
    ),
  };
}

export async function createHouseholdList(
  input: CreateListInput,
): Promise<MutationResult<HouseholdListRow>> {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, reason: "validation", message: "listTitleRequired" };
  }
  if (!input.householdId || !input.creatorId) {
    return { ok: false, reason: "validation", message: "missingConfig" };
  }

  const supabase = getSupabaseBrowserClient();
  const session = await guardSession();
  if (!session.ok) return session;
  if (!supabase) {
    return { ok: false, reason: "no_client", message: "missingConfig" };
  }

  const kind = normalizeKind(input.kind);
  const { data, error } = await supabase
    .from("household_lists")
    .insert({
      household_id: input.householdId,
      creator_id: input.creatorId,
      title,
      kind,
      sort_order: input.sortOrder ?? 0,
    })
    .select(LIST_COLUMNS)
    .single();

  if (error) {
    return { ok: false, reason: "error", message: error.message };
  }

  return {
    ok: true,
    data: normalizeList(data as unknown as Record<string, unknown>),
  };
}

export async function createListItem(
  input: CreateListItemInput,
): Promise<MutationResult<ListItemRow>> {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, reason: "validation", message: "listItemTitleRequired" };
  }
  if (!input.listId || !input.householdId || !input.creatorId) {
    return { ok: false, reason: "validation", message: "missingConfig" };
  }

  const supabase = getSupabaseBrowserClient();
  const session = await guardSession();
  if (!session.ok) return session;
  if (!supabase) {
    return { ok: false, reason: "no_client", message: "missingConfig" };
  }

  const { data, error } = await supabase
    .from("list_items")
    .insert({
      list_id: input.listId,
      household_id: input.householdId,
      creator_id: input.creatorId,
      title,
      is_checked: false,
      sort_order: input.sortOrder ?? 0,
    })
    .select(ITEM_COLUMNS)
    .single();

  if (error) {
    return { ok: false, reason: "error", message: error.message };
  }

  return {
    ok: true,
    data: normalizeItem(data as unknown as Record<string, unknown>),
  };
}

export async function setListItemChecked(params: {
  itemId: string;
  checked: boolean;
  membershipId: string;
}): Promise<MutationResult<ListItemRow>> {
  const supabase = getSupabaseBrowserClient();
  const session = await guardSession();
  if (!session.ok) return session;
  if (!supabase) {
    return { ok: false, reason: "no_client", message: "missingConfig" };
  }

  const payload = params.checked
    ? {
        is_checked: true,
        completed_by: params.membershipId,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    : {
        is_checked: false,
        completed_by: null,
        completed_at: null,
        updated_at: new Date().toISOString(),
      };

  const { data, error } = await supabase
    .from("list_items")
    .update(payload)
    .eq("id", params.itemId)
    .select(ITEM_COLUMNS)
    .single();

  if (error) {
    return { ok: false, reason: "error", message: error.message };
  }

  return {
    ok: true,
    data: normalizeItem(data as unknown as Record<string, unknown>),
  };
}
