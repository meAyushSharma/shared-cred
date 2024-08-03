let timeoutId;

async function showAlertBox(prompt) {
    if(timeoutId != undefined){
      const alrt = document.getElementsByClassName('alert-container')[0];
      alrt.classList.remove('alert-box-activate');
      clearTimeout(timeoutId);
    }
    const alrt = document.getElementsByClassName('alert-container')[0];
    alrt.innerText=prompt;
    alrt.classList.toggle('alert-box-activate');
    timeoutId = setTimeout(function(){
      alrt.classList.remove('alert-box-activate');
    }, 5000);
  }