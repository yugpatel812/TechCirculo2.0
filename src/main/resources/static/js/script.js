// Sample data
const userData = {
  name: "Yash Mac",
  college: "Parul University",
  profilePic:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  socialLinks: {
    linkedin: "https://linkedin.com/in/Yashmac",
    github: "https://github.com/yashmac",
  },
};

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".slider");

  // Clone the first few items for a seamless loop
  const clone = slider.innerHTML;
  slider.innerHTML += clone;

  slider.style.animation = "scroll 10s linear infinite";
});

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".slider");

  slider.addEventListener("mouseenter", () => {
    slider.style.animationPlayState = "paused";
  });

  slider.addEventListener("mouseleave", () => {
    slider.style.animationPlayState = "running";
  });
});
function likePost(btn) {
  if (btn.innerText.includes("Liked")) {
      btn.innerText = "Like ❤️";
  } else {
      btn.innerText = "Liked ✅";
  }
}
function sharePost() {
  alert("Post shared successfully!");
}
function toggleJoin(btn) {
  if (btn.innerText.includes("Join")) {
      btn.innerText = "Leave Community";
      btn.classList.add("joined");
      
  } else {
      btn.innerText = "Join Community";
      btn.classList.remove("joined");
  }
}


const communities = [
  {
    id: 1,
    name: "Web Development",
    description:
      "Share knowledge and stay updated with latest web technologies",
    memberCount: "2.4k",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop",
  },
  // Add more communities as needed
];

// Update notification badge count
function updateNotificationCount(count) {
  const badges = document.querySelectorAll(".badge");
  badges.forEach((badge) => {
    badge.textContent = count;
  });
}

// Toggle notifications panel
const notificationsBtn = document.querySelector(".notifications-btn");
if (notificationsBtn) {
  notificationsBtn.addEventListener("click", () => {
    // Add your notification panel toggle logic here
    console.log("Toggle notifications panel");
  });
}

// Search communities
const searchInput = document.querySelector(".search input");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    // Add your search logic here
    console.log("Searching for:", searchTerm);
  });
}

// Initialize the dashboard
function initDashboard() {
  // Update user profile
  document.querySelector(".user-profile span").textContent = userData.name;
  document.querySelector(".profile-details h1").textContent = userData.name;
  document.querySelector(".profile-details p").textContent = userData.college;

  // Set initial notification count
  updateNotificationCount(5);
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", initDashboard);
