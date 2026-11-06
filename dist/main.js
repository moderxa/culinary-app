import { fetchRecipes } from "./api.js";
import { errorMessage, assertNever } from "./state.js";
import { filterRecipes } from "./recipes.js";
import { renderRecipes, renderMessage, getFilter } from "./ui.js";
let state = { status: "loading" };
function setState(next) {
    state = next;
    render();
}
function render() {
    switch (state.status) {
        case "loading":
            renderMessage("Загружаем рецепты...");
            break;
        case "error":
            renderMessage(`Не удалось загрузить: ${state.message}`);
            break;
        case "success":
            renderRecipes(filterRecipes(state.recipes, getFilter()), "recipe-list", (id) => { console.log("В избранное:", id); }, (id) => { console.log("Удалить:", id); }, (recipe) => { console.log("Изменить:", recipe); });
            break;
        default:
            assertNever(state);
    }
}
function setupFilters() {
    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("category-filter");
    const favsCheckbox = document.getElementById("favorites-only");
    const timeCheckbox = document.getElementById("max-time-30");
    const sortCheckbox = document.getElementById("sort-by-time");
    searchInput?.addEventListener("input", () => render());
    categorySelect?.addEventListener("change", () => render());
    favsCheckbox?.addEventListener("change", () => render());
    timeCheckbox?.addEventListener("change", () => render());
    sortCheckbox?.addEventListener("change", () => render());
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
            render();
        });
    }
}
async function init() {
    setState({ status: "loading" });
    try {
        const recipes = await fetchRecipes();
        setState({ status: "success", recipes });
        setupFilters();
    }
    catch (error) {
        setState({ status: "error", message: errorMessage(error) });
    }
}
void init();
