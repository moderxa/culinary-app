import type { Recipe, Category, RecipeFilter } from "./types.js";

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_) {
    return false;
  }
}

export function updateCategoryCounts(recipes: Recipe[]): void {
  const categories: Category[] = ["Завтрак", "Обед", "Ужин", "Десерт"];
  categories.forEach((cat) => {
    const count = recipes.filter((r) => r.category === cat).length;
    const elem = document.getElementById(`count-${cat}`);
    if (elem) {
      elem.textContent = `(${count})`;
    }
  });
}

export function renderRecipes(
  recipes: Recipe[],
  containerId: string,
  onToggleFavorite: (id: string) => void,
  onDeleteRecipe: (id: string) => void,
  onEditRecipe: (recipe: Recipe) => void 
): void {
  const container = document.getElementById(containerId);
  if (!container) return;

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
      <button class="fav-btn">${recipe.favorite ? "Из избранного" : "В избранное"}</button>
      <button class="edit-btn" style="margin-left: 10px; cursor: pointer;">Редактировать</button>
      <button class="delete-btn" style="margin-left: 10px; color: red; cursor: pointer;">Удалить</button>
    `;

    const favBtn = card.querySelector(".fav-btn");
    favBtn?.addEventListener("click", () => {
      onToggleFavorite(recipe.id);
    });

    const editBtn = card.querySelector(".edit-btn");
    editBtn?.addEventListener("click", () => {
      onEditRecipe(recipe);
    });

    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn?.addEventListener("click", () => {
      onDeleteRecipe(recipe.id);
    });

    container.appendChild(card);
  });
}

export function getFilter(): RecipeFilter {
  const searchInput = document.getElementById("search") as HTMLInputElement | null;
  const categorySelect = document.getElementById("category-filter") as HTMLSelectElement | null;
  const favsCheckbox = document.getElementById("favorites-only") as HTMLInputElement | null;
  const timeCheckbox = document.getElementById("max-time-30") as HTMLInputElement | null;
  const sortCheckbox = document.getElementById("sort-by-time") as HTMLInputElement | null;

  return {
    query: searchInput?.value || "",
    category: (categorySelect?.value as any) || "Все",
    favoritesOnly: favsCheckbox?.checked || false,
    maxTime30: timeCheckbox?.checked || false,
    sortByTime: sortCheckbox?.checked || false,
  };
}

export function renderMessage(text: string, onRetry?: () => void): void {
  const recipelist = document.getElementById("recipe-list"); 
  if (recipelist) {
    recipelist.innerHTML = "";
    
    const p = document.createElement("p");
    p.textContent = text;
    recipelist.append(p);

    if (onRetry) {
      const btn = document.createElement("button");
      btn.textContent = "Повторить попытку";
      btn.style.marginLeft = "10px";
      btn.style.cursor = "pointer";
      btn.addEventListener("click", onRetry);
      recipelist.append(btn);
    }
  }
}
