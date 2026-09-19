// ============================================================
// SUPABASE CONFIG
// ============================================================


const SUPABASE_URL =
    "https://ybzbkjxzfztanjnhbjhg.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_K_w1ldCzvx0K0_8Ey_cjIQ_xJ2Tugrv";

const db =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ============================================================
// ELEMENTS
// ============================================================

// Login / App

const loginSection =
    document.getElementById(
        "login-section"
    );

const appSection =
    document.getElementById(
        "app-section"
    );

const loginButton =
    document.getElementById(
        "login-button"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );

const loginMessage =
    document.getElementById(
        "login-message"
    );

const userEmail =
    document.getElementById(
        "user-email"
    );


// Inventory

const rawList =
    document.getElementById(
        "raw-list"
    );

const cookedList =
    document.getElementById(
        "cooked-list"
    );

const rawLowList =
    document.getElementById(
        "raw-low-list"
    );

const cookedLowList =
    document.getElementById(
        "cooked-low-list"
    );


// Add Raw

const addRawButton =
    document.getElementById(
        "add-raw-button"
    );

const rawDialog =
    document.getElementById(
        "raw-dialog"
    );

const rawForm =
    document.getElementById(
        "raw-form"
    );

const cancelRawButton =
    document.getElementById(
        "cancel-raw-button"
    );


// Add Cooked

const addCookedButton =
    document.getElementById(
        "add-cooked-button"
    );

const cookedDialog =
    document.getElementById(
        "cooked-dialog"
    );

const cookedForm =
    document.getElementById(
        "cooked-form"
    );

const cancelCookedButton =
    document.getElementById(
        "cancel-cooked-button"
    );

const cookedItemSelect =
    document.getElementById(
        "cooked-item"
    );

const newCookedFields =
    document.getElementById(
        "new-cooked-fields"
    );

// ============================================================
// RECIPE ELEMENTS
// ============================================================

const recipeList =
    document.getElementById("recipe-list");

const recipeCount =
    document.getElementById("recipe-count");

const addRecipeButton =
    document.getElementById("add-recipe-button");

const recipeDialog =
    document.getElementById("recipe-dialog");

const recipeForm =
    document.getElementById("recipe-form");

const cancelRecipeButton =
    document.getElementById("cancel-recipe-button");

const addRecipeIngredientButton =
    document.getElementById("add-recipe-ingredient-button");

const addRecipeStepButton =
    document.getElementById("add-recipe-step-button");

const recipeIngredientsEditor =
    document.getElementById("recipe-ingredients-editor");

const recipeStepsEditor =
    document.getElementById("recipe-steps-editor");

const recipeFormMessage =
    document.getElementById("recipe-form-message");



const recipeDetailDialog =
    document.getElementById(
        "recipe-detail-dialog"
    );

const detailRecipeName =
    document.getElementById(
        "detail-recipe-name"
    );

const detailRecipeDescription =
    document.getElementById(
        "detail-recipe-description"
    );

const detailRecipeMeta =
    document.getElementById(
        "detail-recipe-meta"
    );

const detailRecipeIngredients =
    document.getElementById(
        "detail-recipe-ingredients"
    );

const detailRecipeSteps =
    document.getElementById(
        "detail-recipe-steps"
    );

const recipeDetailMessage =
    document.getElementById(
        "recipe-detail-message"
    );

const closeRecipeDetailButton =
    document.getElementById(
        "close-recipe-detail-button"
    );

const editRecipeButton =
    document.getElementById(
        "edit-recipe-button"
    );

const deleteRecipeButton =
    document.getElementById(
        "delete-recipe-button"
    );

const cookRecipeButton =
    document.getElementById(
        "cook-recipe-button"
    );
// ============================================================
// EDIT RAW ELEMENTS
// ============================================================

const editRawDialog =
    document.getElementById(
        "edit-raw-dialog"
    );

const editRawForm =
    document.getElementById(
        "edit-raw-form"
    );

const cancelEditRawButton =
    document.getElementById(
        "cancel-edit-raw-button"
    );

const deleteRawButton =
    document.getElementById(
        "delete-raw-button"
    );


// ============================================================
// EDIT COOKED ELEMENTS
// ============================================================

const editCookedDialog =
    document.getElementById(
        "edit-cooked-dialog"
    );

const editCookedForm =
    document.getElementById(
        "edit-cooked-form"
    );

const cancelEditCookedButton =
    document.getElementById(
        "cancel-edit-cooked-button"
    );

const deleteCookedButton =
    document.getElementById(
        "delete-cooked-button"
    );

const editCookedBatches =
    document.getElementById(
        "edit-cooked-batches"
    );

const rawIngredientOptions =
    document.getElementById(
        "raw-ingredient-options"
    );

// ============================================================
// STATE
// ============================================================

let currentUser = null;

let cachedCookedItems = [];

let editingRawItem = null;

let editingCookedItem = null;

let selectedRecipe = null;

let editingRecipe = null;

let cachedRawItems = [];

// ============================================================
// LOGIN
// ============================================================

loginButton.addEventListener(
    "click",
    async () =>
    {
        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;


        loginMessage.textContent =
            "Signing in...";


        const {
            data,
            error
        } =
            await db.auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error)
        {
            loginMessage.textContent =
                error.message;

            return;
        }


        loginMessage.textContent =
            "";

        await showApp(
            data.user
        );
    }
);


// ============================================================
// LOGOUT
// ============================================================

logoutButton.addEventListener(
    "click",
    async () =>
    {
        await db.auth.signOut();

        currentUser =
            null;

        appSection.classList.add(
            "hidden"
        );

        loginSection.classList.remove(
            "hidden"
        );
    }
);


// ============================================================
// SHOW APP
// ============================================================

async function showApp(user)
{
    currentUser =
        user;


    loginSection.classList.add(
        "hidden"
    );

    appSection.classList.remove(
        "hidden"
    );


    userEmail.textContent =
        user.email;


    await Promise.all([
        loadInventory(user.id),
        loadRecipes(user.id)
    ]);
}

// ============================================================
// LOAD RECIPES
// ============================================================

async function loadRecipes(userId)
{
    const {
        data,
        error
    } =
        await db
            .from("recipes")
            .select(`
                id,
                name,
                description,
                prep_minutes,
                servings,
                created_at
            `)
            .eq("user_id", userId)
            .order("name", {
                ascending: true
            });


    if (error)
    {
        console.error(error);

        recipeList.textContent =
            "Could not load recipes.";

        return;
    }


    renderRecipes(data ?? []);
}


// ============================================================
// RENDER RECIPES
// ============================================================

function renderRecipes(recipes)
{
    recipeList.innerHTML = "";

    recipeCount.textContent =
        recipes.length;


    if (recipes.length === 0)
    {
        const empty =
            document.createElement("div");

        empty.className =
            "empty-message";

        empty.textContent =
            "No recipes yet.";

        recipeList.appendChild(empty);

        return;
    }


    for (const recipe of recipes)
    {
        const card =
            document.createElement("div");

        card.className =
            "recipe-card";
        card.addEventListener(
            "click",
            () =>
            {
                openRecipeDetail(recipe);
            }
        );


        const name =
            document.createElement("div");

        name.className =
            "recipe-name";

        name.textContent =
            recipe.name;


        card.appendChild(name);


        if (recipe.description)
        {
            const description =
                document.createElement("div");

            description.className =
                "recipe-description";

            description.textContent =
                recipe.description;

            card.appendChild(description);
        }


        const meta =
            document.createElement("div");

        meta.className =
            "recipe-meta";


        const metaParts = [];


        if (recipe.prep_minutes != null)
        {
            metaParts.push(
                `${recipe.prep_minutes} min`
            );
        }


        if (recipe.servings != null)
        {
            metaParts.push(
                `${recipe.servings} serving` +
                (recipe.servings === 1 ? "" : "s")
            );
        }


        meta.textContent =
            metaParts.join(" · ");


        card.appendChild(meta);

        recipeList.appendChild(card);
    }
}

// ============================================================
// ADD INGREDIENT EDITOR ROW
// ============================================================

function addRecipeIngredientRow(
    values = {}
)
{
    const row =
        document.createElement("div");

    row.className =
        "recipe-ingredient-row";


    // Ingredient name

    const nameInput =
        document.createElement("input");

    nameInput.type =
        "text";

    nameInput.placeholder =
        "Ingredient / 食材";

    nameInput.className =
        "recipe-ingredient-name";

    nameInput.value =
        values.name ?? "";

    nameInput.setAttribute(
        "list",
        "raw-ingredient-options"
    );

    nameInput.autocomplete = "off";
        
    // Amount

    const amountInput =
        document.createElement("input");

    amountInput.type =
        "number";

    amountInput.min =
        "0";

    amountInput.step =
        "any";

    amountInput.placeholder =
        "Amount";

    amountInput.className =
        "recipe-ingredient-amount";

    amountInput.value =
        values.amount ?? "";


    // Unit

    const unitSelect =
        document.createElement("select");

    unitSelect.className =
        "recipe-ingredient-unit";


    const units = [
        "g",
        "kg",
        "ml",
        "L",
        "tsp",
        "tbsp",
        "cup",
        "piece",
        "portion"
    ];


    for (const unit of units)
    {
        const option =
            document.createElement("option");

        option.value =
            unit;

        option.textContent =
            unit;

        unitSelect.appendChild(option);
    }


    unitSelect.value =
        values.unit ?? "g";


    // Remove

    const removeButton =
        document.createElement("button");

    removeButton.type =
        "button";

    removeButton.className =
        "recipe-remove-row";

    removeButton.textContent =
        "×";


    removeButton.addEventListener(
        "click",
        () =>
        {
            row.remove();
        }
    );


    row.appendChild(nameInput);
    row.appendChild(amountInput);
    row.appendChild(unitSelect);
    row.appendChild(removeButton);


    recipeIngredientsEditor.appendChild(
        row
    );
}

// ============================================================
// ADD RECIPE STEP ROW
// ============================================================

function addRecipeStepRow(
    text = ""
)
{
    const row =
        document.createElement("div");

    row.className =
        "recipe-step-row";


    const number =
        document.createElement("div");

    number.className =
        "recipe-step-number";


    const textarea =
        document.createElement("textarea");

    textarea.rows =
        2;

    textarea.placeholder =
        "Instruction / 步骤";

    textarea.className =
        "recipe-step-instruction";

    textarea.value =
        text;


    const removeButton =
        document.createElement("button");

    removeButton.type =
        "button";

    removeButton.className =
        "recipe-remove-row";

    removeButton.textContent =
        "×";


    removeButton.addEventListener(
        "click",
        () =>
        {
            row.remove();

            updateRecipeStepNumbers();
        }
    );


    row.appendChild(number);
    row.appendChild(textarea);
    row.appendChild(removeButton);


    recipeStepsEditor.appendChild(row);

    updateRecipeStepNumbers();
}


// ============================================================
// UPDATE STEP NUMBERS
// ============================================================

function updateRecipeStepNumbers()
{
    const rows =
        recipeStepsEditor.querySelectorAll(
            ".recipe-step-row"
        );


    rows.forEach(
        (row, index) =>
        {
            row.querySelector(
                ".recipe-step-number"
            ).textContent =
                `${index + 1}.`;
        }
    );
}

// ============================================================
// OPEN ADD RECIPE
// ============================================================

addRecipeButton.addEventListener(
    "click",
    () =>
    {
        editingRecipe = null;

        recipeForm.reset();

        recipeIngredientsEditor.innerHTML = "";
        recipeStepsEditor.innerHTML = "";
        recipeFormMessage.textContent = "";

        recipeDialog.querySelector("h2").textContent =
            "Add Recipe";

        recipeForm.querySelector(
            'button[type="submit"]'
        ).textContent =
            "Save Recipe";

        document.getElementById(
            "recipe-prep-minutes"
        ).value = 10;

        document.getElementById(
            "recipe-servings"
        ).value = 1;

        addRecipeIngredientRow();
        addRecipeStepRow();

        recipeDialog.showModal();
    }
);

cancelRecipeButton.addEventListener(
    "click",
    () =>
    {
        editingRecipe = null;

        recipeDialog.close();
    }
);

addRecipeIngredientButton.addEventListener(
    "click",
    () =>
    {
        addRecipeIngredientRow();
    }
);


addRecipeStepButton.addEventListener(
    "click",
    () =>
    {
        addRecipeStepRow();
    }
);

// ============================================================
// SAVE RECIPE
// ============================================================

recipeForm.addEventListener(
    "submit",
    async event =>
    {
        event.preventDefault();

        if (!currentUser)
        {
            return;
        }


        // ====================================================
        // BASIC INFORMATION
        // ====================================================

        const name =
            document.getElementById(
                "recipe-name"
            ).value.trim();


        const description =
            document.getElementById(
                "recipe-description"
            ).value.trim();


        const prepMinutes =
            Number(
                document.getElementById(
                    "recipe-prep-minutes"
                ).value
            );


        const servings =
            Number(
                document.getElementById(
                    "recipe-servings"
                ).value
            );


        if (!name)
        {
            recipeFormMessage.textContent =
                "Recipe name is required.";

            return;
        }


        // ====================================================
        // COLLECT INGREDIENTS
        // ====================================================

        const ingredientRows =
            [
                ...recipeIngredientsEditor
                    .querySelectorAll(
                        ".recipe-ingredient-row"
                    )
            ];


        const ingredients = [];


        for (const row of ingredientRows)
        {
            const ingredientName =
                row.querySelector(
                    ".recipe-ingredient-name"
                ).value.trim();


            const amount =
                Number(
                    row.querySelector(
                        ".recipe-ingredient-amount"
                    ).value
                );


            const unit =
                row.querySelector(
                    ".recipe-ingredient-unit"
                ).value;


            if (!ingredientName)
            {
                continue;
            }


            if (
                !Number.isFinite(amount) ||
                amount < 0
            )
            {
                recipeFormMessage.textContent =
                    `Invalid amount for ${ingredientName}.`;

                return;
            }


            ingredients.push({
                name:
                    ingredientName,

                amount:
                    amount,

                unit:
                    unit
            });
        }


        // ====================================================
        // COLLECT STEPS
        // ====================================================

        const stepRows =
            [
                ...recipeStepsEditor
                    .querySelectorAll(
                        ".recipe-step-row"
                    )
            ];


        const steps = [];


        for (const row of stepRows)
        {
            const instruction =
                row.querySelector(
                    ".recipe-step-instruction"
                ).value.trim();


            if (instruction)
            {
                steps.push(
                    instruction
                );
            }
        }


        recipeFormMessage.textContent =
            "Saving...";


        let recipeId;


        // ====================================================
        // ADD OR UPDATE RECIPE
        // ====================================================

        if (editingRecipe)
        {
            // -----------------------------------------------
            // UPDATE EXISTING RECIPE
            // -----------------------------------------------

            recipeId =
                editingRecipe.id;


            const {
                error: updateError
            } =
                await db
                    .from("recipes")
                    .update({
                        name:
                            name,

                        description:
                            description,

                        prep_minutes:
                            Number.isFinite(
                                prepMinutes
                            )
                                ? prepMinutes
                                : null,

                        servings:
                            Number.isFinite(
                                servings
                            )
                                ? servings
                                : 1
                    })
                    .eq(
                        "id",
                        recipeId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );


            if (updateError)
            {
                console.error(
                    updateError
                );

                recipeFormMessage.textContent =
                    updateError.message;

                return;
            }


            // -----------------------------------------------
            // Remove old ingredient links
            // -----------------------------------------------

            const {
                error: deleteIngredientError
            } =
                await db
                    .from(
                        "recipe_ingredients"
                    )
                    .delete()
                    .eq(
                        "recipe_id",
                        recipeId
                    );


            if (deleteIngredientError)
            {
                console.error(
                    deleteIngredientError
                );

                recipeFormMessage.textContent =
                    deleteIngredientError.message;

                return;
            }


            // -----------------------------------------------
            // Remove old steps
            // -----------------------------------------------

            const {
                error: deleteStepError
            } =
                await db
                    .from(
                        "recipe_steps"
                    )
                    .delete()
                    .eq(
                        "recipe_id",
                        recipeId
                    );


            if (deleteStepError)
            {
                console.error(
                    deleteStepError
                );

                recipeFormMessage.textContent =
                    deleteStepError.message;

                return;
            }
        }
        else
        {
            // -----------------------------------------------
            // CREATE NEW RECIPE
            // -----------------------------------------------

            const {
                data: newRecipe,
                error: recipeError
            } =
                await db
                    .from("recipes")
                    .insert({
                        user_id:
                            currentUser.id,

                        name:
                            name,

                        description:
                            description,

                        prep_minutes:
                            Number.isFinite(
                                prepMinutes
                            )
                                ? prepMinutes
                                : null,

                        servings:
                            Number.isFinite(
                                servings
                            )
                                ? servings
                                : 1
                    })
                    .select("id")
                    .single();


            if (recipeError)
            {
                console.error(
                    recipeError
                );

                recipeFormMessage.textContent =
                    recipeError.message;

                return;
            }


            recipeId =
                newRecipe.id;
        }


        // ====================================================
        // INSERT INGREDIENTS
        // ====================================================

        for (const item of ingredients)
        {
            let ingredientId = null;


            // -----------------------------------------------
            // Look for existing ingredient
            // -----------------------------------------------

            const {
                data: existingIngredient,
                error: lookupError
            } =
                await db
                    .from("ingredients")
                    .select("id")
                    .eq(
                        "user_id",
                        currentUser.id
                    )
                    .eq(
                        "name",
                        item.name
                    )
                    .maybeSingle();


            if (lookupError)
            {
                console.error(
                    lookupError
                );

                recipeFormMessage.textContent =
                    lookupError.message;

                return;
            }


            if (existingIngredient)
            {
                ingredientId =
                    existingIngredient.id;
            }
            else
            {
                // -------------------------------------------
                // Recipe-only ingredient
                // -------------------------------------------

                const {
                    data: newIngredient,
                    error: ingredientError
                } =
                    await db
                        .from("ingredients")
                        .insert({
                            user_id:
                                currentUser.id,

                            name:
                                item.name,

                            category:
                                "Other",

                            default_unit:
                                item.unit
                        })
                        .select("id")
                        .single();


                if (ingredientError)
                {
                    console.error(
                        ingredientError
                    );

                    recipeFormMessage.textContent =
                        ingredientError.message;

                    return;
                }


                ingredientId =
                    newIngredient.id;
            }


            // -----------------------------------------------
            // Create recipe ingredient link
            // -----------------------------------------------

            const {
                error: linkError
            } =
                await db
                    .from(
                        "recipe_ingredients"
                    )
                    .insert({
                        recipe_id:
                            recipeId,

                        ingredient_id:
                            ingredientId,

                        amount:
                            item.amount,

                        unit:
                            item.unit,

                        optional:
                            false
                    });


            if (linkError)
            {
                console.error(
                    linkError
                );

                recipeFormMessage.textContent =
                    linkError.message;

                return;
            }
        }


        // ====================================================
        // INSERT STEPS
        // ====================================================

        if (steps.length > 0)
        {
            const stepRecords =
                steps.map(
                    (
                        instruction,
                        index
                    ) =>
                    ({
                        recipe_id:
                            recipeId,

                        step_number:
                            index + 1,

                        instruction:
                            instruction
                    })
                );


            const {
                error: stepError
            } =
                await db
                    .from(
                        "recipe_steps"
                    )
                    .insert(
                        stepRecords
                    );


            if (stepError)
            {
                console.error(
                    stepError
                );

                recipeFormMessage.textContent =
                    stepError.message;

                return;
            }
        }


        // ====================================================
        // DONE
        // ====================================================

        editingRecipe = null;

        selectedRecipe = null;

        recipeDialog.close();


        await loadRecipes(
            currentUser.id
        );
    }
);

// ============================================================
// LOAD ALL INVENTORY
// ============================================================

async function loadInventory(userId)
{
    await Promise.all([
        loadRawInventory(
            userId
        ),

        loadCookedInventory(
            userId
        )
    ]);
}


// ============================================================
// RAW INVENTORY
// ============================================================

async function loadRawInventory(
    userId
)
{
    const {
        data,
        error
    } =
        await db
            .from(
                "inventory_items"
            )
            .select(`
                id,
                quantity,
                portion,
                low_stock_threshold,
                ingredients (
                    id,
                    name,
                    category,
                    default_unit
                )
            `)
            .eq(
                "user_id",
                userId
            );


    if (error)
    {
        console.error(
            error
        );

        rawList.textContent =
            "Failed to load raw inventory.";

        return;
    }

    cachedRawItems =
    data ?? [];

    updateRawIngredientOptions();

    renderRaw(
        data ?? []
    );
}

function updateRawIngredientOptions()
{
    rawIngredientOptions.innerHTML = "";

    const names =
        cachedRawItems
            .map(
                item =>
                    item.ingredients?.name
            )
            .filter(
                name =>
                    name
            )
            .sort(
                (a, b) =>
                    a.localeCompare(b)
            );

    for (const name of names)
    {
        const option =
            document.createElement(
                "option"
            );

        option.value = name;

        rawIngredientOptions.appendChild(
            option
        );
    }
}


// ============================================================
// RENDER RAW
// ============================================================

function renderRaw(items)
{
    rawList.innerHTML =
        "";

    const lowItems =
        [];


    for (const item of items)
    {
        const low =
            Number(item.quantity) <=
            Number(
                item.low_stock_threshold
            );


        if (low)
        {
            lowItems.push(
                item.ingredients.name
            );
        }


        const row =
            document.createElement(
                "div"
            );

        row.className =
            "inventory-row";


        // Food info

        const info =
            document.createElement(
                "div"
            );


        const name =
            document.createElement(
                "div"
            );

        name.className =
            "food-name clickable";

        name.textContent =
            item.ingredients.name;


        name.addEventListener(
            "click",
            () =>
            {
                openEditRawDialog(
                    item
                );
            }
);


        if (low)
        {
            const lowLabel =
                document.createElement(
                    "span"
                );

            lowLabel.className =
                "low-label";

            lowLabel.textContent =
                "LOW";

            name.appendChild(
                lowLabel
            );
        }


        const detail =
            document.createElement(
                "div"
            );

        detail.className =
            "food-detail";


        if (item.portion)
        {
            detail.textContent =
                `${item.portion} / ${item.ingredients.default_unit}`;
        }
        else
        {
            detail.textContent =
                item.ingredients.default_unit;
        }


        info.appendChild(
            name
        );

        info.appendChild(
            detail
        );


        // Quantity controls

        const controls =
            createQuantityControls(
                item.quantity,

                async () =>
                {
                    await changeRawQuantity(
                        item,
                        +1
                    );
                },

                async () =>
                {
                    await changeRawQuantity(
                        item,
                        -1
                    );
                }
            );


        row.appendChild(
            info
        );

        row.appendChild(
            controls
        );


        rawList.appendChild(
            row
        );
    }


    document.getElementById(
        "raw-count"
    ).textContent =
        `${items.length} items`;


    rawLowList.textContent =
        lowItems.length > 0
            ? lowItems.join(", ")
            : "Nothing";
}


// ============================================================
// CHANGE RAW QUANTITY
// ============================================================

async function changeRawQuantity(
    item,
    change
)
{
    if (!currentUser)
    {
        return;
    }


    const oldQuantity =
        Number(
            item.quantity
        );


    const newQuantity =
        Math.max(
            0,
            oldQuantity + change
        );


    if (
        newQuantity ===
        oldQuantity
    )
    {
        return;
    }


    const {
        error
    } =
        await db
            .from(
                "inventory_items"
            )
            .update({
                quantity:
                    newQuantity
            })
            .eq(
                "id",
                item.id
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error)
    {
        console.error(
            error
        );

        alert(
            "Failed to update quantity."
        );

        return;
    }


    await loadRawInventory(
        currentUser.id
    );
}


// ============================================================
// COOKED INVENTORY
// ============================================================

async function loadCookedInventory(
    userId
)
{
    const {
        data: cookedItems,
        error: itemError
    } =
        await db
            .from(
                "cooked_items"
            )
            .select(`
                id,
                name,
                portion,
                low_stock_threshold
            `)
            .eq(
                "user_id",
                userId
            );


    if (itemError)
    {
        console.error(
            itemError
        );

        cookedList.textContent =
            "Failed to load cooked inventory.";

        return;
    }


    // Keep all cooked item definitions,
    // including items with no active batch.

    cachedCookedItems =
        cookedItems ?? [];


    const {
        data: batches,
        error: batchError
    } =
        await db
            .from(
                "cooked_batches"
            )
            .select(`
                id,
                cooked_item_id,
                quantity,
                cooked_date,
                created_at
            `)
            .eq(
                "user_id",
                userId
            )
            .gt(
                "quantity",
                0
            )
            .order(
                "cooked_date",
                {
                    ascending: true
                }
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (batchError)
    {
        console.error(
            batchError
        );

        cookedList.textContent =
            "Failed to load cooked batches.";

        return;
    }


    const cooked =
        [];


    for (
        const item of
        cachedCookedItems
    )
    {
        const itemBatches =
            (batches ?? []).filter(
                batch =>
                    batch.cooked_item_id ===
                    item.id
            );


        const total =
            itemBatches.reduce(
                (
                    sum,
                    batch
                ) =>
                    sum +
                    Number(
                        batch.quantity
                    ),
                0
            );


        // Do not show zero-stock cooked items
        // on the main page.

        if (total <= 0)
        {
            continue;
        }


        cooked.push({
            ...item,

            quantity:
                total,

            batches:
                itemBatches
        });
    }


    renderCooked(
        cooked
    );
}


// ============================================================
// RENDER COOKED
// ============================================================

function renderCooked(items)
{
    cookedList.innerHTML =
        "";

    const lowItems =
        [];


    for (const item of items)
    {
        const low =
            Number(item.quantity) <=
            Number(
                item.low_stock_threshold
            );


        if (low)
        {
            lowItems.push(
                item.name
            );
        }


        const row =
            document.createElement(
                "div"
            );

        row.className =
            "inventory-row";


        // Food info

        const info =
            document.createElement(
                "div"
            );


        const name =
            document.createElement(
                "div"
            );

        name.className =
        "food-name clickable";

        name.textContent =
            item.name;


        name.addEventListener(
            "click",
            () =>
            {
                openEditCookedDialog(
                    item
                );
            }
        );

        if (low)
        {
            const lowLabel =
                document.createElement(
                    "span"
                );

            lowLabel.className =
                "low-label";

            lowLabel.textContent =
                "LOW";

            name.appendChild(
                lowLabel
            );
        }


        const detail =
            document.createElement(
                "div"
            );

        detail.className =
            "food-detail";

        detail.textContent =
            item.portion || "";


        info.appendChild(
            name
        );

        info.appendChild(
            detail
        );


        // Quantity controls

        const controls =
            createQuantityControls(
                item.quantity,

                async () =>
                {
                    await increaseCookedQuantity(
                        item
                    );
                },

                async () =>
                {
                    await decreaseCookedQuantityFIFO(
                        item
                    );
                }
            );


        row.appendChild(
            info
        );

        row.appendChild(
            controls
        );


        cookedList.appendChild(
            row
        );
    }


    document.getElementById(
        "cooked-count"
    ).textContent =
        `${items.length} items`;


    cookedLowList.textContent =
        lowItems.length > 0
            ? lowItems.join(", ")
            : "Nothing";
}


// ============================================================
// CREATE QUANTITY CONTROLS
//
// Display order:
// quantity | + | -
// ============================================================

function createQuantityControls(
    quantity,
    onIncrease,
    onDecrease
)
{
    const controls =
        document.createElement(
            "div"
        );

    controls.className =
        "quantity-controls";


    // Quantity

    const quantityText =
        document.createElement(
            "span"
        );

    quantityText.className =
        "quantity";

    quantityText.textContent =
        formatQuantity(
            quantity
        );


    // +

    const plusButton =
        document.createElement(
            "button"
        );

    plusButton.className =
        "quantity-button";

    plusButton.type =
        "button";

    plusButton.textContent =
        "+";


    // -

    const minusButton =
        document.createElement(
            "button"
        );

    minusButton.className =
        "quantity-button";

    minusButton.type =
        "button";

    minusButton.textContent =
        "−";


    plusButton.addEventListener(
        "click",
        async () =>
        {
            plusButton.disabled =
                true;

            minusButton.disabled =
                true;


            try
            {
                await onIncrease();
            }
            finally
            {
                plusButton.disabled =
                    false;

                minusButton.disabled =
                    false;
            }
        }
    );


    minusButton.addEventListener(
        "click",
        async () =>
        {
            plusButton.disabled =
                true;

            minusButton.disabled =
                true;


            try
            {
                await onDecrease();
            }
            finally
            {
                plusButton.disabled =
                    false;

                minusButton.disabled =
                    false;
            }
        }
    );


    controls.appendChild(
        quantityText
    );

    controls.appendChild(
        plusButton
    );

    controls.appendChild(
        minusButton
    );


    return controls;
}


// ============================================================
// INCREASE COOKED QUANTITY
//
// Quick + changes newest active batch.
//
// A real new cooking session uses Add Cooked Food,
// which creates a new dated batch.
// ============================================================

async function increaseCookedQuantity(
    item
)
{
    if (
        !currentUser ||
        item.batches.length === 0
    )
    {
        return;
    }


    // batches are oldest -> newest

    const newestBatch =
        item.batches[
            item.batches.length - 1
        ];


    const newQuantity =
        Number(
            newestBatch.quantity
        ) + 1;


    const {
        error
    } =
        await db
            .from(
                "cooked_batches"
            )
            .update({
                quantity:
                    newQuantity
            })
            .eq(
                "id",
                newestBatch.id
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error)
    {
        console.error(
            error
        );

        alert(
            "Failed to update cooked quantity."
        );

        return;
    }


    await loadCookedInventory(
        currentUser.id
    );
}


// ============================================================
// DECREASE COOKED QUANTITY
//
// FIFO:
// remove from oldest active batch first.
// ============================================================

async function decreaseCookedQuantityFIFO(
    item
)
{
    if (
        !currentUser ||
        item.batches.length === 0
    )
    {
        return;
    }


    const oldestBatch =
        item.batches[0];


    const oldQuantity =
        Number(
            oldestBatch.quantity
        );


    if (oldQuantity <= 0)
    {
        return;
    }


    const newQuantity =
        Math.max(
            0,
            oldQuantity - 1
        );


    const {
        error
    } =
        await db
            .from(
                "cooked_batches"
            )
            .update({
                quantity:
                    newQuantity
            })
            .eq(
                "id",
                oldestBatch.id
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error)
    {
        console.error(
            error
        );

        alert(
            "Failed to update cooked quantity."
        );

        return;
    }


    await loadCookedInventory(
        currentUser.id
    );
}


// ============================================================
// ADD RAW DIALOG
// ============================================================

addRawButton.addEventListener(
    "click",
    () =>
    {
        rawForm.reset();


        document.getElementById(
            "raw-quantity"
        ).value =
            "1";


        document.getElementById(
            "raw-threshold"
        ).value =
            "0";


        document.getElementById(
            "raw-form-message"
        ).textContent =
            "";


        rawDialog.showModal();
    }
);


cancelRawButton.addEventListener(
    "click",
    () =>
    {
        rawDialog.close();
    }
);


// ============================================================
// ADD RAW FOOD
// ============================================================

rawForm.addEventListener(
    "submit",
    async event =>
    {
        event.preventDefault();


        if (!currentUser)
        {
            return;
        }


        const message =
            document.getElementById(
                "raw-form-message"
            );


        const name =
            document.getElementById(
                "raw-name"
            )
                .value
                .trim();


        const category =
            document.getElementById(
                "raw-category"
            ).value;


        const quantity =
            Number(
                document.getElementById(
                    "raw-quantity"
                ).value
            );


        const unit =
            document.getElementById(
                "raw-unit"
            ).value;


        const portion =
            document.getElementById(
                "raw-portion"
            )
                .value
                .trim();


        const threshold =
            Number(
                document.getElementById(
                    "raw-threshold"
                ).value
            );


        if (!name)
        {
            message.textContent =
                "Please enter a food name.";

            return;
        }


        if (
            !Number.isFinite(quantity) ||
            quantity < 0
        )
        {
            message.textContent =
                "Invalid quantity.";

            return;
        }


        if (
            !Number.isFinite(threshold) ||
            threshold < 0
        )
        {
            message.textContent =
                "Invalid low-stock threshold.";

            return;
        }


        message.textContent =
            "Adding...";


        // ----------------------------------------------------
        // Look for an existing ingredient
        // ----------------------------------------------------

        const {
            data: existingIngredient,
            error: searchError
        } =
            await db
                .from(
                    "ingredients"
                )
                .select(`
                    id,
                    name
                `)
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "name",
                    name
                )
                .maybeSingle();


        if (searchError)
        {
            console.error(
                searchError
            );

            message.textContent =
                searchError.message;

            return;
        }


        let ingredientId;


        // ----------------------------------------------------
        // Existing ingredient
        // ----------------------------------------------------

        if (existingIngredient)
        {
            ingredientId =
                existingIngredient.id;
        }

        // ----------------------------------------------------
        // New ingredient
        // ----------------------------------------------------

        else
        {
            const {
                data: newIngredient,
                error: insertIngredientError
            } =
                await db
                    .from(
                        "ingredients"
                    )
                    .insert({
                        user_id:
                            currentUser.id,

                        name:
                            name,

                        category:
                            category,

                        default_unit:
                            unit
                    })
                    .select("id")
                    .single();


            if (insertIngredientError)
            {
                console.error(
                    insertIngredientError
                );

                message.textContent =
                    insertIngredientError.message;

                return;
            }


            ingredientId =
                newIngredient.id;
        }


        // ----------------------------------------------------
        // Check whether already in RAW inventory
        // ----------------------------------------------------

        const {
            data: existingInventory,
            error: inventorySearchError
        } =
            await db
                .from(
                    "inventory_items"
                )
                .select(`
                    id,
                    quantity
                `)
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "ingredient_id",
                    ingredientId
                )
                .maybeSingle();


        if (inventorySearchError)
        {
            console.error(
                inventorySearchError
            );

            message.textContent =
                inventorySearchError.message;

            return;
        }


        if (existingInventory)
        {
            message.textContent =
                "This food is already in RAW inventory.";

            return;
        }


        // ----------------------------------------------------
        // Add RAW inventory row
        // ----------------------------------------------------

        const {
            error: insertInventoryError
        } =
            await db
                .from(
                    "inventory_items"
                )
                .insert({
                    user_id:
                        currentUser.id,

                    ingredient_id:
                        ingredientId,

                    quantity:
                        quantity,

                    portion:
                        portion,

                    low_stock_threshold:
                        threshold
                });


        if (insertInventoryError)
        {
            console.error(
                insertInventoryError
            );

            message.textContent =
                insertInventoryError.message;

            return;
        }


        rawDialog.close();


        await loadRawInventory(
            currentUser.id
        );
    }
);


// ============================================================
// ADD COOKED DIALOG
// ============================================================

addCookedButton.addEventListener(
    "click",
    () =>
    {
        cookedForm.reset();


        cookedItemSelect.innerHTML =
            "";


        // Existing cooked foods

        for (
            const item of
            cachedCookedItems
        )
        {
            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.id;


            option.textContent =
                item.portion
                    ? `${item.name} (${item.portion})`
                    : item.name;


            cookedItemSelect.appendChild(
                option
            );
        }


        // New cooked food

        const newOption =
            document.createElement(
                "option"
            );


        newOption.value =
            "__new__";


        newOption.textContent =
            "+ New Food";


        cookedItemSelect.appendChild(
            newOption
        );


        // If there are no existing items,
        // select New Food automatically.

        if (
            cachedCookedItems.length === 0
        )
        {
            cookedItemSelect.value =
                "__new__";

            newCookedFields.classList.remove(
                "hidden"
            );
        }
        else
        {
            newCookedFields.classList.add(
                "hidden"
            );
        }


        document.getElementById(
            "cooked-quantity"
        ).value =
            "1";


        // ----------------------------------------------------
        // Local calendar date
        // ----------------------------------------------------

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


        document.getElementById(
            "cooked-date"
        ).value =
            `${year}-${month}-${day}`;


        document.getElementById(
            "cooked-form-message"
        ).textContent =
            "";


        cookedDialog.showModal();
    }
);


cancelCookedButton.addEventListener(
    "click",
    () =>
    {
        cookedDialog.close();
    }
);


// ============================================================
// NEW COOKED FOOD FIELDS
// ============================================================

cookedItemSelect.addEventListener(
    "change",
    () =>
    {
        if (
            cookedItemSelect.value ===
            "__new__"
        )
        {
            newCookedFields.classList.remove(
                "hidden"
            );
        }
        else
        {
            newCookedFields.classList.add(
                "hidden"
            );
        }
    }
);


// ============================================================
// ADD COOKED FOOD
// ============================================================

cookedForm.addEventListener(
    "submit",
    async event =>
    {
        event.preventDefault();


        if (!currentUser)
        {
            return;
        }


        const message =
            document.getElementById(
                "cooked-form-message"
            );


        const quantity =
            Number(
                document.getElementById(
                    "cooked-quantity"
                ).value
            );


        const cookedDate =
            document.getElementById(
                "cooked-date"
            ).value;


        if (
            !Number.isFinite(quantity) ||
            quantity <= 0
        )
        {
            message.textContent =
                "Quantity must be greater than 0.";

            return;
        }


        if (!cookedDate)
        {
            message.textContent =
                "Please select a cooked date.";

            return;
        }


        let cookedItemId =
            cookedItemSelect.value;


        message.textContent =
            "Adding...";


        // ----------------------------------------------------
        // Create NEW cooked item definition
        // ----------------------------------------------------

        if (
            cookedItemId ===
            "__new__"
        )
        {
            const name =
                document.getElementById(
                    "cooked-name"
                )
                    .value
                    .trim();


            const portion =
                document.getElementById(
                    "cooked-portion"
                )
                    .value
                    .trim();


            const threshold =
                Number(
                    document.getElementById(
                        "cooked-threshold"
                    ).value
                );


            if (!name)
            {
                message.textContent =
                    "Please enter a food name.";

                return;
            }


            if (
                !Number.isFinite(threshold) ||
                threshold < 0
            )
            {
                message.textContent =
                    "Invalid low-stock threshold.";

                return;
            }


            const {
                data: newItem,
                error: newItemError
            } =
                await db
                    .from(
                        "cooked_items"
                    )
                    .insert({
                        user_id:
                            currentUser.id,

                        name:
                            name,

                        portion:
                            portion,

                        low_stock_threshold:
                            threshold
                    })
                    .select("id")
                    .single();


            if (newItemError)
            {
                console.error(
                    newItemError
                );

                message.textContent =
                    newItemError.message;

                return;
            }


            cookedItemId =
                newItem.id;
        }


        // ----------------------------------------------------
        // Create a NEW dated cooked batch
        // ----------------------------------------------------

        const {
            error: batchError
        } =
            await db
                .from(
                    "cooked_batches"
                )
                .insert({
                    user_id:
                        currentUser.id,

                    cooked_item_id:
                        cookedItemId,

                    quantity:
                        quantity,

                    cooked_date:
                        cookedDate
                });


        if (batchError)
        {
            console.error(
                batchError
            );

            message.textContent =
                batchError.message;

            return;
        }


        cookedDialog.close();


        await loadCookedInventory(
            currentUser.id
        );
    }
);


// ============================================================
// QUANTITY FORMAT
// ============================================================

function formatQuantity(value)
{
    const number =
        Number(value);


    if (
        Number.isInteger(number)
    )
    {
        return number.toString();
    }


    return number.toFixed(1);
}


// ============================================================
// RESTORE SESSION
// ============================================================

async function initialize()
{
    const {
        data,
        error
    } =
        await db.auth
            .getSession();


    if (error)
    {
        console.error(
            error
        );

        return;
    }


    if (
        data.session?.user
    )
    {
        await showApp(
            data.session.user
        );
    }
}


initialize();

// ============================================================
// OPEN EDIT RAW
// ============================================================

function openEditRawDialog(
    item
)
{
    editingRawItem =
        item;


    document.getElementById(
        "edit-raw-name"
    ).value =
        item.ingredients.name;


    document.getElementById(
        "edit-raw-category"
    ).value =
        item.ingredients.category ||
        "Other";


    document.getElementById(
        "edit-raw-unit"
    ).value =
        item.ingredients.default_unit ||
        "portion";


    document.getElementById(
        "edit-raw-portion"
    ).value =
        item.portion || "";


    document.getElementById(
        "edit-raw-threshold"
    ).value =
        item.low_stock_threshold;


    document.getElementById(
        "edit-raw-message"
    ).textContent =
        "";


    editRawDialog.showModal();
}


// ============================================================
// CANCEL EDIT RAW
// ============================================================

cancelEditRawButton.addEventListener(
    "click",
    () =>
    {
        editingRawItem =
            null;

        editRawDialog.close();
    }
);


// ============================================================
// SAVE RAW
// ============================================================

editRawForm.addEventListener(
    "submit",
    async event =>
    {
        event.preventDefault();


        if (
            !currentUser ||
            !editingRawItem
        )
        {
            return;
        }


        const message =
            document.getElementById(
                "edit-raw-message"
            );


        const name =
            document.getElementById(
                "edit-raw-name"
            )
                .value
                .trim();


        const category =
            document.getElementById(
                "edit-raw-category"
            ).value;


        const unit =
            document.getElementById(
                "edit-raw-unit"
            ).value;


        const portion =
            document.getElementById(
                "edit-raw-portion"
            )
                .value
                .trim();


        const threshold =
            Number(
                document.getElementById(
                    "edit-raw-threshold"
                ).value
            );


        if (!name)
        {
            message.textContent =
                "Name cannot be empty.";

            return;
        }


        if (
            !Number.isFinite(threshold) ||
            threshold < 0
        )
        {
            message.textContent =
                "Invalid low-stock threshold.";

            return;
        }


        message.textContent =
            "Saving...";


        // Update ingredient definition

        const {
            error: ingredientError
        } =
            await db
                .from(
                    "ingredients"
                )
                .update({
                    name:
                        name,

                    category:
                        category,

                    default_unit:
                        unit
                })
                .eq(
                    "id",
                    editingRawItem
                        .ingredients
                        .id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (ingredientError)
        {
            console.error(
                ingredientError
            );

            message.textContent =
                ingredientError.message;

            return;
        }


        // Update inventory-specific settings

        const {
            error: inventoryError
        } =
            await db
                .from(
                    "inventory_items"
                )
                .update({
                    portion:
                        portion,

                    low_stock_threshold:
                        threshold
                })
                .eq(
                    "id",
                    editingRawItem.id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (inventoryError)
        {
            console.error(
                inventoryError
            );

            message.textContent =
                inventoryError.message;

            return;
        }


        editingRawItem =
            null;


        editRawDialog.close();


        await loadRawInventory(
            currentUser.id
        );
    }
);


// ============================================================
// DELETE RAW
// ============================================================

deleteRawButton.addEventListener(
    "click",
    async () =>
    {
        if (
            !currentUser ||
            !editingRawItem
        )
        {
            return;
        }


        const foodName =
            editingRawItem
                .ingredients
                .name;


        const confirmed =
            confirm(
                `Delete ${foodName} from RAW inventory?`
            );


        if (!confirmed)
        {
            return;
        }


        const {
            error
        } =
            await db
                .from(
                    "inventory_items"
                )
                .delete()
                .eq(
                    "id",
                    editingRawItem.id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error)
        {
            console.error(
                error
            );

            document.getElementById(
                "edit-raw-message"
            ).textContent =
                error.message;

            return;
        }


        editingRawItem =
            null;


        editRawDialog.close();


        await loadRawInventory(
            currentUser.id
        );
    }
);

// ============================================================
// OPEN EDIT COOKED
// ============================================================

function openEditCookedDialog(
    item
)
{
    editingCookedItem =
        item;


    document.getElementById(
        "edit-cooked-name"
    ).value =
        item.name;


    document.getElementById(
        "edit-cooked-portion"
    ).value =
        item.portion || "";


    document.getElementById(
        "edit-cooked-threshold"
    ).value =
        item.low_stock_threshold;


    document.getElementById(
        "edit-cooked-message"
    ).textContent =
        "";


    // --------------------------------------------------------
    // Show batches
    // --------------------------------------------------------

    editCookedBatches.innerHTML =
        "";


    if (
        item.batches.length === 0
    )
    {
        editCookedBatches.textContent =
            "No active batches.";
    }
    else
    {
        for (
            const batch of
            item.batches
        )
        {
            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "batch-row";


            const date =
                document.createElement(
                    "span"
                );


            date.className =
                "batch-date";


            date.textContent =
                formatCookedDate(
                    batch.cooked_date
                );


            const quantity =
                document.createElement(
                    "span"
                );


            quantity.className =
                "batch-quantity";


            quantity.textContent =
                formatQuantity(
                    batch.quantity
                );


            row.appendChild(
                date
            );


            row.appendChild(
                quantity
            );


            editCookedBatches.appendChild(
                row
            );
        }
    }


    editCookedDialog.showModal();
}


// ============================================================
// FORMAT COOKED DATE
// ============================================================

function formatCookedDate(
    dateString
)
{
    if (!dateString)
    {
        return "";
    }


    // Avoid timezone conversion.
    // 2026-09-19 -> Sep 19, 2026

    const parts =
        dateString.split("-");


    if (parts.length !== 3)
    {
        return dateString;
    }


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);


    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    return (
        `${monthNames[month - 1]} ` +
        `${day}, ${year}`
    );
}


// ============================================================
// CANCEL EDIT COOKED
// ============================================================

cancelEditCookedButton.addEventListener(
    "click",
    () =>
    {
        editingCookedItem =
            null;

        editCookedDialog.close();
    }
);


// ============================================================
// SAVE COOKED
// ============================================================

editCookedForm.addEventListener(
    "submit",
    async event =>
    {
        event.preventDefault();


        if (
            !currentUser ||
            !editingCookedItem
        )
        {
            return;
        }


        const message =
            document.getElementById(
                "edit-cooked-message"
            );


        const name =
            document.getElementById(
                "edit-cooked-name"
            )
                .value
                .trim();


        const portion =
            document.getElementById(
                "edit-cooked-portion"
            )
                .value
                .trim();


        const threshold =
            Number(
                document.getElementById(
                    "edit-cooked-threshold"
                ).value
            );


        if (!name)
        {
            message.textContent =
                "Name cannot be empty.";

            return;
        }


        if (
            !Number.isFinite(threshold) ||
            threshold < 0
        )
        {
            message.textContent =
                "Invalid low-stock threshold.";

            return;
        }


        message.textContent =
            "Saving...";


        const {
            error
        } =
            await db
                .from(
                    "cooked_items"
                )
                .update({
                    name:
                        name,

                    portion:
                        portion,

                    low_stock_threshold:
                        threshold
                })
                .eq(
                    "id",
                    editingCookedItem.id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error)
        {
            console.error(
                error
            );

            message.textContent =
                error.message;

            return;
        }


        editingCookedItem =
            null;


        editCookedDialog.close();


        await loadCookedInventory(
            currentUser.id
        );
    }
);


// ============================================================
// DELETE COOKED
// ============================================================

deleteCookedButton.addEventListener(
    "click",
    async () =>
    {
        if (
            !currentUser ||
            !editingCookedItem
        )
        {
            return;
        }


        const foodName =
            editingCookedItem.name;


        const confirmed =
            confirm(
                `Delete ${foodName} and all of its cooked batches?`
            );


        if (!confirmed)
        {
            return;
        }


        const {
            error
        } =
            await db
                .from(
                    "cooked_items"
                )
                .delete()
                .eq(
                    "id",
                    editingCookedItem.id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error)
        {
            console.error(
                error
            );

            document.getElementById(
                "edit-cooked-message"
            ).textContent =
                error.message;

            return;
        }


        editingCookedItem =
            null;


        editCookedDialog.close();


        await loadCookedInventory(
            currentUser.id
        );
    }
);

// ============================================================
// OPEN RECIPE DETAIL
// ============================================================

async function openRecipeDetail(recipe)
{
    selectedRecipe =
        recipe;

    recipeDetailMessage.textContent =
        "";

    detailRecipeName.textContent =
        recipe.name;

    detailRecipeDescription.textContent =
        recipe.description || "";

    detailRecipeMeta.textContent =
        `${recipe.prep_minutes ?? 0} min · ` +
        `${recipe.servings ?? 1} serving` +
        ((recipe.servings ?? 1) === 1 ? "" : "s");


    detailRecipeIngredients.innerHTML =
        "Loading...";

    detailRecipeSteps.innerHTML =
        "";


    recipeDetailDialog.showModal();


    // --------------------------------------------------------
    // Load ingredients
    // --------------------------------------------------------

    const {
        data: ingredients,
        error: ingredientError
    } =
        await db
            .from("recipe_ingredients")
            .select(`
                id,
                amount,
                unit,
                optional,
                ingredients (
                    id,
                    name
                )
            `)
            .eq(
                "recipe_id",
                recipe.id
            );


    if (ingredientError)
    {
        console.error(
            ingredientError
        );

        recipeDetailMessage.textContent =
            ingredientError.message;

        return;
    }


    // --------------------------------------------------------
    // Load steps
    // --------------------------------------------------------

    const {
        data: steps,
        error: stepError
    } =
        await db
            .from("recipe_steps")
            .select(`
                id,
                step_number,
                instruction
            `)
            .eq(
                "recipe_id",
                recipe.id
            )
            .order(
                "step_number",
                {
                    ascending: true
                }
            );


    if (stepError)
    {
        console.error(
            stepError
        );

        recipeDetailMessage.textContent =
            stepError.message;

        return;
    }


    renderRecipeDetailIngredients(
        ingredients ?? []
    );

    renderRecipeDetailSteps(
        steps ?? []
    );


    // Keep them for Edit later

    selectedRecipe.ingredients =
        ingredients ?? [];

    selectedRecipe.steps =
        steps ?? [];
}

function renderRecipeDetailIngredients(
    ingredients
)
{
    detailRecipeIngredients.innerHTML =
        "";


    if (ingredients.length === 0)
    {
        detailRecipeIngredients.textContent =
            "No ingredients.";

        return;
    }


    for (const item of ingredients)
    {
        const row =
            document.createElement(
                "div"
            );

        row.className =
            "recipe-detail-ingredient";


        const name =
            document.createElement(
                "span"
            );

        name.className =
            "recipe-detail-ingredient-name";

        name.textContent =
            item.ingredients?.name ??
            "Unknown ingredient";


        const amount =
            document.createElement(
                "span"
            );

        amount.className =
            "recipe-detail-ingredient-amount";

        amount.textContent =
            `${formatQuantity(item.amount)} ${item.unit}`;


        row.appendChild(name);
        row.appendChild(amount);

        detailRecipeIngredients.appendChild(
            row
        );
    }
}

function renderRecipeDetailSteps(
    steps
)
{
    detailRecipeSteps.innerHTML =
        "";


    if (steps.length === 0)
    {
        detailRecipeSteps.textContent =
            "No instructions.";

        return;
    }


    for (const step of steps)
    {
        const row =
            document.createElement(
                "div"
            );

        row.className =
            "recipe-detail-step";


        const number =
            document.createElement(
                "div"
            );

        number.className =
            "recipe-detail-step-number";

        number.textContent =
            `${step.step_number}.`;


        const instruction =
            document.createElement(
                "div"
            );

        instruction.textContent =
            step.instruction;


        row.appendChild(number);

        row.appendChild(
            instruction
        );

        detailRecipeSteps.appendChild(
            row
        );
    }
}

closeRecipeDetailButton.addEventListener(
    "click",
    () =>
    {
        selectedRecipe =
            null;

        recipeDetailDialog.close();
    }
);

deleteRecipeButton.addEventListener(
    "click",
    async () =>
    {
        if (
            !currentUser ||
            !selectedRecipe
        )
        {
            return;
        }


        const confirmed =
            confirm(
                `Delete recipe "${selectedRecipe.name}"?`
            );


        if (!confirmed)
        {
            return;
        }


        const {
            error
        } =
            await db
                .from("recipes")
                .delete()
                .eq(
                    "id",
                    selectedRecipe.id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error)
        {
            console.error(error);

            recipeDetailMessage.textContent =
                error.message;

            return;
        }


        selectedRecipe =
            null;

        recipeDetailDialog.close();

        await loadRecipes(
            currentUser.id
        );
    }
);

editRecipeButton.addEventListener(
    "click",
    () =>
    {
        if (!selectedRecipe)
        {
            return;
        }

        openEditRecipe(
            selectedRecipe
        );
    }
);

function openEditRecipe(recipe)
{
    editingRecipe = recipe;

    recipeForm.reset();

    recipeIngredientsEditor.innerHTML = "";
    recipeStepsEditor.innerHTML = "";
    recipeFormMessage.textContent = "";


    // --------------------------------------------------------
    // Change dialog title/button
    // --------------------------------------------------------

    recipeDialog.querySelector(
        "h2"
    ).textContent =
        "Edit Recipe";


    recipeForm.querySelector(
        'button[type="submit"]'
    ).textContent =
        "Save Changes";


    // --------------------------------------------------------
    // Basic recipe information
    // --------------------------------------------------------

    document.getElementById(
        "recipe-name"
    ).value =
        recipe.name ?? "";


    document.getElementById(
        "recipe-description"
    ).value =
        recipe.description ?? "";


    document.getElementById(
        "recipe-prep-minutes"
    ).value =
        recipe.prep_minutes ?? 0;


    document.getElementById(
        "recipe-servings"
    ).value =
        recipe.servings ?? 1;


    // --------------------------------------------------------
    // Ingredients
    // --------------------------------------------------------

    for (
        const item of
        recipe.ingredients ?? []
    )
    {
        addRecipeIngredientRow({
            name:
                item.ingredients?.name ?? "",

            amount:
                item.amount,

            unit:
                item.unit
        });
    }


    if (
        (recipe.ingredients ?? [])
            .length === 0
    )
    {
        addRecipeIngredientRow();
    }


    // --------------------------------------------------------
    // Steps
    // --------------------------------------------------------

    for (
        const step of
        recipe.steps ?? []
    )
    {
        addRecipeStepRow(
            step.instruction
        );
    }


    if (
        (recipe.steps ?? [])
            .length === 0
    )
    {
        addRecipeStepRow();
    }


    // Close detail first

    recipeDetailDialog.close();


    // Open editor

    recipeDialog.showModal();
}

// ============================================================
// COOK THIS
// ============================================================

cookRecipeButton.addEventListener(
    "click",
    async () =>
    {
        if (
            !currentUser ||
            !selectedRecipe
        )
        {
            return;
        }


        cookRecipeButton.disabled =
            true;


        recipeDetailMessage.textContent =
            "Checking inventory...";


        try
        {
            // =================================================
            // LOAD RAW INVENTORY
            // =================================================

            const {
                data: rawItems,
                error: rawError
            } =
                await db
                    .from("inventory_items")
                    .select(`
                        id,
                        quantity,
                        ingredient_id,
                        ingredients (
                            id,
                            name
                        )
                    `)
                    .eq(
                        "user_id",
                        currentUser.id
                    );


            if (rawError)
            {
                throw rawError;
            }


            // =================================================
            // MATCH RECIPE INGREDIENTS TO RAW INVENTORY
            // =================================================

            const tracked = [];
            const untracked = [];


            for (
                const recipeIngredient of
                selectedRecipe.ingredients
            )
            {
                const ingredientId =
                    recipeIngredient
                        .ingredients
                        ?.id;


                const rawItem =
                    rawItems.find(
                        item =>
                            item.ingredient_id ===
                            ingredientId
                    );


                if (rawItem)
                {
                    tracked.push({
                        recipeIngredient:
                            recipeIngredient,

                        rawItem:
                            rawItem
                    });
                }
                else
                {
                    untracked.push(
                        recipeIngredient
                    );
                }
            }


            // =================================================
            // CHECK STOCK
            // =================================================

            const insufficient =
                tracked.filter(
                    item =>
                        Number(
                            item.rawItem.quantity
                        ) < 1
                );


            if (insufficient.length > 0)
            {
                const names =
                    insufficient
                        .map(
                            item =>
                                item
                                    .recipeIngredient
                                    .ingredients
                                    ?.name ??
                                "Unknown"
                        )
                        .join(", ");


                recipeDetailMessage.textContent =
                    `Not enough inventory: ${names}`;


                return;
            }


            // =================================================
            // CONFIRMATION MESSAGE
            // =================================================

            const lines = [];


            lines.push(
                `Cook "${selectedRecipe.name}"?`
            );


            lines.push("");
            lines.push("RAW inventory:");


            if (tracked.length === 0)
            {
                lines.push(
                    "No tracked ingredients."
                );
            }
            else
            {
                for (const item of tracked)
                {
                    const oldQuantity =
                        Number(
                            item.rawItem.quantity
                        );


                    const newQuantity =
                        oldQuantity - 1;


                    const ingredientName =
                        item
                            .recipeIngredient
                            .ingredients
                            ?.name ??
                        "Unknown";


                    lines.push(
                        `${ingredientName}: ` +
                        `${formatQuantity(oldQuantity)}` +
                        ` → ` +
                        `${formatQuantity(newQuantity)}`
                    );
                }
            }


            if (untracked.length > 0)
            {
                lines.push("");
                lines.push("Not tracked:");


                for (
                    const item of
                    untracked
                )
                {
                    lines.push(
                        item.ingredients?.name ??
                        "Unknown"
                    );
                }
            }


            lines.push("");
            lines.push(
                `COOKED: ${selectedRecipe.name} +1`
            );


            const confirmed =
                confirm(
                    lines.join("\n")
                );


            if (!confirmed)
            {
                recipeDetailMessage.textContent =
                    "";

                return;
            }


            recipeDetailMessage.textContent =
                "Cooking...";


            // =================================================
            // ATOMIC COOK TRANSACTION
            // =================================================

            const {
                error: cookError
            } =
                await db.rpc(
                    "cook_recipe",
                    {
                        p_recipe_id:
                            selectedRecipe.id
                    }
                );


            if (cookError)
            {
                throw cookError;
            }


            // =================================================
            // SUCCESS
            // =================================================

            recipeDetailMessage.textContent =
                "Cooked! Inventory updated.";


            await Promise.all([
                loadRawInventory(
                    currentUser.id
                ),

                loadCookedInventory(
                    currentUser.id
                )
            ]);


            // =================================================
            // SUCCESS
            // =================================================

            recipeDetailMessage.textContent =
                "Cooked! Inventory updated.";


            await Promise.all([
                loadRawInventory(
                    currentUser.id
                ),

                loadCookedInventory(
                    currentUser.id
                )
            ]);
        }
        catch (error)
        {
            console.error(error);

            recipeDetailMessage.textContent =
                error.message ??
                "Could not update inventory.";
        }
        finally
        {
            cookRecipeButton.disabled =
                false;
        }
    }
);