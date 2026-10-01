import { demoAnalytics, demoDonors, demoMatches, demoRequests } from "./humapulse-demo";
import type {
  Analytics,
  BloodRequest,
  CreateRequestPayload,
  Donor,
  DonorMatch,
  RequestFilters,
} from "./humapulse-types";

/**
 * API client for the HumaPulse FastAPI backend.
 * When the backend is unreachable (e.g. the hosted demo), every call
 * transparently falls back to local demo data so the UI stays usable.
 */
const env = import.meta.env as Record<string, string | undefined>;

/** Backend URL: set VITE_API_BASE_URL in production (e.g. https://api.humapulse.com). */
export const API_BASE_URL = (
  env["VITE_API_BASE_URL"] ??
  env["VITE_HUMAPULSE_API_URL"] ??
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

/** Mock fallback toggle: VITE_USE_MOCK_DATA=always | fallback (default) | never. */
const MOCK_MODE = (env["VITE_USE_MOCK_DATA"] ?? "fallback").toLowerCase();
const API_TIMEOUT_MS = Number(env["VITE_API_TIMEOUT_MS"] ?? 6000);

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Set once the backend proves unreachable, so we stop retrying every query. */
let backendOffline = MOCK_MODE === "always";

function friendlyMessage(status: number, message: string) {
  if (status >= 500) return "The HumaPulse server had a problem. Please try again shortly.";
  if (status === 404) return "That record could not be found.";
  if (status === 401 || status === 403) return "You don't have permission to do that.";
  return message;
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  // Never call the local backend during server rendering — the browser owns it.
  if (typeof window === "undefined") throw new ApiError("Backend unavailable during SSR", 503);
  if (backendOffline) throw new ApiError("Backend unreachable", 503);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      ...init,
    });
  } catch {
    if (MOCK_MODE !== "never") backendOffline = true;
    throw new ApiError("Backend unreachable", 503);
  }
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !body?.success) {
    const status = res.ok ? 400 : res.status;
    const message = friendlyMessage(status, body?.message ?? `Request failed (${status})`);
    // 5xx are surfaced globally; 4xx (e.g. duplicate request) are shown by the form that sent them.
    if (status >= 500) {
      const { toast } = await import("sonner");
      toast.error(message, { id: `api-${status}` });
    }
    throw new ApiError(message, status);
  }
  return body;
}

function matchesFilters(r: BloodRequest, f: RequestFilters) {
  if (f.blood_group && f.blood_group !== "all" && r.blood_group !== f.blood_group) return false;
  if (f.urgency && f.urgency !== "all" && r.urgency !== f.urgency) return false;
  if (f.status && f.status !== "all" && r.status !== f.status) return false;
  if (f.city && !r.city.toLowerCase().includes(f.city.trim().toLowerCase())) return false;
  return true;
}

/** Requests created locally while the backend is offline. */
const localRequests: BloodRequest[] = [];

export async function searchRequests(filters: RequestFilters): Promise<BloodRequest[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v && v !== "all") params.set(k, String(v));
  });
  try {
    const res = await request<BloodRequest[]>(`/api/v1/requests/search?${params.toString()}`);
    return res.data ?? [];
  } catch {
    return [...localRequests, ...demoRequests].filter((r) => matchesFilters(r, filters));
  }
}

export async function fetchMatches(requestId: string): Promise<DonorMatch[]> {
  try {
    const res = await request<DonorMatch[]>(`/api/v1/requests/${requestId}/matches?batch=1`);
    return res.data ?? [];
  } catch {
    const target = [...localRequests, ...demoRequests].find((r) => r.id === requestId);
    return demoMatches.map((m) => ({
      ...m,
      blood_group: target?.blood_group ?? m.blood_group,
      city: target?.city ?? m.city,
    }));
  }
}

export async function createRequest(payload: CreateRequestPayload): Promise<BloodRequest> {
  try {
    const res = await request<BloodRequest>("/api/v1/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new ApiError("Request created but no data returned", 500);
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) throw err;
    const duplicate = [...localRequests, ...demoRequests].some(
      (r) =>
        r.status === "active" &&
        r.blood_group === payload.blood_group &&
        r.hospital_name.toLowerCase() === payload.hospital_name.trim().toLowerCase(),
    );
    if (duplicate) {
      throw new ApiError(
        "A matching active request already exists for this hospital and blood group.",
        400,
      );
    }
    const created: BloodRequest = {
      id: `REQ-${Math.floor(10000 + Math.random() * 89999)}`,
      requester_id: "USR-LOCAL",
      units_arranged: 0,
      status: "active",
      created_at: new Date().toISOString(),
      ...payload,
      notes: payload.notes,
    };
    localRequests.unshift(created);
    return created;
  }
}

export async function updateRequestStatus(
  requestId: string,
  status: "fulfilled" | "cancelled",
): Promise<void> {
  try {
    await request(`/api/v1/requests/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch {
    const all = [...localRequests, ...demoRequests];
    const target = all.find((r) => r.id === requestId);
    if (target) {
      target.status = status;
      if (status === "fulfilled") target.units_arranged = target.units_required;
    }
  }
}

export async function fetchAnalytics(): Promise<Analytics> {
  try {
    const res = await request<Analytics>("/api/v1/dashboard/analytics");
    return res.data ?? demoAnalytics;
  } catch {
    return demoAnalytics;
  }
}

export async function fetchDonors(filters: {
  blood_group?: string | undefined;
  city?: string | undefined;
  available?: string | undefined;
}): Promise<Donor[]> {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== "all") params.set(k, String(v));
    });
    const res = await request<Donor[]>(`/api/v1/donors?${params.toString()}`);
    return res.data ?? [];
  } catch {
    return demoDonors.filter((d) => {
      if (filters.blood_group && filters.blood_group !== "all" && d.blood_group !== filters.blood_group)
        return false;
      if (filters.city && !d.city.toLowerCase().includes(filters.city.trim().toLowerCase()))
        return false;
      if (filters.available === "available" && !d.available) return false;
      if (filters.available === "unavailable" && d.available) return false;
      return true;
    });
  }
}
