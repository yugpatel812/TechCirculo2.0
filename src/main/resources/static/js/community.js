// community.js

document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "http://localhost:8084/communities"; // API base URL, consistent with profile.js

    // Helper to get auth headers
    function getAuthHeaders() {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token && { "Authorization": "Bearer " + token }) // Include token if available
        };
    }

    const allCommunityList = document.getElementById("all-community-list");
    const joinedCommunityList = document.getElementById("joined-community-list");
    const communityHeading = document.getElementById("community-heading");
    const postList = document.getElementById("post-list");
    const announcementList = document.getElementById("announcement-list");
    const membersList = document.getElementById("members-list");

    const postTitle = document.getElementById("post-title");
    const postDescription = document.getElementById("post-description");
    const submitPostBtn = document.getElementById("submit-post");
    const createPostSection = document.getElementById("create-post-section");
    const createPostHeading = document.getElementById("create-post-heading");

    let joinedCommunities = []; // To keep track of joined communities by ID for local state

    // Define colors for each role
    const roleColors = {
        "Student": "orange",
        "Faculty": "blue",
        "Alumni": "green",
        "Admin": "red"
    };

    // Function to display the "Create Post" section when a community is selected
    function showCreatePostSection(communityName) {
        if (communityName) {
            createPostHeading.style.display = "block";
            createPostSection.style.display = "block";
        } else {
            createPostHeading.style.display = "none";
            createPostSection.style.display = "none";
        }
    }

    // Load and display data for a selected community
    async function loadCommunityData(communityId, communityName) {
        communityHeading.textContent = communityName;
        communityHeading.dataset.communityId = communityId; // Store communityId on heading
        postList.innerHTML = "<li>Loading posts...</li>";
        announcementList.innerHTML = "<li>Loading announcements...</li>";
        membersList.innerHTML = "<li>Loading members...</li>";

        try {
            // Fetch posts
            const postsResponse = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`, { headers: getAuthHeaders() });
            const posts = await postsResponse.json();
            postList.innerHTML = "";
            if (postsResponse.ok && posts && posts.length > 0) {
                posts.forEach(post => {
                    const li = document.createElement("li");
                    li.textContent = post.title; // Assuming backend returns 'title'
                    postList.appendChild(li);
                });
            } else {
                postList.innerHTML = "<li>No posts found for this community.</li>";
            }

            // Fetch announcements
            const announcementsResponse = await fetch(`${API_BASE_URL}/communities/${communityId}/announcements`, { headers: getAuthHeaders() });
            const announcements = await announcementsResponse.json();
            announcementList.innerHTML = "";
            if (announcementsResponse.ok && announcements && announcements.length > 0) {
                announcements.forEach(announcement => {
                    const li = document.createElement("li");
                    li.textContent = announcement.title; // Assuming backend returns 'title'
                    announcementList.appendChild(li);
                });
            } else {
                announcementList.innerHTML = "<li>No announcements found for this community.</li>";
            }

            // Fetch members
            const membersResponse = await fetch(`${API_BASE_URL}/communities/${communityId}/members`, { headers: getAuthHeaders() });
            const members = await membersResponse.json();
            membersList.innerHTML = "";
            if (membersResponse.ok && members && members.length > 0) {
                members.forEach(member => {
                    const li = document.createElement("li");
                    const roleColor = roleColors[member.role] || "gray";
                    li.innerHTML = `<strong>${member.name}</strong> - <span style="color: ${roleColor};">${member.role}</span>`;
                    li.style.borderLeft = `5px solid ${roleColor}`;
                    li.style.padding = "5px";
                    membersList.appendChild(li);
                });
            } else {
                membersList.innerHTML = "<li>No members found for this community.</li>";
            }

            // Activate the first tab (Posts)
            document.querySelectorAll(".tab-btn")[0].click();
            showCreatePostSection(communityName); // Show create post section for the selected community
        }catch (error) {
            console.error("Error fetching community data:", error);
            postList.innerHTML = "<li>Failed to load posts.</li>";
            announcementList.innerHTML = "<li>Failed to load announcements.</li>";
            membersList.innerHTML = "<li>Failed to load members.</li>";
        }
    }

    async function addToJoinedCommunities(communityId, communityName) {
        if (!joinedCommunities.some(c => c.id === communityId)) { // Check if already joined based on ID
            try {
                console.log(`Joining community: ${communityName} (ID: ${communityId})`);
                const response = await fetch(`${API_BASE_URL}/user/communities/join`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ communityId: communityId })
                });

                if (response.ok) {
                    alert(`Successfully joined ${communityName}!`);
                    fetchAndRenderCommunities(); // Re-fetch both lists to update UI
                } else {
                    const errorData = await response.json();
                    alert(`Failed to join: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error("Error joining community:", error);
                alert("An error occurred while trying to join the community.");
            }
        } else {
            alert(`You have already joined ${communityName}.`);
        }
    }

    async function removeFromJoinedCommunities(communityId, communityName) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/communities/leave/${communityId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                alert(`Successfully left ${communityName}!`);
                fetchAndRenderCommunities(); // Re-fetch both lists to update UI
            } else {
                const errorData = await response.json();
                alert(`Failed to leave: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Error leaving community:", error);
            alert("An error occurred while trying to leave the community.");
        }
    }

    // Fetch and render all available communities
    async function renderAllCommunities() {
        allCommunityList.innerHTML = "<li>Loading all communities...</li>";
        try {
            const response = await fetch(`${API_BASE_URL}/all`, { headers: getAuthHeaders() });
            const communities = await response.json();
            allCommunityList.innerHTML = ""; // Clear loading message
            if (response.ok && communities && communities.length > 0) {
                communities.forEach(community => {
                    const li = document.createElement("li");
                    li.innerHTML = `${community.name} <button class="btn" data-community-id="${community.id}" data-community-name="${community.name}">Join</button>`;
                    li.querySelector(".btn").addEventListener("click", function (e) {
                        e.stopPropagation(); // Prevent li click from triggering community data load
                        const id = this.dataset.communityId;
                        const name = this.dataset.communityName;
                        addToJoinedCommunities(id, name);
                    });
                    li.addEventListener("click", function () {
                        loadCommunityData(community.id, community.name);
                    });
                    allCommunityList.appendChild(li);
                });
            } else {
                allCommunityList.innerHTML = "<li>No communities available.</li>";
            }
        } catch (error) {
            console.error("Error fetching all communities:", error);
            allCommunityList.innerHTML = "<li>Failed to load communities.</li>";
        }
    }

    // Fetch and render communities joined by the user
    async function renderJoinedCommunities() {
        joinedCommunityList.innerHTML = "<li>Loading joined communities...</li>";
        try {
            const response = await fetch(`${API_BASE_URL}/user/communities/joined`, { headers: getAuthHeaders() });
            const communities = await response.json();
            joinedCommunities = communities; // Update the global joinedCommunities array for state management
            joinedCommunityList.innerHTML = ""; // Clear loading message
            if (response.ok && communities && communities.length > 0) {
                communities.forEach(community => {
                    const li = document.createElement("li");
                    li.innerHTML = `${community.name} <button class="btn leave" data-community-id="${community.id}" data-community-name="${community.name}">Leave</button>`;
                    li.querySelector(".leave").addEventListener("click", function (e) {
                        e.stopPropagation(); // Prevent li click event from triggering community data load
                        const id = this.dataset.communityId;
                        const name = this.dataset.communityName;
                        removeFromJoinedCommunities(id, name);
                    });
                    li.addEventListener("click", function () {
                        loadCommunityData(community.id, community.name);
                    });
                    joinedCommunityList.appendChild(li);
                });
            } else {
                joinedCommunityList.innerHTML = "<li>No joined communities.</li>";
            }
        }catch (error) {
            console.error("Error fetching joined communities:", error);
            joinedCommunityList.innerHTML = "<li>Failed to load joined communities.</li>";
        }
    }

    // Combined function to fetch and render both community lists
    async function fetchAndRenderCommunities() {
        await renderAllCommunities();
        await renderJoinedCommunities();
    }

    // Handle post submission
    submitPostBtn.addEventListener("click", async () => {
        const currentCommunityId = communityHeading.dataset.communityId; // Get community ID from heading's dataset
        if (!currentCommunityId) {
            alert("Please select a community first to post.");
            return;
        }

        const postTitleValue = postTitle.value.trim();
        const postDescriptionValue = postDescription.value.trim();

        if (postTitleValue === "" || postDescriptionValue === "") {
            alert("Please fill in both the post title and description.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/communities/${currentCommunityId}/posts`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: postTitleValue,
                    content: postDescriptionValue // Assuming backend expects 'content' for description
                })
            });

            if (response.ok) {
                alert("Post created successfully!");
                // Reload posts for the currently selected community
                loadCommunityData(currentCommunityId, communityHeading.textContent);
                postTitle.value = ""; // Clear form fields
                postDescription.value = "";
            } else {
                const errorData = await response.json();
                alert(`Failed to create post: ${errorData.message || response.statusText}`);
            }
        }catch (error) {
            console.error("Error creating post:", error);
            alert("An error occurred while trying to create the post.");
        }
    });

    // Tab switching logic
    const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            tabs.forEach(btn => btn.classList.remove("active"));
            contents.forEach(content => content.classList.remove("active"));
            tab.classList.add("active");
            contents[index].classList.add("active");
        });
    });

    // Initial fetch of communities when the page loads
    fetchAndRenderCommunities();

    // Hide create post section initially
    showCreatePostSection(null);
});