let blog = null;
let translate = null;

function saveContent(callback) {
  if (isSaved) return callback(null);

  document.querySelector('.general-writing-saving-prompt').style.display = 'flex';

  if (!translate || translate == 'en') {
    serverRequest(
      `/blog/writing/edit?id=${blog._id}&writing_id=${writing._id}`,
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
      `/blog/writing/translate?id=${blog._id}&writing_id=${writing._id}`,
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
  blog = JSON.parse(document.getElementById('blog-json').value);
  translate = JSON.parse(document.getElementById('translate-json').value);

  const savingPrompt = document.querySelector('.general-writing-saving-prompt');

  const coverInput = document.querySelector('.general-writing-cover-input');
  const coverImage = document.querySelector('.general-writing-cover-image');
  const imageLoadingPrompt = document.querySelector('.general-writing-loading-image-prompt');

  coverInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    imageLoadingPrompt.style.display = 'flex';

    serverRequest(`/blog/writing/cover?id=${blog._id}&writing_id=${writing._id}`, 'FILE', {
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
  });

  document.addEventListener('click', event => {
    if (ancestorWithClassName(event.target, 'change-language-input-choice')) {
      const translate = ancestorWithClassName(event.target, 'change-language-input-choice').id.replace('select-input-', '');

      savingPrompt.style.display = 'flex';
      saveContent(err => {
        if (err) return throwError(err);
  
        savingPrompt.style.display = 'none';
        window.location = `/blog/writing/content?id=${blog._id}&writing_id=${writing._id}&translate=${translate}`
      });
    };

    if (event.target.id == 'save-writing-button') {
      saveContent(err => {
        if (err) return throwError(err);
      });
    }
  });
});