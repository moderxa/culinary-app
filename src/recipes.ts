import type { Recipe, RecipeDraft, RecipeFilter } from "./types.js";

export function createRecipe(draft: RecipeDraft): Recipe {
  return {
    ...draft,
    id: `recipe-${Date.now()}`, 
    favorite: false            
  };
}

export function updateRecipe(recipe: Recipe, changes: Partial<RecipeDraft>): Recipe {
  return {
    ...recipe,
    ...changes
  };
}

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
