const API_KEY = "2230781f66c231db978715c2fb4e9325";

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_SRC_BASE = `https://image.tmdb.org/t/p/w500`;

const TABS = {
  HOME: "HOME",
  LIKE: "LIKED LIST",
};

// model
const model = {
  movieList: [],
  likedList: [],
  activeTab: TABS.HOME,
  currentFilter: "popular",
  currentPage: 1,
  totalPages: 0,
  currentMovie: null,
};

// view
const updateTabs = () => {
  const currentTab = model.activeTab;
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    const tabName = tab.getAttribute("name");
    tab.className = `tab${tabName === currentTab ? " active" : ""}`;
  });
  const homeContainer = document.querySelector("#homeContainer");
  const likedContainer = document.querySelector("#likedContainer");
  const activeTab = currentTab === TABS.HOME ? homeContainer : likedContainer;
  const otherTab = currentTab === TABS.HOME ? likedContainer : homeContainer;
  activeTab.className = "tab-view-active";
  otherTab.className = "tab-view";
};

const updateMovieList = () => {
  const renderList = (list, containerId) => {
    const container = document.querySelector(containerId);
    container.innerHTML = "";
    list.forEach((movie) => {
      const movieCard = createMovieCard(movie);
      container.append(movieCard);
    });
  };

  renderList(model.movieList, "#homeList");
  renderList(model.likedList, "#likedList");
};

const updatePage = () => {
  document.querySelector(
    "#currentPage"
  ).innerHTML = `${model.currentPage} / ${model.totalPages}`;
};



// controller
const loadMovies = (category, page) => {
  return fetch(`${BASE_URL}/movie/${category}?page=${page}&api_key=${API_KEY}`)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        return [];
      }
    })
    .then((movieData) => {
      model.movieList = movieData.results;
      model.totalPages = movieData.total_pages;
    })
    .catch((err) => {
      console.log(err);
    });
};

const fetchMovieData = (movieId) => {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`;
  return fetch(url).then((resp) => {
    return resp.json();
  });
};

const createMovieCard = (movie) => {
  const movieCard = document.createElement("div");
  movieCard.className = "movie-card";
  movieCard.id = movie.id;

  const poster = document.createElement("img");
  poster.src = `${IMG_SRC_BASE}${movie.poster_path}`;
  poster.alt = movie.title;
  poster.className = "movie-poster";

  const title = document.createElement("h3");
  title.className = "movie-title";
  title.textContent = movie.title;

  const details = document.createElement("div");
  details.className = "movie-details";

  const rating = document.createElement("div");
  rating.className = "movie-rating";
  rating.innerHTML = `<i class="icon ion-ios-star rating-icon"></i>
    <span>${movie.vote_average}</span>`;

  const liked = model.likedList.some(
    (likedMovie) => likedMovie.id === movie.id
  );
  const likeButton = document.createElement("div");
  likeButton.className = "like-button";
  likeButton.innerHTML = `<i class="like-icon icon ${
    liked ? "ion-ios-heart" : "ion-ios-heart-outline"
  }"></i>`;

  details.appendChild(rating);
  details.appendChild(likeButton);

  movieCard.appendChild(poster);
  movieCard.appendChild(title);
  movieCard.appendChild(details);

  return movieCard;
};

const updateModal = () => {
  const movieData = model.currentMovie;

  const modal = document.querySelector("#modal");
  const modalImg = modal.querySelector(".modal-img");
  modalImg.innerHTML = `<img src="${IMG_SRC_BASE}/${movieData.poster_path}" />`;
  const modalTitle = modal.querySelector("#modal-movie-title");
  modalTitle.textContent = movieData.title;

  const modalOverview = modal.querySelector(".modal-overview");
  modalOverview.innerHTML = movieData.overview;

  const genreContainer = modal.querySelector(".genre-container");
  genreContainer.innerHTML = movieData.genres
    .map((genre) => {
      return `<div class="genre-item">${genre.name}</div>`;
    })
    .join("");

  const ratingElement = modal.querySelector(".rating");
  ratingElement.textContent = movieData.vote_average;

  const productionContainer = modal.querySelector(".production-container");
  productionContainer.innerHTML = movieData.production_companies
    .map((company) => {
      return `<div class="production-item">
         <img src="${IMG_SRC_BASE}/${company.logo_path}" />
       </div>`;
    })
    .join("");
};

//event handler

const handleNavBarClick = (e) => {
  const target = e.target;
  const name = target.getAttribute("name");
  if (!name) {
    return;
  }

  model.activeTab = name;
  updateTabs();
};

const handleListClick = (e) => {
  const target = e.target;
  const card = target.closest(".movie-card");
  if (!card) {
    return;
  }

  const movieId = Number(card.id);
  if (target.classList.contains("like-icon")) {
    const movieData = model.movieList.find((movie) => movie.id === movieId);
    const alreadyLiked = model.likedList.some(
      (likedMovie) => likedMovie.id === movieId
    );
    if (alreadyLiked) {
      model.likedList = model.likedList.filter((movie) => movie.id !== movieId);
    } else {
      model.likedList.push(movieData);
    }
    updateMovieList();
    return;
  }

  if (target.classList.contains("movie-title")) {
    fetchMovieData(movieId).then((movieData) => {
      model.currentMovie = movieData;
      updateModal();
      document.querySelector("#modal").style.display = "flex";
    });
  }
};

const handlePageClick = (e) => {
  const target = e.target;
  const currentPage = model.currentPage;

  if (target.id === "nextButton" || target.id === "prevButton") {
    const isNext = target.id === "nextButton";
    if (
      (isNext && currentPage === model.totalPages) ||
      (!isNext && currentPage === 1)
    ) {
      return;
    }
    const nextPage = currentPage + (isNext ? 1 : -1);
    loadMovies(model.currentFilter, nextPage).then(() => {
      model.currentPage = nextPage;
      updateMovieList();
      updatePage();
    });
  }
};

const handleFilterChange = (e) => {
  const value = e.target.value;
  model.currentFilter = value;
  loadMovies(model.currentFilter, 1).then(() => {
    updateMovieList();
    updatePage();
  });
};

// event listener
const loadEvent = () => {
  const navBar = document.querySelector(".nav-bar");
  const lists = document.querySelectorAll(".list-container");
  const closeModalElement = document.querySelector(".close-modal");
  const select = document.querySelector(".filter-select");
  const pageContainer = document.querySelector(".page-container");

  navBar.addEventListener("click", handleNavBarClick);
  lists.forEach((list) => {
    list.addEventListener("click", handleListClick);
  });

  pageContainer.addEventListener("click", handlePageClick);

  select.addEventListener("change", handleFilterChange);

  closeModalElement.addEventListener("click", () => {
    document.querySelector("#modal").style.display = "none";
  });
};

// initialize
const initializeApp = () => {
  loadEvent();
  loadMovies(model.currentFilter, 1).then(() => {
    updateTabs();
    updateMovieList();
    updatePage();
  });
};

initializeApp();
