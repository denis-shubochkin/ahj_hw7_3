
const block = document.querySelector('.block');
const input = document.querySelector('.input');
const images = document.querySelector('.images');
let imgContainers = document.querySelectorAll('.img-container');

block.addEventListener('click', () => {
  input.dispatchEvent(new MouseEvent('click'));
});


function clear() {
  if (imgContainers.length > 0) {
    imgContainers.forEach((el) => {
      el.remove();
    });
  }
}

function addImage(data, id) {
  const imgCont = document.createElement('div');
  imgCont.classList.add('img-container');
  images.appendChild(imgCont);
  const img = document.createElement('img');
  img.classList.add('img');
  imgCont.id = id;
  imgCont.appendChild(img);
  const delBut = document.createElement('button');
  delBut.classList.add('delete');
  imgCont.appendChild(delBut);
  const newEl = images.lastChild.querySelector('.img');
  const newDel = images.lastChild.querySelector('.delete');
  const reader = new FileReader();
  reader.onload = (event) => {
    newEl.src = event.target.result;
  };

  try {
    reader.readAsDataURL(data);
  } catch (e) {
    images.lastChild.remove();
    return;
  }

  newDel.addEventListener('click', (event) => {
    const params = new URLSearchParams();
    params.append('method', 'delImage');
    params.append('id', event.target.closest('.img-container').id);
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `https://zippo1095-ahj-hw7-3.herokuapp.com:7070/?${params}`);
    xhr.send();
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          // const d = xhr.responseText;
          event.target.closest('.img-container').remove();
          // eslint-disable-next-line no-use-before-define
          getImages();
        } catch (e) {
          console.error(e);
        }
      }
    });
  });
}


function getImages() {
  const params = new URLSearchParams();
  params.append('method', 'allImages');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `https://zippo1095-ahj-hw7-3.herokuapp.com:7070/?${params}`);
  xhr.send();
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        if (xhr.responseText !== 'empty') {
          const d = JSON.parse(xhr.responseText);
          clear();
          d.forEach((el) => {
            const str = new Uint8Array(el.data.data);
            const blob = new Blob([str], { type: 'image/png' });
            addImage(blob, el.id);
          });
          imgContainers = document.querySelectorAll('.img-container');
        } else {
          console.log('Картинок нет');
        }
      } catch (e) {
        console.error(e);
      }
    }
  });
}

function init() {
  getImages();
}

init();


function sendInsert(element) {
  const params = new URLSearchParams();
  params.append('method', 'loadImage');
  const formData = new FormData();
  formData.append('img', element);
  console.log(element);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `https://zippo1095-ahj-hw7-3.herokuapp.com:7070/?${params}`);
  xhr.send(formData);
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const d = xhr.responseText;
        if (d === 'ok') {
          // clear();
          getImages();
        }
        input.value = '';
      } catch (e) {
        console.error(e);
      }
    }
  });
}

block.addEventListener('dragover', (evt) => {
  evt.preventDefault();
  input.dispatchEvent(new Event('dragover'));
});

block.addEventListener('drop', (evt) => {
  evt.preventDefault();
  const files = Array.from(evt.dataTransfer.files);
  files.forEach((el) => {
    sendInsert(el);
  });
});

input.addEventListener('dragover', (evt) => {
  evt.preventDefault();
});

input.addEventListener('drop', (evt) => {
  evt.preventDefault();
  const files = Array.from(evt.dataTransfer.files);
  files.forEach((el) => {
    sendInsert(el);
  });
});


input.addEventListener('change', (evt) => {
  const data = evt.target.files;
  data.forEach((el) => {
    sendInsert(el);
  });
});
