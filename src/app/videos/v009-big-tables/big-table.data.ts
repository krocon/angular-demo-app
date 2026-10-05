import { mulberry32 } from '../../core/fake-backend/fake-db';

export interface BigRow {
  id: number;
  name: string;
  city: string;
  score: number;
  status: string;
  email: string;
  phone: string;
  country: string;
  team: string;
  created: string;
}

export type BigColumn = keyof BigRow;

export const ALL_COLUMNS: readonly { key: BigColumn; label: string; numeric?: boolean }[] = [
  { key: 'id', label: 'ID', numeric: true },
  { key: 'name', label: 'Name' },
  { key: 'city', label: 'City' },
  { key: 'score', label: 'Score', numeric: true },
  { key: 'status', label: 'Status' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'country', label: 'Country' },
  { key: 'team', label: 'Team' },
  { key: 'created', label: 'Created' },
];

const NAMES = [
  'Ada',
  'Grace',
  'Linus',
  'Margaret',
  'Alan',
  'Barbara',
  'Ken',
  'Radia',
  'Tim',
  'Hedy',
];
const CITIES = ['Berlin', 'Hamburg', 'Munich', 'Vienna', 'Zurich', 'Lisbon', 'Oslo', 'Prague'];
const STATUS = ['active', 'paused', 'invited', 'blocked'];
const COUNTRIES = ['DE', 'AT', 'CH', 'PT', 'NO', 'CZ'];
const TEAMS = ['Core', 'Forms', 'Router', 'CDK', 'Material', 'CLI'];

let cache: BigRow[] = [];

/** Deterministic rows; generated once (up to the largest requested count) and then sliced. */
export function generateRows(count: number): BigRow[] {
  if (cache.length < count) {
    const rnd = mulberry32(9);
    const pick = <T>(list: readonly T[]): T => list[Math.floor(rnd() * list.length)] as T;
    cache = Array.from({ length: count }, (_, i) => {
      const name = `${pick(NAMES)} ${String.fromCharCode(65 + (i % 26))}.`;
      return {
        id: i + 1,
        name,
        city: pick(CITIES),
        score: Math.round(rnd() * 1000) / 10,
        status: pick(STATUS),
        email: `user${i + 1}@example.com`,
        phone: `+49 30 ${String(1000000 + Math.floor(rnd() * 8999999))}`,
        country: pick(COUNTRIES),
        team: pick(TEAMS),
        created: new Date(Date.UTC(2020, 0, 1) + Math.floor(rnd() * 2000) * 86400000)
          .toISOString()
          .slice(0, 10),
      };
    });
  }
  return cache.slice(0, count);
}

export type SortDirection = 'asc' | 'desc';

export function sortRows(
  rows: readonly BigRow[],
  key: BigColumn,
  direction: SortDirection,
): BigRow[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => (a[key] < b[key] ? -factor : a[key] > b[key] ? factor : 0));
}

export function filterRows(rows: readonly BigRow[], query: string): readonly BigRow[] {
  const q = query.trim().toLowerCase();
  return q
    ? rows.filter((r) => r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q))
    : rows;
}
