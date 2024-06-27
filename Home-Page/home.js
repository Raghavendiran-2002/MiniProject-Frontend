// var IP = "http://localhost:8000/api";
var IP = "https://backend.raghavendiran.cloud/api";

// Redirect to the landing page if no token is found in local storage
if (!localStorage.getItem("token")) {
  window.location.href = "../Landing-Page/landing.html";
}

// Function to log out the user
async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "../Landing-Page/landing.html";
}

// Function to search for products
async function searchProduct(event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }
  const productName = document.getElementById("productName").value.trim();
  try {
    const response = await fetch(
      `${IP}/Product/GetProductByName?productName=${productName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const products = await response.json();
    console.log(products);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("product-grid");
  const searchBar = document.getElementById("search-bar");
  const categoryGrid = document.getElementById("category-grid");

  // Fetch products and categories
  fetchProducts();
  fetchCategories();

  // Add event listener to search bar
  searchBar.addEventListener("input", (e) => {
    const query = e.target.value;
    if (query.length >= 4) {
      filterProducts(query);
    }
  });
});

// Function to fetch products
async function fetchProducts() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }
  try {
    const response = await fetch(`${IP}/Product`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const products = await response.json();
    displayProducts(products["$values"]);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Function to fetch categories
async function fetchCategories() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }
  try {
    const response = await fetch(`${IP}/Category`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const categories = await response.json();
    displayCategories(categories["$values"]);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

// Function to display products
function displayProducts(products) {
  productGrid.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "me-4 mt-3";
    card.classList.add("product-cart", "card");
    card.innerHTML = ` 
          <img src=" ${
            product.imageUrl
              ? product.imageUrl
              : "https://via.placeholder.com/300x200.png?text=Product"
          }"
          class="card-img-top" alt="https://via.placeholder.com/300x200" style="width:100%;height:65%;">
          <div class="card-body">
          <h5 class="card-title">${product.productName}</h5>
          <p class="card-text">$${product.price}</p>
          <p class="card-text">${product.description}</p>
          </div>`;
    card.addEventListener("click", () => {
      window.location.href = `../Product-Page/product.html?productId=${product.productID}`;
    });
    productGrid.appendChild(card);
  });
}

// Function to display categories
function displayCategories(categories) {
  categoryGrid.innerHTML = "";
  categories.forEach((category) => {
    const card = document.createElement("div");
    card.className = "card col-lg-2 col-md-6 ms-2 me-2";
    card.classList.add("category-cart", "card");
    card.innerHTML = `
          <img src=" ${
            category.imageUrl
              ? category.imageUrl
              : "https://via.placeholder.com/300x200.png?text=Category"
          }"
          class="card-img-top" alt="https://via.placeholder.com/300x200" style="width:100%;height:65%;">
          <div class="card-body">
            <h5 class="card-title">${category.categoryName}</h5>
            <p class="card-text">${category.description}</p>
          </div>`;
    card.addEventListener("click", () => {
      window.location.href = `../Category-Page/category.html?categoryId=${category.categoryID}`;
    });
    categoryGrid.appendChild(card);
  });
}

// Function to filter products
async function filterProducts(query) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }
  try {
    const response = await fetch(
      `${IP}/Product/GetProductByName?productName=${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const products = await response.json();
    if (products["errorcode"] == 401) return;
    const filteredProducts = products["$values"].filter((product) =>
      product.productName.toLowerCase().includes(query.toLowerCase())
    );
    displayProducts(filteredProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}
