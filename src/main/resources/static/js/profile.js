// js/profile.js - Enhanced profile management with modern UI
document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = window.location.origin; // API base URL

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
      const response = await fetch(`${API_BASE_URL}/user/profile`, { headers: getAuthHeaders() });
      const userData = await response.json();
      if (response.ok) {
        displayName.textContent = userData.name || "Guest User";
        displayEmail.textContent = userData.email || "guest@university.edu";
        displayUniversity.textContent = userData.university || "Tech University";
        displayMajor.textContent = userData.major || "Computer Science";
        displayLocation.textContent = userData.location || "San Francisco, CA";
        displayBio.textContent = userData.bio || "Passionate computer science student interested in web development, AI, and cybersecurity.";

        profilePicDisplay.src = userData.profilePic || "https://via.placeholder.com/120x120?text=GU";
        editProfilePhoto.src = userData.profilePic || "https://via.placeholder.com/80x80?text=GU";

        // Update social links
        updateSocialLink(linkedinLink, userData.socialLinks?.linkedin, "LinkedIn");
        updateSocialLink(githubLink, userData.socialLinks?.github, "GitHub");
        updateSocialLink(leetcodeLink, userData.socialLinks?.portfolio || userData.socialLinks?.leetcode, "Portfolio");

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
    updateSocialLink(leetcodeLink, "https://leetcode.com", "Portfolio");
  }

  function updateSocialLink(element, url, defaultText) {
    if (url && url !== "#") {
      element.href = url;
      element.querySelector('span').textContent = defaultText;
    } else {
      element.href = "#";
      element.querySelector('span').textContent = `${defaultText} (Not set)`;
    }
  }

  async function fetchUserCommunities() {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/user/communities/joined`, { headers: getAuthHeaders() });
      const communities = await response.json();
      communityList.innerHTML = "";
      if (response.ok && communities && communities.length > 0) {
        communities.forEach(community => {
          const li = document.createElement("li");
          li.className = "community-item";
          li.innerHTML = `
            <div class="community-info">
              <div class="community-name">${community.name}</div>
              <div class="community-meta">Member • ${community.joinedDate || 'Recently'}</div>
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
      const response = await fetch(`${API_BASE_URL}/api/posts/user`, { headers: getAuthHeaders() });
      const posts = await response.json();
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
        // Static fallback
        postList.innerHTML = `
          <li class="post-item">
            <div class="post-title">React Best Practices Discussion</div>
            <div class="post-meta">2 hours ago • 5 comments</div>
          </li>
          <li class="post-item">
            <div class="post-title">CSS Grid vs Flexbox - When to use what?</div>
            <div class="post-meta">1 day ago • 12 comments</div>
          </li>
        `;
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
      // Static fallback
      postList.innerHTML = `
        <li class="post-item">
          <div class="post-title">React Best Practices Discussion</div>
          <div class="post-meta">2 hours ago • 5 comments</div>
        </li>
        <li class="post-item">
          <div class="post-title">CSS Grid vs Flexbox - When to use what?</div>
          <div class="post-meta">1 day ago • 12 comments</div>
        </li>
      `;
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
    const newProfilePic = editProfilePhoto.src;

    if (!newName || !newEmail) {
      showNotification("Name and email are required.", 'error');
      return;
    }

    const updatedProfile = {
      name: newName,
      email: newEmail,
      university: newUniversity,
      major: newMajor,
      location: newLocation,
      bio: newBio,
      profilePic: newProfilePic
    };

    // Show loading state
    saveEditBtn.textContent = "Saving...";
    saveEditBtn.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedProfile)
      });

      if (response.ok) {
        showNotification("Profile updated successfully!", 'success');
        // Update display elements
        displayName.textContent = newName;
        displayEmail.textContent = newEmail;
        displayUniversity.textContent = newUniversity;
        displayMajor.textContent = newMajor;
        displayLocation.textContent = newLocation;
        displayBio.textContent = newBio;
        profilePicDisplay.src = newProfilePic;
        closeModal();
      } else {
        const errorData = await response.json();
        showNotification(`Failed to update profile: ${errorData.message || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("An error occurred while updating your profile.", 'error');
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
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          showNotification("Image size should be less than 5MB.", 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          imageElement.src = e.target.result;
          showNotification("Photo updated successfully!", 'success');
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }

  removePhotoBtn.addEventListener("click", function () {
    const placeholderSrc = "https://via.placeholder.com/120x120?text=GU";
    profilePicDisplay.src = placeholderSrc;
    editProfilePhoto.src = "https://via.placeholder.com/80x80?text=GU";
    showNotification("Photo removed successfully!", 'success');
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
    const portfolioURL = leetcodeInput.value.trim();

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

    if (!isValidUrl(linkedinURL) || !isValidUrl(githubURL) || !isValidUrl(portfolioURL)) {
      showNotification("Please enter valid URLs.", 'error');
      return;
    }

    const updatedSocialLinks = {
      linkedin: linkedinURL,
      github: githubURL,
      portfolio: portfolioURL
    };

    // Show loading state
    saveSocialLinksBtn.textContent = "Saving...";
    saveSocialLinksBtn.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/user/social-links`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedSocialLinks)
      });

      if (response.ok) {
        showNotification("Social links updated successfully!", 'success');

        updateSocialLink(linkedinLink, linkedinURL, "LinkedIn");
        updateSocialLink(githubLink, githubURL, "GitHub");
        updateSocialLink(leetcodeLink, portfolioURL, "Portfolio");

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

  /* --- Join New Community Logic --- */
  joinCommunityBtn.addEventListener("click", async () => {
    const communityName = prompt("Enter the name of the community you want to join:");
    if (communityName && communityName.trim()) {
      // Show loading state
      joinCommunityBtn.textContent = "Searching...";
      joinCommunityBtn.disabled = true;

      try {
        const searchResponse = await fetch(`${API_BASE_URL}/communities/search?name=${encodeURIComponent(communityName.trim())}`, { headers: getAuthHeaders() });
        const searchResults = await searchResponse.json();

        if (searchResponse.ok && searchResults && searchResults.length > 0) {
          const community = searchResults[0]; // Take the first match

          const joinResponse = await fetch(`${API_BASE_URL}/user/communities/join`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ communityId: community.id })
          });

          if (joinResponse.ok) {
            showNotification(`Successfully joined ${community.name}!`, 'success');
            fetchUserCommunities(); // Refresh the communities list
          } else {
            const errorData = await joinResponse.json();
            showNotification(`Failed to join community: ${errorData.message || joinResponse.statusText}`, 'error');
          }
        } else {
          showNotification(`Community "${communityName}" not found.`, 'error');
        }
      } catch (error) {
        console.error("Error joining community:", error);
        showNotification("An error occurred while trying to join the community.", 'error');
      } finally {
        joinCommunityBtn.textContent = "Join New";
        joinCommunityBtn.disabled = false;
      }
    }
  });

  // Initialize the page
  fetchAndDisplayProfile();
});