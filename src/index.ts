import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type Recipe = Record<{
    id: string;
    recipeName: string;
    ownerName: string;
    ownerId: string;
    description: string;
    recipeType: string;
    videoDemonstration: string;
}>;

type RecipePayload = Record<{
    recipeName: string;
    recipeType: string;
    description: string;
    ownerName: string;
    videoDemonstration: string;
}>;

const recipeStorage = new StableBTreeMap<string, Recipe>(1, 44, 1024);

/**
 * Retrieves all recipes from the system.
 * @returns A Result containing a list of recipes or an error message.
 */
$query;
export function getAllRecipes(): Result<Vec<Recipe>, string> {
    try {
        const recipes = recipeStorage.values();
        if (recipes.length === 0) {
            return Result.Err("There are no recipes at this moment.");
        } else {
            return Result.Ok(recipes);
        }
    } catch (error) {
        console.error(`Failed to get recipes: ${error}`);
        return Result.Err('Failed to get recipes');
    }
}

/**
 * Retrieves a specific recipe by UUID.
 * @param recipeId - The ID of the recipe to retrieve.
 * @param requesterId - The ID of the user making the request.
 * @returns A Result containing the recipe or an error message.
 */
$query;
export function getRecipeById(recipeId: string, requesterId: string): Result<Recipe, string> {
    if (!isValidUUID(recipeId)) {
        return Result.Err<Recipe, string>('Invalid recipe ID');
    }

    return match(recipeStorage.get(recipeId), {
        Some: (recipe) => {
            if (recipe.ownerId !== requesterId) {
                return Result.Err<Recipe, string>('Unauthorized to access this recipe.');
            }
            return Result.Ok<Recipe, string>(recipe);
        },
        None: () => Result.Err<Recipe, string>(`Recipe with the provided id: ${recipeId} has not been found!`),
    });
}

/**
 * Retrieves a recipe(s) by recipeName.
 * @param recipeName - The name of the recipe to retrieve.
 * @returns A Result containing the list of recipes or an error message.
 */
$query;
export function getRecipeByName(recipeName: string): Result<Vec<Recipe>, string> {
    try {
        const result = recipeStorage.values().filter((recipe) => recipe.recipeName.toLowerCase() === recipeName.toLowerCase());
        if (result.length === 0) {
            return Result.Err(`There are no recipes with the name ${recipeName} at this moment.`);
        } else {
            return Result.Ok(result);
        }
    } catch (error) {
        console.error(`Failed to retrieve recipes with the name of ${recipeName.toLowerCase()}: ${error}`);
        return Result.Err(`Failed to retrieve recipes with the name of ${recipeName.toLowerCase()}!`);
    }
}

/**
 * Retrieves all recipes owned by a specific owner.
 * @param ownerId - The ID of the owner.
 * @param requesterId - The ID of the user making the request.
 * @returns A Result containing a list of recipes or an error message.
 */
$query;
export function getOwnersRecipesById(ownerId: string, requesterId: string): Result<Vec<Recipe>, string> {
    if (!isValidUUID(ownerId)) {
        return Result.Err<Vec<Recipe>, string>('Invalid owner ID');
    }

    try {
        const result = recipeStorage.values().filter((recipe) => recipe.ownerId === ownerId);
        if (result.length === 0) {
            return Result.Err("There are no recipes available by this owner/chef.");
        } else {
            return Result.Ok(result);
        }
    } catch (error) {
        console.error(`Failed to retrieve recipes for owner with ID ${ownerId}: ${error}`);
        return Result.Err(`Failed to retrieve recipes for owner with ID ${ownerId}!`);
    }
}

/**
 * Retrieves all recipes owned by owners with this name.
 * @param ownerName - The name of the owner. It can be duplicated.
 * @param requesterId - The ID of the user making the request.
 * @returns A Result containing a list of recipes or an error message.
 */
$query;
export function getRecipesByOwnersName(ownerName: string, requesterId: string): Result<Vec<Recipe>, string> {
    try {
        const result = recipeStorage.values().filter((recipe) => recipe.ownerName === ownerName);
        if (result.length === 0) {
            return Result.Err("There are no recipes available by this owner/chef.");
        } else {
            return Result.Ok(result);
        }
    } catch (error) {
        console.error(`Failed to retrieve recipes for owner with name ${ownerName}: ${error}`);
        return Result.Err(`Failed to retrieve recipes for owner with name ${ownerName}!`);
    }
}

/**
 * Retrieves all recipes by recipe type.
 * @param recipeType - The type of the recipe. It can be whatever, if further developed it will be categorized in enums.
 * @returns A Result containing a list of recipes or an error message.
 */
$query;
export function getRecipesByType(recipeType: string): Result<Vec<Recipe>, string> {
    try {
        const result = recipeStorage.values().filter((recipe) => recipe.recipeType.toLowerCase() === recipeType.toLowerCase());
        if (result.length === 0) {
            return Result.Err(`There are no recipes available from type ${recipeType}.`);
        } else {
            return Result.Ok(result);
        }
    } catch (error) {
        console.error(`Failed to retrieve recipes of type ${recipeType.toLowerCase()}: ${error}`);
        return Result.Err(`Failed to retrieve recipes of type ${recipeType.toLowerCase()}!`);
    }
}

/**
 * Creates a new recipe.
 * @param payload - Information about the recipe.
 * @returns A Result containing the new recipe or an error message.
 */
$update;
export function createRecipe(requesterId: string, payload: RecipePayload): Result<Recipe, string> {
    try {
        // Validate payload
        if (!payload.recipeType || !payload.description || !payload.ownerName || !payload.videoDemonstration || !payload.recipeName) {
            return Result.Err<Recipe, string>('Incomplete input data!');
        }

        // Generate a unique ID for the recipe
        const recipeId = uuidv4();
        // Set each property for better performance
        const newRecipe: Recipe = {
            id: recipeId,
            recipeName: payload.recipeName,
            recipeType: payload.recipeType,
            description: payload.description,
            ownerName: payload.ownerName,
            ownerId: requesterId, // Use the requester's ID as the owner ID
            videoDemonstration: payload.videoDemonstration
        };

        // Add the recipe to recipeStorage
        recipeStorage.insert(newRecipe.id, newRecipe);

        return Result.Ok(newRecipe);
    } catch (error) {
        console.error(`Failed to create

 recipe: ${error}`);
        return Result.Err<Recipe, string>('Failed to create recipe!');
    }
}

/**
 * Updates information for a specific recipe.
 * @param recipeId - The ID of the recipe to update.
 * @param requesterId - The ID of the user making the request.
 * @param payload - Updated information about the recipe.
 * @returns A Result containing the updated recipe or an error message.
 */
$update;
export function updateRecipe(recipeId: string, requesterId: string, payload: RecipePayload): Result<Recipe, string> {
    // Validate IDs
    if (!isValidUUID(recipeId)) {
        return Result.Err<Recipe, string>('Invalid recipe ID for updating the recipe.');
    }

    return match(recipeStorage.get(recipeId), {
        Some: (recipe) => {
            // Validate ownership
            if (recipe.ownerId !== requesterId) {
                return Result.Err<Recipe, string>('Only the owner of the recipe can update this recipe!');
            }

            // Set each property for better performance
            const updatedRecipe: Recipe = {
                id: recipe.id,
                recipeName: payload.recipeName || recipe.recipeName,
                recipeType: payload.recipeType || recipe.recipeType,
                description: payload.description || recipe.description,
                ownerName: payload.ownerName || recipe.ownerName,
                ownerId: recipe.ownerId,
                videoDemonstration: payload.videoDemonstration || recipe.videoDemonstration
            };

            // Update the recipe in recipeStorage
            recipeStorage.insert(recipe.id, updatedRecipe);

            return Result.Ok<Recipe, string>(updatedRecipe);
        },
        None: () => Result.Err<Recipe, string>(`Failed to update recipe with id: ${recipeId}!`),
    });
}

/**
 * Deletes a specific recipe.
 * @param recipeId - The ID of the recipe to delete.
 * @param requesterId - The ID of the user making the request.
 * @returns A Result containing the deleted recipe or an error message.
 */
$update;
export function deleteRecipe(recipeId: string, requesterId: string): Result<Recipe, string> {
    // Validate IDs
    if (!isValidUUID(recipeId)) {
        return Result.Err<Recipe, string>('Invalid recipe ID for deleting a recipe.');
    }

    return match(recipeStorage.get(recipeId), {
        Some: (recipe) => {
            // Validate ownership
            if (recipe.ownerId !== requesterId) {
                return Result.Err<Recipe, string>('Only the owner can delete the recipe!');
            }

            // Remove the recipe from recipeStorage
            recipeStorage.remove(recipeId);

            return Result.Ok<Recipe, string>(recipe);
        },
        None: () => Result.Err<Recipe, string>(`Failed to delete recipe with id: ${recipeId}`),
    });
}

/**
 * Validates whether a given string is a valid UUID.
 * @param id - The string to validate as a UUID.
 * @returns True if the string is a valid UUID, otherwise false.
 */
export function isValidUUID(id: string): boolean {
    // Validate if the provided ID is a valid UUID
    return /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/i.test(id);
}
