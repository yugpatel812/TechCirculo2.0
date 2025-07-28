// dashboard.js

document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE_URL = "http://localhost:8084"; // API base URL, consistent with other JS files

    // Helper to get auth headers
    function getAuthHeaders() {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token && { "Authorization": "Bearer " + token }) // Include token if available
        };
    }

    // DOM Elements
    const userProfileName = document.getElementById("user-profile-name");
    const userProfileImage = document.getElementById("user-profile-image");
    const greetingText = document.getElementById("greeting-text");
    const communitySlider = document.querySelector(".slider"); // This is the .slider class used for all communities
    const postContainer = document.querySelector(".post-container");
    const notificationsBadge = document.querySelector(".notifications-btn .badge");


    // Fetch User Profile Data
    async function fetchUserProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, { headers: getAuthHeaders() });
            const userData = await response.json();
            if (response.ok) {
                userProfileName.textContent = userData.name || "User";
                userProfileImage.src = userData.profilePic || "default-profile.png"; // Assuming profilePic field
                greetingText.textContent = `Welcome, ${userData.name || "User"}!`;
            } else {
                console.warn("Failed to fetch user profile:", userData.message);
                // Fallback to static data if API fails or token is missing
                userProfileName.textContent = "Guest";
                userProfileImage.src = "default-profile.png";
                greetingText.textContent = `Welcome, Guest!`;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Fallback to static data
            userProfileName.textContent = "Guest";
            userProfileImage.src = "default-profile.png";
            greetingText.textContent = `Welcome, Guest!`;
        }
    }

    // Fetch All Communities for the slider
    async function fetchAllCommunities() {
        try {
            const response = await fetch(`${API_BASE_URL}/communities/all`, { headers: getAuthHeaders() });
            const communities = await response.json();
            communitySlider.innerHTML = ""; // Clear existing static content

            if (response.ok && communities && communities.length > 0) {
                communities.forEach((community) => {
                    const communityCard = document.createElement("div");
                    communityCard.classList.add("community-card");
                    communityCard.innerHTML = `
                        <div class="community-header">
                            <img src="${community.imageUrl || 'https://via.placeholder.com/300x200?text=Community'}" alt="${community.name}">
                            <span class="member-count">${community.memberCount || 0} members</span>
                        </div>
                        <div class="community-body">
                            <h3>${community.name}</h3>
                            <p>${community.description || 'No description available.'}</p>
                            <button type="button" class="joinnow" data-community-id="${community.id}">Join now</button>
                        </div>
                    `;
                    communitySlider.appendChild(communityCard);
                });

                // Attach event listeners to newly created "Join now" buttons
                document.querySelectorAll(".joinnow").forEach(button => {
                    button.addEventListener("click", async function() {
                        const communityId = this.dataset.communityId;
                        const communityName = this.closest('.community-card').querySelector('h3').textContent;
                        await joinCommunity(communityId, communityName);
                    });
                });

            } else {
                communitySlider.innerHTML = "<p>No communities available.</p>";
            }
        } catch (error) {
            console.error("Error fetching all communities:", error);
            communitySlider.innerHTML = "<p>Failed to load communities.</p>";
        }
    }

    // Function to handle joining a community
    async function joinCommunity(communityId, communityName) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/communities/join`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ communityId: communityId })
            });

            if (response.ok) {
                alert(`Successfully joined ${communityName}!`);
                // Optionally, refresh communities or update button state
                // Re-fetch all communities to update member counts or button states
                fetchAllCommunities();
            } else {
                const errorData = await response.json();
                alert(`Failed to join ${communityName}: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Error joining community:", error);
            alert("An error occurred while trying to join the community.");
        }
    }


    // Fetch Posts
    async function fetchPosts() {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/all`, { headers: getAuthHeaders() }); // Assuming an API for all posts
            const posts = await response.json();
            postContainer.innerHTML = ""; // Clear existing static content

            if (response.ok && posts && posts.length > 0) {
                posts.forEach((post) => {
                    const postElement = document.createElement("div");
                    postElement.classList.add("post");
                    postElement.innerHTML = `
                        <img src="${post.imageUrl || 'https://via.placeholder.com/600x400?text=Post'}" alt="${post.title}">
                        <h3>${post.title}</h3>
                        <p>${post.content}</p>
                        <div class="actions">
                            <button class="btn like-btn" data-post-id="${post.id}" onclick="likePost(this)">Like ❤️</button>
                            <button class="btn share-btn" onclick="sharePost()">Share 🔄</button>
                            <button class="btn join-btn" data-community-id="${post.communityId}" onclick="toggleJoin(this)">Join Community</button>
                        </div>
                    `;
                    postContainer.appendChild(postElement);
                });
            } else {
                postContainer.innerHTML = "<p>No posts available.</p>";
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            postContainer.innerHTML = "<p>Failed to load posts.</p>";
        }
    }

    // Fetch Announcements Count for Badge (assuming an endpoint that returns a count of unread or total announcements)
    async function fetchAnnouncementsCount() {
        try {
            const response = await fetch(`${API_BASE_URL}/announcements/count`, { headers: getAuthHeaders() }); // Example API
            const data = await response.json();
            if (response.ok && data.count !== undefined) {
                notificationsBadge.textContent = data.count;
            } else {
                notificationsBadge.textContent = "0"; // Default to 0 if count not available
            }
        } catch (error) {
            console.error("Error fetching announcement count:", error);
            notificationsBadge.textContent = "0";
        }
    }

    // Functions from script.js that are useful here
    window.likePost = function(btn) {
        // You might want to send a POST request to your backend here to record the like
        // Example: fetch(`${API_BASE_URL}/posts/${btn.dataset.postId}/like`, { method: 'POST', headers: getAuthHeaders() });
        if (btn.innerText.includes("Liked")) {
            btn.innerText = "Like ❤️";
        } else {
            btn.innerText = "Liked ✅";
        }
    };

    window.sharePost = function() {
        alert("Post shared successfully!");
    };

    window.toggleJoin = async function(btn) {
        const communityId = btn.dataset.communityId;
        // This button is on a post, so it implies joining the community associated with the post.
        // The actual join logic is in the joinCommunity function, which is called for community cards.
        // For post-level "Join Community" button, you might want to directly call the join API.
        const communityName = "this community"; // Placeholder, ideally get from post data

        if (btn.innerText.includes("Join")) {
            await joinCommunity(communityId, communityName);
            // After successful join, you might change the button text
            btn.innerText = "Joined";
            btn.classList.add("joined");
        } else {
            // If already joined (backend confirms), this button might change to "Leave" or be hidden.
            // For simplicity, this example just alerts.
            alert("You are already part of this community.");
        }
    };


    // Initial Fetch Calls
    await fetchUserProfile();
    await fetchAllCommunities();
    await fetchPosts();
    await fetchAnnouncementsCount(); // Fetch count for the badge

    // Sidebar active link highlighting (already present and functional)
    const currentPath = window.location.pathname.split("/").pop();
    document.querySelectorAll(".sidebar nav a").forEach(link => {
        const linkHref = link.getAttribute("href").split("/").pop();
        link.classList.toggle("active", linkHref === currentPath || (currentPath === "" && linkHref === "dashboard.html"));
    });
});