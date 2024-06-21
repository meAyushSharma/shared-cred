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
