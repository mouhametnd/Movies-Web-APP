// This function will request the movies with all the values of each filter and also is going to execute the renderMovies function passed. 
export const requestMovies = async ({ PAGES, endPoints, renderMovies, formatNumber, observer }) => {
  try {
    const $containerActiveGenres = document.getElementById('containerActiveGenres');
    const $searchInput = document.getElementById('searchInput');
    const $select = document.getElementById('sortBySelect');

    const genres = [...$containerActiveGenres.querySelectorAll('[data-ActiveGenreId]')].map($genre => $genre.dataset.activegenreid);
    const year = $containerActiveGenres.querySelector('[data-year]')?.getAttribute('data-year');

    // In here we're using this constructor to set all the search params that we need and then with the method toString() we'll receive the query strings in a string.
    const searchParams = new URLSearchParams({
      query: $searchInput.value.trim().toLowerCase(),
      year: year ?? '',
      with_genres: genres.join(','),
      page: PAGES.actualpage,
      adult: 'false',
    });
    let req = null;

    // making a normal request or a search request depending on if the search input has a value.
    $searchInput.value.trim().toLowerCase() ? (req = await fetch(`${endPoints.SEARCH}&${searchParams.toString()}`)) : (req = await fetch(`${endPoints[$select.value]}&${searchParams.toString()}`));

    if (!req.ok) throw req;
    const { page, results, total_pages, total_results } = await req.json();
    PAGES.actualpage = page;
    PAGES.totalPages = total_pages;
    renderMovies(results, observer);

    document.getElementById('totalMoviesSpan').textContent = `${formatNumber(total_results)} MOVIES`;
  } catch (err) {
    console.error(err);
  }
};

// In this function, we're doing a request for the movie clicked to get more info and then we execute the renderModal function.
export const requestMovie = async ({ renderModal, movieId, API_KEY, formatNumber }) => {
  try {
    const req = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos`);

    if (!req.ok) throw req;

    const res = await req.json();
    renderModal({ movie: res, formatNumber });
  } catch (err) {
    console.error(err);
  }
};
