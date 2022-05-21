import API_KEY from './modules/API_KEY.js';
import { setUserMovie, requestUserMovies } from './modules/user_movies.js';
import { renderMovies, renderModal } from './modules/render_movies.js';
import { requestMovies, requestMovie } from './modules/request_movies.js';

window.addEventListener('DOMContentLoaded', () => {
  if (!JSON.parse(localStorage.getItem('userMovies'))) localStorage.setItem('userMovies', JSON.stringify({ seens: [], seeLaters: [], favourites: [] }));
  const $filterLiGenreTemplate = document.getElementById('filterLiGenreTemplate').content.querySelector('li');
  const $filterContainerGenres = document.getElementById('containerGenres');
  const $yearInput = document.getElementById('yearInput');
  const $menuSection = document.getElementById('menuSection');
  const $filterSection = document.getElementById('filterSection');
  const $containerActiveGenres = document.getElementById('containerActiveGenres');
  const $activeBtnGenreTemplate = document.getElementById('activeBtnGenreTemplate').content.querySelector('button');
  const $select = document.getElementById('sortBySelect');
  const $body = document.body;
  const $containerMovies = document.getElementById('containerMovies');
  const $containerSelectPart = document.getElementById('containerSelectPart');
  const $modal = document.getElementById('modal');
  const $searchInput = document.getElementById('searchInput');
  const BASE_URL = 'https://api.themoviedb.org/3/movie';
  const endPoints = {
    POPULAR: `${BASE_URL}/popular?api_key=${API_KEY}`,
    TOP_RATED: `${BASE_URL}/top_rated?api_key=${API_KEY}`,
    NOW_PLAYING: `${BASE_URL}/now_playing?api_key=${API_KEY}`,
    UPCOMING: `${BASE_URL}/upcoming?api_key=${API_KEY}`,
    SEARCH: `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}`,
    GENDERS: `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`,
  };
  const PAGES = {
    actualpage: 1,
    totalPages: null,
  };

  // This function will return a boolean depending on if the target of the events matches with the selector passed.
  const isElement = (e, str) => e.target.matches(str);

  // This function will return the number passed formated
  function formatNumber(num) {
    const str = num.toString().split('.');
    if (str[0].length >= 5) str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1.');
    if (str[1] && str[1].length >= 5) str[1] = str[1].replace(/(\d{3})/g, '$1.');
    return str.join('.');
  }

  // This function adds a new genre element and the value of the attribute will be the id of the genre
  const addNewGenre = e => {
    const $newActiveBtnGenre = $activeBtnGenreTemplate.cloneNode(true);
    $newActiveBtnGenre.setAttribute('data-activeGenreId', e.target.dataset.genreid);
    $newActiveBtnGenre.querySelector('span').textContent = e.target.querySelector('span').textContent;
    $containerActiveGenres.append($newActiveBtnGenre);
  };

  // In here we're creating a observer to observe the last movie element.
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && PAGES.actualpage < PAGES.totalPages) {
          PAGES.actualpage++;
          requestMovies({ PAGES, endPoints, observer, renderMovies, formatNumber });
        }
      });
    },
    { threshold: 0.2, rootMargin: '0% 0% -40% 0%' }
  );

  // In here we're creating a mutacionObserver to make a request every time when a genre is added or removed
  const mutacionObserver = new MutationObserver(entries => {
    entries[0].addedNodes.forEach($element => {
      if ($element.hasAttribute('data-activeGenreId')) {
        document.querySelector(`[data-genreId="${$element.getAttribute('data-activeGenreId')}"]`).classList.add('filter-section__genre--active');
      }
    });
    entries[0].removedNodes.forEach($element => {
      if ($element.hasAttribute('data-activeGenreId')) {
        document.querySelector(`[data-genreId="${$element.getAttribute('data-activeGenreId')}"]`).classList.remove('filter-section__genre--active');
      }
    });

    if (document.getElementById('home').classList.contains('menu-section__btn--active')) {
      $containerMovies.replaceChildren('');
      requestMovies({ PAGES, endPoints, observer, renderMovies, formatNumber });
    } else requestUserMovies(renderMovies);
  });

  mutacionObserver.observe($containerActiveGenres, { childList: true });
  requestMovies({ PAGES, endPoints, observer, renderMovies, formatNumber });

  // In this IIFI we're requesting the genres of the movies and rendering them
  (async () => {
    try {
      const req = await fetch(endPoints.GENDERS);
      if (!req.ok) throw req;
      const { genres } = await req.json();
      const fragment = new DocumentFragment();
      genres.forEach(({ id, name }) => {
        const $newLi = $filterLiGenreTemplate.cloneNode(true);
        $newLi.dataset.genreid = id;
        $newLi.querySelector('span').textContent = name;
        fragment.append($newLi);
      });
      $filterContainerGenres.append(fragment);
      $yearInput.max = new Date().getFullYear();
    } catch (err) {
      console.error(err);
    }
  })();
                                                                
// Click events for elements on the menu section
  $menuSection.addEventListener('click', e => {
    if (isElement(e, '#filterBtn')) $body.classList.add('filter--active');
    else if (isElement(e, '#home') && document.querySelector('.menu-section__btn--active') !== document.getElementById('home')) {
      $containerMovies.replaceChildren('');
      requestMovies({ PAGES, endPoints, observer, renderMovies, formatNumber });
      document.querySelector('.menu-section__btn--active').classList.remove('menu-section__btn--active');
      e.target.classList.add('menu-section__btn--active');
      $containerSelectPart.classList.remove('hide');
    } else if (isElement(e, '#seeLaters, #seens, #favourites')) {
      PAGES.actualpage = 1;
      document.querySelector('.menu-section__btn--active').classList.remove('menu-section__btn--active');
      e.target.classList.add('menu-section__btn--active');
      requestUserMovies(renderMovies);
    }
  });

// Click events for elements on the filter section 
  $filterSection.addEventListener('click', e => {
    if (isElement(e, '#filterCrossBtn')) $body.classList.remove('filter--active');
    else if (isElement(e, '[data-genreId]')) {
      const $posibleElement = $containerActiveGenres.querySelector(`[data-activeGenreId="${e.target.getAttribute('data-genreId')}"]`);
      $posibleElement ? $posibleElement.remove() : addNewGenre(e);
    }
  });

// Click events for the active genres 
  $containerActiveGenres.addEventListener('click', e => {
    if (isElement(e, '[data-activeGenreId], [data-year]')) e.target.remove();
  });

// In this event, we'll request movies whenever the value of the input is setted
  $yearInput.addEventListener('input', () => {
    let $posibleElement = $containerActiveGenres.querySelector('[data-year]');
    if (!$posibleElement) {
      $posibleElement = $activeBtnGenreTemplate.cloneNode(true);
      $posibleElement.removeAttribute('data-ActiveGenreId');
      $containerActiveGenres.append($posibleElement);
    }
    $posibleElement.querySelector('span').textContent = `YEAR ${$yearInput.value}`;
    $posibleElement.setAttribute('data-year', $yearInput.value.trim());
    document.getElementById('filterYearSpan').textContent = $yearInput.value;

    if(document.getElementById('home').classList.contains('menu-section__btn--active') ){
      $containerMovies.replaceChildren('')
      requestMovies({ PAGES, endPoints, observer, renderMovies, formatNumber }) 
    }else requestUserMovies(renderMovies);
  });

// In this event, we'll request movies whenever the value of the select is setted
  $select.addEventListener('input', () => {
    $containerMovies.replaceChildren('');
    requestMovies({ PAGES, endPoints, observer, renderMovies, formatNumber });
  });


// In this event, we'll request movies whenever the value of the select is setted
  $searchInput.addEventListener('input', () => {
    if (document.getElementById('home').classList.contains('menu-section__btn--active')) {
      $containerMovies.replaceChildren('');
      requestMovies({ PAGES, endPoints, observer, renderMovies, formatNumber });
    } else requestUserMovies(renderMovies);
  });

  // Events for the action buttons of the movies and for the article element
  $containerMovies.addEventListener('click', e => {
    if (isElement(e, '[data-property]')) setUserMovie(e);
    else if (isElement(e, '[data-movieId], [data-movieId ] *')) {
      const movieId = e.target.tagName === 'ARTICLE' ? e.target.getAttribute('data-movieId') : e.target.closest('article').getAttribute('data-movieId');
      requestMovie({ renderModal, movieId, API_KEY, formatNumber });
    }
  });

  // Events for the action buttons of the movies and for the article element inside on the modal
  $modal.addEventListener('click', e => {
    if (isElement(e, '#backBtn')) {
      $modal.classList.add('modal-section--hide');
      document.querySelector('.movie-section').classList.remove('hide');
      document.getElementById('home').classList.contains('menu-section__btn--active') ? requestMovies({ PAGES, endPoints, observer, renderMovies, formatNumber }) : requestUserMovies(renderMovies);
    } else if (isElement(e, '#trailerBtn')) open(e.target.getAttribute('data-source'));
    else if (isElement(e, '[data-property]')) setUserMovie(e);
  });


  document.addEventListener('keyup', e => {
    if (e.key === '/') $searchInput.focus();
  });
});

// localStorage.clear()