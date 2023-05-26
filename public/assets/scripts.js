const DEV_URL = 'http://localhost:3000';
const PROD_URL = '1545749-cd47482.twc1.net';
const URL = DEV_URL;

async function handleSignin() {
  const formEl = document.querySelector('#signinForm');
  const formData = new FormData(formEl);
  const body = {};

  for (const pair of formData.entries()) {
    body[pair[0]] = pair[1];
  }

  return await fetch(URL + '/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (res.ok) {
        return (location.href = URL + '/users/profile');
      }
      return res.text().then((e) => {
        const json = JSON.parse(e);
        showModal(json.error, json.message);
      });
    })
    .catch((e) => {
      showModal(e.error, e.message);
    });
}

async function handleSignout() {
  return await fetch(URL + '/auth/signout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      if (res.ok) {
        return showModal(
          'Успех',
          `Вы вышли из системы`,
          false,
          () => (location.href = URL),
        );
      }
      return res.text().then((e) => {
        const json = JSON.parse(e);
        showModal(json.error, json.message);
      });
    })
    .catch((e) => {
      showModal(e.error, e.message);
    });
}

async function handleSignup() {
  const formEl = document.querySelector('#signupForm');
  const formData = new FormData(formEl);
  const body = {};

  for (const pair of formData.entries()) {
    body[pair[0]] = pair[1];
  }

  return await fetch(URL + '/users/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (res.ok) {
        return showModal(
          'Успех',
          `Пользователь создан`,
          false,
          () => (location.href = URL + '/users/signin'),
        );
      }
      return res.text().then((e) => {
        const json = JSON.parse(e);
        showModal(json.error, json.message);
      });
    })
    .catch((e) => {
      showModal(e.error, e.message);
    });
}

async function handleUpdateUser() {
  const formEl = document.querySelector('#updateUserForm');
  const formData = new FormData(formEl);
  const body = {};

  for (const pair of formData.entries()) {
    body[pair[0]] = pair[1];
  }

  return await fetch(URL + '/users/update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (res.ok) {
        return showModal('Успех', `Данные обновлены`, false, () =>
          location.reload(),
        );
      }
      return res.text().then((e) => {
        const json = JSON.parse(e);
        showModal(json.error, json.message);
      });
    })
    .catch((e) => {
      showModal(e.error, e.message);
    });
}

async function handleSubmitNews() {
  const formEl = document.querySelector('#createNewsForm');
  const formData = new FormData(formEl);
  // Add the image
  // formData.append('cover', formEl.cover);
  // const body = {};

  // for (const pair of formData.entries()) {
  //   body[pair[0]] = pair[1];
  // }

  return await fetch(URL + '/news/create', {
    method: 'POST',
    // headers: {
    //   'Content-Type': 'multipart/form-data',
    // },
    // body: formData,

    // headers: {
    //   'Content-Type': 'application/json',
    // },
    // body: JSON.stringify(body),
    body: formData,
  })
    .then((res) => {
      if (res.ok) {
        return location.reload();
      }
      return res.text().then((e) => {
        const json = JSON.parse(e);
        showModal(json.error, json.message);
      });
    })
    .catch((e) => {
      showModal(json.error, json.message);
    });
}

async function handleUpdateNews() {
  const formEl = document.querySelector('#updateNewsForm');
  const data = new FormData(formEl);

  return await fetch(`${URL}/news/update/${formEl.dataset.newsid}`, {
    method: 'PATCH',
    body: data,
  })
    .then((res) => {
      if (res.ok) {
        showModal(
          res.status,
          res.message,
          false,
          () =>
            (location.href = `${URL}/news/details/${formEl.dataset.newsid}`),
        );
      }
      // If response with error
      return res.text().then((e) => {
        const json = JSON.parse(e);
        showModal(json.status, json.message);
      });
    })
    .catch((e) => {
      showModal(e.status, e.message);
    });
}

// async function handleSubmitComment() {
//   const formEl = document.querySelector('#createCommentForm');
//   const formData = new FormData(formEl);
//   const body = {};

//   for (const pair of formData.entries()) {
//     body[pair[0]] = pair[1];
//   }

//   return await fetch(`${URL}/comments/create?newsid=${formEl.dataset.newsid}`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(body),
//   })
//     .then((res) => {
//       if (res.ok) {
//         return location.reload();
//       }
//       return res.text().then((e) => {
//         const json = JSON.parse(e);
//         showModal(json.status, json.message);
//       });
//     })
//     .catch((e) => {
//       const json = JSON.parse(e);
//       showModal(json.error, json.message);
//     });
// }

// To view of comment's update
// document.querySelectorAll('.goToUpdateCommentBtn').forEach((el) => {
//   el.addEventListener('click', (e) => {
//     const commentId = e.currentTarget.dataset.commentid;
//     location.href = `${URL}/comments/update/${commentId}`;
//   });
// });

async function handleUpdateComment() {
  const formEl = document.querySelector('#updateCommentForm');
  const commentId = formEl.dataset.commentid;
  const newsId = formEl.dataset.newsid;
  const formData = new FormData(formEl);
  const body = {};

  for (const pair of formData.entries()) {
    body[pair[0]] = pair[1];
  }

  return await fetch(`${URL}/comments/update/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (res.ok) {
        showModal(
          res.status,
          res.message,
          false,
          () => (location.href = `${URL}/news/details/${newsId}`),
        );
      }
      return res.text().then((e) => {
        const json = JSON.parse(e);
        showModal(json.status, json.message);
      });
    })
    .catch((e) => {
      const json = JSON.parse(e);
      showModal(json.status, json.message);
    });
}

function showModal(title, text, typeError = true, onHideEvent) {
  const modalEl = document.querySelector('.modal');
  const modalContentEl = document.querySelector('.modal-content');
  const modalTitleEl = document.querySelector('.modal-title');
  const modalTextEl = document.querySelector('.modal-body p');

  const modal = new bootstrap.Modal(modalEl);

  // Callback
  modalEl.addEventListener('hidden.bs.modal', onHideEvent);

  // Pant the border
  modalContentEl.classList.remove('border-danger', 'border-info');
  modalContentEl.classList.add(typeError ? 'border-danger' : 'border-info');

  modalTitleEl.innerText = title;
  modalTextEl.innerText = text;
  modal.show();
}
