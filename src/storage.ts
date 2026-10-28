import type { Recipe } from "./types.js";
import { initialRecipes } from "./data.js";

const STORAGE_KEY = "recipes_data";

export function loadRecipes(): Recipe[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    saveRecipes(initialRecipes);
    return initialRecipes;
  }
  return JSON.parse(stored);
}

export function saveRecipes(recipes: Recipe[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}
