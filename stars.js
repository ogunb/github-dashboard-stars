let retryCount = 0;
let interval = setInterval(() => {
  const reposContainer = document.querySelector('[aria-label="Repositories"]');

  if (retryCount > 10 || reposContainer !== null) {
    clearInterval(interval);
  }

  if (reposContainer !== null) {
    requestIdleCallback(() => stars(reposContainer));
  }
}, 500);

async function stars(reposContainer) {
  const stars = await fetchUserStars();
  const starsContainer = createStarsContainer(reposContainer);
  const list = starsContainer.querySelector('#github_stars_extension_list');
  for (let star of stars) {
    const starElement = generateStarHtml(star);
    list.insertAdjacentHTML('beforeend', starElement);
  }

  reposContainer.insertAdjacentElement('afterend', starsContainer);
}

async function fetchUserStars() {
  const user = getUser();
  const response = await fetch(`https://api.github.com/users/${user}/starred?per_page=10&sort=created`);
  const data = await response.json();
  return data;
}

function getUser() {
  const userLoginMeta = document.querySelector('meta[name=user-login]');
  if (!userLoginMeta) {
    throw new Error('User is not logged in!');
  }

  return userLoginMeta.content;
}

function createStarsContainer(reposContainer) {
  const container = document.createElement('div');
  container.classList.value = `${reposContainer.classList.value} border-top my-2`;
  container.id = 'github_stars_extension_container';

  const heading = document.createElement('h2');
  heading.classList.value = 'mb-1 f5 mt-md-3';
  heading.textContent = 'Stars';

  const list = document.createElement('ul');
  list.classList.value = 'list-style-none';
  list.id = 'github_stars_extension_list';

  container.appendChild(heading);
  container.appendChild(list);

  return container;
}

function generateStarHtml({ visibility, html_url, owner: { avatar_url, login }, name, description }) {
  const repoHtml = `
  <li class="${visibility} source">
    <div class="width-full d-flex mt-2">
      <a
        class="mr-2 d-flex flex-items-center"
        href="${html_url}"
      >
        <img
          src="${avatar_url}"
          class="avatar avatar-small circle"
          width="16"
          height="16"
          alt="User: ${login}"
          aria-label="Repository"
        />
      </a>
      <div class="wb-break-word">
        <a
          class="color-fg-default lh-0 mb-2 markdown-title"
          href="${html_url}"
        >
          ${login}<span class="color-fg-muted">/</span>${name}
        </a>
        <p class="color-fg-muted">${description}</p>
      </div>
    </div>
  </li>
  `;

  return repoHtml;
}
