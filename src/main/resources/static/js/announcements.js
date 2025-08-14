// js/announcements.js - Enhanced announcements management with modern UI
document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = window.location.origin; // API base URL, consistent with other JS files

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
    const announcementsList = document.getElementById("announcementsList");
    const searchInput = document.getElementById("searchInput");
    const filterCommunity = document.getElementById("filterCommunity");
    const filterType = document.getElementById("filterType");
    const filterTabs = document.querySelectorAll('.filter-tab');
    const urgentBadge = document.getElementById("urgentBadge");

    // Store announcements data
    let announcements = [];
    let filteredAnnouncements = [];
    let currentFilter = 'all';

    // Initialize the page
    async function initializePage() {
        await fetchAnnouncements();
        initializeEventListeners();
        updateUrgentBadge();
    }

    // Fetch announcements from the backend
    async function fetchAnnouncements() {
        try {
            showLoadingState();
            const response = await fetch(`${API_BASE_URL}/announcements`, { headers: getAuthHeaders() });
            const data = await response.json();

            if (response.ok && data && data.length > 0) {
                announcements = data.map(ann => ({
                    ...ann,
                    date: new Date(ann.date || Date.now()).getTime(),
                    priority: ann.priority || 'normal',
                    category: ann.category || 'general',
                    read: ann.read || false,
                    bookmarked: ann.bookmarked || false
                }));
                filteredAnnouncements = [...announcements];
                renderAnnouncements();
            } else {
                // Keep static announcements as fallback
                initializeStaticAnnouncements();
                renderAnnouncements();
            }
        } catch (error) {
            console.error("Error fetching announcements:", error);
            // Keep static announcements as fallback
            initializeStaticAnnouncements();
            renderAnnouncements();
        }
    }

    // Initialize static announcements from the HTML
    function initializeStaticAnnouncements() {
        const staticCards = document.querySelectorAll('.announcement-card');
        announcements = Array.from(staticCards).map((card, index) => {
            const priority = card.classList.contains('urgent') ? 'urgent' : 'normal';
            const category = card.dataset.category || 'general';
            const title = card.querySelector('.announcement-title')?.textContent || '';
            const description = card.querySelector('.announcement-description')?.textContent || '';
            const author = card.querySelector('.author-name')?.textContent || '';
            const timeText = card.querySelector('.post-time')?.textContent || '';
            const deadline = card.querySelector('.announcement-deadline span')?.textContent || '';

            return {
                id: index + 1,
                title,
                content: description,
                description,
                priority,
                category,
                author,
                timeText,
                deadline,
                date: Date.now() - (index * 3600000), // Stagger by hours
                read: false,
                bookmarked: false,
                tags: Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent)
            };
        });
        filteredAnnouncements = [...announcements];
    }

    // Render announcements
    function renderAnnouncements() {
        if (filteredAnnouncements.length === 0) {
            renderEmptyState();
            return;
        }

        announcementsList.innerHTML = '';

        filteredAnnouncements.forEach((announcement, index) => {
            const announcementCard = createAnnouncementCard(announcement);
            announcementsList.appendChild(announcementCard);

            // Animate in with stagger
            setTimeout(() => {
                announcementCard.style.opacity = '1';
                announcementCard.style.transform = 'translateY(0)';
            }, 100 + (index * 50));
        });
    }

    // Create announcement card element
    function createAnnouncementCard(announcement) {
        const card = document.createElement('article');
        card.className = `announcement-card ${announcement.priority} ${announcement.read ? 'read' : ''}`;
        card.dataset.priority = announcement.priority;
        card.dataset.category = announcement.category;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

        const priorityIcon = announcement.priority === 'urgent' ? `
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
            <path d="M12 2L2 22h20L12 2z"/>
        ` : `
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
        `;

        const priorityText = announcement.priority === 'urgent' ? 'HIGH' : 'NORMAL';

        const categoryClass = announcement.category || 'general';
        const categoryText = (announcement.category || 'general').charAt(0).toUpperCase() + (announcement.category || 'general').slice(1);

        const tags = announcement.tags ? announcement.tags.map(tag =>
            `<span class="tag">${tag}</span>`
        ).join('') : '';

        const authorInitials = announcement.author ?
            announcement.author.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : 'UA';

        card.innerHTML = `
            <div class="announcement-header">
                <div class="priority-indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        ${priorityIcon}
                    </svg>
                    <span class="priority-text">${priorityText}</span>
                </div>
                <div class="announcement-category ${categoryClass}">${categoryText}</div>
                <button class="bookmark-btn ${announcement.bookmarked ? 'bookmarked' : ''}" data-announcement-id="${announcement.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l5-5 5 5z"/>
                    </svg>
                </button>
            </div>
            
            <h3 class="announcement-title">${announcement.title}</h3>
            <p class="announcement-description">${announcement.content || announcement.description}</p>
            
            ${tags ? `<div class="announcement-tags">${tags}</div>` : ''}
            
            <div class="announcement-footer">
                <div class="author-info">
                    <div class="author-avatar">${authorInitials}</div>
                    <div class="author-details">
                        <span class="author-name">${announcement.author || 'University Admin'}</span>
                        <span class="post-time">${announcement.timeText || formatTimeAgo(announcement.date)}</span>
                    </div>
                </div>
                <div class="announcement-deadline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span>${announcement.deadline || 'No deadline'}</span>
                </div>
            </div>
        `;

        return card;
    }

    // Format time ago
    function formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return 'Recently';
        }
    }

    // Show loading state
    function showLoadingState() {
        announcementsList.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'loading-skeleton skeleton-announcement';
            announcementsList.appendChild(skeleton);
        }
    }

    // Render empty state
    function renderEmptyState() {
        announcementsList.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                </svg>
                <h3>No announcements found</h3>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
    }

    // Filter announcements
    function filterAnnouncements() {
        let filtered = [...announcements];

        // Apply search filter
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (searchTerm) {
            filtered = filtered.filter(announcement =>
                announcement.title.toLowerCase().includes(searchTerm) ||
                (announcement.content || announcement.description || '').toLowerCase().includes(searchTerm) ||
                (announcement.author || '').toLowerCase().includes(searchTerm)
            );
        }

        // Apply category filter
        const categoryFilter = filterCommunity ? filterCommunity.value : 'all';
        if (categoryFilter && categoryFilter !== 'all') {
            filtered = filtered.filter(announcement =>
                announcement.category === categoryFilter
            );
        }

        // Apply priority filter
        const priorityFilter = filterType ? filterType.value : 'all';
        if (priorityFilter && priorityFilter !== 'all') {
            filtered = filtered.filter(announcement =>
                announcement.priority === priorityFilter
            );
        }

        // Apply tab filter
        if (currentFilter !== 'all') {
            filtered = filtered.filter(announcement => {
                if (currentFilter === 'urgent') {
                    return announcement.priority === 'urgent';
                } else {
                    return announcement.category === currentFilter;
                }
            });
        }

        filteredAnnouncements = filtered;
        renderAnnouncements();
    }

    // Toggle bookmark
    async function toggleBookmark(announcementId) {
        const announcement = announcements.find(a => a.id == announcementId);
        if (!announcement) return;

        try {
            const response = await fetch(`${API_BASE_URL}/announcements/${announcementId}/bookmark`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ bookmarked: !announcement.bookmarked })
            });

            if (response.ok) {
                announcement.bookmarked = !announcement.bookmarked;
                const message = announcement.bookmarked ? 'Announcement bookmarked!' : 'Bookmark removed!';
                showNotification(message, 'success');
                // Re-filter to update display
                filterAnnouncements();
            } else {
                const errorData = await response.json();
                showNotification(`Failed to update bookmark: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            // Fallback: update locally
            announcement.bookmarked = !announcement.bookmarked;
            const message = announcement.bookmarked ? 'Announcement bookmarked!' : 'Bookmark removed!';
            showNotification(message, 'success');
            filterAnnouncements();
        }
    }

    // Mark as read/unread
    async function toggleRead(announcementId) {
        const announcement = announcements.find(a => a.id == announcementId);
        if (!announcement) return;

        try {
            const response = await fetch(`${API_BASE_URL}/announcements/${announcementId}/read`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ read: !announcement.read })
            });

            if (response.ok) {
                announcement.read = !announcement.read;
                const message = announcement.read ? 'Marked as read!' : 'Marked as unread!';
                showNotification(message, 'success');
                filterAnnouncements();
            } else {
                const errorData = await response.json();
                showNotification(`Failed to update read status: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Error toggling read status:", error);
            // Fallback: update locally
            announcement.read = !announcement.read;
            const message = announcement.read ? 'Marked as read!' : 'Marked as unread!';
            showNotification(message, 'success');
            filterAnnouncements();
        }
    }

    // Update urgent badge
    function updateUrgentBadge() {
        const urgentCount = announcements.filter(a => a.priority === 'urgent' && !a.read).length;
        if (urgentBadge) {
            urgentBadge.textContent = urgentCount;
            urgentBadge.style.display = urgentCount > 0 ? 'inline' : 'none';
        }
    }

    // Initialize event listeners
    function initializeEventListeners() {
        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', debounce(filterAnnouncements, 300));
        }

        // Filter dropdowns
        if (filterCommunity) {
            filterCommunity.addEventListener('change', filterAnnouncements);
        }

        if (filterType) {
            filterType.addEventListener('change', filterAnnouncements);
        }

        // Filter tabs
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update current filter
                currentFilter = tab.dataset.filter;
                filterAnnouncements();
            });
        });

        // Bookmark buttons (event delegation)
        announcementsList.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.bookmark-btn');
                const announcementId = btn.dataset.announcementId;
                toggleBookmark(announcementId);
            }
        });

        // Card click to mark as read
        announcementsList.addEventListener('click', (e) => {
            if (e.target.closest('.announcement-card') && !e.target.closest('.bookmark-btn')) {
                const card = e.target.closest('.announcement-card');
                const announcementId = card.querySelector('.bookmark-btn').dataset.announcementId;
                const announcement = announcements.find(a => a.id == announcementId);
                if (announcement && !announcement.read) {
                    toggleRead(announcementId);
                }
            }
        });
    }

    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize the page
    initializePage();
});