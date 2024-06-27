// Define the base URL for the API
var IP = "https://backend.raghavendiran.cloud/api";

// Retrieve the token from local storage
const token = localStorage.getItem("token");

// Initialize the page when the DOM content is loaded
document.addEventListener("DOMContentLoaded", initializePage);

function initializePage() {
  fetchProducts(); // Fetch and display products
  fetchCategories(); // Fetch and display categories
  setupFormSubmissions(); // Setup form submission handlers
}

function setupFormSubmissions() {
  // Add event listener for product form submission
  document
    .getElementById("productForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      saveProduct(); // Save the product
    });
}

async function fetchCategories() {
  // Fetch categories from the API
  const response = await fetch(`${IP}/Category`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const categories = await response.json();
  displayCategories(categories); // Display the fetched categories
}

function displayCategories(categories) {
  const tableBody = document.getElementById("categoryTableBody");
  tableBody.innerHTML = "";
  // Iterate over each category and append to the table
  categories["$values"].forEach((category) => {
    const row = document.createElement("tr");
    row.innerHTML = getCategoryRowHtml(category);
    tableBody.appendChild(row);
  });
}

function getCategoryRowHtml(category) {
  // Return HTML for a category row
  return `
    <td>${category.categoryID}</td>
    <td>${category.categoryName}</td>
    <td>${category.description}</td>
    <td><img src="${category.imageUrl}" alt="${category.categoryName}" width="50"></td>
    <td>
      <button class="btn btn-sm btn-warning" onclick="editCategory(${category.categoryID})">Edit</button>
      <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.categoryID})">Delete</button>
    </td>
  `;
}

async function fetchProducts() {
  // Fetch products from the API
  const response = await fetch(`${IP}/Product`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const products = await response.json();
  displayProducts(products); // Display the fetched products
}

function displayProducts(products) {
  const tableBody = document.getElementById("productTableBody");
  tableBody.innerHTML = "";
  // Iterate over each product and append to the table
  products["$values"].forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = getProductRowHtml(product);
    tableBody.appendChild(row);
  });
}

function getProductRowHtml(product) {
  // Return HTML for a product row
  return `
    <td>${product.productID}</td>
    <td>${product.productName}</td>
    <td>${product.description}</td>
    <td>${product.price}</td>
    <td>${product.stock}</td>
    <td>${product.categoryID}</td>
    <td><img src="${product.imageUrl}" alt="${product.productName}" width="50"></td>
    <td>${product.discountID}</td>
    <td>
      <button class="btn btn-sm btn-warning" onclick="editProduct(${product.productID})">Edit</button>
      <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.productID})">Delete</button>
    </td>
  `;
}

function getAuthHeaders() {
  // Return the authorization headers
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function openAddModal() {
  // Reset the product form and fetch categories and discounts
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  fetchCategoriesAndDiscount();
  const productModal = new bootstrap.Modal(
    document.getElementById("addProductModal")
  );
  productModal.show(); // Show the add product modal
}

async function saveProduct() {
  // Create a product object from form inputs
  const product = {
    productID: document.getElementById("productId").value || null,
    productName: document.getElementById("productName").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    stock: document.getElementById("stock").value,
    categoryID: document.getElementById("categoryId").value,
    imageUrl: document.getElementById("imageUrl").value,
    discountID: document.getElementById("discountId").value,
  };

  // Send a POST request to save the product
  const response = await fetch(`${IP}/Product/AddProduct`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });

  if (response.ok) {
    fetchProducts(); // Refresh the product list
    const productModal = bootstrap.Modal.getInstance(
      document.getElementById("productModal")
    );
    productModal.hide(); // Hide the modal
  } else {
    alert("Error saving product");
  }
}

async function editProduct(productID) {
  // Fetch product details by ID
  const response = await fetch(`${IP}/Product/ById?Id=${productID}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const product = await response.json();

  // Populate the edit form with product details
  document.getElementById("productId").innerHTML = product.productID;
  document.getElementById("editProductName").value = product.productName;
  document.getElementById("editProductDescription").value = product.description;
  document.getElementById("editProductPrice").value = product.price;
  document.getElementById("editProductStock").value = product.stock;
  document.getElementById("editProductImageUrl").value = product.imageUrl;
  const productModal = new bootstrap.Modal(
    document.getElementById("editProductModal")
  );
  productModal.show(); // Show the edit product modal

  // Add event listener for edit form submission
  document
    .getElementById("editProductForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const editProduct = {
        productID: productID,
        productName: document.getElementById("editProductName").value,
        description: document.getElementById("editProductDescription").value,
        price: document.getElementById("editProductPrice").value,
        stock: document.getElementById("editProductStock").value,
        imageUrl: document.getElementById("editProductImageUrl").value,
      };
      const response = await fetch(`${IP}/Product/UpdateProduct`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(editProduct),
      });
      if (response.ok) {
        fetchProducts(); // Refresh the product list
        const productModal = bootstrap.Modal.getInstance(
          document.getElementById("editProductModal")
        );
        productModal.hide(); // Hide the modal
      } else {
        alert("Error editing product");
      }
    });
}

async function deleteProduct(productID) {
  const response = await fetch(`${IP}/Product?Id=${productID}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (response.ok) {
    fetchProducts();
  } else {
    alert("Error deleting product");
  }
}

async function fetchCategoriesAndDiscount() {
  const categorySelect = document.getElementById("categoryId");
  const discountSelect = document.getElementById("discountId");
  categorySelect.innerHTML = "";
  discountSelect.innerHTML = "";
  fetch(`${IP}/Category`, {
    method: "GET",
    headers: getAuthHeaders(),
  })
    .then((response) => response.json())
    .then((data) => {
      data["$values"].forEach((category) => {
        const option = document.createElement("option");
        option.value = category.categoryID;
        option.textContent = category.categoryName;
        categorySelect.appendChild(option);
      });
    });

  fetch(`${IP}/Discount`, {
    method: "GET",
    headers: getAuthHeaders(),
  })
    .then((response) => response.json())
    .then((data) => {
      data["$values"].forEach((discount) => {
        const option = document.createElement("option");
        option.value = discount.discountID;
        option.textContent = discount.discountName;
        discountSelect.appendChild(option);
      });
    });
}

async function addCategory() {
  const category = {
    categoryName: document.getElementById("categoryName").value,
    description: document.getElementById("description").value,
    imageUrl: document.getElementById("imageUrl").value,
  };

  const response = await fetch(`${IP}/Category`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(category),
  });

  if (response.ok) {
    fetchCategories();
    const categoryModal = new bootstrap.Modal(
      document.getElementById("addCategoryModal")
    );
    categoryModal.hide();
  } else {
    alert("Error adding category");
  }
}

document
  .getElementById("addCategoryForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    addCategory();
  });

async function editCategory(categoryID) {
  const response = await fetch(`${IP}/Category/ById?Id=${categoryID}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const category = await response.json();

  document.getElementById("editCategoryId").innerHTML = category.categoryID;
  document.getElementById("editCategoryName").value = category.categoryName;
  document.getElementById("editDescription").value = category.description;
  document.getElementById("editImageUrl").value = category.imageUrl;

  const categoryModal = new bootstrap.Modal(
    document.getElementById("editCategoryModal")
  );
  categoryModal.show();

  document
    .getElementById("editCategoryForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const editCategory = {
        categoryId: categoryID,
        categoryName: document.getElementById("editCategoryName").value,
        description: document.getElementById("editDescription").value,
        imageUrl: document.getElementById("editImageUrl").value,
      };
      const response = await fetch(`${IP}/Category`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(editCategory),
      });
      if (response.ok) {
        fetchCategories();
        const categoryModal = bootstrap.Modal.getInstance(
          document.getElementById("editCategoryModal")
        );
        categoryModal.hide();
      } else {
        alert("Error editing category");
      }
    });
}

async function deleteCategory(categoryID) {
  const response = await fetch(`${IP}/Category?Id=${categoryID}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (response.ok) {
    fetchCategories();
  } else {
    alert("Error deleting category");
  }
}
