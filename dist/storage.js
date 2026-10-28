import { initialRecipes } from "./data.js";
const STORAGE_KEY = "recipes_data";
export function loadRecipes() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        saveRecipes(initialRecipes);
        return initialRecipes;
    }
    return JSON.parse(stored);
}
export function saveRecipes(recipes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}
