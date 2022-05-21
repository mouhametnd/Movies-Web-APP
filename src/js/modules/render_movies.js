const $movieTemplate = document.getElementById('movieTemplate').content.querySelector('article');
const $containerSekeletons = document.getElementById('containerSkeletons');
const $containerMovies = document.getElementById('containerMovies');

// This function is going to set the style for action buttons if the movie setted as favourite or seen or watched. 
const setMovieStates = ($element, id) => {
  const userMovies = JSON.parse(localStorage.getItem('userMovies'));
  const seensMoviesId = userMovies?.seens?.reduce((acc, { id }) => `${acc} ${id}`, '');
  const seeLatersMoviesId = userMovies?.seeLaters?.reduce((acc, { id }) => `${acc} ${id}`, '');
  const favouritesMoviesId = userMovies?.favourites?.reduce((acc, { id }) => `${acc} ${id}`, '');

  if (seensMoviesId?.includes(id)) $element.querySelector('[data-property="seens"]').classList.add('movie-section__action--active');
  else $element.querySelector('[data-property="seens"]').classList.remove('movie-section__action--active');

  if (seeLatersMoviesId?.includes(id)) $element.querySelector('[data-property="seeLaters"]').classList.add('movie-section__action--active');
  else $element.querySelector('[data-property="seeLaters"]').classList.remove('movie-section__action--active');

  if (favouritesMoviesId?.includes(id)) $element.querySelector('[data-property="favourites"]').classList.add('movie-section__action--active');
  else $element.querySelector('[data-property="favourites"]').classList.remove('movie-section__action--active');
};

// This function is going to render the movies passed in array.
export const renderMovies = (arrayOfMovies, observer) => {
  const fragment = new DocumentFragment();
  if (arrayOfMovies.length === 0) {
    const $h4 = document.createElement('h4');
    $h4.classList.add('movie-section__no-movies-found');
    $h4.textContent = 'No movies found';
    document.getElementById('containerMovies').replaceChildren($h4);
    document.getElementById('totalMoviesSpan').textContent = '0 MOVIE';
  }

  arrayOfMovies.forEach(movie => {
    const $newMovie = $movieTemplate.cloneNode(true);
    const { genre_ids, poster_path, original_title, id, release_date } = movie;
    const year = release_date?.split('-')[0] ?? 'No info about the year';
    $newMovie.setAttribute('data-movieId', id);
    $newMovie.setAttribute('data-movieGenresId', genre_ids.join(','));
    $newMovie.setAttribute('data-moviePosterPath', poster_path);
    $newMovie.setAttribute('data-movieYear', release_date);
    $newMovie.setAttribute('data-movieTitle', original_title);

    $newMovie.querySelector('img').alt = original_title;
    $newMovie.querySelector('.movie-section__movie-title').textContent = original_title;
    $newMovie.querySelector('.movie-section__movie-year').textContent = year;

    if (poster_path) $newMovie.querySelector('img').src = `https://image.tmdb.org/t/p/w500${poster_path}`;
    setMovieStates($newMovie, id);
    fragment.append($newMovie);
  });

  $containerSekeletons.classList.add('hide');
  // In here, we're setting the element that we're going to observe and unobserve.
  if (observer) {
    if ($containerMovies.querySelector('article:last-of-type')) observer.unobserve($containerMovies.querySelector('article:last-of-type'));

    $containerMovies.append(fragment);
    if ($containerMovies.querySelector('article:last-of-type')) observer.observe($containerMovies.querySelector('article:last-of-type'));
  } else $containerMovies.replaceChildren(fragment);
};

const $modal = document.getElementById('modal');
const $trailerBtn = document.getElementById('trailerBtn');

// This function is going to render the movie passed for the modal.
export const renderModal = ({ movie, formatNumber }) => {
  const noInfo = () => 'Thre is no information';
  document.querySelector('.movie-section').classList.add('hide');

  $modal.classList.remove('modal-section--hide');
  const { poster_path, overview, original_title, id, genres, release_date, videos, budget, original_language, vote_average, runtime, popularity, revenue, vote_count } = movie;
  $modal.setAttribute('data-movieId', id);
  $modal.setAttribute('data-movieYear', release_date);
  $modal.setAttribute('data-movieTitle', original_title);
  $modal.setAttribute('data-moviePosterPath', poster_path);
  $modal.setAttribute('data-movieGenresId', genres?.map(({ id }) => id).join(','));

  poster_path ? ($modal.style.backgroundImage = `linear-gradient(#0007, #0007), url('https://image.tmdb.org/t/p/w500${poster_path}')`) : ($modal.style.backgroundImage = "linear-gradient(#0007, #0007), url('/assets/default-img.jpg')");

  $modal.querySelector('.modal-section__movie-overview').textContent = overview || noInfo();
  $modal.querySelector('.modal-section__movie-title').textContent = original_title || noInfo();
  document.getElementById('released').textContent = release_date?.split('-')[0] || noInfo();
  document.getElementById('originalLang').textContent = original_language?.toUpperCase() || noInfo();
  document.getElementById('voteAverage').textContent = vote_average || noInfo();
  document.getElementById('originalLang').textContent = original_language?.toUpperCase() || noInfo();
  document.getElementById('runtime').textContent = `${runtime} min` || noInfo();
  document.getElementById('voteCount').textContent = vote_count ? formatNumber(vote_count) : noInfo();
  document.getElementById('budget').textContent = budget ? `$${formatNumber(budget)}` : noInfo();
  document.getElementById('popularity').textContent = popularity ? formatNumber(popularity) : noInfo();
  document.getElementById('revenue').textContent = revenue ? `$${formatNumber(revenue)}` : noInfo();

  const youtubeVideoSource = videos.results.find(({ site }) => site.toLowerCase() === 'youtube');
  if (youtubeVideoSource) {
    $trailerBtn.setAttribute('data-source', `https://www.youtube.com/watch?v=${youtubeVideoSource.key}`);
    $trailerBtn.classList.remove('hide');
  } else $trailerBtn.classList.add('hide');

  const fragment = new DocumentFragment();
  genres.forEach(({ name }) => {
    const $newLi = document.createElement('li');
    $newLi.classList.add('modal-section__li-genre');
    $newLi.textContent = name;
    fragment.append($newLi);
  });
  setMovieStates($modal, id);
  document.getElementById('modalMovieGenres').replaceChildren(fragment);
};
