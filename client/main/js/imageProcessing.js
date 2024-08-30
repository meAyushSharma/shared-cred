document.getElementById('upload-submit').addEventListener('click', async function() {
    // Create a new FormData object
    const formData = new FormData();
  
    // Get input values
    const credImage = document.getElementById('credImage').files[0];
    const nameContainer = document.getElementById('upload-form-name');
    const name = nameContainer.value;
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
      if(!data.success) await showAlertBox("something went wrong ━┳━ ━┳━");
      nameContainer.innerHTML = "";
      await showAlertBox("Credential saved successfully (～￣▽￣)～");
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
  const showImageTemplate = document.getElementById(`${userId}`);
  showImageTemplate.remove();
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


  