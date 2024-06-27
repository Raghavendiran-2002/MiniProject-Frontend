// Define the base URL for the API
const IP = "https://backend.raghavendiran.cloud/api";

// Retrieve token and userId from localStorage
const token = localStorage.getItem("token");
const userId = localStorage.getItem("username");

// Event listener for DOMContentLoaded to check token and fetch user data
document.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    handleNoToken();
    return;
  }
  if (userId) {
    await fetchUserData(userId);
  }
});

// Redirect to login page if no token is found
function handleNoToken() {
  console.error("No token found in localStorage");
  window.location.href = "../Login-Page/login.html";
}

// Fetch user data from the server
async function fetchUserData(userId) {
  try {
    const response = await apiGetRequest(
      `/UserProfile/ViewProfile?Id=${userId}`
    );
    if (!response.ok) {
      window.location.href = "../Login-Page/login.html";
    }
    const userData = await response.json();
    populateFormData(userData);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Populate form fields with user data
function populateFormData(userData) {
  document.getElementById("username").value = userData.username;
  document.getElementById("fullname").value = userData.fullName;
  document.getElementById("email").value = userData.email;
  document.getElementById("address").value = userData.address;
  document.getElementById("phonenumber").value = userData.phoneNumber;
  document.getElementById("role").value = userData.role;
}

// Handle form submission to update user profile
async function updateProfile(event) {
  event.preventDefault();
  const updatedData = {
    userId: userId,
    username: document.getElementById("username").value.trim(),
    fullname: document.getElementById("fullname").value.trim(),
    email: document.getElementById("email").value.trim(),
    address: document.getElementById("address").value.trim(),
    phonenumber: document.getElementById("phonenumber").value.trim(),
    role: document.getElementById("role").value.trim(),
  };

  try {
    const response = await apiPostRequest(
      "/UserProfile/UpdateProfile",
      updatedData
    );
    if (!response.ok) {
      throw new Error("Failed to update profile");
    }
    response.json().then((d) => {
      alert("Profile updated successfully!");
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// Make a GET request to the API
async function apiGetRequest(path) {
  const response = await fetch(`${IP}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

// Make a POST request to the API
async function apiPostRequest(path, data) {
  const response = await fetch(`${IP}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response;
}
