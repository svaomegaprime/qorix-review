const sortDropdown = document.querySelector('.qr-sort-dropdown');
const sortBtn = document.querySelector('.qr-sort-btn');
const sortBtnText = document.querySelector('.qr-sort-btn-text');
const sortItems = document.querySelectorAll('.qr-sort-menu li');

const savedSort = sessionStorage.getItem('selectedSort');

if (savedSort) {
  sortItems.forEach((item) => {
    if (item.dataset.sort === savedSort) {
      item.classList.add('active');
      sortBtnText.textContent = `Sort by: ${item.textContent.trim()}`;
    }
  });
}


sortBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sortDropdown.classList.toggle('is-open');
});


document.addEventListener('click', () => {
  sortDropdown.classList.remove('is-open');
});


sortItems.forEach((item) => {
  item.addEventListener('click', () => {

    
    sortItems.forEach((li) => {
      li.classList.remove('active');
    });

    
    item.classList.add('active');

   
    sortBtnText.textContent = `Sort by: ${item.textContent.trim()}`;

    
    sessionStorage.setItem(
      'selectedSort',
      item.dataset.sort
    );

    
    sortDropdown.classList.remove('is-open');
  });
});

