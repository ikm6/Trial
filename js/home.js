const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");
const themeToggle = document.getElementById("themeToggle");
const speakButton = document.getElementById("speakButton");
const stopSpeakButton = document.getElementById("stopSpeakButton");

settingsButton.addEventListener("click", function () {
  settingsMenu.classList.toggle("hidden");
});

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
}

speakButton.addEventListener("click", function () {
  const textToRead = `
    Welcome to Struggle and Scran.
    Are you a university student struggling for food?
    Send us a shelfie, a picture of your fridge, and we will help you make an easy recipe.
    Use what you already have, waste less food, and find cheap groceries when you need them.
  `;

  const speech = new SpeechSynthesisUtterance(textToRead);
  speech.rate = 0.95;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
});

stopSpeakButton.addEventListener("click", function () {
  window.speechSynthesis.cancel();
});