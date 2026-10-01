export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const URGENCY_LEVELS = ["normal", "urgent", "critical"] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

export const REQUEST_STATUSES = ["active", "fulfilled", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface BloodRequest {
  id: string;
  requester_id: string;
  hospital_name: string;
  city: string;
  blood_group: BloodGroup;
  units_required: number;
  units_arranged: number;
  urgency: Urgency;
  status: RequestStatus;
  required_before: string;
  created_at: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface DonorMatch {
  donor_id: string;
  masked_name: string;
  blood_group: BloodGroup;
  match_score: number;
  distance_km: number;
  eligible: boolean;
  last_donation?: string;
  city: string;
}

export interface Donor {
  id: string;
  masked_name: string;
  blood_group: BloodGroup;
  city: string;
  available: boolean;
  verified: boolean;
  total_donations: number;
  last_donation?: string;
}

export interface Analytics {
  total_requests: number;
  active_emergency_requests: number;
  completed_donations: number;
  registered_donors: number;
  available_donors: number;
  fulfillment_rate: number;
  demand_by_blood_group: { blood_group: string; requests: number }[];
  requests_by_urgency: { urgency: string; count: number }[];
}

export interface CreateRequestPayload {
  blood_group: BloodGroup;
  units_required: number;
  hospital_name: string;
  city: string;
  latitude?: number;
  longitude?: number;
  required_before: string;
  urgency: Urgency;
  notes?: string;
}

export interface RequestFilters {
  blood_group?: string;
  city?: string;
  urgency?: string;
  status?: string;
}
