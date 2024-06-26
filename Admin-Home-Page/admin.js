document.addEventListener("DOMContentLoaded", function () {
  const images = document.querySelectorAll(".clickable-image");

  images.forEach((image) => {
    image.addEventListener("click", function () {
      alert(`You clicked on ${this.alt}`);
    });
  });
});
