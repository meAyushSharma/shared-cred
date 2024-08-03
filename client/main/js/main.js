
var logo = document.getElementById("logo-id");
logo.addEventListener("click", function () {
  navigateToSection("top-here");
});

var about = document.getElementsByClassName("about-container")[0];
about.addEventListener("click", function () {
  navigateToSection("about");
});
var template = document.getElementsByClassName("credential-container")[0];
template.addEventListener("click", function () {
  navigateToSection("credential");
});
var navigate = document.getElementsByClassName("navigate-up")[0];
navigate.addEventListener("click", function () {
  navigateToSection("top-here");
});

function navigateToSection(sectionId) {
  const section = document.getElementById(sectionId);
  section.scrollIntoView({ behavior: "smooth" });
  history.pushState(null, null, "#" + sectionId);
}


// this here is for addUser popup
document.addEventListener('click', e=>{
  const isAddUser = e.target.matches("#button, #button > div, #arrow-down-svg, .add-user");
  if(!isAddUser && e.target.closest('[data-dropdown]')!= null) return;
  let currentDropdown;
  if(isAddUser){
    currentDropdown = e.target.closest('[data-dropdown]');
    currentDropdown.classList.toggle('active')
  }

  document.querySelectorAll('[data-dropdown]').forEach(dropdown =>{
    if(dropdown === currentDropdown){
      return;
    }
    dropdown.classList.remove('active');
  })
});


document.addEventListener('click', e => {
  const ifClickedOn = e.target.matches('path.find-btn-info, .info-btn>svg, .info-btn>svg>path');
  if(!ifClickedOn && e.target.closest(".info-btn") != null ) return;
  let currentDropdown;
  if(ifClickedOn) {
    currentDropdown = e.target.closest('.info-btn');
    currentDropdown.classList.toggle('activated')
  }
  document.querySelectorAll('.info-btn').forEach(dropdown => {
    if(dropdown === currentDropdown) return;
    dropdown.classList.remove('activated')
  })
})


