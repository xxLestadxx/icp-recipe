# icp-recipe

Icp-recipe is a simple CRUD project to showcase how to write and deploy canisters on ICP. The application mimics a database of recipes. The user can create a recipe, search a recipe by name, chef/owner or type (for example bulgarian cuisine), as well as you can update and delete the recipe.  

## Methods and usage

- **createRecipe(RecipePayload)** - where the payload consists of the following parameters - recipeName: string; recipeType: string; description: string; ownerName: string; videoDemonstration: string; The valid recipe is added to the database.

- **deleteRecipe(recipeId, ownerId)** - takes the recipeId and ownerId, as the ownerId is the only entity that can delete their recipe.

- **getAllRecipes()** - returns a list of all recipes if any.

- **getOwnersRecipesById(ownerId)** - returns all recipes by the specific user.

- **getRecipeById(recipeId)** - returns the specific recipe

- **getRecipeByName(recipeName)** - returns a list with all recipes with the specific name, because a dish can be made with various ways.

- **getRecipesByOwnersName(ownerName)** - returns all recipes from users with the name provided. 

- **getRecipesByType(recipeType)** - returns all recipes from the specific type (for example bulgarian cuisine)

- **updateRecipe(recipeId, ownerId, RecipePayload)** - updates the recipe.

## Run Locally

`dfx` is the tool you will use to interact with the IC locally and on mainnet. If you don't already have it installed:

```
npm run dfx_install
```

Next you will need to install the dependancies, recommended Node version v18.12.1

```
npm install
```

Next you will want to start a replica, which is a local instance of the IC that you can deploy your canisters to:

```
dfx start --background --clean
```

If you ever want to stop the replica:

```
dfx stop
```
__NOTE THAT YOU HAVE TO STOP IT IN THE SAME WINDOW TERMINAL YOU STARTED THE PROJECT OTHERWISE SOME PROCESSES ARE GOING TO HANG__

Now you can deploy your canister locally:

```
dfx deploy
```

A link to the Candid UI is going to result from the command for you to navigate to it. 