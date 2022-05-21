// This function is going to be execute when a movie action is been clicked and we will set the set movie to localStorage.
export const setUserMovie = e => {
  const userMovies = JSON.parse(localStorage.getItem('userMovies'));
  const $btn = e.target;
  const property = $btn.dataset.property;
  const $movieElement = $btn.closest('[data-movieId]');
  const movieId = $movieElement.getAttribute('data-movieId');
  const array = userMovies[property];

  if ($btn.classList.contains('movie-section__action--active')) {
    array.splice(array.indexOf(array.find(({ id }) => id === movieId)), 1);
    $btn.classList.remove('movie-section__action--active');
  } else {
    $btn.classList.add('movie-section__action--active');
    userMovies[property].push({
      id: movieId,
      genre_ids: $movieElement.getAttribute('data-movieGenresId').split(','),
      poster_path: $movieElement.getAttribute('data-moviePosterPath'),
      original_title: $movieElement.getAttribute('data-movieTitle'),
      release_date: $movieElement.getAttribute('data-movieYear'),
    });
  }
  localStorage.setItem('userMovies', JSON.stringify(userMovies));
};

// This function is going to be execute when we have to render the movies of the user. We are going to request the movies from localStorage and this function is going to filter the movies depending on the values of filter fields. 
export const requestUserMovies = renderMovies => {
  const $containerSelectPart = document.getElementById('containerSelectPart');
  const $containerActiveGenres = document.getElementById('containerActiveGenres');
  const $element = document.querySelector('.menu-section__btn--active');
  const $searchInput = document.getElementById('searchInput');
  const $totalMoviesSpan = document.getElementById('totalMoviesSpan');
  const userMovies = JSON.parse(localStorage.getItem('userMovies'));

  const array = userMovies[$element.id];
  $containerSelectPart.classList.add('hide');

  if (array && array.length > 0) {
    const year = $containerActiveGenres.querySelector('[data-year]')?.getAttribute('data-year') ?? '';

    const moviesActiveGenresStr = [...$containerActiveGenres.querySelectorAll('[data-ActiveGenreId]')].map($genre => $genre.dataset.activegenreid);

    const moviesFiltered = array.filter(movie => {
      const { genre_ids, original_title, release_date } = movie;
      let counter = 0;
      moviesActiveGenresStr.forEach(activeGenreId => {
        genre_ids.forEach(movieGenreId => {
          if (activeGenreId === movieGenreId) counter++;
        });
      });

      if (original_title.toLowerCase().startsWith($searchInput.value.trim().toLowerCase()) && release_date.includes(year) && counter === moviesActiveGenresStr.length) return true;
    });

    renderMovies(moviesFiltered);
    $totalMoviesSpan.textContent = `${moviesFiltered.length} MOVIES`;
  } else{
    const $h4 = document.createElement('h4');
    $h4.classList.add('movie-section__no-movies-found');
    $h4.textContent = 'No movies found';
    document.getElementById('containerMovies').replaceChildren($h4);
    document.getElementById('totalMoviesSpan').textContent = '0 MOVIE'; 
  }
};




