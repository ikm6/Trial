export function createHeader() {
  const header = document.createElement('header');
  const title = document.createElement('h1');
  title.textContent = 'Component-Based Web App';
  header.appendChild(title);
  return header;
}
