export const CATEGORIES = ["Завтрак", "Обед", "Ужин", "Десерт"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Recipe {
  readonly id: string;
  title: string;
  category: Category;
  servings: number;
  cookingTime: number;
  ingredients: string[];
  instructions: string;
  favorite: boolean;
  imageUrl?: string;
}

export type RecipeDraft = Omit<Recipe, "id" | "favorite">;
export type NewRecipe = Omit<Recipe, "id">;

export type RecipeFilter = {
  query: string;
  category: Category | "Все";
  favoritesOnly: boolean;
  maxTime30: boolean;    
  sortByTime: boolean;   
};

export type RecipeSortKey = "title" | "servings" | "cookingTime";

export type RecipeSortValue =
  | Recipe["title"]
  | Recipe["servings"]
  | Recipe["cookingTime"];

export type CategoryLabels = Record<Category, string>;

export type RecipeUpdate = Partial<Omit<Recipe, "id">>;
export type RecipeCardData = Pick<Recipe, "id" | "title" | "category">;
export type RecipeWithoutId = Omit<Recipe, "id">;
export type ReadonlyRecipe = Readonly<Recipe>;
export type CategoryCounts = Record<Category, number>;
export type EditableRecipeFields = Exclude<keyof Recipe, "id">;
export type MainRecipeFields = Extract<keyof Recipe, "title" | "category">;
