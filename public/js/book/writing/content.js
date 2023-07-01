let parent = null;
let parent_type = null;
let translate = null;

function saveContent(callback) {
  if (isSaved) return callback(null);

  document.querySelector('.general-writing-saving-prompt').style.display = 'flex';

  if (!translate || translate == 'en') {
    serverRequest(
      `/book/writing/edit?${parent_type ? 'type=' + parent_type + '&' : ''}id=${parent._id}&writing_id=${writing._id}`,
      'POST',
      generateWritingData(),
      res => {
        if (!res.success) {
          document.querySelector('.general-writing-saving-prompt').style.display = 'none';
          return callback(res.error || 'unknown_error');
        }

        isSaved = true;
        document.querySelector('.general-writing-saving-prompt').style.display = 'none';
        document.querySelector('.general-writing-unsaved-changes-text').style.visibility = 'hidden';
        callback(null);
      }
    );
  } else {
    const data = generateWritingData();
    data.language = translate;

    serverRequest(
      `/book/writing/translate?${parent_type ? 'type=' + parent_type + '&' : ''}id=${parent._id}&writing_id=${writing._id}`,
      'POST',
      data,
      res => {
        if (!res.success) {
          document.querySelector('.general-writing-saving-prompt').style.display = 'none';
          return callback(res.error || 'unknown_error');
        }

        isSaved = true;
        document.querySelector('.general-writing-saving-prompt').style.display = 'none';
        document.querySelector('.general-writing-unsaved-changes-text').style.visibility = 'hidden';
        callback(null);
      }
    );
  }
};

window.addEventListener('load', () => {
  parent = JSON.parse(document.getElementById('parent-json').value);
  if (document.getElementById('parent-type'))
    parent_type = JSON.parse(document.getElementById('parent-type').value);
  translate = JSON.parse(document.getElementById('translate-json').value);

  const savingPrompt = document.querySelector('.general-writing-saving-prompt');

  const coverInput = document.querySelector('.general-writing-cover-input');
  const coverImage = document.querySelector('.general-writing-cover-image');
  const imageLoadingPrompt = document.querySelector('.general-writing-loading-image-prompt');

  coverInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    imageLoadingPrompt.style.display = 'flex';

    if (!translate || translate == 'en') {
      serverRequest(`/book/writing/cover?${parent_type ? 'type=' + parent_type + '&' : ''}id=${parent._id}&writing_id=${writing._id}`, 'FILE', {
        file
      }, res => {
        if (!res.success) {
          imageLoadingPrompt.style.display = 'none';
          return throwError(res.error);
        }
  
        imageLoadingPrompt.style.display = 'none';
        coverImage.style.display = 'block';
        coverImage.src = res.url;
      });
    } else {
      serverRequest(`/book/writing/cover-translate?${parent_type ? 'type=' + parent_type + '&' : ''}id=${parent._id}&writing_id=${writing._id}&language=${translate}`, 'FILE', {
        file
      }, res => {
        if (!res.success) {
          imageLoadingPrompt.style.display = 'none';
          return throwError(res.error);
        }
  
        imageLoadingPrompt.style.display = 'none';
        coverImage.style.display = 'block';
        coverImage.src = res.url;
      });
    }
  });

  document.addEventListener('click', event => {
    if (ancestorWithClassName(event.target, 'change-language-input-choice')) {
      const translate = ancestorWithClassName(event.target, 'change-language-input-choice').id.replace('select-input-', '');

      savingPrompt.style.display = 'flex';
      saveContent(err => {
        if (err) return throwError(err);
  
        savingPrompt.style.display = 'none';
        window.location = `/book/writing/content?${parent_type ? 'type=' + parent_type + '&' : ''}id=${parent._id}&writing_id=${writing._id}&translate=${translate}`
      });
    };

    if (event.target.id == 'save-writing-button') {
      saveContent(err => {
        if (err) return throwError(err);
      });
    }
  });
});