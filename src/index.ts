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
        if (recipeStorage.values().length == 0) {
            return Result.Err("There are no recipes at this moment.")
        } else {
            return Result.Ok(recipeStorage.values());
        }
    } catch (error) {
        return Result.Err('Failed to get recipes');
    }
}

/**
 * Retrieves a specific recipe by UUID.
 * @param recipeId - The ID of the recipe to retrieve.
 * @returns A Result containing the recipe or an error message.
 */
$query;
export function getRecipeById(recipeId: string): Result<Recipe, string> {
    // Validate ID
    if (!isValidUUID(recipeId)) {
        return Result.Err<Recipe, string>('Invalid recipe ID');
    }

    return match(recipeStorage.get(recipeId), {
        Some: (recipe) => Result.Ok<Recipe, string>(recipe),
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
        let result = recipeStorage.values().filter((recipe) => recipe.recipeName.toLowerCase() === recipeName.toLowerCase())
        if (result.length == 0) {
            return Result.Err("There are no recipes with such a name at this moment.")
        } else {
            return Result.Ok(result);
        }
    } catch (error) {
        return Result.Err(`Failed to retrieve recipes with the name of ${recipeName.toLowerCase()}!`);
    }
}


/**
 * Retrieves all recipes owned by a specific owner.
 * @param ownerId - The ID of the owner.
 * @returns A Result containing a list of recipes or an error message.
 */
$query;
export function getOwnersRecipesById(ownerId: string): Result<Vec<Recipe>, string> {
    // Validate ID
    if (!isValidUUID(ownerId)) {
        return Result.Err<Vec<Recipe>, string>('Invalid owner ID');
    }

    try {
        let result = recipeStorage.values().filter((recipe) => recipe.ownerId === ownerId)
        if (result.length == 0) {
            return Result.Err("There are no recipes available by this owner/chef.")
        } else {
            return Result.Ok(result);
        }
    } catch (error) {
        return Result.Err(`Failed to retrieve recipes for owner with ID ${ownerId}!`);
    }
}

/**
 * Retrieves all recipes owned by owners with this name.
 * @param ownerName - The name of the owner. It can be duplicated.
 * @returns A Result containing a list of recipes or an error message.
 */
$query;
export function getRecipesByOwnersName(ownerName: string): Result<Vec<Recipe>, string> {

    try {
        let result = recipeStorage.values().filter((recipe) => recipe.ownerName === ownerName)
        if (result.length == 0) {
            return Result.Err("There are no recipes available by this owner/chef.")
        } else {
            return Result.Ok(result);
        }
    } catch (error) {
        return Result.Err(`Failed to retrieve recipes for owner with name ${ownerName}!`);
    }
}

/**
 * Retrieves all recipes by recipe type.
 * @param recipeType - The type of the recipe. It can be whatever, if futher developed it will be categorized in enums.
 * @returns A Result containing a list of recipes or an error message.
 */
$query;
export function getRecipesByType(recipeType: string): Result<Vec<Recipe>, string> {

    try {
        let result = recipeStorage.values().filter((recipe) => recipe.recipeType.toLowerCase() === recipeType.toLowerCase())
        if (result.length == 0) {
            return Result.Err("There are no recipes available from this type.")
        } else {
            return Result.Ok(result);
        }
    } catch (error) {
        return Result.Err(`Failed to retrieve recipes who are from type of ${recipeType.toLowerCase()}!`);
    }
}

/**
 * Creates a new recipe.
 * @param payload - Information about the recipe.
 * @returns A Result containing the new recipe or an error message.
 */
$update;
export function createRecipe(payload: RecipePayload): Result<Recipe, string> {
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
            ownerId: uuidv4(), // Generate a unique owner ID
            videoDemonstration: payload.videoDemonstration
        };

        // Add the recipe to recipeStorage
        recipeStorage.insert(newRecipe.id, newRecipe);

        return Result.Ok(newRecipe);
    } catch (error) {
        return Result.Err<Recipe, string>('Failed to create recipe!');
    }
}

/**
 * Updates information for a specific recipe.
 * @param recipeId - The ID of the recipe to update.
 * @param ownerId - The ID of the owner making the recipe.
 * @param payload - Updated information about the recipe.
 * @returns A Result containing the updated recipe or an error message.
 */
$update;
export function updateRecipe(recipeId: string, ownerId: string, payload: RecipePayload): Result<Recipe, string> {
    // Validate IDs
    if (!isValidUUID(recipeId) || !isValidUUID(ownerId)) {
        return Result.Err<Recipe, string>('Invalid recipe or owner ID for updating the recipe.');
    }

    return match(recipeStorage.get(recipeId), {
        Some: (recipe) => {
            // Validate ownership
            if (recipe.ownerId !== ownerId) {
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
 * @param ownerId - The ID of the owner of the recipe as they are the only one who can delete the recipe.
 * @returns A Result containing the deleted recipe or an error message.
 */
$update;
export function deleteRecipe(recipeId: string, ownerId: string): Result<Recipe, string> {
    // Validate IDs
    if (!isValidUUID(recipeId) || !isValidUUID(ownerId)) {
        return Result.Err<Recipe, string>('Invalid recipe or owner ID for deleting an Recipe.');
    }

    return match(recipeStorage.remove(recipeId), {
        Some: (recipe) => {
            // Validate ownership
            if (recipe.ownerId !== ownerId) {
                return Result.Err<Recipe, string>('Only the owner can delete the recipe!');
            }

            return Result.Ok<Recipe, string>(recipe);
        },
        None: () => Result.Err<Recipe, string>(`Failed to delete recipe with id: ${recipeId}`),
    });
}

// A workaround to make the uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    },
};

/**
 * Validates whether a given string is a valid UUID.
 * @param id - The string to validate as a UUID.
 * @returns True if the string is a valid UUID, otherwise false.
 */
export function isValidUUID(id: string): boolean {
    // Validate if the provided ID is a valid UUID
    return /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(id);
}
