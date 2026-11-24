import type { Recipe, RecipeFilter, CategoryLabels, RecipeSortKey } from "./types.js";

export const CATEGORY_LABELS = {
  "Завтрак": "Утренние блюда",
  "Обед": "Основные блюда",
  "Ужин": "Вечерние блюда",
  "Десерт": "Сладкие блюда"
} satisfies CategoryLabels;

export function filterRecipes(recipes: Recipe[], filters: RecipeFilter): Recipe[] {
  let filtered = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(filters.query.toLowerCase()) ||
      recipe.ingredients.some((ing) => ing.toLowerCase().includes(filters.query.toLowerCase()));

    const matchesCategory =
      filters.category === "Все" || recipe.category === filters.category;

    const matchesFavorites = !filters.favoritesOnly || recipe.favorite;

    const matchesMaxTime = !filters.maxTime30 || recipe.cookingTime <= 30;

    return matchesSearch && matchesCategory && matchesFavorites && matchesMaxTime;
  });

  if (filters.sortByTime) {
    filtered = [...filtered].sort((a, b) => a.cookingTime - b.cookingTime);
  }

  return filtered;
}

export function deleteRecipe(recipes: Recipe[], id: string): Recipe[] {
  return recipes.filter((recipe) => recipe.id !== id);
}

export function sortRecipes(
  recipes: Recipe[],
  key: RecipeSortKey,
  direction: "asc" | "desc"
): Recipe[] {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...recipes].sort((a, b) => {
    const left = a[key];
    const right = b[key];

    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * multiplier;
    }

    return String(left).localeCompare(String(right), "ru") * multiplier;
  });
}