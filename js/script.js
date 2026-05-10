console.log("script.js is connected");

const form = document.getElementById("fridgeForm");
const recipeResult = document.getElementById("recipeResult");
const loadingMessage = document.getElementById("loadingMessage");

const recipeActions = document.getElementById("recipeActions");
const acceptRecipeButton = document.getElementById("acceptRecipe");
const rejectRecipeButton = document.getElementById("rejectRecipe");

const ingredientQuestion = document.getElementById("ingredientQuestion");
const hasIngredientsYesButton = document.getElementById("hasIngredientsYes");
const hasIngredientsNoButton = document.getElementById("hasIngredientsNo");

const shoppingListBox = document.getElementById("shoppingListBox");
const shoppingListItems = document.getElementById("shoppingListItems");

const API_KEY = "AIzaSyBQYiYigRbon8vpvHEqa7LANJsQk1rI8PI"; // Replace with your actual API key

let latestRecipeText = "";

function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onload = function () {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };

    reader.onerror = function () {
      reject(new Error("Could not read image file"));
    };

    reader.readAsDataURL(file);
  });
}

async function generateRecipe(makeDifferentRecipe = false) {
  const ingredients = document.getElementById("ingredients").value;
  const time = document.getElementById("time").value;
  const diet = document.getElementById("diet").value;
  const imageInput = document.getElementById("fridgeImage");
  const imageFile = imageInput.files[0];

  if (!ingredients.trim() && !imageFile) {
    recipeResult.textContent = "Send us your shelfie or type what you have first.";
    return;
  }

  const prompt = `
You are Struggle & Scran, a funny but helpful student cooking assistant.

The user may upload a photo of their fridge/shelfie. First, identify visible food ingredients from the image. If you are unsure about anything, say you are unsure. Do not make up ingredients.

The user also typed these ingredients:
${ingredients || "No typed ingredients provided"}

Their available cooking time is:
${time}

Their dietary preference is:
${diet}

${
  makeDifferentRecipe
    ? "The user rejected the first recipe. Generate a DIFFERENT recipe idea using the same inputs. Do not repeat the same recipe name or same main idea."
    : ""
}

Create a cheap, student-friendly recipe.

Format the response exactly like this:

Ingredients you have:
Ingredients you need to buy:
Recipe name:
Short description:
Cooking time:
Dietary match:
Steps:
Student survival tip:

Rules:
- Use mostly the ingredients visible in the image or typed by the user.
- Do not include ingredients that break their dietary preference.
- If the user is vegan, do not include meat, fish, eggs, milk, cheese, butter, yogurt, or honey.
- If the user is vegetarian, do not include meat or fish.
- If the user is pescatarian, fish is okay, but meat is not.
- If the user is gluten free, avoid wheat, normal pasta, bread, flour, and gluten-containing foods.
- If the user is dairy free, avoid milk, cheese, butter, yogurt, and cream.
- Match the cooking time as closely as possible.
- Keep it cheap and realistic for university students.
- Do not assume the user has any ingredients except the ones they show in the image or type in. If you are unsure if they have an ingredient, assume they do not have it, and add it to the shopping list
-- In the Ingredients you need to buy section, only include ingredients the user may need to buy.
- If nothing needs buying, write: Nothing needed.
- Make it funny but still useful.
- Give clear numbered steps.
- If the image is unclear, be honest about what you cannot identify.
- Make the instructions very brief and short sentences, not very long.
`;

  try {
    loadingMessage.classList.remove("hidden");
    recipeActions.classList.add("hidden");
    ingredientQuestion.classList.add("hidden");
    shoppingListBox.classList.add("hidden");

    recipeResult.textContent = makeDifferentRecipe
      ? "Finding a less tragic alternative..."
      : "Scanning your shelfie...";

    const parts = [
      {
        text: prompt
      }
    ];

    if (imageFile) {
      const base64Image = await fileToBase64(imageFile);

      parts.push({
        inline_data: {
          mime_type: imageFile.type,
          data: base64Image
        }
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: parts
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("Gemini response:", data);

    if (!response.ok) {
      throw new Error(data.error?.message || "Something went wrong with Gemini");
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error("Gemini did not return a recipe.");
    }

    latestRecipeText = aiText;
    recipeResult.textContent = aiText;
    recipeActions.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error);

    recipeResult.textContent =
      "Oops, the fridge goblin failed. Error: " + error.message;
  } finally {
    loadingMessage.classList.add("hidden");
  }
}

function extractShoppingList(recipeText) {
  const match = recipeText.match(
    /Ingredients you need to buy:\s*([\s\S]*?)(Recipe name:|Short description:|Cooking time:|Dietary match:|Steps:|Student survival tip:|$)/i
  );

  if (!match || !match[1].trim()) {
    return ["No shopping list found."];
  }

  const shoppingText = match[1].trim();

  if (shoppingText.toLowerCase().includes("nothing needed")) {
    return ["Nothing needed. You are somehow prepared. Suspicious, but impressive."];
  }

  return shoppingText
    .split(/\n|,|-/)
    .map(function (item) {
      return item
        .replace(/^\*+/, "")
        .replace(/^\d+\./, "")
        .trim();
    })
    .filter(function (item) {
      return item.length > 0;
    });
}

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    generateRecipe(false);
  });
} else {
  console.error("Could not find the form. Check that form.html has id='fridgeForm'.");
}

if (rejectRecipeButton) {
  rejectRecipeButton.addEventListener("click", function () {
    generateRecipe(true);
  });
}

if (acceptRecipeButton) {
  acceptRecipeButton.addEventListener("click", function () {
    recipeActions.classList.add("hidden");
    ingredientQuestion.classList.remove("hidden");
    shoppingListBox.classList.add("hidden");
  });
}

if (hasIngredientsNoButton) {
  hasIngredientsNoButton.addEventListener("click", function () {
    const items = extractShoppingList(latestRecipeText);

    localStorage.setItem("shoppingList", JSON.stringify(items));

    window.location.href = "groceries.html";
  });
}