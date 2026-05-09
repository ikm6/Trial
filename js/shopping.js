const savedShoppingList = document.getElementById("savedShoppingList");
const clearShoppingListButton = document.getElementById("clearShoppingList");

function loadShoppingList() {
  const shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];

  savedShoppingList.innerHTML = "";

  if (shoppingList.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No shopping list saved yet. Generate a recipe first.";
    savedShoppingList.appendChild(li);
    return;
  }

  shoppingList.forEach(function (item) {
    const li = document.createElement("li");
    li.textContent = item;
    savedShoppingList.appendChild(li);
  });
}

clearShoppingListButton.addEventListener("click", function () {
  localStorage.removeItem("shoppingList");
  loadShoppingList();
});

loadShoppingList();