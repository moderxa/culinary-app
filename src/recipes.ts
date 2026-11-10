import type { Recipe, RecipeFilter } from "./types.js";

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
