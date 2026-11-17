export type ListKind = "shopping" | "trip" | "custom";

export type HouseholdListRow = {
  id: string;
  household_id: string;
  creator_id: string | null;
  title: string;
  kind: ListKind;
  trip_start_date: string | null;
  trip_end_date: string | null;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
};

export type ListItemRow = {
  id: string;
  list_id: string;
  household_id: string;
  title: string;
  is_checked: boolean;
  note: string | null;
  sort_order: number;
  creator_id: string | null;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type FetchListsResult =
  | { ok: true; data: HouseholdListRow[] }
  | {
      ok: false;
      reason: "no_client" | "no_session" | "expired" | "error";
      message: string;
    };

export type FetchListItemsResult =
  | { ok: true; data: ListItemRow[] }
  | {
      ok: false;
      reason: "no_client" | "no_session" | "expired" | "error";
      message: string;
    };

export type CreateListInput = {
  householdId: string;
  creatorId: string;
  title: string;
  kind: ListKind;
  sortOrder?: number;
};

export type CreateListItemInput = {
  listId: string;
  householdId: string;
  creatorId: string;
  title: string;
  sortOrder?: number;
};

export type MutationResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      reason: "no_client" | "no_session" | "expired" | "error" | "validation";
      message: string;
    };
