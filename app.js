const recipes = [
  { id: 1, name: 'Majadito camba', region: 'Santa Cruz', time: '45 min', description: 'Arroz suelto, charque dorado y ese color de urucú que abre el apetito.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Majadito_de_Santa_Cruz.jpg/960px-Majadito_de_Santa_Cruz.jpg', ingredients: ['Arroz', 'Charque', 'Urucú', 'Plátano'] },
  { id: 2, name: 'Sonso de yuca', region: 'Santa Cruz', time: '35 min', description: 'Yuca majada y queso derretido, asados juntos hasta quedar doraditos.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Sonso_de_yuca.jpg/960px-Sonso_de_yuca.jpg', ingredients: ['Yuca', 'Queso criollo', 'Mantequilla', 'Sal'] },
  { id: 3, name: 'Sopa de maní', region: 'Camiri', time: '60 min', description: 'Cremosa, reconfortante y con el aroma tostado que reúne a todos.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Sopa_de_Man%C3%AD_de_Bolivia.jpg/960px-Sopa_de_Man%C3%AD_de_Bolivia.jpg', ingredients: ['Maní', 'Carne', 'Papa', 'Zanahoria'] },
  { id: 4, name: 'Pique macho camba', region: 'Santa Cruz', time: '40 min', description: 'Un plato generoso para compartir, con carne, papas y un toque de ají.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Pique_Macho_Bolivia.jpg/960px-Pique_Macho_Bolivia.jpg', ingredients: ['Lomo', 'Papa', 'Cebolla', 'Locoto'] },
  { id: 5, name: 'Rosquetes camireños', region: 'Camiri', time: '50 min', description: 'Dulces, suaves y con un glaseado que sabe a fiesta patronal.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Rosquete_Tarate%C3%B1o.jpg/960px-Rosquete_Tarate%C3%B1o.jpg', ingredients: ['Harina', 'Huevo', 'Azúcar', 'Anís'] },
  { id: 6, name: 'Cuñapé al horno', region: 'Santa Cruz', time: '30 min', description: 'Panecillos de almidón y queso para acompañar la tarde con café.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Cu%C3%B1ap%C3%A9_al_horno.jpg/960px-Cu%C3%B1ap%C3%A9_al_horno.jpg', ingredients: ['Almidón', 'Queso', 'Huevo', 'Leche'] }
];

const grid = document.querySelector('#recipeGrid');
const searchInput = document.querySelector('#searchInput');
const emptyState = document.querySelector('#emptyState');
const count = document.querySelector('#favoritesCount');
const dialog = document.querySelector('#recipeDialog');
const dialogContent = document.querySelector('#dialogContent');
let activeFilter = 'Todos';
let favorites = JSON.parse(localStorage.getItem('alma-y-sabor-favorites') || '[]');

function renderRecipes() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = recipes.filter((recipe) => {
    const matchesFilter = activeFilter === 'Todos' || recipe.region === activeFilter;
    const matchesSearch = [recipe.name, recipe.region, recipe.description, ...recipe.ingredients].join(' ').toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  grid.innerHTML = visible.map((recipe) => `
    <article class="recipe-card">
      <div class="card-image"><img src="${recipe.image}" alt="${recipe.name}" loading="lazy" /><button class="favorite-button ${favorites.includes(recipe.id) ? 'is-favorite' : ''}" data-favorite="${recipe.id}" aria-label="${favorites.includes(recipe.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}">${favorites.includes(recipe.id) ? '♥' : '♡'}</button></div>
      <div class="card-info"><span class="card-tag">${recipe.region} · ${recipe.time}</span><h3>${recipe.name}</h3><p>${recipe.description}</p></div>
    </article>`).join('');
  emptyState.hidden = visible.length > 0;
  count.textContent = favorites.length;
  grid.querySelectorAll('[data-favorite]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); toggleFavorite(Number(button.dataset.favorite)); }));
  grid.querySelectorAll('.recipe-card').forEach((card, index) => card.addEventListener('click', () => openRecipe(visible[index])));
}

function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id];
  localStorage.setItem('alma-y-sabor-favorites', JSON.stringify(favorites));
  renderRecipes();
  showToast(favorites.includes(id) ? 'Guardado en tus favoritos' : 'Quitado de tus favoritos');
}

function openRecipe(recipe) {
  dialogContent.innerHTML = `<div class="dialog-layout"><img src="${recipe.image}" alt="${recipe.name}" /><div class="dialog-copy"><span class="card-tag">${recipe.region} · ${recipe.time}</span><h2>${recipe.name.replace(' ', ' <em>')}</em></h2><p>${recipe.description} Esta receta se prepara con calma, respetando el punto de cada ingrediente y el gusto de la casa.</p><div class="ingredients">${recipe.ingredients.map((ingredient) => `<span>${ingredient}</span>`).join('')}</div></div></div>`;
  dialog.showModal();
}

function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }

function downloadDocument(type) {
  const documents = {
    recetario: `ALMA & SABOR\nRECETARIO DEL ORIENTE\n\n${recipes.map((recipe) => `${recipe.name.toUpperCase()}\nRegión: ${recipe.region} | Tiempo: ${recipe.time}\n${recipe.description}\nIngredientes: ${recipe.ingredients.join(', ')}\n`).join('\n')}`,
    ingredientes: `ALMA & SABOR\nDESPENSA CAMBA\n\n${[...new Set(recipes.flatMap((recipe) => recipe.ingredients))].sort().map((ingredient) => `□ ${ingredient}`).join('\n')}`,
    historia: `ALMA & SABOR\nLA COCINA COMO MEMORIA\n\nEn Santa Cruz y Camiri, cada plato es una conversación entre generaciones. La cocina del oriente boliviano nace de la generosidad: de la yuca y el maíz, del charque y el plátano, de los ríos y los montes. Es mestiza, abundante y profundamente nuestra.`
  };
  const file = new Blob([documents[type]], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(file); link.download = `alma-y-sabor-${type}.txt`; link.click(); URL.revokeObjectURL(link.href); showToast('Documento descargado');
}

document.querySelectorAll('.document-card').forEach((card) => card.addEventListener('click', () => downloadDocument(card.dataset.document)));
document.querySelectorAll('.gallery-item').forEach((item) => item.addEventListener('click', () => {
  const image = item.querySelector('img'); dialogContent.innerHTML = `<div class="gallery-lightbox"><img src="${image.src}" alt="${image.alt}" /><span>${item.dataset.galleryTitle}</span></div>`; dialog.showModal();
}));

searchInput.addEventListener('input', renderRecipes);
document.querySelectorAll('.chip').forEach((chip) => chip.addEventListener('click', () => { activeFilter = chip.dataset.filter; document.querySelector('.chip.active').classList.remove('active'); chip.classList.add('active'); renderRecipes(); }));
document.querySelector('#showAll').addEventListener('click', () => { activeFilter = 'Todos'; searchInput.value = ''; document.querySelector('.chip.active').classList.remove('active'); document.querySelector('[data-filter="Todos"]').classList.add('active'); renderRecipes(); });
document.querySelector('#dialogClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
document.querySelector('#favoritesNav').addEventListener('click', () => { activeFilter = 'Todos'; searchInput.value = ''; const onlyFavorites = recipes.filter((recipe) => favorites.includes(recipe.id)); grid.innerHTML = onlyFavorites.length ? onlyFavorites.map((recipe) => `<article class="recipe-card"><div class="card-image"><img src="${recipe.image}" alt="${recipe.name}" /><button class="favorite-button is-favorite" data-favorite="${recipe.id}">♥</button></div><div class="card-info"><span class="card-tag">${recipe.region} · ${recipe.time}</span><h3>${recipe.name}</h3><p>${recipe.description}</p></div></article>`).join('') : ''; emptyState.hidden = onlyFavorites.length > 0; document.querySelector('#recetas').scrollIntoView({ behavior: 'smooth' }); grid.querySelectorAll('[data-favorite]').forEach((button) => button.addEventListener('click', () => toggleFavorite(Number(button.dataset.favorite)))); });
document.querySelector('#newsletterForm').addEventListener('submit', (event) => { event.preventDefault(); document.querySelector('#newsletterMessage').textContent = 'Listo. Revisa tu bandeja para confirmar.'; event.target.reset(); });
renderRecipes();
