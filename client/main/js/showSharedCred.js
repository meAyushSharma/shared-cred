const showSharedBtn = document.getElementsByClassName('shared-cred-heading')[0];
showSharedBtn.addEventListener('click', async e =>{
  const viewerContainer = document.getElementById('viewer-container');
  const editorContainer = document.getElementById('editor-container');
  const authorContainer = document.getElementById('author-container');
  viewerContainer.innerHTML = "";
  editorContainer.innerHTML="";
  authorContainer.innerHTML = "";
  const response = await fetch("/credential-manager/show-shared-resources", {
    method: "GET",
    headers : {
      'Content-Type': 'application/json'
    }
  });
  const {resourcesToSend} = await response.json();
  if(!resourcesToSend || resourcesToSend == undefined){
    await showAlertBox("Problem fetching credentials ━┳━ ━┳━");
    return;
  }
  let inc = 1;
  for (const resource of resourcesToSend.viewer) {
    console.log("this is resource:: ", resource);
    const resourceValue = await decryptResourceValue(resource.resourceValue, resource.encryptedSymmetricKey);
    createSharedCredEle(resource, role="viewer", inc, resourceValue);
    inc++;
  }
  for (const resource of resourcesToSend.editor) {
    console.log("this is resource:: ", resource);
    const resourceValue = await decryptResourceValue(resource.resourceValue, resource.encryptedSymmetricKey);
    createSharedCredEle(resource, role="editor", inc, resourceValue);
    inc++;
  }
  for (const resource of resourcesToSend.author) {
    console.log("this is resource:: ", resource);
    const resourceValue = await decryptResourceValue(resource.resourceValue, resource.encryptedSymmetricKey);
    createSharedCredEle(resource, role="author", inc, resourceValue);
    inc++;
  }
})