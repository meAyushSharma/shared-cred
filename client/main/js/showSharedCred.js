
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
    await showAlertBox("Problem fetching credentials ━┳━　━┳━");
    return;
  }
  console.log(resourcesToSend);
  
  let inc = 1;
  await resourcesToSend.viewer.forEach(resource => {
    createSharedCredEle(resource, role="viewer", inc);
    inc++;
  });
  await resourcesToSend.editor.forEach(resource => {
    createSharedCredEle(resource, role="editor", inc);
    inc++;
  });
  await resourcesToSend.author.forEach(resource => {
    createSharedCredEle(resource, role="author", inc);
    inc++
  });
})