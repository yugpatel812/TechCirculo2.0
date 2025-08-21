// js/profile.js - Enhanced profile management with backend-compatible endpoints
document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = "http://localhost:8084"; // API base URL

  // 🔑 Reusable header helpers
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

function getAuthHeadersMultipart() {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Bearer ${token}` // browser sets boundary
  };
}

  // Enhanced notification system
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
        type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
            'linear-gradient(135deg, #f59e0b, #d97706)'};
        color: white;
        padding: 1.25rem 1.75rem;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        z-index: 1000;
        font-weight: 600;
        font-size: 0.875rem;
        max-width: 400px;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-family: 'Inter', sans-serif;
    `;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.25rem; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.2); border-radius: 50%;">${icon}</span>
            <span style="line-height: 1.4;">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 400);
    }, 4500);
  }

  /* --- DOM Elements --- */
  const editPanel = document.getElementById("edit-panel");
  const editPersonalInfoBtn = document.getElementById("edit-personal-info-btn");
  const closeEditBtn = document.getElementById("close-edit-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const saveEditBtn = document.getElementById("save-edit-btn");

  const profilePicDisplay = document.getElementById("profile-pic");
  const editProfilePhoto = document.getElementById("edit-profile-photo");
  const removePhotoBtn = document.getElementById("remove-photo-btn");
  const editPhotoBtn = document.getElementById("edit-photo-btn");
  const changePhotoBtn = document.getElementById("change-photo-btn");

  const displayName = document.getElementById("display-name");
  const displayEmail = document.getElementById("display-email");
  const displayUniversity = document.getElementById("display-university");
  const displayMajor = document.getElementById("display-major");
  const displayLocation = document.getElementById("display-location");
  const displayBio = document.getElementById("display-bio");

  const editNameInput = document.getElementById("edit-name");
  const editEmailInput = document.getElementById("edit-email");
  const editUniversityInput = document.getElementById("edit-university");
  const editMajorInput = document.getElementById("edit-major");
  const editLocationInput = document.getElementById("edit-location");
  const editBioInput = document.getElementById("edit-bio");

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
      // ✅ Updated to match backend endpoint: GET /profile
      const response = await fetch(`${API_BASE_URL}/profile`, { headers: getAuthHeaders() });
      const userData = await response.json();
      
      if (response.ok) {
        displayName.textContent = userData.name || "Guest User";
        displayEmail.textContent = userData.email || "guest@university.edu";
        displayUniversity.textContent = userData.university || "Tech University";
        displayMajor.textContent = userData.major || "Computer Science";
        displayLocation.textContent = userData.location || "San Francisco, CA";
        displayBio.textContent = userData.bio || "Passionate computer science student interested in web development, AI, and cybersecurity.";

        // Backend returns profilePicUrl field
        profilePicDisplay.src = userData.profilePicUrl || "https://via.placeholder.com/120x120?text=GU";
        editProfilePhoto.src = userData.profilePicUrl || "https://via.placeholder.com/80x80?text=GU";

        // Update social links - backend returns direct URLs
        updateSocialLink(linkedinLink, userData.linkedinUrl, "LinkedIn");
        updateSocialLink(githubLink, userData.githubUrl, "GitHub");
        updateSocialLink(leetcodeLink, userData.leetcodeUrl, "LeetCode");

        fetchUserCommunities();
        fetchUserPosts();

      } else {
        console.error("Failed to fetch user profile:", userData.message);
        setFallbackData();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setFallbackData();
    }
  }

  function setFallbackData() {
    displayName.textContent = "Guest User";
    displayEmail.textContent = "guest@university.edu";
    displayUniversity.textContent = "Tech University";
    displayMajor.textContent = "Computer Science";
    displayLocation.textContent = "San Francisco, CA";
    displayBio.textContent = "Passionate computer science student interested in web development, AI, and cybersecurity.";

    profilePicDisplay.src = "https://via.placeholder.com/120x120?text=GU";
    editProfilePhoto.src = "https://via.placeholder.com/80x80?text=GU";

    updateSocialLink(linkedinLink, "https://www.linkedin.com", "LinkedIn");
    updateSocialLink(githubLink, "https://github.com", "GitHub");
    updateSocialLink(leetcodeLink, "https://leetcode.com", "LeetCode");
  }

  function updateSocialLink(element, url, defaultText) {
    if (url && url !== "#" && url.trim() !== "") {
      element.href = url;
      element.querySelector('span').textContent = defaultText;
    } else {
      element.href = "#";
      element.querySelector('span').textContent = `${defaultText} (Not set)`;
    }
  }

  async function fetchUserCommunities() {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/join`, { headers: getAuthHeaders() });
      const communities = await response.json();
      console.log(communities);
      
      communityList.innerHTML = "";
      if (response.ok && communities && communities.length > 0) {
        communities.forEach(community => {
          const li = document.createElement("li");
          li.className = "community-item";
          li.innerHTML = `
            <div class="community-info">
              <div class="community-name">${community.name}</div>
              <div class="community-meta">
  ${community.role || 'Member'} • ${community.joinedAt 
      ? new Date(community.joinedAt).toLocaleDateString() 
      : 'Recently'}
</div>

            </div>
          `;
          communityList.appendChild(li);
        });
      } else {
        // Static fallback
        communityList.innerHTML = `
          <li class="community-item">
            <div class="community-info">
              <div class="community-name">Web Development</div>
              <div class="community-meta">Member • Sept 2023</div>
            </div>
          </li>
          <li class="community-item">
            <div class="community-info">
              <div class="community-name">AI/ML Research</div>
              <div class="community-meta">Member • Oct 2023</div>
            </div>
          </li>
          <li class="community-item">
            <div class="community-info">
              <div class="community-name">Cybersecurity</div>
              <div class="community-meta">Member • Nov 2023</div>
            </div>
          </li>
        `;
      }
    } catch (error) {
      console.error("Error fetching user communities:", error);
      // Static fallback
      communityList.innerHTML = `
        <li class="community-item">
          <div class="community-info">
            <div class="community-name">Web Development</div>
            <div class="community-meta">Member • Sept 2023</div>
          </div>
        </li>
        <li class="community-item">
          <div class="community-info">
            <div class="community-name">AI/ML Research</div>
            <div class="community-meta">Member • Oct 2023</div>
          </div>
        </li>
        <li class="community-item">
          <div class="community-info">
            <div class="community-name">Cybersecurity</div>
            <div class="community-meta">Member • Nov 2023</div>
          </div>
        </li>
      `;
    }
  }

async function fetchUserPosts() {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/my-posts?page=0&size=5`, {
      headers: getAuthHeaders()
    });
    const data = await response.json(); // Spring Page object
    const posts = data.content; // Extract list

    postList.innerHTML = "";

    if (response.ok && posts && posts.length > 0) {
      posts.forEach(post => {
        const li = document.createElement("li");
        li.className = "post-item";
        li.innerHTML = `
          <div class="post-title">${post.title}</div>
          <div class="post-meta">${post.timeAgo || 'Recently'} • ${post.comments || 0} comments</div>
        `;
        postList.appendChild(li);
      });
    } else {
      postList.innerHTML = `<li class="post-item">No recent posts</li>`;
    }
  } catch (error) {
    console.error("Error fetching user posts:", error);
    postList.innerHTML = `<li class="post-item">Failed to load posts</li>`;
  }
}


  /* --- Modal Logic --- */
  function openModal() {
    // Pre-fill fields from display values
    editNameInput.value = displayName.textContent;
    editEmailInput.value = displayEmail.textContent;
    editUniversityInput.value = displayUniversity.textContent;
    editMajorInput.value = displayMajor.textContent;
    editLocationInput.value = displayLocation.textContent;
    editBioInput.value = displayBio.textContent;
    // Sync photo in edit panel with display photo
    editProfilePhoto.src = profilePicDisplay.src;
    editPanel.classList.add("open");
  }

  function closeModal() {
    editPanel.classList.remove("open");
  }

  editPersonalInfoBtn.addEventListener("click", openModal);
  closeEditBtn.addEventListener("click", closeModal);
  cancelEditBtn.addEventListener("click", closeModal);

  // Close modal when clicking on overlay
  editPanel.addEventListener("click", (e) => {
    if (e.target === editPanel) {
      closeModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && editPanel.classList.contains("open")) {
      closeModal();
    }
  });

  saveEditBtn.addEventListener("click", async () => {
    const newName = editNameInput.value.trim();
    const newEmail = editEmailInput.value.trim();
    const newUniversity = editUniversityInput.value.trim();
    const newMajor = editMajorInput.value.trim();
    const newLocation = editLocationInput.value.trim();
    const newBio = editBioInput.value.trim();
    const newProfilePicUrl = editProfilePhoto.src;

    if (!newName || !newEmail) {
      showNotification("Name and email are required.", 'error');
      return;
    }

    // ✅ Updated to include ALL fields that backend now supports
    const updatedPersonalInfo = {
      name: newName,
      email: newEmail,
      university: newUniversity,
      major: newMajor,
      location: newLocation,
      bio: newBio,
      profilePicUrl: newProfilePicUrl
    };

    // Show loading state
    saveEditBtn.textContent = "Saving...";
    saveEditBtn.disabled = true;

    try {
      // ✅ Updated to match backend endpoint: PUT /profile/personal-info
      const response = await fetch(`${API_BASE_URL}/profile/personal-info`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedPersonalInfo)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        showNotification("Personal info updated successfully!", 'success');
        
        // ✅ Better null handling with fallbacks
        displayName.textContent = updatedProfile.name || newName || "Guest User";
        displayEmail.textContent = updatedProfile.email || newEmail || "No email provided";
        displayUniversity.textContent = updatedProfile.university || newUniversity || "University not specified";
        displayMajor.textContent = updatedProfile.major || newMajor || "Major not specified";
        displayLocation.textContent = updatedProfile.location || newLocation || "Location not specified";
        displayBio.textContent = updatedProfile.bio || newBio || "No bio provided";
        
        // Handle profile picture with proper URL construction
        if (updatedProfile.profilePicUrl) {
          const profilePicUrl = updatedProfile.profilePicUrl.startsWith('http') 
            ? updatedProfile.profilePicUrl 
            : `${API_BASE_URL}${updatedProfile.profilePicUrl}`;
          profilePicDisplay.src = profilePicUrl;
        } else if (newProfilePicUrl) {
          profilePicDisplay.src = newProfilePicUrl;
        }
        
        closeModal();
      }else {
        const errorData = await response.json();
        showNotification(`Failed to update personal info: ${errorData.message || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error("Error updating personal info:", error);
      showNotification("An error occurred while updating your personal info.", 'error');
    } finally {
      saveEditBtn.textContent = "Save Changes";
      saveEditBtn.disabled = false;
    }
  });
  /* --- Profile Photo Editing --- */
  function handlePhotoUpload(imageElement) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

   fileInput.onchange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  console.log("File details:", {
    name: file.name,
    size: file.size,
    type: file.type
  });

  if (file.size > 5 * 1024 * 1024) {
    showNotification("Image size should be less than 5MB.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  
  // Debug: Log FormData contents
  for (let pair of formData.entries()) {
    console.log("FormData:", pair[0], pair[1]);
  }

  console.log("Token exists:", !!localStorage.getItem("token"),"and token is",localStorage.getItem("token"));


  try {
    const res = await fetch(`${API_BASE_URL}/profile/profile-pic`, {
      method: "POST",
      headers: getAuthHeadersMultipart(),
      body: formData,
    });

    console.log(res);
    
    console.log("Response status:", res.status);
    console.log("Response headers:", [...res.headers.entries()]);

    if (res.ok) {
      const data = await res.json();
      const newProfilePicUrl = API_BASE_URL + data.profilePicUrl; // prepend API base

      imageElement.src = newProfilePicUrl;
      profilePicDisplay.src = newProfilePicUrl;
      editProfilePhoto.src = newProfilePicUrl;

      showNotification("Photo uploaded successfully!", "success");
    } else {
      const errorData = await res.json();
      
  console.error("Upload failed response:", errorData);
      showNotification(`Upload failed: ${errorData.message || res.statusText}`, "error");
    }
  } catch (err) {
    console.error(err);
    showNotification("An error occurred during upload.", "error");
  }
};


    fileInput.click();
  }

  removePhotoBtn.addEventListener("click", async function () {
    try {
      // Create a placeholder file to upload
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 120, 120);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GU', 60, 65);

      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("file", blob, "/images/profil_pic.png");

        try {
          const res = await fetch(`${API_BASE_URL}/profile/profile-pic`, {
            method: "PUT",
            headers: getAuthHeadersMultipart(),
            body: formData
          });

          if (res.ok) {
            const data = await res.json();
            const placeholderUrl = data.profilePicUrl;
            profilePicDisplay.src = placeholderUrl;
            editProfilePhoto.src = placeholderUrl;
            showNotification("Photo removed successfully!", 'success');
          }
        } catch (error) {
          console.error("Error removing photo:", error);
          // Fallback to placeholder URLs
          const placeholderSrc = "https://via.placeholder.com/120x120?text=GU";
          profilePicDisplay.src = placeholderSrc;
          editProfilePhoto.src = "https://via.placeholder.com/80x80?text=GU";
          showNotification("Photo removed successfully!", 'success');
        }
      });
    } catch (error) {
      // Fallback to placeholder URLs
      const placeholderSrc = "https://via.placeholder.com/120x120?text=GU";
      profilePicDisplay.src = placeholderSrc;
      editProfilePhoto.src = "https://via.placeholder.com/80x80?text=GU";
      showNotification("Photo removed successfully!", 'success');
    }
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
    const linkedinUrl = linkedinInput.value.trim();
    const githubUrl = githubInput.value.trim();
    const leetcodeUrl = leetcodeInput.value.trim();

    // Simple URL validation
    const isValidUrl = (url) => {
      if (!url) return true; // Empty is valid
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    if (!isValidUrl(linkedinUrl) || !isValidUrl(githubUrl) || !isValidUrl(leetcodeUrl)) {
      showNotification("Please enter valid URLs.", 'error');
      return;
    }

    // ✅ Updated to match backend SocialLinksRequest DTO
    const updatedSocialLinks = {
      linkedinUrl: linkedinUrl,
      githubUrl: githubUrl,
      leetcodeUrl: leetcodeUrl
    };

    // Show loading state
    saveSocialLinksBtn.textContent = "Saving...";
    saveSocialLinksBtn.disabled = true;

    try {
      // ✅ Updated to match backend endpoint: PUT /profile/social-links
      const response = await fetch(`${API_BASE_URL}/profile/social-links`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedSocialLinks)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        showNotification("Social links updated successfully!", 'success');

        // Update social links with backend response
        updateSocialLink(linkedinLink, updatedProfile.linkedinUrl, "LinkedIn");
        updateSocialLink(githubLink, updatedProfile.githubUrl, "GitHub");
        updateSocialLink(leetcodeLink, updatedProfile.leetcodeUrl, "LeetCode");

        socialLinksEdit.style.display = "none";
        socialLinksDisplay.style.display = "block";
      } else {
        const errorData = await response.json();
        showNotification(`Failed to update social links: ${errorData.message || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error("Error updating social links:", error);
      showNotification("An error occurred while updating your social links.", 'error');
    } finally {
      saveSocialLinksBtn.textContent = "Save Changes";
      saveSocialLinksBtn.disabled = false;
    }
  });

  cancelSocialLinksBtn.addEventListener("click", () => {
    socialLinksEdit.style.display = "none";
    socialLinksDisplay.style.display = "block";
  });



  // Initialize the page
  fetchAndDisplayProfile();
});