// var IP = "http://localhost:8000/api";
var IP = "https://backend.raghavendiran.cloud/api";

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get("categoryId");
  if (!categoryId) {
    alert("Category ID is missing");
    return;
  }
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }
  fetchCategoryDetails(categoryId, token);
  fetchCategoryProducts(categoryId, token);
});

function fetchCategoryDetails(categoryId, token) {
  fetch(`${IP}/Category/ById?Id=${categoryId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((category) => {
      displayCategoryDetails(category);
    })
    .catch((error) => console.error("Error fetching category details:", error));
}

function displayCategoryDetails(category) {
  document.querySelector(".category-container").innerHTML = `
    <h1 class="mb-4">${category.categoryName}</h1>
    <p>${category.description}</p>`;
}

function fetchCategoryProducts(categoryId, token) {
  fetch(`${IP}/Product/FilterCategoryId?categoryId=${categoryId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((products) => {
      displayCategoryProducts(products["$values"]);
    })
    .catch((error) => console.error("Error fetching products:", error));
}

function displayCategoryProducts(products) {
  const container = document.querySelector(".products-container");
  container.innerHTML = "";

  products.forEach((product) => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.classList.add("col-md-4", "mb-4");
  card.innerHTML = `
    <div class="card">
      <img src="${
        product.imageUrl
          ? product.imageUrl
          : "https://via.placeholder.com/300x200.png?text=Product"
      }" class="card-img-top" alt="${
    product.productName
  }" style="height: 300px;">
      <div class="card-body">
        <h5 class="card-title">${product.productName}</h5>
        <p class="card-text">${product.description}</p>
        <p class="card-text">$${product.price}</p>
      </div>
    </div>`;
  card.addEventListener("click", () => {
    window.location.href = `../Product-Page/product.html?productId=${product.productID}`;
  });
  return card;
}
