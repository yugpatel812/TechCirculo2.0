// dashboard.js

document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE_URL = "http://localhost:8084"; // API base URL, consistent with other JS files

    // Add loading states and animations
    function showLoading(element) {
        element.classList.add('loading');
        element.style.pointerEvents = 'none';
    }

    function hideLoading(element) {
        element.classList.remove('loading');
        element.style.pointerEvents = 'auto';
    }

    // Enhanced notification system with better styling
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

    // Enhanced scroll to top functionality with better styling
    function addScrollToTop() {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 15-6-6-6 6"/>
            </svg>
        `;
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            border: none;
            font-size: 1.25rem;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            visibility: hidden;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 255, 255, 0.1);
        `;

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        scrollBtn.addEventListener('mouseenter', () => {
            scrollBtn.style.transform = 'scale(1.1) translateY(-2px)';
            scrollBtn.style.boxShadow = '0 32px 64px -12px rgb(0 0 0 / 0.35)';
        });

        scrollBtn.addEventListener('mouseleave', () => {
            scrollBtn.style.transform = 'scale(1) translateY(0)';
            scrollBtn.style.boxShadow = '0 25px 50px -12px rgb(0 0 0 / 0.25)';
        });

        document.body.appendChild(scrollBtn);

        // Show/hide based on scroll position with smooth transition
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (window.scrollY > 400) {
                        scrollBtn.style.opacity = '1';
                        scrollBtn.style.visibility = 'visible';
                        scrollBtn.style.transform = 'scale(1)';
                    } else {
                        scrollBtn.style.opacity = '0';
                        scrollBtn.style.visibility = 'hidden';
                        scrollBtn.style.transform = 'scale(0.8)';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Enhanced drag and drop functionality for file upload
    function initializeFileUpload() {
        const uploadGroup = document.querySelector('.upload-group');
        const fileInput = document.getElementById('postImage');

        if (!uploadGroup || !fileInput) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadGroup.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadGroup.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadGroup.addEventListener(eventName, unhighlight, false);
        });

        uploadGroup.addEventListener('drop', handleDrop, false);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight(e) {
            uploadGroup.classList.add('dragover');
        }

        function unhighlight(e) {
            uploadGroup.classList.remove('dragover');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                fileInput.files = files;
                updateFileDisplay(files[0]);
            }
        }

        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                updateFileDisplay(e.target.files[0]);
            }
        });

        function updateFileDisplay(file) {
            const uploadInfo = uploadGroup.querySelector('.upload-info span');
            if (uploadInfo) {
                uploadInfo.textContent = `Selected: ${file.name}`;
                uploadGroup.style.borderColor = 'var(--success-color)';
                uploadGroup.style.background = 'rgba(16, 185, 129, 0.05)';
            }
        }
    }

    // Enhanced form validation with visual feedback
    function initializeFormValidation() {
        const form = document.getElementById('createPostForm');
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearValidation);
        });

        function validateField(e) {
            const field = e.target;
            const isValid = field.checkValidity();

            if (!isValid) {
                field.style.borderColor = 'var(--error-color)';
                field.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
                showFieldError(field);
            } else {
                field.style.borderColor = 'var(--success-color)';
                field.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
                clearFieldError(field);
            }
        }

        function clearValidation(e) {
            const field = e.target;
            field.style.borderColor = 'var(--border-color)';
            field.style.boxShadow = 'none';
            clearFieldError(field);
        }

        function showFieldError(field) {
            clearFieldError(field);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'field-error';
            errorMsg.style.cssText = `
                color: var(--error-color);
                font-size: 0.75rem;
                margin-top: 0.25rem;
                font-weight: 500;
            `;
            errorMsg.textContent = field.validationMessage;
            field.parentNode.appendChild(errorMsg);
        }

        function clearFieldError(field) {
            const errorMsg = field.parentNode.querySelector('.field-error');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    }

    // Initialize create post toggle functionality
    function initializeCreatePostToggle() {
        const toggleBtn = document.getElementById('createPostToggle');
        const createPostSection = document.getElementById('createPostSection');

        if (!toggleBtn || !createPostSection) return;

        toggleBtn.addEventListener('click', function() {
            const isVisible = createPostSection.style.display !== 'none';

            if (isVisible) {
                // Hide the section with animation
                createPostSection.style.opacity = '0';
                createPostSection.style.transform = 'translateY(-20px)';

                setTimeout(() => {
                    createPostSection.style.display = 'none';
                    toggleBtn.classList.remove('active');
                }, 300);

                // Update button text
                toggleBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                        <circle cx="12" cy="13" r="3"/>
                    </svg>
                    Create New Post
                    <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                `;
            } else {
                // Show the section with animation
                createPostSection.style.display = 'block';
                createPostSection.style.opacity = '0';
                createPostSection.style.transform = 'translateY(-20px)';
                toggleBtn.classList.add('active');

                // Force reflow
                createPostSection.offsetHeight;

                setTimeout(() => {
                    createPostSection.style.opacity = '1';
                    createPostSection.style.transform = 'translateY(0)';
                }, 50);

                // Update button text
                toggleBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                        <circle cx="12" cy="13" r="3"/>
                    </svg>
                    Hide Create Post
                    <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                `;

                // Scroll to the create post section smoothly
                setTimeout(() => {
                    createPostSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    }

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

    // New Post Form Elements
    const createPostForm = document.getElementById("createPostForm");
    const communitySelect = document.getElementById("communitySelect");
    const postTitleInput = document.getElementById("postTitle");
    const postContentTextarea = document.getElementById("postContent");
    const postImageInput = document.getElementById("postImage");
    const clearPostBtn = document.getElementById("clearPostBtn");
    const publishPostBtn = document.getElementById("publishPostBtn");

    // Initialize enhanced features
    addScrollToTop();
    initializeFileUpload();
    initializeFormValidation();
    initializeCreatePostToggle();

    // Add smooth animations to elements on load
    function animateElementsOnLoad() {
        const sidebar = document.querySelector('.sidebar');
        const header = document.querySelector('.header');
        const createPostSection = document.querySelector('.create-post-section');

        if (sidebar) sidebar.classList.add('animate-fadeInLeft');
        if (header) header.classList.add('animate-fadeInUp');
        if (createPostSection) {
            setTimeout(() => {
                createPostSection.classList.add('animate-fadeInUp');
            }, 200);
        }
    }

    // Fetch User Profile Data with enhanced error handling
    async function fetchUserProfile() {
        const profileElements = [userProfileName, userProfileImage, greetingText];
        profileElements.forEach(el => el && showLoading(el));

        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, { headers: getAuthHeaders() });
            const userData = await response.json();
            if (response.ok) {
                userProfileName.textContent = userData.name || "User";
                userProfileImage.src = userData.profilePic || "https://via.placeholder.com/44x44?text=User"; // Default placeholder if no image
                greetingText.textContent = `Welcome, ${userData.name || "User"}!`;
            } else {
                console.warn("Failed to fetch user profile:", userData.message);
                // Fallback to static data if API fails or token is missing
                userProfileName.textContent = "Guest";
                userProfileImage.src = "https://via.placeholder.com/44x44?text=G";
                greetingText.textContent = `Welcome, Guest!`;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Fallback to static data
            userProfileName.textContent = "Guest";
            userProfileImage.src = "https://via.placeholder.com/44x44?text=G";
            greetingText.textContent = `Welcome, Guest!`;
        } finally {
            profileElements.forEach(el => el && hideLoading(el));
        }
    }

    // Fetch All Communities for the slider with enhanced animations
    async function fetchAllCommunities() {
        showLoading(communitySlider);

        try {
            const response = await fetch(`${API_BASE_URL}/communities/all`, { headers: getAuthHeaders() });
            const communities = await response.json();
            communitySlider.innerHTML = ""; // Clear existing static content

            if (response.ok && communities && communities.length > 0) {
                communities.forEach((community, index) => {
                    const communityCard = document.createElement("div");
                    communityCard.classList.add("community-card");
                    communityCard.style.opacity = '0';
                    communityCard.style.transform = 'translateY(30px)';
                    communityCard.innerHTML = `
                        <div class="community-header">
                            <img src="${community.imageUrl || 'https://via.placeholder.com/300x180?text=Community'}" alt="${community.name}">
                            <span class="member-count">${community.memberCount || 0} members</span>
                        </div>
                        <div class="community-body">
                            <h3>${community.name}</h3>
                            <p>${community.description || 'No description available.'}</p>
                            <button type="button" class="joinnow" data-community-id="${community.id}">Join now</button>
                        </div>
                    `;
                    communitySlider.appendChild(communityCard);

                    // Staggered animation
                    setTimeout(() => {
                        communityCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        communityCard.style.opacity = '1';
                        communityCard.style.transform = 'translateY(0)';
                    }, 100 + (index * 100));
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
                communitySlider.innerHTML = "<p style='text-align: center; color: var(--text-muted); padding: 2rem;'>No communities available.</p>";
            }
        } catch (error) {
            console.error("Error fetching all communities:", error);
            communitySlider.innerHTML = "<p style='text-align: center; color: var(--error-color); padding: 2rem;'>Failed to load communities.</p>";
        } finally {
            hideLoading(communitySlider);
        }
    }

    // Function to handle joining a community with enhanced feedback
    async function joinCommunity(communityId, communityName) {
        const joinBtn = document.querySelector(`[data-community-id="${communityId}"]`);
        if (joinBtn) {
            joinBtn.disabled = true;
            joinBtn.innerHTML = `
                <svg style="animation: spin 1s linear infinite; width: 16px; height: 16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
            `;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/communities/join`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ communityId: communityId })
            });

            if (response.ok) {
                showNotification(`Successfully joined ${communityName}!`, 'success');
                // Update button state
                if (joinBtn) {
                    joinBtn.innerHTML = 'Joined ✓';
                    joinBtn.style.background = 'linear-gradient(135deg, var(--success-color), #059669)';
                    joinBtn.disabled = false;
                }
                // Optionally, refresh communities to update member counts
                fetchAllCommunities();
            } else {
                const errorData = await response.json();
                showNotification(`Failed to join ${communityName}: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Error joining community:", error);
            showNotification("An error occurred while trying to join the community.", 'error');
        } finally {
            if (joinBtn) {
                joinBtn.disabled = false;
                if (joinBtn.innerHTML.includes('Joining')) {
                    joinBtn.innerHTML = 'Join now';
                }
            }
        }
    }

    // Fetch Posts with enhanced animations
    async function fetchPosts() {
        showLoading(postContainer);

        try {
            const response = await fetch(`${API_BASE_URL}/posts/all`, { headers: getAuthHeaders() }); // Assuming an API for all posts
            const posts = await response.json();
            postContainer.innerHTML = ""; // Clear existing static content

            if (response.ok && posts && posts.length > 0) {
                posts.forEach((post, index) => {
                    const postElement = document.createElement("div");
                    postElement.classList.add("post");
                    postElement.style.opacity = '0';
                    postElement.style.transform = 'translateY(30px)';
                    postElement.innerHTML = `
                        <img src="${post.imageUrl || 'https://via.placeholder.com/600x200?text=Post'}" alt="${post.title}">
                        <h3>${post.title}</h3>
                        <p>${post.content}</p>
                        <div class="actions">
                            <button class="btn like-btn" data-post-id="${post.id}" onclick="likePost(this)">Like ❤️</button>
                            <button class="btn share-btn" onclick="sharePost()">Share 🔄</button>
                            <button class="btn join-btn" data-community-id="${post.communityId}" onclick="toggleJoin(this)">Join Community</button>
                        </div>
                    `;
                    postContainer.appendChild(postElement);

                    // Staggered animation
                    setTimeout(() => {
                        postElement.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        postElement.style.opacity = '1';
                        postElement.style.transform = 'translateY(0)';
                    }, 100 + (index * 100));
                });

                // Update post count
                const postCountElement = document.querySelector('.post-count');
                if (postCountElement) {
                    postCountElement.textContent = `${posts.length} posts`;
                }
            } else {
                postContainer.innerHTML = "<p style='text-align: center; color: var(--text-muted); padding: 2rem; grid-column: 1 / -1;'>No posts available.</p>";
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            postContainer.innerHTML = "<p style='text-align: center; color: var(--error-color); padding: 2rem; grid-column: 1 / -1;'>Failed to load posts.</p>";
        } finally {
            hideLoading(postContainer);
        }
    }

    // Fetch Communities for Select Dropdown with enhanced styling
    async function fetchCommunitiesForSelect() {
        try {
            const response = await fetch(`${API_BASE_URL}/user/communities`, { headers: getAuthHeaders() });
            const communities = await response.json();

            communitySelect.innerHTML = '<option value="" disabled>Choose a community...</option>';

            if (response.ok && communities && communities.length > 0) {
                communities.forEach(community => {
                    const option = document.createElement("option");
                    option.value = community.id;
                    option.textContent = community.name;
                    communitySelect.appendChild(option);
                });
            } else {
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "No communities available";
                option.disabled = true;
                communitySelect.appendChild(option);
            }
        } catch (error) {
            console.error("Error fetching communities for select:", error);
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Error loading communities";
            option.disabled = true;
            communitySelect.appendChild(option);
        }
    }

    // Enhanced Create Post Form Submission
    createPostForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        // Get form data
        const selectedCommunities = Array.from(communitySelect.selectedOptions).map(option => option.value);
        const title = postTitleInput.value.trim();
        const content = postContentTextarea.value.trim();
        const image = postImageInput.files[0];

        // Enhanced validation
        if (selectedCommunities.length === 0) {
            showNotification("Please select at least one community", 'error');
            communitySelect.focus();
            return;
        }

        if (!title) {
            showNotification("Please enter a post title", 'error');
            postTitleInput.focus();
            return;
        }

        if (!content) {
            showNotification("Please enter post content", 'error');
            postContentTextarea.focus();
            return;
        }

        // Show loading state on publish button
        publishPostBtn.disabled = true;
        publishPostBtn.innerHTML = `
            <svg style="animation: spin 1s linear infinite; width: 16px; height: 16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Publishing...
        `;

        try {
            // Create FormData for file upload if image is selected
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('communities', JSON.stringify(selectedCommunities));

            if (image) {
                formData.append('image', image);
            }

            const response = await fetch(`${API_BASE_URL}/posts/create`, {
                method: 'POST',
                headers: {
                    ...(localStorage.getItem("token") && { "Authorization": "Bearer " + localStorage.getItem("token") })
                },
                body: formData
            });

            if (response.ok) {
                showNotification("Post published successfully!", 'success');
                // Clear form
                createPostForm.reset();
                // Update file upload display
                const uploadInfo = document.querySelector('.upload-info span');
                if (uploadInfo) {
                    uploadInfo.textContent = 'Drag and drop an image here, or click to browse';
                }
                const uploadGroup = document.querySelector('.upload-group');
                if (uploadGroup) {
                    uploadGroup.style.borderColor = 'var(--border-color)';
                    uploadGroup.style.background = 'var(--background-color)';
                }
                // Refresh posts
                fetchPosts();
            } else {
                const errorData = await response.json();
                showNotification(`Failed to publish post: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Error creating post:", error);
            showNotification("An error occurred while publishing the post.", 'error');
        } finally {
            // Reset publish button
            publishPostBtn.disabled = false;
            publishPostBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z"/>
                    <path d="M22 2 11 13"/>
                </svg>
                Publish Post
            `;
        }
    });

    // Enhanced Clear Form Button
    clearPostBtn.addEventListener("click", function() {
        if (confirm("Are you sure you want to clear all fields?")) {
            createPostForm.reset();
            // Reset file upload display
            const uploadInfo = document.querySelector('.upload-info span');
            if (uploadInfo) {
                uploadInfo.textContent = 'Drag and drop an image here, or click to browse';
            }
            const uploadGroup = document.querySelector('.upload-group');
            if (uploadGroup) {
                uploadGroup.style.borderColor = 'var(--border-color)';
                uploadGroup.style.background = 'var(--background-color)';
            }
            // Clear any validation styling
            const inputs = createPostForm.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.style.borderColor = 'var(--border-color)';
                input.style.boxShadow = 'none';
                const errorMsg = input.parentNode.querySelector('.field-error');
                if (errorMsg) errorMsg.remove();
            });
            showNotification("Form cleared", 'info');
        }
    });

    // Add CSS for spinning animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Initialize everything
    animateElementsOnLoad();
    await fetchUserProfile();
    await fetchAllCommunities();
    await fetchPosts();
    await fetchCommunitiesForSelect();
});
