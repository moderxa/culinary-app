function requireElement(selector) {
    const elem = document.querySelector(selector);
    if (!elem)
        throw new Error(`Элемент не найден: ${selector}`);
    return elem;
}
export const retryButton = requireElement("#retry-button");
export const formMessage = requireElement("#form-message");
export const recipeForm = requireElement("#recipe-form");
// Элементы сортировки
export const sortKeySelect = requireElement("#sort-key");
export const sortDirectionSelect = requireElement("#sort-direction");
// Элементы формы редактирования
export const editRecipeForm = requireElement("#edit-recipe-form");
export const editRecipeId = requireElement("#edit-recipe-id");
export const editRecipeTitle = requireElement("#edit-recipe-title");
export const editRecipeCategory = requireElement("#edit-recipe-category");
export const editRecipeServings = requireElement("#edit-recipe-servings");
export const editRecipeTime = requireElement("#edit-recipe-time");
export const editRecipeIngredients = requireElement("#edit-recipe-ingredients");
export const editRecipeInstructions = requireElement("#edit-recipe-instructions");
export const editMessage = requireElement("#edit-message");
export const cancelEditButton = requireElement("#cancel-edit");
function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    }
    catch (_) {
        return false;
    }
}
export function updateCategoryCounts(recipes) {
    const categories = ["Завтрак", "Обед", "Ужин", "Десерт"];
    categories.forEach((cat) => {
        const count = recipes.filter((r) => r.category === cat).length;
        const elem = document.getElementById(`count-${cat}`);
        if (elem) {
            elem.textContent = `(${count})`;
        }
    });
}
export function renderRecipes(recipes, containerId) {
    const container = document.getElementById(containerId);
    if (!container)
        return;
    container.innerHTML = "";
    if (recipes.length === 0) {
        container.innerHTML = "<p>Рецепты не найдены</p>";
        return;
    }
    updateCategoryCounts(recipes);
    recipes.forEach((recipe) => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        if (recipe.favorite) {
            card.classList.add("is-favorite");
        }
        const imageHtml = recipe.imageUrl && isValidUrl(recipe.imageUrl)
            ? `<img src="${recipe.imageUrl}" alt="${recipe.title}" style="max-width:100%; height:auto; display:block; border-radius:4px; margin-bottom:10px;">`
            : "";
        card.innerHTML = `
      ${imageHtml}
      <h3>${recipe.title}</h3>
      <p>Категория: ${recipe.category}</p>
      <p>Порции: ${recipe.servings} | Время: ${recipe.cookingTime} мин.</p>
      <p>Ингредиенты: ${recipe.ingredients.join(", ")}</p>
      <p>${recipe.instructions}</p>
      <button class="fav-btn" data-action="favorite" data-id="${recipe.id}">${recipe.favorite ? "Из избранного" : "В избранное"}</button>
      <button class="edit-btn" data-action="edit" data-id="${recipe.id}">Редактировать</button>
      <button class="delete-btn" data-action="delete" data-id="${recipe.id}">Удалить</button>
    `;
        container.appendChild(card);
    });
}
export function getFilter() {
    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("category-filter");
    const favsCheckbox = document.getElementById("favorites-only");
    const timeCheckbox = document.getElementById("max-time-30");
    const sortCheckbox = document.getElementById("sort-by-time");
    return {
        query: searchInput?.value || "",
        category: categorySelect?.value || "Все",
        favoritesOnly: favsCheckbox?.checked || false,
        maxTime30: timeCheckbox?.checked || false,
        sortByTime: sortCheckbox?.checked || false,
    };
}
export function renderMessage(text) {
    const recipelist = document.getElementById("recipe-list");
    if (recipelist) {
        recipelist.innerHTML = `<p>${text}</p>`;
    }
}
