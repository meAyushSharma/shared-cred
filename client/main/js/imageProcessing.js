document.getElementById('upload-submit').addEventListener('click', async function() {
    // Create a new FormData object
    const formData = new FormData();
  
    // Get input values
    const credImage = document.getElementById('credImage').files[0];
    const nameContainer = document.getElementById('upload-form-name');
    const name = nameContainer.value;
    await showAlertBox("Uploading.... =]");
  if(name == "" || !credImage) return await showAlertBox("Missing fields (┬┬﹏┬┬)");
    if (credImage) {
      formData.append('credImage', credImage);
    }
    formData.append('name', name);
    fetch('/credential-manager/upload', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(async data => {
      console.log(data)
      if(!data.success){
        nameContainer.value = "";
        const node = document.getElementById('custom-file-upload');
        node.classList.remove('choose-container-change');
        return await showAlertBox(`${data.msg}`);
      }
      nameContainer.value = "";
      await showAlertBox("Credential saved successfully (～￣▽￣)～");
      const showImage = document.getElementById('show-image');
      const node = document.getElementById('custom-file-upload');
      node.classList.remove('choose-container-change');
      showImage.click();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });

document.getElementById('show-image').addEventListener('click', async () => {
  const response = await fetch('/credential-manager/get-images', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });
  const showContainer = document.getElementsByClassName("show-image-container")[0];
  showContainer.innerHTML = "";
  const {imagesArray, userId} = await response.json();
  let inc = 0;
  await imagesArray.forEach(ele => {
    showContainer.append(createImageShowTemplate(ele.name, ele.url, ++inc, userId))
  });
})

async function deleteImage(increment, imageURL) {
  const userId = document.getElementsByClassName(`delete-image-credential${increment}`)[0].closest('.show-image-template').id;
  const showImageTemplate = document.getElementById(`${userId}`);
  showImageTemplate.remove();
  const response = await fetch('/credential-manager/delete-cred-image', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: userId,
      imageURL: imageURL
    })
  });
  const result = await response.json();
  if(!result.success) return await showAlertBox(result.msg);
  return await showAlertBox(result.msg);
}


function createImageShowTemplate(imageName, imageURL, increment, userId) {
  const showImageTemplateNode = document.createElement('div');
  showImageTemplateNode.setAttribute('class', "show-image-template");
  showImageTemplateNode.setAttribute('id', `${userId}`);
  showImageTemplateNode.innerHTML = `<div class="image-credential-name image-credential-name${increment}">${imageName}</div>
              <div class="delete-image-credential delete-image-credential${increment}" onclick="deleteImage(${increment}, '${imageURL}')" >Delete</div>
              <div id="image-container">
                <img src="${imageURL}" alt="oops there was credential... <(＿　＿)>" class="credential-image">
              </div>`
  return showImageTemplateNode;
}

document.getElementById('credImage').addEventListener('change', (e) => {
  const node = document.getElementById('custom-file-upload');
  console.log(node);
  node.setAttribute('class', "choose-container-change");
})


  