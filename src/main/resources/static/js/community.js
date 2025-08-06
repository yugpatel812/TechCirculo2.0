// Community.js - Enhanced community management with dynamic content

document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE_URL = "http://localhost:8084"; // API base URL, consistent with other JS files

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
        await fetchUserProfile();
        await fetchAllCommunities();
        await fetchJoinedCommunities();
        initializeEventListeners();
    }

    // Fetch user profile for header
    async function fetchUserProfile() {
        const userProfileName = document.getElementById("user-profile-name");
        const userProfileImage = document.getElementById("user-profile-image");
        const greetingText = document.getElementById("greeting-text");

        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, { headers: getAuthHeaders() });
            const userData = await response.json();
            if (response.ok) {
                userProfileName.textContent = userData.name || "User";
                userProfileImage.src = userData.profilePic || "https://via.placeholder.com/44x44?text=User";
                greetingText.textContent = `Welcome, ${userData.name || "User"}!`;
            } else {
                // Fallback to static data
                userProfileName.textContent = "Guest";
                userProfileImage.src = "https://via.placeholder.com/44x44?text=G";
                greetingText.textContent = "Welcome, Guest!";
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Fallback to static data
            userProfileName.textContent = "Guest";
            userProfileImage.src = "https://via.placeholder.com/44x44?text=G";
            greetingText.textContent = "Welcome, Guest!";
        }
    }

    // Fetch all available communities
    async function fetchAllCommunities() {
        try {
            showLoadingState(allCommunitiesGrid, 'communities');
            const response = await fetch(`${API_BASE_URL}/communities/all`, { headers: getAuthHeaders() });
            const communities = await response.json();

            if (response.ok && communities && communities.length > 0) {
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
        }
    }

    // Fetch joined communities
    async function fetchJoinedCommunities() {
        try {
            showLoadingState(joinedCommunitiesGrid, 'communities');
            const response = await fetch(`${API_BASE_URL}/user/communities/joined`, { headers: getAuthHeaders() });
            const communities = await response.json();

            if (response.ok && communities && communities.length > 0) {
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
        }
    }

    // Render communities in grid
    function renderCommunities(container, communities, isJoined) {
        container.innerHTML = '';

        communities.forEach((community, index) => {
            const communityCard = document.createElement('div');
            communityCard.className = 'community-card';
            communityCard.style.opacity = '0';
            communityCard.style.transform = 'translateY(20px)';

            const isTrending = Math.random() > 0.7; // Random trending for demo

            communityCard.innerHTML = `
                <div class="community-card-header">
                    ${isTrending ? '<div class="community-trending">Trending</div>' : ''}
                    <img src="${community.imageUrl || `https://via.placeholder.com/400x140/6366f1/ffffff?text=${encodeURIComponent(community.name)}`}" 
                         alt="${community.name}" />
                </div>
                <div class="community-card-body">
                    <h3 class="community-title">${community.name}</h3>
                    <p class="community-description">${community.description || 'No description available.'}</p>
                    
                    <div class="community-stats">
                        <div class="stat-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 19a6 6 0 0 0-12 0" />
                                <circle cx="8" cy="9" r="4" />
                                <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
                            </svg>
                            <span>${community.memberCount || 0} members</span>
                        </div>
                        <div class="stat-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                            <span>${community.postCount || 0} posts</span>
                        </div>
                    </div>
                    
                    <div class="community-category">${community.category || 'General'}</div>
                    
                    <div class="community-actions">
                        <button class="view-btn" data-community-id="${community.id}">View</button>
                        ${isJoined ?
                `<button class="leave-btn" data-community-id="${community.id}" data-community-name="${community.name}">Leave</button>` :
                `<button class="join-btn" data-community-id="${community.id}" data-community-name="${community.name}">Join</button>`
            }
                    </div>
                </div>
            `;

            container.appendChild(communityCard);

            // Animate in with stagger
            setTimeout(() => {
                communityCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                communityCard.style.opacity = '1';
                communityCard.style.transform = 'translateY(0)';
            }, 100 + (index * 50));
        });

        // Add event listeners to buttons
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

    // Join community
    async function joinCommunity(communityId, communityName, button) {
        const originalText = button.textContent;
        button.textContent = 'Joining...';
        button.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/user/communities/join`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ communityId: communityId })
            });

            if (response.ok) {
                showNotification(`Successfully joined ${communityName}!`, 'success');
                // Refresh both lists
                await Promise.all([fetchAllCommunities(), fetchJoinedCommunities()]);
            } else {
                const errorData = await response.json();
                showNotification(`Failed to join ${communityName}: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Error joining community:", error);
            showNotification("An error occurred while trying to join the community.", 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    // Leave community
    async function leaveCommunity(communityId, communityName, button) {
        const originalText = button.textContent;
        button.textContent = 'Leaving...';
        button.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/user/communities/leave/${communityId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                showNotification(`Successfully left ${communityName}!`, 'success');
                // Refresh both lists
                await Promise.all([fetchAllCommunities(), fetchJoinedCommunities()]);
            } else {
                const errorData = await response.json();
                showNotification(`Failed to leave ${communityName}: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Error leaving community:", error);
            showNotification("An error occurred while trying to leave the community.", 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    // Show community detail view
    function showCommunityDetail(community) {
        currentCommunityId = community.id;

        // Update community info
        communityName.textContent = community.name;
        communityDescription.textContent = community.description || 'No description available.';
        communityMembers.textContent = `${community.memberCount || 0} members`;
        communityPosts.textContent = `${community.postCount || 0} posts`;
        communityCategory.textContent = community.category || 'General';

        // Check if user is already a member
        const isJoined = joinedCommunities.some(c => c.id === community.id);
        joinCommunityBtn.textContent = isJoined ? 'Leave Community' : 'Join Community';
        joinCommunityBtn.className = isJoined ? 'join-btn leave-btn' : 'join-btn';

        // Hide overview and show detail
        communitiesOverview.style.display = 'none';
        communityDetail.style.display = 'block';

        // Load community content
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
            const members = await response.json();

            if (response.ok && members && members.length > 0) {
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
    function renderMembers(members) {
        membersList.innerHTML = '';

        members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';

            const initials = member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
            const roleClass = (member.role || 'student').toLowerCase();

            memberItem.innerHTML = `
                <div class="member-avatar">${initials}</div>
                <div class="member-info">
                    <div class="member-name">${member.name || 'Unknown User'}</div>
                    <div class="member-role">${member.department || 'No department specified'}</div>
                </div>
                <div class="member-badge ${roleClass}">${member.role || 'Student'}</div>
                <button class="view-profile-btn">View Profile</button>
            `;

            membersList.appendChild(memberItem);
        });
    }

    // Load community announcements
    async function loadCommunityAnnouncements(communityId) {
        try {
            showLoadingState(announcementsList, 'announcements');
            const response = await fetch(`${API_BASE_URL}/communities/${communityId}/announcements`, { headers: getAuthHeaders() });
            const announcements = await response.json();

            if (response.ok && announcements && announcements.length > 0) {
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

            // Determine announcement type based on content or random for demo
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
            const posts = await response.json();

            if (response.ok && posts && posts.length > 0) {
                renderPosts(posts);
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

            const authorInitials = post.author ? post.author.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
            const timeAgo = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently';

            postItem.innerHTML = `
                <div class="post-header">
                    <div class="post-author-avatar">${authorInitials}</div>
                    <div class="post-author-info">
                        <div class="post-author-name">${post.author || 'Anonymous'}</div>
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
                        ${post.likes || 0}
                    </button>
                    <button class="post-action comment-action">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        ${post.comments || 0}
                    </button>
                    <button class="post-action share-action">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                            <polyline points="16,6 12,2 8,6"/>
                            <line x1="12" y1="2" x2="12" y2="15"/>
                        </svg>
                        Share
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

                // Update active tab
                communityTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active panel
                tabPanels.forEach(panel => panel.classList.remove('active'));
                document.getElementById(`${tabType}CommunitiesPanel`).classList.add('active');
            });
        });

        // Content tabs
        contentTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const contentType = tab.dataset.content;

                // Update active tab
                contentTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active panel
                contentPanels.forEach(panel => panel.classList.remove('active'));
                document.getElementById(`${contentType}Panel`).classList.add('active');
            });
        });

        // Back to communities button
        backToCommunities.addEventListener('click', () => {
            communityDetail.style.display = 'none';
            communitiesOverview.style.display = 'block';
            currentCommunityId = null;
        });

        // Join/Leave community button in detail view
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
});