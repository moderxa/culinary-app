import type { Recipe } from "./types.js";

export function identity<T>(value: T): T {
  return value;
}

export function getProperty<T, K extends keyof T>(
  object: T,
  key: K
): T[K] {
  return object[key];
}

export function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

export type ApiResult<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export function updateById<T, Id>(
  items: T[],
  getId: (item: T) => Id,
  targetId: Id,
  update: (item: T) => T
): T[] {
  return items.map((item) =>
    getId(item) === targetId ? update(item) : item
  );
}

export function groupBy<T>(
  items: T[],
  getKey: (item: T) => string
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = getKey(item);
    (groups[key] ??= []).push(item);
    return groups;
  }, {});
}

export function groupRecipesByCategory(
  recipes: Recipe[]
): Record<string, Recipe[]> {
  return groupBy(recipes, (recipe) => recipe.category);
}
