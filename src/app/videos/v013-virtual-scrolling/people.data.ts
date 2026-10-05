import { mulberry32 } from '../../core/fake-backend/fake-db';

export interface Person {
  id: number;
  name: string;
  city: string;
  score: number;
  initials: string;
  hue: number;
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
  'Hedy',
  'John',
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
  'Lee',
  'Lamarr',
];
const CITIES = [
  'Berlin',
  'Hamburg',
  'Munich',
  'Vienna',
  'Zurich',
  'Lisbon',
  'Oslo',
  'Prague',
  'Rome',
  'Madrid',
];

export function generatePeople(count: number, seed = 13): Person[] {
  const rnd = mulberry32(seed);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(rnd() * list.length)] as T;
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    return {
      id: i + 1,
      name: `${first} ${last}`,
      city: pick(CITIES),
      score: Math.round(rnd() * 10000) / 100,
      initials: `${first[0]}${last[0]}`,
      hue: Math.floor(rnd() * 360),
    };
  });
}

export type PersonSort = 'id' | 'name' | 'score-desc' | 'city';

export function sortPeople(people: readonly Person[], sort: PersonSort): readonly Person[] {
  switch (sort) {
    case 'name':
      return [...people].sort((a, b) => a.name.localeCompare(b.name));
    case 'city':
      return [...people].sort((a, b) => a.city.localeCompare(b.city) || a.id - b.id);
    case 'score-desc':
      return [...people].sort((a, b) => b.score - a.score);
    default:
      return people;
  }
}

export function filterPeople(people: readonly Person[], query: string): readonly Person[] {
  const q = query.trim().toLowerCase();
  return q
    ? people.filter((p) => p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q))
    : people;
}
