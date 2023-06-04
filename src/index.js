import axios from 'axios';
import { Notify } from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreButton = document.getElementById('load-more');

let currentPage = 1;
let currentSearchQuery = '';

searchForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const searchQuery = searchForm.elements.searchQuery.value;
  clearGallery();
  currentSearchQuery = searchQuery;
  currentPage = 1;
  await searchImages(searchQuery, currentPage);
});

loadMoreButton.addEventListener('click', async function () {
  currentPage++;
  await searchImages(currentSearchQuery, currentPage);
});

async function searchImages(query, page) {
  const key = '37002105-a10eeb22943de1726cde568cc';
  const perPage = 40;

  const url = `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(
    query
  )}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.hits.length === 0) {
      showNotification(
        'Sorry, there are no images matching your search query. Please try again.',
        2
      );
    } else {
      displayImageResults(data.hits);

      if (data.totalHits <= page * perPage) {
        hideLoadMoreButton();
        showNotification(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        showLoadMoreButton();
      }
    }
  } catch (error) {
    showNotification(
      'An error occurred while fetching images. Please try again.',
      1
    );
    console.error(error);
  }
}

function displayImageResults(images) {
  images.forEach(image => {
    const photoCard = createPhotoCard(image);
    gallery.appendChild(photoCard);
  });

  const lightbox = new SimpleLightbox('.photo-card a');
  lightbox.on('show.simplelightbox', function () {
    document.body.classList.add('lightbox-open');
  });
  lightbox.on('close.simplelightbox', function () {
    document.body.classList.remove('lightbox-open');
  });
}

function createPhotoCard(image) {
  const imgElement = document.createElement('img');
  imgElement.src = image.previewURL;
  imgElement.alt = image.tags;
  imgElement.loading = 'lazy';

  const linkElement = document.createElement('a');
  linkElement.href = image.webformatURL;

  linkElement.appendChild(imgElement);

  const likesElement = createInfoElement('Likes', image.likes);
  const viewsElement = createInfoElement('Views', image.views);
  const commentsElement = createInfoElement('Comments', image.comments);
  const downloadsElement = createInfoElement('Downloads', image.downloads);

  const infoElement = document.createElement('div');
  infoElement.classList.add('info');
  infoElement.appendChild(likesElement);
  infoElement.appendChild(viewsElement);
  infoElement.appendChild(commentsElement);
  infoElement.appendChild(downloadsElement);

  const photoCard = document.createElement('div');
  photoCard.classList.add('photo-card');
  photoCard.appendChild(linkElement);
  photoCard.appendChild(infoElement);

  return photoCard;
}

function createInfoElement(label, value) {
  const infoItemElement = document.createElement('p');
  infoItemElement.classList.add('info-item');
  infoItemElement.innerHTML = `<b>${label}:</b> ${value}`;

  return infoItemElement;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

function showNotification(message, type) {
  if (type == 1) {
    Notify.failure(message);
  } else if (type == 2) {
    Notify.warning(message);
  } else {
    Notify.info(message);
  }
}
