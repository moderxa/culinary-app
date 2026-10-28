import type { Recipe, RecipeFilter, Category, RecipeDraft } from "./types.js";
import { loadRecipes, saveRecipes } from "./storage.js";
import { filterRecipes, createRecipe, updateRecipe } from "./recipes.js";
import { renderRecipes, updateCategoryCounts } from "./ui.js";

let recipes: Recipe[] = loadRecipes();
let editingRecipeId: string | null = null; 

const currentFilters: RecipeFilter = {
  query: "",
  category: "Все",
  favoritesOnly: false,
  maxTime30: false,
  sortByTime: false
};

function updateUI(): void {
  const filtered = filterRecipes(recipes, currentFilters);
  
  const countElem = document.getElementById("results-count");
  if (countElem) {
    countElem.textContent = `Найдено рецептов: ${filtered.length}`;
  }

  updateCategoryCounts(recipes);

  renderRecipes(filtered, "recipe-list", toggleFavorite, deleteRecipe, startEditRecipe);
}

function toggleFavorite(id: string): void {
  recipes = recipes.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r);
  saveRecipes(recipes);
  updateUI();
}

function deleteRecipe(id: string): void {
  const confirmed = confirm("Вы действительно хотите удалить этот рецепт?");
  if (confirmed) {
    recipes = recipes.filter(r => r.id !== id);
    saveRecipes(recipes);
    updateUI();
  }
}

function startEditRecipe(recipe: Recipe): void {
  editingRecipeId = recipe.id;
  
  const titleInput = document.getElementById("recipe-title") as HTMLInputElement;
  const categorySelect = document.getElementById("recipe-category") as HTMLSelectElement;
  const servingsInput = document.getElementById("recipe-servings") as HTMLInputElement;
  const timeInput = document.getElementById("recipe-time") as HTMLInputElement;
  const ingredientsInput = document.getElementById("recipe-ingredients") as HTMLInputElement;
  const instructionsText = document.getElementById("recipe-instructions") as HTMLTextAreaElement;
  const imageInput = document.getElementById("recipe-image") as HTMLInputElement;
  const submitBtn = document.querySelector("#recipe-form button[type='submit']");
  const cancelBtn = document.getElementById("cancel-edit-btn") as HTMLButtonElement;

  if (titleInput) titleInput.value = recipe.title;
  if (categorySelect) categorySelect.value = recipe.category;
  if (servingsInput) servingsInput.value = recipe.servings.toString();
  if (timeInput) timeInput.value = recipe.cookingTime.toString();
  if (ingredientsInput) ingredientsInput.value = recipe.ingredients.join(", ");
  if (instructionsText) instructionsText.value = recipe.instructions;
  if (imageInput) imageInput.value = recipe.imageUrl || "";
  
  if (submitBtn) submitBtn.textContent = "Обновить рецепт";
  if (cancelBtn) cancelBtn.style.display = "inline-block"; // Показываем кнопку отмены
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search") as HTMLInputElement;
  const categoryFilter = document.getElementById("category-filter") as HTMLSelectElement;
  const favoritesFilter = document.getElementById("favorites-only") as HTMLInputElement;
  const maxTimeFilter = document.getElementById("max-time-30") as HTMLInputElement;
  const sortByTimeFilter = document.getElementById("sort-by-time") as HTMLInputElement;
  const clearFiltersBtn = document.getElementById("clear-filters-btn") as HTMLButtonElement;
  const cancelEditBtn = document.getElementById("cancel-edit-btn") as HTMLButtonElement;
  const form = document.getElementById("recipe-form") as HTMLFormElement;

  searchInput?.addEventListener("input", (e) => {
    currentFilters.query = (e.target as HTMLInputElement).value;
    updateUI();
  });

  categoryFilter?.addEventListener("change", (e) => {
    currentFilters.category = (e.target as HTMLSelectElement).value as Category | "Все";
    updateUI();
  });

  favoritesFilter?.addEventListener("change", (e) => {
    currentFilters.favoritesOnly = (e.target as HTMLInputElement).checked;
    updateUI();
  });

  maxTimeFilter?.addEventListener("change", (e) => {
    currentFilters.maxTime30 = (e.target as HTMLInputElement).checked;
    updateUI();
  });

  sortByTimeFilter?.addEventListener("change", (e) => {
    currentFilters.sortByTime = (e.target as HTMLInputElement).checked;
    updateUI();
  });

  clearFiltersBtn?.addEventListener("click", () => {
    currentFilters.query = "";
    currentFilters.category = "Все";
    currentFilters.favoritesOnly = false;
    currentFilters.maxTime30 = false;
    currentFilters.sortByTime = false;

    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "Все";
    if (favoritesFilter) favoritesFilter.checked = false;
    if (maxTimeFilter) maxTimeFilter.checked = false;
    if (sortByTimeFilter) sortByTimeFilter.checked = false;

    updateUI();
  });

  cancelEditBtn?.addEventListener("click", () => {
    editingRecipeId = null;
    form.reset();
    const submitBtn = document.querySelector("#recipe-form button[type='submit']");
    if (submitBtn) submitBtn.textContent = "Сохранить рецепт";
    cancelEditBtn.style.display = "none"; 
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const titleInput = document.getElementById("recipe-title") as HTMLInputElement;
    const categorySelect = document.getElementById("recipe-category") as HTMLSelectElement;
    const servingsInput = document.getElementById("recipe-servings") as HTMLInputElement;
    const timeInput = document.getElementById("recipe-time") as HTMLInputElement;
    const ingredientsInput = document.getElementById("recipe-ingredients") as HTMLInputElement;
    const instructionsText = document.getElementById("recipe-instructions") as HTMLTextAreaElement;
    const imageInput = document.getElementById("recipe-image") as HTMLInputElement;
    const submitBtn = document.querySelector("#recipe-form button[type='submit']");

    const changedData: Partial<RecipeDraft> = {
      title: titleInput.value,
      category: categorySelect.value as Category,
      servings: parseInt(servingsInput.value, 10),
      cookingTime: parseInt(timeInput.value, 10),
      ingredients: ingredientsInput.value.split(",").map(i => i.trim()).filter(Boolean),
      instructions: instructionsText.value,
      imageUrl: imageInput ? imageInput.value || undefined : undefined
    };

    if (editingRecipeId) {
      recipes = recipes.map(r => r.id === editingRecipeId ? updateRecipe(r, changedData) : r);
      editingRecipeId = null;
      if (submitBtn) submitBtn.textContent = "Сохранить рецепт";
    } else {
      const newRecipe = createRecipe(changedData as RecipeDraft);
      recipes.push(newRecipe);
    }

    saveRecipes(recipes);
    form.reset();
    if (cancelEditBtn) cancelEditBtn.style.display = "none"; 
    updateUI();

    const msg = document.getElementById("form-message");
    if (msg) {
      msg.textContent = "Успешно сохранено!";
      setTimeout(() => { msg.textContent = ""; }, 3000);
    }
  });

  updateUI();
});
