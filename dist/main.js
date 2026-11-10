import { fetchRecipes, createRecipeOnServer, setFavorite, deleteRecipeOnServer } from "./api.js";
import { errorMessage, assertNever } from "./state.js";
import { filterRecipes, deleteRecipe } from "./recipes.js";
import { renderRecipes, renderMessage, getFilter, retryButton, formMessage, recipeForm } from "./ui.js";
import { withRetry } from "./retry.js";
import { debounce } from "./debounce.js";
import { isCategory } from "./parse.js";
let state = { status: "loading" };
let searchController;
function setState(next) {
    state = next;
    render();
}
function updateRecipes(change) {
    if (state.status !== "success")
        return;
    setState({ status: "success", recipes: change(state.recipes) });
}
function render() {
    retryButton.hidden = state.status !== "error";
    switch (state.status) {
        case "loading":
            renderMessage("Загружаем рецепты...");
            break;
        case "error":
            renderMessage(`Не удалось загрузить: ${state.message}`);
            break;
        case "success":
            renderRecipes(filterRecipes(state.recipes, getFilter()), "recipe-list");
            break;
        default:
            assertNever(state);
    }
}
async function performSearch() {
    searchController?.abort();
    searchController = new AbortController();
    const { signal } = searchController;
    const searchInput = document.getElementById("search");
    const query = searchInput?.value || "";
    try {
        const recipes = await fetchRecipes(query, signal);
        setState({ status: "success", recipes });
    }
    catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
            return; // Ошибку отмены просто пропускаем
        setState({ status: "error", message: errorMessage(error) });
    }
}
function setupEvents() {
    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("category-filter");
    const favsCheckbox = document.getElementById("favorites-only");
    const timeCheckbox = document.getElementById("max-time-30");
    const sortCheckbox = document.getElementById("sort-by-time");
    const recipeListBlock = document.getElementById("recipe-list");
    categorySelect?.addEventListener("change", () => render());
    favsCheckbox?.addEventListener("change", () => render());
    timeCheckbox?.addEventListener("change", () => render());
    sortCheckbox?.addEventListener("change", () => render());
    searchInput?.addEventListener("input", debounce(() => { void performSearch(); }, 300));
    const clearBtn = document.getElementById("clear-filters-btn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput)
                searchInput.value = "";
            if (categorySelect)
                categorySelect.value = "Все";
            if (favsCheckbox)
                favsCheckbox.checked = false;
            if (timeCheckbox)
                timeCheckbox.checked = false;
            if (sortCheckbox)
                sortCheckbox.checked = false;
            void performSearch();
        });
    }
    retryButton.addEventListener("click", () => void init());
    recipeListBlock?.addEventListener("click", async (event) => {
        const target = event.target;
        const action = target.getAttribute("data-action");
        const id = target.getAttribute("data-id");
        if (!action || !id || state.status !== "success")
            return;
        try {
            if (action === "favorite") {
                const current = state.recipes.find((r) => r.id === id);
                if (!current)
                    return;
                const updated = await setFavorite(id, !current.favorite);
                updateRecipes((list) => list.map((r) => (r.id === id ? updated : r)));
            }
            else if (action === "delete") {
                await deleteRecipeOnServer(id);
                updateRecipes((list) => deleteRecipe(list, id));
            }
        }
        catch (error) {
            alert(`Не удалось выполнить действие: ${errorMessage(error)}`);
        }
    });
    recipeForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        formMessage.textContent = "";
        const formData = new FormData(recipeForm);
        const title = String(formData.get("title")).trim();
        const category = String(formData.get("category"));
        const servings = Number(formData.get("servings"));
        const cookingTime = Number(formData.get("cookingTime"));
        const ingredients = String(formData.get("ingredients")).split(",").map((i) => i.trim()).filter(Boolean);
        const instructions = String(formData.get("instructions")).trim();
        if (!title || !instructions || ingredients.length === 0 || !isCategory(category)) {
            formMessage.textContent = "Заполните все поля формы корректно.";
            return;
        }
        const draft = { title, category, servings, cookingTime, ingredients, instructions };
        const newRecipe = { ...draft, favorite: false };
        try {
            const created = await createRecipeOnServer(newRecipe);
            updateRecipes((list) => [created, ...list]);
            recipeForm.reset();
            formMessage.textContent = "Рецепт добавлен успешно.";
        }
        catch (error) {
            formMessage.textContent = `Не удалось сохранить рецепт: ${errorMessage(error)}`;
        }
    });
}
async function init() {
    setState({ status: "loading" });
    try {
        const recipes = await withRetry(() => fetchRecipes(), 3, 1000);
        setState({ status: "success", recipes });
    }
    catch (error) {
        setState({ status: "error", message: errorMessage(error) });
    }
}
setupEvents();
void init();
