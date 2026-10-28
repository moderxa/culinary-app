import { loadRecipes, saveRecipes } from "./storage.js";
import { filterRecipes, createRecipe, updateRecipe } from "./recipes.js";
import { renderRecipes, updateCategoryCounts } from "./ui.js";
let recipes = loadRecipes();
let editingRecipeId = null;
const currentFilters = {
    query: "",
    category: "Все",
    favoritesOnly: false,
    maxTime30: false,
    sortByTime: false
};
function updateUI() {
    const filtered = filterRecipes(recipes, currentFilters);
    const countElem = document.getElementById("results-count");
    if (countElem) {
        countElem.textContent = `Найдено рецептов: ${filtered.length}`;
    }
    updateCategoryCounts(recipes);
    renderRecipes(filtered, "recipe-list", toggleFavorite, deleteRecipe, startEditRecipe);
}
function toggleFavorite(id) {
    recipes = recipes.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r);
    saveRecipes(recipes);
    updateUI();
}
function deleteRecipe(id) {
    const confirmed = confirm("Вы действительно хотите удалить этот рецепт?");
    if (confirmed) {
        recipes = recipes.filter(r => r.id !== id);
        saveRecipes(recipes);
        updateUI();
    }
}
function startEditRecipe(recipe) {
    editingRecipeId = recipe.id;
    const titleInput = document.getElementById("recipe-title");
    const categorySelect = document.getElementById("recipe-category");
    const servingsInput = document.getElementById("recipe-servings");
    const timeInput = document.getElementById("recipe-time");
    const ingredientsInput = document.getElementById("recipe-ingredients");
    const instructionsText = document.getElementById("recipe-instructions");
    const imageInput = document.getElementById("recipe-image");
    const submitBtn = document.querySelector("#recipe-form button[type='submit']");
    const cancelBtn = document.getElementById("cancel-edit-btn");
    if (titleInput)
        titleInput.value = recipe.title;
    if (categorySelect)
        categorySelect.value = recipe.category;
    if (servingsInput)
        servingsInput.value = recipe.servings.toString();
    if (timeInput)
        timeInput.value = recipe.cookingTime.toString();
    if (ingredientsInput)
        ingredientsInput.value = recipe.ingredients.join(", ");
    if (instructionsText)
        instructionsText.value = recipe.instructions;
    if (imageInput)
        imageInput.value = recipe.imageUrl || "";
    if (submitBtn)
        submitBtn.textContent = "Обновить рецепт";
    if (cancelBtn)
        cancelBtn.style.display = "inline-block"; // Показываем кнопку отмены
}
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const categoryFilter = document.getElementById("category-filter");
    const favoritesFilter = document.getElementById("favorites-only");
    const maxTimeFilter = document.getElementById("max-time-30");
    const sortByTimeFilter = document.getElementById("sort-by-time");
    const clearFiltersBtn = document.getElementById("clear-filters-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const form = document.getElementById("recipe-form");
    searchInput?.addEventListener("input", (e) => {
        currentFilters.query = e.target.value;
        updateUI();
    });
    categoryFilter?.addEventListener("change", (e) => {
        currentFilters.category = e.target.value;
        updateUI();
    });
    favoritesFilter?.addEventListener("change", (e) => {
        currentFilters.favoritesOnly = e.target.checked;
        updateUI();
    });
    maxTimeFilter?.addEventListener("change", (e) => {
        currentFilters.maxTime30 = e.target.checked;
        updateUI();
    });
    sortByTimeFilter?.addEventListener("change", (e) => {
        currentFilters.sortByTime = e.target.checked;
        updateUI();
    });
    clearFiltersBtn?.addEventListener("click", () => {
        currentFilters.query = "";
        currentFilters.category = "Все";
        currentFilters.favoritesOnly = false;
        currentFilters.maxTime30 = false;
        currentFilters.sortByTime = false;
        if (searchInput)
            searchInput.value = "";
        if (categoryFilter)
            categoryFilter.value = "Все";
        if (favoritesFilter)
            favoritesFilter.checked = false;
        if (maxTimeFilter)
            maxTimeFilter.checked = false;
        if (sortByTimeFilter)
            sortByTimeFilter.checked = false;
        updateUI();
    });
    cancelEditBtn?.addEventListener("click", () => {
        editingRecipeId = null;
        form.reset();
        const submitBtn = document.querySelector("#recipe-form button[type='submit']");
        if (submitBtn)
            submitBtn.textContent = "Сохранить рецепт";
        cancelEditBtn.style.display = "none";
    });
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const titleInput = document.getElementById("recipe-title");
        const categorySelect = document.getElementById("recipe-category");
        const servingsInput = document.getElementById("recipe-servings");
        const timeInput = document.getElementById("recipe-time");
        const ingredientsInput = document.getElementById("recipe-ingredients");
        const instructionsText = document.getElementById("recipe-instructions");
        const imageInput = document.getElementById("recipe-image");
        const submitBtn = document.querySelector("#recipe-form button[type='submit']");
        const changedData = {
            title: titleInput.value,
            category: categorySelect.value,
            servings: parseInt(servingsInput.value, 10),
            cookingTime: parseInt(timeInput.value, 10),
            ingredients: ingredientsInput.value.split(",").map(i => i.trim()).filter(Boolean),
            instructions: instructionsText.value,
            imageUrl: imageInput ? imageInput.value || undefined : undefined
        };
        if (editingRecipeId) {
            recipes = recipes.map(r => r.id === editingRecipeId ? updateRecipe(r, changedData) : r);
            editingRecipeId = null;
            if (submitBtn)
                submitBtn.textContent = "Сохранить рецепт";
        }
        else {
            const newRecipe = createRecipe(changedData);
            recipes.push(newRecipe);
        }
        saveRecipes(recipes);
        form.reset();
        if (cancelEditBtn)
            cancelEditBtn.style.display = "none";
        updateUI();
        const msg = document.getElementById("form-message");
        if (msg) {
            msg.textContent = "Успешно сохранено!";
            setTimeout(() => { msg.textContent = ""; }, 3000);
        }
    });
    updateUI();
});
