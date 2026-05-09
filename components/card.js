export function createCard({ title, text, buttonText }) {
  const card = document.createElement('section');
  card.className = 'card';

  const heading = document.createElement('h2');
  heading.textContent = title;

  const paragraph = document.createElement('p');
  paragraph.textContent = text;

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = buttonText;

  card.append(heading, paragraph, button);
  return card;
}
