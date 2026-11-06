import { fetchRecipes } from "./api.js";
import { LoadState, errorMessage, assertNever } from "./state.js";
import { filterRecipes } from "./recipes.js";
import { renderRecipes, renderMessage, getFilter } from "./ui.js";

let state: LoadState = { status: "loading" };

function setState(next: LoadState): void {
  state = next;
  render();  
}

function render(): void {
  switch (state.status) {
    case "loading":
      renderMessage("Загружаем рецепты...");
      break;
    case "error":
      renderMessage(`Не удалось загрузить: ${state.message}`);
      break;
    case "success":
      
      renderRecipes(
        filterRecipes(state.recipes, getFilter()),    
        "recipe-list",                               
        (id) => { console.log("В избранное:", id); },    
        (id) => { console.log("Удалить:", id); },      
        (recipe) => { console.log("Изменить:", recipe); } 
      );
      break;
    default:
      assertNever(state);
  }
}

function setupFilters(): void {
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
      if (searchInput) (searchInput as HTMLInputElement).value = "";
      if (categorySelect) (categorySelect as HTMLSelectElement).value = "Все";
      if (favsCheckbox) (favsCheckbox as HTMLInputElement).checked = false;
      if (timeCheckbox) (timeCheckbox as HTMLInputElement).checked = false;
      if (sortCheckbox) (sortCheckbox as HTMLInputElement).checked = false;

      render(); 
    });
  }
}

async function init(): Promise<void> {
  setState({ status: "loading" });
  try {
    const recipes = await fetchRecipes(); 
    setState({ status: "success", recipes });
    setupFilters(); 
  } catch (error: unknown) {
    setState({ status: "error", message: errorMessage(error) }); 
  }
}

void init();
