// Fixed Community.js - Hamburger Menu Implementation

document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE_URL = "http://localhost:8084";

    // ✅ Auto-attach JWT token to all fetch calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        let [resource, config] = args;
        const token = localStorage.getItem("jwtToken");
        if (token) {
            config = config || {};
            config.headers = {
                ...config.headers,
                "Authorization": `Bearer ${token}`
            };
        }
        return originalFetch(resource, config);
    };

    // FIXED: Hamburger Menu Functionality - Moved inside main DOMContentLoaded
    function initializeHamburgerMenu() {
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        // Check if elements exist before adding listeners
        if (!hamburgerBtn || !sidebar || !sidebarOverlay) {
            console.error('Hamburger menu elements not found');
            return;
        }

        // Toggle sidebar
        function toggleSidebar() {
            hamburgerBtn.classList.toggle('active');
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            
            // Prevent body scroll when sidebar is open
            if (sidebar.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        
        // Close sidebar
        function closeSidebar() {
            hamburgerBtn.classList.remove('active');
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Event listeners
        hamburgerBtn.addEventListener('click', toggleSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
        
        // Close sidebar when clicking on sidebar links (on mobile)
        const sidebarLinks = document.querySelectorAll('.sidebar nav a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeSidebar();
            }
        });
        
        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                closeSidebar();
            }
        });

        console.log('Hamburger menu initialized successfully');
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

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 400);
        }, 4500);
    }

    // Helper to get auth headers with better error handling
    function getAuthHeaders() {
        const token = localStorage.getItem("token");
        const headers = {
            "Content-Type": "application/json"
        };
        
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        } else {
            console.warn("No authentication token found");
        }
        
        return headers;
    }

    // Helper function to handle API responses
    async function handleApiResponse(response, defaultErrorMessage = "An error occurred") {
        if (!response.ok) {
            let errorMessage = defaultErrorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                console.error("Non-JSON error response:", e);
            }
            throw new Error(errorMessage);
        }
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            throw new Error("Server returned non-JSON response. Check if backend is running correctly.");
        }
    }
    
// Show user profile modal
async function showUserProfile(username) {
    const modal = document.getElementById('profileModal');
    const content = document.getElementById('profileContent');
    
    // Show modal with loading state
    modal.classList.add('active');
    content.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
        </div>
    `;

    try {
        // Note: You might need to modify this endpoint to fetch a specific user's profile
        // Instead of the logged-in user's profile
        const response = await fetch(`${API_BASE_URL}/profile/${username}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const profileData = await response.json();
        renderProfileContent(profileData);

    } catch (error) {
        console.error('Error fetching profile:', error);
        content.innerHTML = `
            <div class="error-state">
                <h3>Unable to load profile</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// Render profile content
function renderProfileContent(profile) {
    const content = document.getElementById('profileContent');
    console.log(profile);
    
    // Generate initials for avatar if no profile pic
    const initials = profile.name 
        ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U';

    content.innerHTML = `
        <div class="profile-avatar">
            ${profile.profilePicUrl
                ? `<img src="${profile.profilePicUrl}" alt="${profile.name || 'User'}" onerror="this.style.display='none'; this.nextSibling.style.display='block';">
                   <div style="display:none">${initials}</div>`
                : initials
            }
        </div>
        <div class="profile-name">${profile.name || 'Unknown User'}</div>
        <div class="profile-university">${profile.university || 'University not specified'}</div>
        <div class="verification-badge">Verified by TechCirculo</div>
    `;

    // Add profile details section
    const modal = content.closest('.profile-modal');
    const existingContent = modal.querySelector('.profile-content');
    if (existingContent) {
        existingContent.remove();
    }

    const profileContentDiv = document.createElement('div');
    profileContentDiv.className = 'profile-content';
    
    let socialLinksHtml = '';
    if (profile.linkedinUrl || profile.githubUrl || profile.leetcodeUrl) {
        socialLinksHtml = `
            <div class="info-section">
                <div class="info-title">Social Links</div>
                <div class="social-links">
                    ${profile.linkedinUrl ? `
                        <a href="${profile.linkedinUrl}" target="_blank" class="social-link linkedin">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                        </a>
                    ` : ''}
                    ${profile.githubUrl ? `
                        <a href="${profile.githubUrl}" target="_blank" class="social-link github">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                        </a>
                    ` : ''}
                    ${profile.leetcodeurl ? `
                        <a href="${profile.leetcodeUrl}" target="_blank" class="social-link leetcode">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.814 2.133 8.038-.074l3.927-3.926c.031-.031.063-.042.094-.074a1.367 1.367 0 0 0-.492-2.258 1.378 1.378 0 0 0-1.513.492l-3.927 3.926a2.827 2.827 0 0 1-3.981.007l-4.316-4.232-.039-.037a2.66 2.66 0 0 1-.577-.79 2.786 2.786 0 0 1-.174-.53 2.739 2.739 0 0 1-.062-1.367 2.75 2.75 0 0 1 .631-1.109l3.854-4.126 5.406-5.788a1.372 1.372 0 0 0-.438-.96 1.378 1.378 0 0 0-1.513.492z"/>
                            </svg>
                            LeetCode
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }
    //console.log(socialLinksHtml);
    
    profileContentDiv.innerHTML = socialLinksHtml || `
        <div class="info-section">
            <p style="text-align: center; color: #6c757d; font-style: italic;">No additional information available</p>
        </div>
    `;

    modal.appendChild(profileContentDiv);
}

// Close modal
function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
document.getElementById('profileModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeProfileModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProfileModal();
    }
});

    // DOM Elements
    const communityTabs = document.querySelectorAll('.community-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const allCommunitiesGrid = document.getElementById('allCommunitiesGrid');
    const joinedCommunitiesGrid = document.getElementById('joinedCommunitiesGrid');
    const allCommunitiesCount = document.getElementById('allCommunitiesCount');
    const joinedCommunitiesCount = document.getElementById('joinedCommunitiesCount');
    const joinedCount = document.getElementById('joinedCount');

    // Community Detail Elements
    const communitiesOverview = document.getElementById('communitiesOverview');
    const communityDetail = document.getElementById('communityDetail');
    const backToCommunities = document.getElementById('backToCommunities');
    const communityName = document.getElementById('communityName');
    const communityDescription = document.getElementById('communityDescription');
    const communityMembers = document.getElementById('communityMembers');
    const communityPosts = document.getElementById('communityPosts');
    const communityCategory = document.getElementById('communityCategory');
    const joinCommunityBtn = document.getElementById('joinCommunityBtn');

    // Content tabs and panels
    const contentTabs = document.querySelectorAll('.content-tab');
    const contentPanels = document.querySelectorAll('.content-panel');
    const membersList = document.getElementById('membersList');
    const announcementsList = document.getElementById('announcementsList');
    const postsList = document.getElementById('postsList');
    const membersTabCount = document.getElementById('membersTabCount');
    const announcementsTabCount = document.getElementById('announcementsTabCount');
    const postsTabCount = document.getElementById('postsTabCount');

    // Search functionality
    const communitySearch = document.getElementById('communitySearch');

    let currentCommunityId = null;
    let allCommunities = [];
    let joinedCommunities = [];

    // Initialize the page
    async function initializePage() {
        try {
            // FIXED: Initialize hamburger menu first
            initializeHamburgerMenu();
            
            await fetchUserProfile();
            await fetchAllCommunities();
            await fetchJoinedCommunities();
            initializeEventListeners();
        } catch (error) {
            console.error("Error initializing page:", error);
            showNotification("Failed to initialize page. Please check if the backend server is running.", 'error');
        }
    }
    
    // Fetch user profile for header
    async function fetchUserProfile() {
        const userProfileName = document.getElementById("user-profile-name");
        const userProfileImage = document.getElementById("user-profile-image");
        const greetingText = document.getElementById("greeting-text");

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, { headers: getAuthHeaders() });
            const userData = await handleApiResponse(response, "Failed to fetch user profile");
            
            if (userProfileName) {
                userProfileName.textContent = userData.name || "User";
            }
            
            if (userProfileImage) {
                userProfileImage.src = userData.profilePicUrl || "/images/profile_pic.png";
                userProfileImage.onerror = function() {
                    this.src = "/images/profile_pic.png";
                    console.log("Failed to load profile image, using fallback");
                };
            }
            
            if (greetingText) {
                greetingText.textContent = `Welcome, ${userData.name || "User"}!`;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            if (userProfileName) userProfileName.textContent = "Guest";
            if (userProfileImage) {
                userProfileImage.src = "/images/profile_pic.png";
                userProfileImage.onerror = function() {
                    this.src = "https://via.placeholder.com/44x44?text=G";
                };
            }
            if (greetingText) greetingText.textContent = "Welcome, Guest!";
        }
    }

    // Fetch all available communities
    async function fetchAllCommunities() {
        try {
            showLoadingState(allCommunitiesGrid, 'communities');
            const response = await fetch(`${API_BASE_URL}/communities/all`, { headers: getAuthHeaders() });
            const communities = await handleApiResponse(response, "Failed to fetch communities");

            if (communities && communities.length > 0) {
                allCommunities = communities;
                renderCommunities(allCommunitiesGrid, communities, false);
                allCommunitiesCount.textContent = `${communities.length} communities`;
            } else {
                renderEmptyState(allCommunitiesGrid, 'No communities available', 'Be the first to create a community!');
                allCommunitiesCount.textContent = '0 communities';
            }
        } catch (error) {
            console.error("Error fetching all communities:", error);
            renderErrorState(allCommunitiesGrid, 'Failed to load communities');
            allCommunitiesCount.textContent = '0 communities';
            showNotification(error.message, 'error');
        }
    }

    // Fetch joined communities
    async function fetchJoinedCommunities() {
        try {
            showLoadingState(joinedCommunitiesGrid, 'communities');
            const response = await fetch(`${API_BASE_URL}/communities/join`, { headers: getAuthHeaders() });
            const communities = await handleApiResponse(response, "Failed to fetch joined communities");

            if (communities && communities.length > 0) {
                joinedCommunities = communities;
                renderCommunities(joinedCommunitiesGrid, communities, true);
                joinedCommunitiesCount.textContent = `${communities.length} communities`;
                joinedCount.textContent = `(${communities.length})`;
            } else {
                renderEmptyState(joinedCommunitiesGrid, 'No joined communities', 'Join some communities to get started!');
                joinedCommunitiesCount.textContent = '0 communities';
                joinedCount.textContent = '(0)';
            }
        } catch (error) {
            console.error("Error fetching joined communities:", error);
            renderErrorState(joinedCommunitiesGrid, 'Failed to load joined communities');
            joinedCommunitiesCount.textContent = '0 communities';
            joinedCount.textContent = '(0)';
            showNotification(error.message, 'error');
        }
    }

    function renderCommunities(container, communities) {
        container.innerHTML = '';

        communities.forEach((community, index) => {
            const communityCard = document.createElement('div');
            communityCard.className = 'community-card';
            communityCard.style.opacity = '0';
            communityCard.style.transform = 'translateY(20px)';

            const isTrending = Math.random() > 0.7;
            const img = document.createElement('img');
            const defaultImage = '/images/community_logo.png';

            img.onerror = function () {
                this.src = defaultImage;
            };

            img.src = community?.imageUrl || defaultImage;
            img.alt = community?.name || 'Community';
            
            communityCard.innerHTML = `
                <div class="community-card-header">
                    ${isTrending ? '<div class="community-trending">Trending</div>' : ''}
                    <div class="community-image-container"></div>
                </div>
                <div class="community-card-body">
                    <h3 class="community-title">${community?.name || 'Unnamed Community'}</h3>
                    <p class="community-description">${community?.description || 'No description available.'}</p>
                    
                    <div class="community-stats">
                        <div class="stat-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 19a6 6 0 0 0-12 0" />
                                <circle cx="8" cy="9" r="4" />
                                <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
                            </svg>
                            <span>${community?.memberCount ?? 0} members</span>
                        </div>
                        <div class="stat-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                            <span>${community?.postCount ?? 0} posts</span>
                        </div>
                    </div>
                    
                    <div class="community-category">${community?.category || 'General'}</div>
                    
                    <div class="community-actions">
                        <button class="view-btn" data-community-id="${community?.id}">View</button>
                        
                        ${community.isJoined
                            ? `<button class="leave-btn" data-community-id="${community?.id}" data-community-name="${community?.name}">Leave</button>`
                            : `<button class="join-btn" data-community-id="${community?.id}" data-community-name="${community?.name}">Join</button>`
                        }
                    </div>
                </div>
            `;

            const imageContainer = communityCard.querySelector('.community-image-container');
            imageContainer.appendChild(img);
            container.appendChild(communityCard);

            setTimeout(() => {
                communityCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                communityCard.style.opacity = '1';
                communityCard.style.transform = 'translateY(0)';
            }, 100 + (index * 50));
        });

        // Event listeners for community actions
        container.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const communityId = e.target.dataset.communityId;
                const community = communities.find(c => c.id === communityId);
                if (community) {
                    showCommunityDetail(community);
                }
            });
        });

        container.querySelectorAll('.join-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const communityId = e.target.dataset.communityId;
                const communityName = e.target.dataset.communityName;
                await joinCommunity(communityId, communityName, e.target);
            });
        });

        container.querySelectorAll('.leave-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const communityId = e.target.dataset.communityId;
                const communityName = e.target.dataset.communityName;
                await leaveCommunity(communityId, communityName, e.target);
            });
        });
    }

    // Join community function
    async function joinCommunity(communityId, communityName, button) {
        const originalText = button.textContent;
        button.textContent = 'Joining...';
        button.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/communities/join`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ communityId: communityId })
            });

            await handleApiResponse(response, `Failed to join ${communityName}`);
            showNotification(`Successfully joined ${communityName}!`, 'success');
            await Promise.all([fetchAllCommunities(), fetchJoinedCommunities()]);
        } catch (error) {
            console.error("Error joining community:", error);
            showNotification(error.message, 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    // Leave community function
    async function leaveCommunity(communityId, communityName, button) {
        const originalText = button.textContent;
        button.textContent = 'Leaving...';
        button.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/communities/leave/${communityId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            await handleApiResponse(response, `Failed to leave ${communityName}`);
            showNotification(`Successfully left ${communityName}!`, 'success');
            await Promise.all([fetchAllCommunities(), fetchJoinedCommunities()]);
        } catch (error) {
            console.error("Error leaving community:", error);
            showNotification(error.message, 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    // Show community detail view
    function showCommunityDetail(community) {
        currentCommunityId = community.id;
        
        communityName.textContent = community.name;
        communityDescription.textContent = community.description || 'No description available.';
        communityMembers.textContent = `${community.memberCount || 0} members`;
        communityPosts.textContent = `${community.postCount || 0} posts`;
        communityCategory.textContent = community.category || 'General';

        const isJoined = joinedCommunities.some(c => c.id === community.id);
        joinCommunityBtn.textContent = isJoined ? 'Leave Community' : 'Join Community';
        joinCommunityBtn.className = isJoined ? 'join-btn leave-btn' : 'join-btn';

        communitiesOverview.style.display = 'none';
        communityDetail.style.display = 'block';

        loadCommunityContent(community.id);
    }

    // Load community content (members, announcements, posts)
    async function loadCommunityContent(communityId) {
        await Promise.all([
            loadCommunityMembers(communityId),
            loadCommunityAnnouncements(communityId),
            loadCommunityPosts(communityId)
        ]);
    }

    // Load community members
    async function loadCommunityMembers(communityId) {
        try {
            showLoadingState(membersList, 'members');
            const response = await fetch(`${API_BASE_URL}/communities/${communityId}/members`, { headers: getAuthHeaders() });
            const members = await handleApiResponse(response, "Failed to load members");

            if (members && members.length > 0) {
                renderMembers(members);
                membersTabCount.textContent = `(${members.length})`;
            } else {
                renderEmptyState(membersList, 'No members found', 'Be the first to join this community!');
                membersTabCount.textContent = '(0)';
            }
        } catch (error) {
            console.error("Error loading members:", error);
            renderErrorState(membersList, 'Failed to load members');
            membersTabCount.textContent = '(0)';
        }
    }

    


    // Render members list
   // Updated renderMembers function with profile modal integration
function renderMembers(members) {
    membersList.innerHTML = '';

    members.forEach(member => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        // Add username as data attribute for profile fetching
        memberItem.setAttribute('data-username', member.username || member.email || member.id);
        
        const initials = member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        const roleClass = (member.role || 'student').toLowerCase();

        memberItem.innerHTML = `
            <div class="member-avatar">${initials}</div>
            <div class="member-info">
                <div class="member-name">${member.name || 'Unknown User'}</div>
                <div class="member-role">${member.major || 'No department specified'}</div>
            </div>
            <div class="member-badge ${roleClass}">${member.role || 'Student'}</div>
            <button class="view-profile-btn" data-username="${member.username || member.email || member.id}">
    View Profile
</button>

        `;
         const btn = memberItem.querySelector('.view-profile-btn');
btn.addEventListener('click', () => {
    showUserProfile(member.username || member.email || member.id);
});


        membersList.appendChild(memberItem);
    });
}

   
    // Load community announcements
    async function loadCommunityAnnouncements(communityId) {
        try {
            showLoadingState(announcementsList, 'announcements');
            const response = await fetch(`${API_BASE_URL}/communities/${communityId}/announcements`, { headers: getAuthHeaders() });
            const announcements = await handleApiResponse(response, "Failed to load announcements");

            if (announcements && announcements.length > 0) {
                renderAnnouncements(announcements);
                announcementsTabCount.textContent = `(${announcements.length})`;
            } else {
                renderEmptyState(announcementsList, 'No announcements yet', 'Check back later for updates!');
                announcementsTabCount.textContent = '(0)';
            }
        } catch (error) {
            console.error("Error loading announcements:", error);
            renderErrorState(announcementsList, 'Failed to load announcements');
            announcementsTabCount.textContent = '(0)';
        }
    }

    // Render announcements list
    function renderAnnouncements(announcements) {
        announcementsList.innerHTML = '';

        announcements.forEach(announcement => {
            const announcementItem = document.createElement('div');
            announcementItem.className = 'announcement-item';

            const types = ['Workshop', 'Event', 'Job'];
            const type = announcement.type || types[Math.floor(Math.random() * types.length)];

            announcementItem.innerHTML = `
                <div class="announcement-header">
                    <div>
                        <div class="announcement-title">${announcement.title}</div>
                        <div class="announcement-meta">
                            By ${announcement.author || 'Admin'} • 
                            ${announcement.date || new Date().toLocaleDateString()} • 
                            ${announcement.location || 'Online'}
                        </div>
                    </div>
                    <div class="announcement-type">${type}</div>
                </div>
                <div class="announcement-description">${announcement.content || announcement.description}</div>
                <a href="#" class="learn-more-btn">Learn More</a>
            `;

            announcementsList.appendChild(announcementItem);
        });
    }

    // Load community posts
    async function loadCommunityPosts(communityId) {
        try {
            showLoadingState(postsList, 'posts');
            const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`, { headers: getAuthHeaders() });
            const posts = await handleApiResponse(response, "Failed to load posts");
            
            if (posts && posts.length > 0) {
                renderPosts(posts);
                communityPosts.textContent = `${posts.length} Posts`;
                postsTabCount.textContent = `(${posts.length})`;
            } else {
                renderEmptyState(postsList, 'No posts yet', 'Be the first to start a conversation!');
                postsTabCount.textContent = '(0)';
            }
        } catch (error) {
            console.error("Error loading posts:", error);
            renderErrorState(postsList, 'Failed to load posts');
            postsTabCount.textContent = '(0)';
        }
    }

    // Render posts list
    function renderPosts(posts) {
        postsList.innerHTML = '';

        posts.forEach(post => {
            const postItem = document.createElement('div');
            postItem.className = 'post-item';

            const authorInitials = post.authorName ? post.authorName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
            const timeAgo = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently';

            postItem.innerHTML = `
                <div class="post-header">
                    <div class="post-author-avatar">${authorInitials}</div>
                    <div class="post-author-info">
                        <div class="post-author-name">${post.authorName || 'Anonymous'}</div>
                        <div class="post-time">${timeAgo}</div>
                    </div>
                </div>
                <div class="post-title">${post.title}</div>
                <div class="post-content">${post.content || post.description}</div>
                <div class="post-actions">
                    <button class="post-action like-action">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        ${post.likesCount || 0}
                    </button>
                </div>
            `;

            postsList.appendChild(postItem);
        });
    }

    // Show loading state
    function showLoadingState(container, type) {
        container.innerHTML = '';
        const skeletonCount = type === 'communities' ? 6 : 3;

        for (let i = 0; i < skeletonCount; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = `loading-skeleton ${type === 'communities' ? 'skeleton-card' : 'skeleton-item'}`;
            container.appendChild(skeleton);
        }
    }

    // Render empty state
    function renderEmptyState(container, title, description) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        `;
    }

    // Render error state
    function renderErrorState(container, message) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Initialize event listeners
    function initializeEventListeners() {
        // Community tabs
        communityTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.dataset.tab;

                communityTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                tabPanels.forEach(panel => panel.classList.remove('active'));
                document.getElementById(`${tabType}CommunitiesPanel`).classList.add('active');
            });
        });

        // Content tabs
        contentTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const contentType = tab.dataset.content;

                contentTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                contentPanels.forEach(panel => panel.classList.remove('active'));
                document.getElementById(`${contentType}Panel`).classList.add('active');
            });
        });

        // Back to communities button
        if (backToCommunities) {
            backToCommunities.addEventListener('click', () => {
                communityDetail.style.display = 'none';
                communitiesOverview.style.display = 'block';
                currentCommunityId = null;
            });
        }

        // Join/Leave community button in detail view
        if (joinCommunityBtn) {
            joinCommunityBtn.addEventListener('click', async () => {
                if (!currentCommunityId) return;

                const community = allCommunities.find(c => c.id === currentCommunityId);
                if (!community) return;

                const isJoined = joinedCommunities.some(c => c.id === currentCommunityId);

                if (isJoined) {
                    await leaveCommunity(currentCommunityId, community.name, joinCommunityBtn);
                    joinCommunityBtn.textContent = 'Join Community';
                    joinCommunityBtn.className = 'join-btn';
                } else {
                    await joinCommunity(currentCommunityId, community.name, joinCommunityBtn);
                    joinCommunityBtn.textContent = 'Leave Community';
                    joinCommunityBtn.className = 'join-btn leave-btn';
                }
            });
        }

        // Search functionality
        if (communitySearch) {
            communitySearch.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                filterCommunities(searchTerm);
            });
        }
    }

    // Filter communities based on search
    function filterCommunities(searchTerm) {
        if (!searchTerm) {
            fetchAllCommunities();
            return;
        }

        const filteredCommunities = allCommunities.filter(community =>
            community.name.toLowerCase().includes(searchTerm) ||
            (community.description && community.description.toLowerCase().includes(searchTerm)) ||
            (community.category && community.category.toLowerCase().includes(searchTerm))
        );

        renderCommunities(allCommunitiesGrid, filteredCommunities, false);
        allCommunitiesCount.textContent = `${filteredCommunities.length} communities`;
    }

    // Initialize the page
    await initializePage();
})