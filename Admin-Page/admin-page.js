var IP = "http://localhost:8000/api";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  fetchCategories();
  document
    .getElementById("productForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      saveProduct();
    });
});

async function fetchCategories() {
  const response = await fetch(`${IP}/Category`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const categories = await response.json();
  const tableBody = document.getElementById("categoryTableBody");
  tableBody.innerHTML = "";
  categories["$values"].forEach((category) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${category.categoryID}</td>
            <td>${category.categoryName}</td>
            <td>${category.description}</td>
            <td><img src="${category.imageUrl}" alt="${category.categoryName}" width="50"></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editCategory(${category.categoryID})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.categoryID})">Delete</button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

async function fetchProducts() {
  const response = await fetch(`${IP}/Product`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const products = await response.json();
  const tableBody = document.getElementById("productTableBody");
  tableBody.innerHTML = "";

  products["$values"].forEach((product) => {
    const row = document.createElement("tr");

    row.innerHTML = `
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
    tableBody.appendChild(row);
  });
}

function openAddModal() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  fetchCategoriesAndDiscount();
  const productModal = new bootstrap.Modal(
    document.getElementById("productModal")
  );
  productModal.show();
}

async function saveProduct() {
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

  const response = await fetch(`${IP}/Product/AddProduct`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (response.ok) {
    fetchProducts();
    const productModal = bootstrap.Modal.getInstance(
      document.getElementById("productModal")
    );
    productModal.hide();
  } else {
    alert("Error saving product");
  }
}

async function editProduct(productID) {
  const response = await fetch(`${IP}/Product/ById?Id=${productID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const product = await response.json();

  document.getElementById("productId").value = product.productID;
  document.getElementById("productName").value = product.productName;
  document.getElementById("description").value = product.description;
  document.getElementById("price").value = product.price;
  document.getElementById("stock").value = product.stock;
  document.getElementById("categoryId").value = product.categoryID;
  document.getElementById("imageUrl").value = product.imageUrl;
  document.getElementById("discountId").value = product.discountID;

  const productModal = new bootstrap.Modal(
    document.getElementById("productModal")
  );
  productModal.show();
}

async function deleteProduct(productID) {
  const response = await fetch(`${IP}/Product?Id=${productID}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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

// Add Category
async function addCategory() {
  const category = {
    categoryName: document.getElementById("categoryName").value,
    description: document.getElementById("description").value,
    imageUrl: document.getElementById("imageUrl").value,
  };

  const response = await fetch(`${IP}/Category`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });

  if (response.ok) {
    fetchCategories();
    $("#addCategoryModal").modal("hide");
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

// Edit Category
async function editCategory(categoryID) {
  const response = await fetch(`${IP}/Category/ById?Id=${categoryID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const category = await response.json();

  document.getElementById("editCategoryId").value = category.categoryID;
  document.getElementById("editCategoryName").value = category.categoryName;
  document.getElementById("editDescription").value = category.description;
  document.getElementById("editImageUrl").value = category.imageUrl;

  const categoryModal = new bootstrap.Modal(
    document.getElementById("editCategoryModal")
  );
  categoryModal.show();
}

// Delete Category
async function deleteCategory(categoryID) {
  const response = await fetch(`${IP}/Category?Id=${categoryID}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application.json",
    },
  });

  if (response.ok) {
    fetchCategories();
  } else {
    alert("Error deleting category");
  }
}
