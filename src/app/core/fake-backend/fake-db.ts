/** Deterministic seed data for the in-memory API (mulberry32 PRNG with a fixed seed). */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Company {
  readonly id: number;
  readonly name: string;
  readonly city: string;
  readonly employees: number;
}

export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly companyId: number;
}

export interface Product {
  readonly id: number;
  readonly name: string;
  readonly emoji: string;
  readonly color: string;
  readonly price: number;
  readonly description: string;
}

export interface AppConfig {
  readonly appName: string;
  readonly apiVersion: string;
  readonly environment: string;
  readonly features: Readonly<Record<string, boolean>>;
}

export interface Profile {
  readonly displayName: string;
  readonly bio: string;
  readonly language: string;
  readonly notifications: boolean;
}

const FIRST = [
  'Ada',
  'Grace',
  'Linus',
  'Margaret',
  'Alan',
  'Barbara',
  'Ken',
  'Radia',
  'Tim',
  'Frances',
  'Dennis',
  'Hedy',
  'Edsger',
  'Katherine',
  'John',
  'Sophie',
  'Niklaus',
  'Anita',
  'Guido',
  'Mary',
];
const LAST = [
  'Lovelace',
  'Hopper',
  'Torvalds',
  'Hamilton',
  'Turing',
  'Liskov',
  'Thompson',
  'Perlman',
  'Berners-Lee',
  'Allen',
  'Ritchie',
  'Lamarr',
  'Dijkstra',
  'Johnson',
  'McCarthy',
  'Wilson',
  'Wirth',
  'Borg',
  'van Rossum',
  'Shaw',
];
const ROLES = ['Developer', 'Designer', 'Product Owner', 'Architect', 'QA Engineer', 'DevOps'];
const COMPANY_PREFIX = [
  'Signal',
  'Zone',
  'Lazy',
  'Standalone',
  'Reactive',
  'Deferred',
  'Hydrated',
  'Linked',
];
const COMPANY_SUFFIX = ['Labs', 'Systems', 'Works', 'Collective'];
const CITIES = [
  'Berlin',
  'Hamburg',
  'Munich',
  'Vienna',
  'Zurich',
  'Amsterdam',
  'Lisbon',
  'Copenhagen',
];
const PRODUCTS: readonly [string, string, string][] = [
  ['Signal Lamp', '💡', '#ffb300'],
  ['Zone Breaker', '🔨', '#e53935'],
  ['Lazy Chair', '🪑', '#8d6e63'],
  ['Deferred Rocket', '🚀', '#3949ab'],
  ['Hydration Bottle', '🧴', '#00acc1'],
  ['Router Map', '🗺️', '#43a047'],
  ['Injector Pen', '🖊️', '#5e35b1'],
  ['Pipe Organ', '🎹', '#6d4c41'],
  ['Effect Wand', '🪄', '#d81b60'],
  ['Computed Cube', '🧊', '#039be5'],
  ['Resource Tree', '🌳', '#2e7d32'],
  ['Template Kite', '🪁', '#f4511e'],
  ['Track Shoes', '👟', '#546e7a'],
  ['Linked Chain', '⛓️', '#757575'],
  ['Snapshot Camera', '📷', '#455a64'],
  ['Bundle Box', '📦', '#a1887f'],
  ['Budget Wallet', '👛', '#c2185b'],
  ['Theme Palette', '🎨', '#7b1fa2'],
  ['Material Fabric', '🧵', '#0288d1'],
  ['Virtual Glasses', '🥽', '#00897b'],
  ['Test Tube', '🧪', '#7cb342'],
  ['Plugin Socket', '🔌', '#fb8c00'],
  ['Debounce Ball', '🏀', '#ef6c00'],
  ['Migration Bird', '🐦', '#1e88e5'],
];

/** Usernames that are always taken (async validation demos). */
export const TAKEN_USERNAMES: readonly string[] = [
  'admin',
  'root',
  'angular',
  'nerd',
  'test',
  'signal',
  'user',
];

export interface FakeDb {
  readonly companies: Company[];
  users: User[];
  readonly products: readonly Product[];
  readonly config: AppConfig;
  profile: Profile;
}

export function createFakeDb(seed = 22): FakeDb {
  const rnd = mulberry32(seed);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(rnd() * list.length)] as T;

  const companies: Company[] = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    name: `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`,
    city: pick(CITIES),
    employees: 5 + Math.floor(rnd() * 495),
  }));

  const users: User[] = Array.from({ length: 480 }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    return {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first}.${last}${i + 1}@example.com`.toLowerCase().replace(/[^a-z0-9.@-]/g, ''),
      role: pick(ROLES),
      companyId: 1 + Math.floor(rnd() * companies.length),
    };
  });

  const products: Product[] = PRODUCTS.map(([name, emoji, color], i) => ({
    id: i + 1,
    name,
    emoji,
    color,
    price: Math.round((9 + rnd() * 190) * 100) / 100,
    description: `${name} – a fictional product to demonstrate view transitions. No real photos, just color and emoji.`,
  }));

  return {
    companies,
    users,
    products,
    config: {
      appName: 'Angular 22 Demos',
      apiVersion: '2026.10',
      environment: 'in-memory',
      features: { featureA: true, featureB: true, betaWidgets: false },
    },
    profile: {
      displayName: 'Ada Lovelace',
      bio: 'First programmer.',
      language: 'en',
      notifications: true,
    },
  };
}
