// var IP = "http://localhost:8000/api";
const IP = "https://backend.raghavendiran.cloud/api";

const token = localStorage.getItem("token");
const userId = localStorage.getItem("username");

document.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    handleNoToken();
    return;
  }
  if (userId) {
    await fetchUserData(userId);
  }
});

function handleNoToken() {
  console.error("No token found in localStorage");
  window.location.href = "../Login-Page/login.html";
}

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

function populateFormData(userData) {
  document.getElementById("username").value = userData.username;
  document.getElementById("fullname").value = userData.fullName;
  document.getElementById("email").value = userData.email;
  document.getElementById("address").value = userData.address;
  document.getElementById("phonenumber").value = userData.phoneNumber;
  document.getElementById("role").value = userData.role;
}

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
