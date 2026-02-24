// dashboard.js - Real Points System Integration

document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE_URL = "http://localhost:8084/api";
    
    // Initialize Points API Service
    if (typeof pointsApi === 'undefined') {
        console.warn('Points API service not loaded. Please include points-api.js');
    }
    
    // Real user data - will be loaded from backend
    let userData = {
        name: "Loading...",
        title: "Full-Stack Developer",
        points: 0,
        level: 1,
        streak: 0,
        rank: null,
        badges: []
    };

    let leaderboardData = [];
    let recentActivities = [];
    let pointsStatistics = {};

    // Cache DOM elements for points system
    const pointsElements = {
        pointsDisplay: document.querySelector('.points-display'),
        levelDisplay: document.querySelector('.level-display'),
        rankDisplay: document.querySelector('.rank-display'),
        streakDisplay: document.querySelector('.streak-display'),
        badgesContainer: document.querySelector('.badges-container'),
        leaderboardContainer: document.querySelector('.leaderboard-container'),
        activityFeed: document.querySelector('.activity-feed'),
        levelProgressBar: document.querySelector('.level-progress-bar'),
        levelProgressText: document.querySelector('.level-progress-text')
    };
    
    // Cache DOM elements from original dashboard
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

    // Points System Functions
    
    /**
     * Extract user info from JWT token
     */
    function getUserInfoFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            // Decode JWT token (simple base64 decode, in production use proper JWT library)
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // The backend expects numeric user IDs, but JWT might contain username
            // For now, we'll use a hash of username to generate a consistent numeric ID
            let userId = payload.userId || payload.id;
            const username = payload.sub || payload.username || payload.name || 'User';
            
            // If no numeric ID is available, generate one from username
            if (!userId || isNaN(userId)) {
                // Simple hash function to convert username to numeric ID
                userId = Math.abs(username.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a; // Convert to 32-bit integer
                }, 0)) % 1000000 + 1; // Keep it within reasonable range
            }
            
            return {
                id: parseInt(userId),
                username: username,
                email: payload.email || ''
            };
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            return { id: 1, username: 'User', email: '' }; // fallback
        }
    }
    
    /**
     * Update current user in points API from JWT token
     */
    async function updateCurrentUserFromToken() {
        const userInfo = getUserInfoFromToken();
        if (userInfo && window.pointsApi) {
            window.pointsApi.setCurrentUser(userInfo);
        }
    }
    
    /**
     * Handle case when user is not found in points system
     */
    async function handleUserNotFound() {
        try {
            console.log('Attempting to initialize user in points system...');
            
            // Try to award points for daily login to create the user
            if (window.pointsApi) {
                await pointsApi.awardPoints('DAILY_LOGIN', null, { 
                    source: 'auto_initialization',
                    timestamp: new Date().toISOString()
                });
                
                console.log('User initialized successfully');
                showNotification('Welcome! Your points tracking has been set up.', 'success');
                
                // Retry loading user data
                setTimeout(() => loadUserPointsData(), 2000);
            }
        } catch (error) {
            console.error('Failed to initialize user:', error);
            // Set up with default values
            userData.points = 0;
            userData.level = 1;
            userData.streak = 0;
            userData.rank = null;
            userData.badges = [];
            
            showNotification('Points system is loading... Please refresh if issues persist.', 'warning');
        }
    }
    
    /**
     * Initialize Points System
     */
    async function initializePointsSystem() {
        try {
            // Create points display elements if they don't exist
            createPointsDisplayElements();
            
            // Load user points data
            await loadUserPointsData();
            
            // Load leaderboard
            await loadLeaderboard();
            
            // Load recent activities
            await loadRecentActivities();
            
            // Set up real-time listeners
            setupRealtimeListeners();
            
        } catch (error) {
            console.error('Error initializing points system:', error);
            showNotification('Failed to load points system', 'error');
        }
    }

    /**
     * Create points display elements in the dashboard
     */
    function createPointsDisplayElements() {
        // Check if points section already exists
        let pointsSection = document.querySelector('.points-section');
        
        if (!pointsSection) {
            // Create points section
            pointsSection = document.createElement('section');
            pointsSection.className = 'points-section';
            pointsSection.innerHTML = `
                <div class="points-header">
                    <h2>Your Progress</h2>
                </div>
                <div class="points-grid">
                    <div class="points-card">
                        <div class="points-icon">🏆</div>
                        <div class="points-info">
                            <span class="points-value points-display">0</span>
                            <span class="points-label">Points</span>
                        </div>
                    </div>
                    <div class="points-card">
                        <div class="points-icon">📊</div>
                        <div class="points-info">
                            <span class="points-value level-display">1</span>
                            <span class="points-label">Level</span>
                        </div>
                    </div>
                    <div class="points-card">
                        <div class="points-icon">🔥</div>
                        <div class="points-info">
                            <span class="points-value streak-display">0</span>
                            <span class="points-label">Streak</span>
                        </div>
                    </div>
                    <div class="points-card">
                        <div class="points-icon">🎯</div>
                        <div class="points-info">
                            <span class="points-value rank-display">-</span>
                            <span class="points-label">Rank</span>
                        </div>
                    </div>
                </div>
                <div class="level-progress">
                    <div class="level-progress-label">
                        <span>Level Progress</span>
                        <span class="level-progress-text">0%</span>
                    </div>
                    <div class="level-progress-bar-container">
                        <div class="level-progress-bar" style="width: 0%"></div>
                    </div>
                </div>
                <div class="badges-section">
                    <h3>Your Badges</h3>
                    <div class="badges-container"></div>
                </div>
            `;
            
            // Insert after the header
            const header = document.querySelector('.header');
            const mainContent = document.querySelector('main') || document.querySelector('.main-content');
            if (header && mainContent) {
                // Insert after header (as the first element after header in main content)
                const firstElementAfterHeader = header.nextElementSibling || mainContent.children[1];
                if (firstElementAfterHeader) {
                    mainContent.insertBefore(pointsSection, firstElementAfterHeader);
                } else {
                    mainContent.appendChild(pointsSection);
                }
            } else if (mainContent) {
                // Fallback: insert at the beginning of main content
                mainContent.insertBefore(pointsSection, mainContent.firstChild);
            }
        }
        
        // Update element references
        pointsElements.pointsDisplay = document.querySelector('.points-display');
        pointsElements.levelDisplay = document.querySelector('.level-display');
        pointsElements.rankDisplay = document.querySelector('.rank-display');
        pointsElements.streakDisplay = document.querySelector('.streak-display');
        pointsElements.badgesContainer = document.querySelector('.badges-container');
        pointsElements.levelProgressBar = document.querySelector('.level-progress-bar');
        pointsElements.levelProgressText = document.querySelector('.level-progress-text');

        // Add CSS for points system
        addPointsSystemCSS();
    }

    /**
     * Add CSS for points system
     */
    function addPointsSystemCSS() {
        if (document.getElementById('points-system-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'points-system-styles';
        style.textContent = `
            .points-section {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 2rem;
                margin-bottom: 2rem;
                color: white;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            .points-header h2 {
                margin: 0 0 1.5rem 0;
                font-size: 1.8rem;
                font-weight: 600;
            }
            
            .points-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .points-card {
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(20px);
                border-radius: 16px;
                padding: 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .points-icon {
                font-size: 2rem;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
            }
            
            .points-info {
                display: flex;
                flex-direction: column;
            }
            
            .points-value {
                font-size: 1.8rem;
                font-weight: 700;
                line-height: 1;
            }
            
            .points-label {
                font-size: 0.9rem;
                opacity: 0.8;
                margin-top: 0.25rem;
            }
            
            .level-progress {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .level-progress-label {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            
            .level-progress-bar-container {
                background: rgba(255, 255, 255, 0.2);
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .level-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #10b981, #34d399);
                border-radius: 4px;
                transition: width 0.5s ease;
            }
            
            .badges-section h3 {
                margin: 0 0 1rem 0;
                font-size: 1.3rem;
                font-weight: 600;
            }
            
            .badges-container {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
            }
            
            .badge-item {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                border: 1px solid rgba(255, 255, 255, 0.3);
                min-width: 100px;
                text-align: center;
            }
            
            .badge-icon {
                font-size: 2rem;
            }
            
            .badge-name {
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .badge-earned {
                font-size: 0.7rem;
                opacity: 0.8;
            }
            
            .activity-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 1rem;
                margin-bottom: 0.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .activity-description {
                flex: 1;
            }
            
            .activity-points {
                font-weight: 600;
                color: #10b981;
            }
            
            @media (max-width: 768px) {
                .points-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .points-section {
                    padding: 1.5rem;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Load user points data from backend
     */
    async function loadUserPointsData() {
        try {
            // Check if user is authenticated
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No authentication token found. Using fallback data.');
                updatePointsDisplay();
                return;
            }
            
            if (!window.pointsApi) {
                throw new Error('Points API not available');
            }
            
            // Update current user from token if needed
            await updateCurrentUserFromToken();
            
            const userPoints = await pointsApi.getUserPoints();
            const userRank = await pointsApi.getUserRank();
            
            // Update userData with backend response
            userData.points = userPoints.totalPoints || userPoints.points || 0;
            userData.level = userPoints.currentLevel || userPoints.level || 1;
            userData.streak = userPoints.currentStreak || userPoints.streak || 0;
            userData.rank = userRank.rank || null;
            userData.name = userPoints.username || userPoints.profileName || 'User';
            userData.badges = userPoints.badges || [];
            
            // Update UI
            updatePointsDisplay();
            updateBadgesDisplay();
            
        } catch (error) {
            console.error('Error loading user points data:', error);
            
            // Check for different types of errors
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                console.log('Authentication error. User may need to log in again.');
                showNotification('Please log in again to view your points', 'error');
            } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
                console.log('Server error. User may not exist in database yet.');
                // Try to create default user or use fallback
                await handleUserNotFound();
            } else if (error.message.includes('404') || error.message.includes('Not Found')) {
                console.log('User not found in points system.');
                await handleUserNotFound();
            }
            
            // Use fallback data
            updatePointsDisplay();
        }
    }

    /**
     * Update points display in UI
     */
    function updatePointsDisplay() {
        if (pointsElements.pointsDisplay) {
            pointsElements.pointsDisplay.textContent = window.pointsApi ? 
                pointsApi.formatPoints(userData.points) : userData.points;
        }
        
        if (pointsElements.levelDisplay) {
            pointsElements.levelDisplay.textContent = userData.level;
        }
        
        if (pointsElements.streakDisplay) {
            pointsElements.streakDisplay.textContent = userData.streak;
        }
        
        if (pointsElements.rankDisplay) {
            pointsElements.rankDisplay.textContent = userData.rank || '-';
        }
        
        // Update level progress
        if (pointsElements.levelProgressBar && pointsElements.levelProgressText && window.pointsApi) {
            const progress = pointsApi.getLevelProgress(userData.level, userData.points);
            pointsElements.levelProgressBar.style.width = progress + '%';
            pointsElements.levelProgressText.textContent = Math.round(progress) + '%';
        }
    }

    /**
     * Update badges display
     */
    function updateBadgesDisplay() {
        if (!pointsElements.badgesContainer) return;
        
        if (userData.badges.length === 0) {
            pointsElements.badgesContainer.innerHTML = `
                <div style="text-align: center; opacity: 0.7; padding: 1rem;">
                    No badges earned yet. Keep being active to earn your first badge!
                </div>
            `;
            return;
        }
        
        const badgesHTML = userData.badges.map(badge => `
            <div class="badge-item">
                <div class="badge-icon">${badge.badgeIcon || '🏅'}</div>
                <div class="badge-name">${badge.badgeName}</div>
                <div class="badge-earned">${new Date(badge.earnedAt).toLocaleDateString()}</div>
            </div>
        `).join('');
        
        pointsElements.badgesContainer.innerHTML = badgesHTML;
    }

    /**
     * Load leaderboard data
     */
    async function loadLeaderboard() {
        try {
            if (!window.pointsApi) return;
            
            leaderboardData = await pointsApi.getLeaderboard(10);
            updateLeaderboardDisplay();
            
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            
            // Don't show error notification for leaderboard as it's not critical
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                console.log('Authentication error loading leaderboard.');
            }
        }
    }

    /**
     * Update leaderboard display
     */
    function updateLeaderboardDisplay() {
        // This would update a leaderboard widget if it exists
        // Implementation depends on your UI layout
    }

    /**
     * Load recent activities
     */
    async function loadRecentActivities() {
        try {
            if (!window.pointsApi) return;
            
            const history = await pointsApi.getUserHistory(10);
            recentActivities = history.map(item => ({
                type: item.activityType,
                description: getActivityDescription(item.activityType),
                points: item.pointsAwarded,
                time: new Date(item.createdAt).toRelativeString()
            }));
            
        } catch (error) {
            console.error('Error loading recent activities:', error);
            
            // Don't show error notification for activities as it's not critical
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                console.log('Authentication error loading activities.');
            }
        }
    }

    /**
     * Get activity description
     */
    function getActivityDescription(activityType) {
        const descriptions = {
            'POST_CREATED': 'Created a new post',
            'POST_LIKED': 'Received a like on post',
            'COMMENT_CREATED': 'Added a comment',
            'COMMENT_LIKED': 'Received a like on comment',
            'PROFILE_COMPLETED': 'Completed profile',
            'DAILY_LOGIN': 'Daily login',
            'WEEKLY_STREAK': 'Weekly streak milestone',
            'EVENT_ATTENDED': 'Attended an event',
            'COURSE_COMPLETED': 'Completed a course',
            'LEVEL_UP': 'Level up achieved!'
        };
        return descriptions[activityType] || activityType;
    }

    /**
     * Setup real-time listeners
     */
    function setupRealtimeListeners() {
        if (!window.pointsApi) return;
        
        // Check if user is authenticated before setting up WebSocket
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No authentication token. Skipping real-time listeners.');
            return;
        }
        
        // Listen for points updates
        pointsApi.addEventListener('pointsUpdate', (data) => {
            userData.points = data.totalPoints;
            userData.level = data.currentLevel;
            userData.streak = data.currentStreak;
            updatePointsDisplay();
            
            // Show notification
            showNotification(`+${data.pointsAwarded} points for ${getActivityDescription(data.activityType)}!`, 'success');
        });
        
        // Listen for badge earned
        pointsApi.addEventListener('badgeEarned', (data) => {
            userData.badges.unshift(data);
            updateBadgesDisplay();
            
            // Show special notification for badge
            showBadgeNotification(data);
        });
        
        // Listen for level up
        pointsApi.addEventListener('levelUp', (data) => {
            userData.level = data.newLevel;
            updatePointsDisplay();
            
            // Show level up notification
            showLevelUpNotification(data);
        });
    }

    /**
     * Award points for activities
     */
    async function awardPointsForActivity(activityType, referenceId = null, metadata = {}) {
        try {
            if (!window.pointsApi) return;
            
            await pointsApi.awardPoints(activityType, referenceId, metadata);
            // Real-time listener will handle UI updates
            
        } catch (error) {
            console.error('Error awarding points:', error);
        }
    }

    /**
     * Show badge notification
     */
    function showBadgeNotification(badge) {
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.style.cssText = `
            position: fixed; top: 50%; left: 50%; z-index: 10000;
            transform: translate(-50%, -50%) scale(0.8);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 2rem; border-radius: 20px;
            text-align: center; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            max-width: 300px; opacity: 0; transition: all 0.5s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">${badge.badgeIcon || '🏅'}</div>
            <h3 style="margin: 0 0 0.5rem 0;">Badge Earned!</h3>
            <p style="margin: 0; font-weight: 600;">${badge.badgeName}</p>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.8; font-size: 0.9rem;">${badge.badgeDescription}</p>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        // Auto remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    /**
     * Show level up notification
     */
    function showLevelUpNotification(levelData) {
        showNotification(`🎉 Level Up! You've reached Level ${levelData.newLevel} and earned ${levelData.bonusPoints} bonus points!`, 'success');
    }

    // Enhanced notification system (from original dashboard)
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

    // Override original post creation to award points
    const originalCreatePostHandler = async function(formData, communityId) {
        // Call original API
        const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`, {
            method: 'POST',
            headers: {
                ...(localStorage.getItem("token") && { "Authorization": "Bearer " + localStorage.getItem("token") })
            },
            body: formData
        });
        
        if (response.ok) {
            const postData = await response.json();
            
            // Award points for creating post
            await awardPointsForActivity('POST_CREATED', postData.id, {
                communityId: communityId,
                postTitle: formData.get('title')
            });
            
            return postData;
        }
        
        throw new Error('Failed to create post');
    };

    // Utility: Add relative time formatting
    Date.prototype.toRelativeString = function() {
        const now = new Date();
        const diff = now.getTime() - this.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    // Initialize everything including the original dashboard functions
    // ... (Include all the original dashboard functions here)
    
    // Initialize Hamburger Menu - Fixed Version
    function initializeHamburgerMenu() {
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (!hamburgerBtn || !sidebar || !sidebarOverlay) {
            console.warn('Hamburger menu elements not found');
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

        const navLinks = sidebar.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
                    toggleSidebar();
                }
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024 && sidebar.classList.contains('open')) {
                toggleSidebar();
            }
        });
    }

    // Main initialization
    async function initialize() {
        try {
            // Initialize hamburger menu first
            initializeHamburgerMenu();
            
            // Initialize points system
            await initializePointsSystem();
            
            console.log("Dashboard with points system initialized successfully");
        } catch (error) {
            console.error("Error initializing dashboard:", error);
            showNotification("Some features may not work properly. Please refresh the page.", 'error');
        }
    }

    // Start initialization
    initialize();
});