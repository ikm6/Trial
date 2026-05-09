import { createHeader } from '../components/header.js';
import { createFooter } from '../components/footer.js';
import { createCard } from '../components/card.js';

const app = document.getElementById('app');

app.appendChild(createHeader());

const main = document.createElement('main');
main.appendChild(
  createCard({
    title: 'Welcome',
    text: 'This is a simple HTML, CSS, and JavaScript starter project with component-based structure.',
    buttonText: 'Learn more',
  })
);

app.appendChild(main);
app.appendChild(createFooter());
