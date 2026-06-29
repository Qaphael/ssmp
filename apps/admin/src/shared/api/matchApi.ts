import { MatchStatus, MatchEventType } from '@ssmp/shared-types';

const API_BASE = () => {
  try {
    const stored = localStorage.getItem('sm_api_url');
    return stored ? stored.replace(/\/$/, '') : 'http://localhost:3001';
  } catch {
    return 'http://localhost:3001';
  }
};

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const base = API_BASE();
  const token = localStorage.getItem('sm_jwt_token') || '';
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export interface MatchData {
  id: string;
  fixture_id: string;
  competition_id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: MatchStatus;
  pitch_id?: string;
  scheduled_at: string;
  started_at?: string;
  half_time_at?: string;
  ended_at?: string;
  official_id?: string;
  matchday?: number;
  home_team_name?: string;
  away_team_name?: string;
  official_name?: string;
}

export interface MatchEventData {
  id: string;
  match_id: string;
  type: MatchEventType;
  minute: number;
  player_id?: string;
  team_id?: string;
  description?: string;
  recorded_by: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  team_name?: string;
}

export async function listMatches(filters?: { officialId?: string; competitionId?: string; status?: string }): Promise<MatchData[]> {
  const params = new URLSearchParams();
  if (filters?.officialId) params.set('officialId', filters.officialId);
  if (filters?.competitionId) params.set('competitionId', filters.competitionId);
  if (filters?.status) params.set('status', filters.status);
  const qs = params.toString();
  const res = await apiFetch(`/api/matches${qs ? '?' + qs : ''}`);
  return res.data || [];
}

export async function getMatch(id: string): Promise<MatchData> {
  const res = await apiFetch(`/api/matches/${id}`);
  return res.data;
}

export async function updateMatchStatus(id: string, status: MatchStatus): Promise<MatchData> {
  const res = await apiFetch(`/api/matches/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res.data;
}

export async function assignOfficial(matchId: string, officialId: string): Promise<MatchData> {
  const res = await apiFetch(`/api/matches/${matchId}/assign-official`, {
    method: 'POST',
    body: JSON.stringify({ officialId }),
  });
  return res.data;
}

export async function recordEvent(matchId: string, data: {
  matchId: string;
  type: MatchEventType;
  minute: number;
  playerId?: string;
  teamId?: string;
  description?: string;
  recordedBy: string;
}): Promise<MatchEventData> {
  const res = await apiFetch(`/api/matches/${matchId}/events`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function listMatchEvents(matchId: string): Promise<MatchEventData[]> {
  const res = await apiFetch(`/api/matches/${matchId}/events`);
  return res.data || [];
}

export async function submitReport(matchId: string, homeScore: number, awayScore: number): Promise<MatchData> {
  const res = await apiFetch(`/api/matches/${matchId}/submit-report`, {
    method: 'POST',
    body: JSON.stringify({ homeScore, awayScore }),
  });
  return res.data;
}

export async function verifyMatch(matchId: string): Promise<MatchData> {
  const res = await apiFetch(`/api/matches/${matchId}/verify`, { method: 'POST' });
  return res.data;
}

export async function publishMatch(matchId: string): Promise<MatchData> {
  const res = await apiFetch(`/api/matches/${matchId}/publish`, { method: 'POST' });
  return res.data;
}

export async function recordWalkover(matchId: string, walkoverTeamId: string, walkoverReason: string): Promise<MatchData> {
  const res = await apiFetch(`/api/matches/${matchId}/walkover`, {
    method: 'POST',
    body: JSON.stringify({ walkoverTeamId, walkoverReason }),
  });
  return res.data;
}

export async function postponeMatch(matchId: string, postponedReason: string): Promise<MatchData> {
  const res = await apiFetch(`/api/matches/${matchId}/postpone`, {
    method: 'POST',
    body: JSON.stringify({ postponedReason }),
  });
  return res.data;
}
