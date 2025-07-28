// Fronted/js/profile.js
document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = "http://localhost:8084"; // API base URL

  // Helper to get auth headers
  function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": "Bearer " + token })
    };
  }

  /* --- DOM Elements --- */
  const editPanel = document.getElementById("edit-panel");
  const editPersonalInfoBtn = document.getElementById("edit-personal-info-btn");
  const closeEditBtn = document.getElementById("close-edit-btn");
  const saveEditBtn = document.getElementById("save-edit-btn");

  const profilePicDisplay = document.getElementById("profile-pic");
  const editProfilePhoto = document.getElementById("edit-profile-photo");
  const removePhotoBtn = document.getElementById("remove-photo-btn");
  const editPhotoBtn = document.getElementById("edit-photo-btn"); // For the button on the display side
  const changePhotoBtn = document.getElementById("change-photo-btn"); // For the button in the edit panel

  const displayName = document.getElementById("display-name");
  const displayEmail = document.getElementById("display-email");
  const displayUniversity = document.getElementById("display-university");

  const editNameInput = document.getElementById("edit-name");
  const editEmailInput = document.getElementById("edit-email");
  const editUniversityInput = document.getElementById("edit-university");

  const editSocialLinksBtn = document.getElementById("edit-social-links-btn");
  const socialLinksDisplay = document.getElementById("social-links-display");
  const socialLinksEdit = document.getElementById("social-links-edit");
  const saveSocialLinksBtn = document.getElementById("save-social-links-btn");
  const cancelSocialLinksBtn = document.getElementById("cancel-social-links-btn");

  const linkedinLink = document.getElementById("linkedin-link");
  const githubLink = document.getElementById("github-link");
  const leetcodeLink = document.getElementById("leetcode-link");

  const linkedinInput = document.getElementById("linkedin-input");
  const githubInput = document.getElementById("github-input");
  const leetcodeInput = document.getElementById("leetcode-input");

  const communityList = document.getElementById("community-list");
  const joinCommunityBtn = document.getElementById("join-community-btn");
  const postList = document.getElementById("post-list");


  /* --- Profile Data Fetching and Display --- */
  async function fetchAndDisplayProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, { headers: getAuthHeaders() });
      const userData = await response.json();
      if (response.ok) {
        displayName.textContent = userData.name || "N/A";
        displayEmail.textContent = userData.email || "N/A";
        displayUniversity.textContent = userData.university || "N/A";
        profilePicDisplay.src = userData.profilePic || "https://via.placeholder.com/100?text=No+Image";
        editProfilePhoto.src = userData.profilePic || "https://via.placeholder.com/100?text=No+Image";

        linkedinLink.href = userData.socialLinks?.linkedin || "#";
        linkedinLink.textContent = userData.socialLinks?.linkedin ? "LinkedIn" : "Not set";
        githubLink.href = userData.socialLinks?.github || "#";
        githubLink.textContent = userData.socialLinks?.github ? "GitHub" : "Not set";
        leetcodeLink.href = userData.socialLinks?.leetcode || "#";
        leetcodeLink.textContent = userData.socialLinks?.leetcode ? "LeetCode" : "Not set";

        fetchUserCommunities();
        fetchUserPosts();

      } else {
        console.error("Failed to fetch user profile:", userData.message);
        // Fallback to static or placeholder data
        displayName.textContent = "Gaurav Mishra";
        displayEmail.textContent = "Gaurav@example.com";
        displayUniversity.textContent = "Parul University";
        profilePicDisplay.src = "https://via.placeholder.com/100?text=No+Image";
        editProfilePhoto.src = "https://via.placeholder.com/100?text=No+Image";
        linkedinLink.href = "https://www.linkedin.com";
        linkedinLink.textContent = "LinkedIn";
        githubLink.href = "https://github.com";
        githubLink.textContent = "GitHub";
        leetcodeLink.href = "https://leetcode.com";
        leetcodeLink.textContent = "LeetCode";
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback to static or placeholder data
      displayName.textContent = "Gaurav Mishra";
      displayEmail.textContent = "Gaurav@example.com";
      displayUniversity.textContent = "Parul University";
      profilePicDisplay.src = "https://via.placeholder.com/100?text=No+Image";
      editProfilePhoto.src = "https://via.placeholder.com/100?text=No+Image";
      linkedinLink.href = "https://www.linkedin.com";
      linkedinLink.textContent = "LinkedIn";
      githubLink.href = "https://github.com";
      githubLink.textContent = "GitHub";
      leetcodeLink.href = "https://leetcode.com";
      leetcodeLink.textContent = "LeetCode";
    }
  }

  async function fetchUserCommunities() {
    try {
      const response = await fetch(`${API_BASE_URL}/user/communities/joined`, { headers: getAuthHeaders() });
      const communities = await response.json();
      communityList.innerHTML = "";
      if (response.ok && communities && communities.length > 0) {
        communities.forEach(community => {
          const li = document.createElement("li");
          li.textContent = community.name; // Assuming community object has a 'name' field
          communityList.appendChild(li);
        });
      } else {
        communityList.innerHTML = "<li>Web Development</li><li>AI/ML</li><li>Cybersecurity</li>"; // Static fallback
      }
    } catch (error) {
      console.error("Error fetching user communities:", error);
      communityList.innerHTML = "<li>Web Development</li><li>AI/ML</li><li>Cybersecurity</li>"; // Static fallback
    }
  }

  async function fetchUserPosts() {
    try {
      const response = await fetch(`${API_BASE_URL}/user/posts`, { headers: getAuthHeaders() });
      const posts = await response.json();
      postList.innerHTML = "";
      if (response.ok && posts && posts.length > 0) {
        posts.forEach(post => {
          const li = document.createElement("li");
          li.textContent = post.title; // Assuming post object has a 'title' field
          postList.appendChild(li);
        });
      } else {
        postList.innerHTML = "<li>Lorem ipsum dolor sit amet.</li><li>Consectetur adipiscing elit.</li>"; // Static fallback
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
      postList.innerHTML = "<li>Lorem ipsum dolor sit amet.</li><li>Consectetur adipiscing elit.</li>"; // Static fallback
    }
  }


  /* --- Right-Side Edit Panel Logic (Personal Info) --- */
  editPersonalInfoBtn.addEventListener("click", () => {
    // Pre-fill fields from display values
    editNameInput.value = displayName.textContent;
    editEmailInput.value = displayEmail.textContent;
    editUniversityInput.value = displayUniversity.textContent;
    // Sync photo in edit panel with display photo
    editProfilePhoto.src = profilePicDisplay.src;
    editPanel.classList.add("open");
  });

  closeEditBtn.addEventListener("click", () => {
    editPanel.classList.remove("open");
  });

  saveEditBtn.addEventListener("click", async () => {
    const newName = editNameInput.value.trim();
    const newEmail = editEmailInput.value.trim();
    const newUniversity = editUniversityInput.value.trim();
    const newProfilePic = editProfilePhoto.src; // Assuming this is a base64 string or URL

    const updatedProfile = {
      name: newName,
      email: newEmail,
      university: newUniversity,
      profilePic: newProfilePic // Send this to backend
    };

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT', // or PATCH
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedProfile)
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        // Update display elements directly from fetched data or updated data
        displayName.textContent = newName;
        displayEmail.textContent = newEmail;
        displayUniversity.textContent = newUniversity;
        profilePicDisplay.src = newProfilePic; // Update display pic immediately
        editPanel.classList.remove("open");
      } else {
        const errorData = await response.json();
        alert(`Failed to update profile: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while trying to update your profile.");
    }
  });

  /* --- Profile Photo Editing --- */
  function handlePhotoUpload(imageElement) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imageElement.src = e.target.result;
          // Note: For actual backend storage, you would send this 'e.target.result' (base64)
          // or the 'file' itself to an image upload API endpoint.
          // For this example, we just update the src in the frontend.
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }

  removePhotoBtn.addEventListener("click", function () {
    profilePicDisplay.src = "https://via.placeholder.com/100?text=No+Image";
    editProfilePhoto.src = "https://via.placeholder.com/100?text=No+Image";
    // Call backend API to remove photo if needed
    // fetch(`${API_BASE_URL}/user/profile/photo`, { method: 'DELETE', headers: getAuthHeaders() });
  });

  editPhotoBtn.addEventListener("click", () => handlePhotoUpload(profilePicDisplay));
  changePhotoBtn.addEventListener("click", () => handlePhotoUpload(editProfilePhoto));


  /* --- Social Links Editing Logic --- */
  editSocialLinksBtn.addEventListener("click", () => {
    linkedinInput.value = linkedinLink.href === "#" ? "" : linkedinLink.href;
    githubInput.value = githubLink.href === "#" ? "" : githubLink.href;
    leetcodeInput.value = leetcodeLink.href === "#" ? "" : leetcodeLink.href;
    socialLinksDisplay.style.display = "none";
    socialLinksEdit.style.display = "block";
  });

  saveSocialLinksBtn.addEventListener("click", async () => {
    const linkedinURL = linkedinInput.value.trim();
    const githubURL = githubInput.value.trim();
    const leetcodeURL = leetcodeInput.value.trim();

    const updatedSocialLinks = {
      linkedin: linkedinURL,
      github: githubURL,
      leetcode: leetcodeURL
    };

    try {
      const response = await fetch(`${API_BASE_URL}/user/social-links`, {
        method: 'PUT', // or PATCH
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedSocialLinks)
      });
console.log("Response:", response);
      if (response.ok) {
        alert("Social links updated successfully!");

        linkedinLink.href = linkedinURL || "#";
        linkedinLink.textContent = linkedinURL ? "LinkedIn" : "Not set";
        githubLink.href = githubURL || "#";
        githubLink.textContent = githubURL ? "GitHub" : "Not set";
        leetcodeLink.href = leetcodeURL || "#";
        leetcodeLink.textContent = leetcodeURL ? "LeetCode" : "Not set";
        socialLinksEdit.style.display = "none";
        socialLinksDisplay.style.display = "block";
      } else {
        const errorData = await response.json();
        alert(`Failed to update social links: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating social links:", error);
      alert("An error occurred while trying to update your social links.");
    }
  });

  cancelSocialLinksBtn.addEventListener("click", () => {
    socialLinksEdit.style.display = "none";
    socialLinksDisplay.style.display = "block";
  });

  /* --- Join New Community Logic (on Profile Page) --- */
  joinCommunityBtn.addEventListener("click", async () => {
    const communityName = prompt("Enter the name of the community you want to join:");
    if (communityName) {
      try {
        // Example: Find community by name and then join it (requires a search API)
        const searchResponse = await fetch(`${API_BASE_URL}/communities/search?name=${encodeURIComponent(communityName)}`, { headers: getAuthHeaders() });
        const searchResults = await searchResponse.json();

        if (searchResponse.ok && searchResults.length > 0) {
          const communityToJoin = searchResults[0]; // Take the first match
          const joinResponse = await fetch(`${API_BASE_URL}/user/communities/join`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ communityId: communityToJoin.id })
          });

          if (joinResponse.ok) {
            alert(`Successfully joined ${communityToJoin.name}!`);
            fetchUserCommunities(); // Refresh the list
          } else {
            const errorData = await joinResponse.json();
            alert(`Failed to join: ${errorData.message || joinResponse.statusText}`);
          }
        } else {
          alert(`Community "${communityName}" not found.`);
        }
      } catch (error) {
        console.error("Error joining community from profile:", error);
        alert("An error occurred while trying to join the community.");
      }
    }
  });

  // Initial fetch of profile data, communities, and posts when the page loads
  fetchAndDisplayProfile();
});