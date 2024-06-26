var IP = "http://localhost:8000/api";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);

  if (!token) {
    console.error("No token found in localStorage");
    window.location.href = "../Login-Page/login.html";
    return;
  }
  const userId = params.get("userid");
  if (userId) {
    await fetchUserData(userId);
  }
});

async function fetchUserData(userId) {
  try {
    const response = await fetch(`${IP}/UserProfile/ViewProfile?Id=${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
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
  const userId = new URLSearchParams(window.location.search).get("userid");
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
    const response = await fetch(`${IP}/UserProfile/UpdateProfile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

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
