// dashboard.js - Fixed Version

document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE_URL = "http://localhost:8084";
    
    // Cache DOM elements
    const domCache = {
        userProfileName: document.getElementById("user-profile-name"),
        userProfileImage: document.getElementById("user-profile-image"),
        greetingText: document.getElementById("greeting-text"),
        communitySlider: document.querySelector(".slider"),
        postContainer: document.getElementById("postContainer"),
        notificationsBadge: document.querySelector(".notifications-btn .badge"),
        communitySelect: document.getElementById("communitySelect"),
        createPostForm: document.getElementById("createPostForm"),
        communityCount: document.querySelector(".community-count"),
        postCount: document.querySelector(".post-count")
    };

    // Handle OAuth2 token
    (function handleOAuth2Token() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            console.log("OAuth2 token found in URL. Storing in local storage.");
            localStorage.setItem("token", token);
            history.replaceState({}, document.title, window.location.pathname);
        }
    })();

    // Initialize Hamburger Menu - Fixed Version
   // Initialize Hamburger Menu - Fixed Version
function initializeHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar'); // Changed from getElementById to querySelector
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // Check if elements exist before adding event listeners
    if (!hamburgerBtn || !sidebar || !sidebarOverlay) {
        console.warn('Hamburger menu elements not found:', {
            hamburgerBtn: !!hamburgerBtn,
            sidebar: !!sidebar,
            sidebarOverlay: !!sidebarOverlay
        });
        return;
    }

    function toggleSidebar() {
        hamburgerBtn.classList.toggle('active');
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    }

    hamburgerBtn.addEventListener('click', toggleSidebar);
    
    sidebarOverlay.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            toggleSidebar();
        }
    });

    // Auto-close on nav click (mobile)
    const navLinks = sidebar.querySelectorAll('nav a');
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
                    toggleSidebar();
                }
            });
        });
    }

    // Auto-close on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && sidebar.classList.contains('open')) {
            toggleSidebar();
        }
    });

    console.log('Hamburger menu initialized successfully');
}

// Make sure to call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeHamburgerMenu);

    // Enhanced notification system
    function showNotification(message, type = 'success') {
        // Remove existing notifications first
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed; top: 2rem; right: 2rem; z-index: 1000;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                    'linear-gradient(135deg, #f59e0b, #d97706)'};
            color: white; padding: 1.25rem 1.75rem; border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
            font-weight: 600; font-size: 0.875rem; max-width: 400px;
            transform: translateX(100%); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.25rem; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.2); border-radius: 50%;">${icon}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }

    // Helper to get auth headers
    function getAuthHeaders() {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token && { "Authorization": "Bearer " + token })
        };
    }

    // Optimized loading state management
    function setLoadingState(element, isLoading) {
        if (!element) return;
        
        if (isLoading) {
            element.style.opacity = '0.6';
            element.style.pointerEvents = 'none';
        } else {
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
        }
    }

    async function handleApiResponse(response, defaultErrorMessage = "An error occurred") {
        if (!response.ok) {
            let errorMessage = defaultErrorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // If response is not JSON (like HTML error page), use default message
                console.error("Non-JSON error response:", e);
            }
            throw new Error(errorMessage);
        }
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            // If response is not JSON, throw error
            throw new Error("Server returned non-JSON response. Check if backend is running correctly.");
        }
    }

    // Optimized user profile fetch
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
                };
            }
            
            if (greetingText) {
                greetingText.textContent = `Welcome, ${userData.name || "User"}!`;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Fallback to static data
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

    // Optimized communities fetch
    async function fetchAllCommunities() {
        if (!domCache.communitySlider) return;
        
        setLoadingState(domCache.communitySlider, true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/communities/all`, { 
                headers: getAuthHeaders(),
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            
            const communities = await response.json();
            
            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            
            if (response.ok && communities && communities.length > 0) {
                if (domCache.communityCount) {
                    domCache.communityCount.textContent = `${communities.length} communities`;
                }
                
                communities.forEach((community, index) => {
                    const communityCard = createCommunityCard(community, index);
                    fragment.appendChild(communityCard);
                });
                
                // Single DOM update
                domCache.communitySlider.innerHTML = "";
                domCache.communitySlider.appendChild(fragment);
                
                // Attach event listeners after all cards are added
                attachCommunityEventListeners();
                
            } else {
                domCache.communitySlider.innerHTML = "<p style='text-align: center; color: #64748b; padding: 2rem;'>No communities available.</p>";
                if (domCache.communityCount) {
                    domCache.communityCount.textContent = "0 communities";
                }
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
            domCache.communitySlider.innerHTML = "<p style='text-align: center; color: #ef4444; padding: 2rem;'>Failed to load communities.</p>";
            if (domCache.communityCount) {
                domCache.communityCount.textContent = "0 communities";
            }
        } finally {
            setLoadingState(domCache.communitySlider, false);
        }
    }

    // Optimized community card creation
    function createCommunityCard(community, index) {
        const communityCard = document.createElement("div");
        communityCard.classList.add("community-card");
        communityCard.style.opacity = '0';
        communityCard.style.transform = 'translateY(30px)';
        
        const isJoined = community.isJoined === true;
        const buttonText = isJoined ? 'Joined ' : 'Join now';
        const buttonClass = isJoined ? 'joinnow joined' : 'joinnow';
        
        communityCard.innerHTML = `
            <div class="community-header">
                <img src="${community.imageUrl || '/images/community_logo.png'}" 
                     alt="${community.name}" 
                     onerror="this.src='/images/community_logo.png'">
                <span class="member-count">${community.memberCount || 0} members</span>
            </div>
            <div class="community-body">
                <h3>${community.name}</h3>
                <p>${community.description || 'No description available.'}</p>
                <button type="button" class="${buttonClass}" 
                        data-community-id="${community.id}" 
                        ${isJoined ? 'disabled' : ''}>${buttonText}</button>
            </div>
        `;
        
        // Staggered animation
        setTimeout(() => {
            communityCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            communityCard.style.opacity = '1';
            communityCard.style.transform = 'translateY(0)';
        }, 50 + (index * 50));
        
        return communityCard;
    }

    // Attach community event listeners
    function attachCommunityEventListeners() {
        document.querySelectorAll(".joinnow:not(.joined):not([disabled])").forEach(button => {
            button.addEventListener("click", async function() {
                const communityId = this.dataset.communityId;
                const communityName = this.closest('.community-card').querySelector('h3').textContent;
                await joinCommunity(communityId, communityName, this);
            });
        });
    }

    // Optimized join community function
    async function joinCommunity(communityId, communityName, buttonElement) {
        if (!communityId) return;
        
        const originalText = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = 'Joining...';
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                showNotification("You must be logged in to join a community.", 'error');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/communities/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ communityId }),
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
                showNotification(`Successfully joined ${communityName}!`, 'success');
                buttonElement.innerHTML = 'Joined ✓';
                buttonElement.classList.add('joined');
                buttonElement.disabled = true;
            } else {
                const errorData = await response.json().catch(() => ({}));
                showNotification(`Failed to join ${communityName}: ${errorData.message || 'Unknown error'}`, 'error');
                buttonElement.innerHTML = originalText;
                buttonElement.disabled = false;
            }
        } catch (error) {
            console.error("Error joining community:", error);
            showNotification("Network error. Please try again.", 'error');
            buttonElement.innerHTML = originalText;
            buttonElement.disabled = false;
        }
    }

    // Heavily optimized posts fetch
    async function fetchPosts() {
        if (!domCache.postContainer) return;
        
        // Show loading immediately
        domCache.postContainer.innerHTML = '<div class="loading" style="text-align: center; padding: 40px; color: #64748b;">Loading posts...</div>';
        
        try {
            const response = await fetch(`${API_BASE_URL}/posts?page=0&size=10&sortBy=createdAt&sortDir=desc`, {
                headers: getAuthHeaders(),
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const posts = data.content || [];
            
            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            
            if (posts.length > 0) {
                posts.forEach((post, index) => {
                    const postElement = createPostElement(post, index);
                    fragment.appendChild(postElement);
                });
                
                // Single DOM update
                domCache.postContainer.innerHTML = "";
                domCache.postContainer.appendChild(fragment);
                
                // Update post count
                if (domCache.postCount) {
                    domCache.postCount.textContent = `${data.totalElements || posts.length} posts`;
                }
                
                // Attach event listeners
                attachPostEventListeners();
                
            } else {
                domCache.postContainer.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 60px 20px; color: #64748b;">
                        <h3>No posts available</h3>
                        <p>Be the first to share something!</p>
                    </div>
                `;
                if (domCache.postCount) {
                    domCache.postCount.textContent = "0 posts";
                }
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            domCache.postContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 60px 20px; color: #ef4444;">
                    <h3>Failed to load posts</h3>
                    <p>Please check your connection and try again.</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry</button>
                </div>
            `;
            if (domCache.postCount) {
                domCache.postCount.textContent = "0 posts";
            }
        }
    }

    // Optimized post element creation
    function createPostElement(post, index = 0) {
        const postElement = document.createElement('article');
        postElement.className = 'post';
        postElement.style.opacity = '0';
        postElement.style.transform = 'translateY(30px)';
        
        // Determine join button state
        const isJoined = post.owner === true;
        const joinButtonText = isJoined ? 'Joined ' : 'Join';
        const joinButtonClass = isJoined ? 'join-btn joined' : 'join-btn';
        const joinButtonDisabled = isJoined ? 'disabled' : '';
        
        // Get user role display
        const getUserRoleDisplay = (role) => {
            const roleMap = {
                'STUDENT': 'Student',
                'ALUMNI': 'Alumni', 
                'TEACHER': 'Teacher',
                'ADMIN': 'Admin',
                'FACULTY': 'Faculty',
                'STAFF': 'Staff'
            };
            return roleMap[role?.toUpperCase()] || 'Member';
        };
        
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-meta">
                    <div class="author-info">
                        <img src="${post.authorProfileUrl || '/images/profile_pic.png'}" 
                             alt="${post.authorName || 'User'}" 
                             class="author-avatar"
                             onerror="this.src='/images/profile_pic.png'">
                        <div class="author-details">
                            <span class="author-name">${post.authorName || 'Anonymous'}</span>
                            <span class="author-role">${getUserRoleDisplay(post.authorRole)}</span>
                        </div>
                    </div>
                    <div class="post-time">
                        ${post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                    </div>
                </div>
            </div>

            ${post.imageUrl ? `<img src="${post.imageUrl}" 
                 alt="${post.title}" 
                 class="post-image"
                 onerror="this.style.display='none'">` : ''}
                 
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-text">${post.content}</p>
                
                <div class="post-actions">
                    <div class="action-buttons">
                        <button class="action-btn like-btn ${post.isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                            <svg fill="${post.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="20" height="20">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span class="like-count">${post.likeCount || 0}</span>
                        </button>
                        
                        <button class="${joinButtonClass}" 
                                data-community-id="${post.community?.id}" 
                                data-community-name="${post.community?.name}"
                                ${joinButtonDisabled}>
                            ${joinButtonText}
                        </button>
                    </div>
                </div>
                
                <div class="post-footer">
                    <div class="community-info">
                        <img src="${post?.communityImageUrl || '/images/community_logo.png'}" 
                             alt="${post?.communityName || 'Community'}" 
                             class="community-avatar"
                             onerror="this.src='/images/community_logo.png'">
                        <span class="community-name">Posted in ${post?.communityName || 'Unknown Community'}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Faster animation
        setTimeout(() => {
            postElement.style.transition = 'all 0.4s ease';
            postElement.style.opacity = '1';
            postElement.style.transform = 'translateY(0)';
        }, 50 + (index * 30));
        
        return postElement;
    }

    // Attach post event listeners
    function attachPostEventListeners() {
        // Like buttons - Fixed to work with dynamically created posts
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const postId = this.dataset.postId;

                try {
                    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
                        method: 'POST',
                        headers: getAuthHeaders()
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        
                        this.classList.toggle('liked', result.isLiked);
                        this.querySelector('svg').style.fill = result.isLiked ? 'currentColor' : 'none';
                        
                        // Update like count from backend
                        const countSpan = this.querySelector('.like-count');
                        if (countSpan) {
                            countSpan.textContent = result.likeCount || 0;
                        }
                        
                        showNotification(result.isLiked ? 'Post liked!' : 'Post unliked!', 'success');
                    } else {
                        throw new Error('Failed to like post');
                    }
                } catch (error) {
                    console.error('Error liking post:', error);
                    showNotification('Error liking post', 'error');
                }
            });
        });

        // Join buttons for posts
        document.querySelectorAll('.join-btn:not(.joined):not([disabled])').forEach(btn => {
            btn.addEventListener('click', async function() {
                const communityId = this.dataset.communityId;
                const communityName = this.dataset.communityName;
                await joinCommunity(communityId, communityName, this);
            });
        });
    }

    // Optimized communities for select dropdown
    async function fetchCommunitiesForSelect() {
        if (!domCache.communitySelect) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/communities/join`, { 
                headers: getAuthHeaders(),
                signal: AbortSignal.timeout(5000)
            });
            const communities = await response.json();

            domCache.communitySelect.innerHTML = '<option value="" disabled selected>Choose a community...</option>';

            if (response.ok && communities && communities.length > 0) {
                communities.forEach(community => {
                    const option = document.createElement("option");
                    option.value = community.id;
                    option.textContent = community.name;
                    domCache.communitySelect.appendChild(option);
                });
            } else {
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "No communities available";
                option.disabled = true;
                domCache.communitySelect.appendChild(option);
            }
        } catch (error) {
            console.error("Error fetching communities for select:", error);
            domCache.communitySelect.innerHTML = '<option value="" disabled>Error loading communities</option>';
        }
    }

    // Initialize UI enhancements
    function initializeUIEnhancements() {
        // Create post toggle
        const toggleBtn = document.getElementById('createPostToggle');
        const createPostSection = document.getElementById('createPostSection');
        
        if (toggleBtn && createPostSection) {
            toggleBtn.addEventListener('click', function() {
                const isVisible = createPostSection.style.display !== 'none';
                
                if (isVisible) {
                    createPostSection.style.display = 'none';
                    toggleBtn.classList.remove('active');
                } else {
                    createPostSection.style.display = 'block';
                    toggleBtn.classList.add('active');
                    setTimeout(() => {
                        createPostSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            });
        }

        // Clear form button
        const clearBtn = document.getElementById('clearPostBtn');
        if (clearBtn && domCache.createPostForm) {
            clearBtn.addEventListener('click', function() {
                domCache.createPostForm.reset();
                showNotification('Form cleared', 'info');
            });
        }

        // Form submission
        if (domCache.createPostForm) {
            domCache.createPostForm.addEventListener("submit", async function(e) {
                e.preventDefault();
                
                const formData = new FormData();
                const communitySelect = document.getElementById('communitySelect');
                const postTitle = document.getElementById('postTitle');
                const postContent = document.getElementById('postContent');
                const postImage = document.getElementById('postImage');
                
                if (!communitySelect.value || !postTitle.value.trim() || !postContent.value.trim()) {
                    showNotification("Please fill in all required fields", 'error');
                    return;
                }
                
                formData.append('title', postTitle.value.trim());
                formData.append('content', postContent.value.trim());
                formData.append('communities', JSON.stringify([communitySelect.value]));
                
                if (postImage.files[0]) {
                    formData.append('image', postImage.files[0]);
                }
                
                const publishBtn = document.getElementById('publishPostBtn');
                const originalText = publishBtn.innerHTML;
                publishBtn.disabled = true;
                publishBtn.innerHTML = 'Publishing...';
                
                try {
                    const response = await fetch(`${API_BASE_URL}/communities/${communitySelect.value}/posts`, {
                        method: 'POST',
                        headers: {
                            ...(localStorage.getItem("token") && { "Authorization": "Bearer " + localStorage.getItem("token") })
                        },
                        body: formData
                    });
                    
                    if (response.ok) {
                        showNotification("Post published successfully!", 'success');
                        domCache.createPostForm.reset();
                        fetchPosts(); // Refresh posts
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        showNotification(`Failed to publish: ${errorData.message || 'Unknown error'}`, 'error');
                    }
                } catch (error) {
                    console.error("Error creating post:", error);
                    showNotification("Network error. Please try again.", 'error');
                } finally {
                    publishBtn.disabled = false;
                    publishBtn.innerHTML = originalText;
                }
            });
        }
    }

    // Main initialization - Run all tasks in parallel for faster loading
    async function initialize() {
        try {
            // Initialize hamburger menu first
            initializeHamburgerMenu();
            
            // Initialize UI enhancements immediately
            initializeUIEnhancements();
            
            // Run all API calls in parallel
            const promises = [
                fetchUserProfile(),
                fetchAllCommunities(), 
                fetchPosts(),
                fetchCommunitiesForSelect()
            ];
            
            // Wait for all promises to complete
            await Promise.allSettled(promises);
            
            console.log("Dashboard initialized successfully");
        } catch (error) {
            console.error("Error initializing dashboard:", error);
            showNotification("Some features may not work properly. Please refresh the page.", 'error');
        }
    }

    // Start initialization
    initialize();
});
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("createPostToggle");
  const postSection = document.getElementById("createPostSection");
  const clearBtn = document.getElementById("clearPostBtn");

  if (toggleBtn && postSection) {
    toggleBtn.addEventListener("click", () => {
        //console.log("button clikd");
        
      postSection.classList.toggle("active");

      // optional: scroll into view when opening
      if (postSection.classList.contains("active")) {
        setTimeout(() => {
          postSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      document.getElementById("createPostForm").reset();
      postSection.classList.remove("active");
    });
  }
});
