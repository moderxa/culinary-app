export function identity(value) {
    return value;
}
export function getProperty(object, key) {
    return object[key];
}
export function pair(first, second) {
    return [first, second];
}
export function updateById(items, getId, targetId, update) {
    return items.map((item) => getId(item) === targetId ? update(item) : item);
}
export function groupBy(items, getKey) {
    return items.reduce((groups, item) => {
        const key = getKey(item);
        (groups[key] ?? (groups[key] = [])).push(item);
        return groups;
    }, {});
}
export function groupRecipesByCategory(recipes) {
    return groupBy(recipes, (recipe) => recipe.category);
}
