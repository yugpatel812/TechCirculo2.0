// announcements.js

document.addEventListener("DOMContentLoaded", function () {
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
    const announcementList = document.getElementById("announcementsList"); // Changed from announcement-list to announcementsList based on HTML
    const searchInput = document.getElementById("search"); // This ID is not in HTML, leaving for future if added
    const filterCommunitySelect = document.getElementById("filterCommunity");
    const filterTypeSelect = document.getElementById("filterType");
    const filterDateSelect = document.getElementById("filterDate");
    const loadMoreBtn = document.getElementById("load-more"); // This ID is not in HTML, leaving for future if added

    // Use an empty array to store fetched announcements
    let announcements = [];
    let visibleAnnouncements = 5; // Initial number of announcements to show

    // Fetch announcements from the backend
    async function fetchAnnouncements() {
        try {
            const response = await fetch(`${API_BASE_URL}/announcements`, { headers: getAuthHeaders() });
            const data = await response.json();
            if (response.ok) {
                // Assuming backend returns an array of announcement objects with id, title, content, date, read, bookmarked
                announcements = data.map(ann => ({
                    ...ann,
                    date: new Date(ann.date).getTime() // Ensure date is a timestamp for sorting
                }));
                displayAnnouncements();
            } else {
                console.error("Failed to fetch announcements:", data.message);
                announcementList.innerHTML = "<li>Failed to load announcements.</li>";
            }
        } catch (error) {
            console.error("Error fetching announcements:", error);
            announcementList.innerHTML = "<li>An error occurred while loading announcements.</li>";
        }
    }

    // Display announcements dynamically
    function displayAnnouncements() {
        announcementList.innerHTML = "";
        const filtered = filterAnnouncements();
        const sorted = sortAnnouncements(filtered);

        if (sorted.length === 0) {
            announcementList.innerHTML = "<li>No announcements found matching your criteria.</li>";
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        sorted.slice(0, visibleAnnouncements).forEach(announcement => {
            const div = document.createElement("div");
            div.className = `announcement ${announcement.read ? '' : 'unread'}`;
            // Added placeholder community/type for display as they are not explicitly in the static data structure from the previous announcements.js
            // You'll need to adjust this if your backend provides these fields.
            const communityName = announcement.communityName || "General";
            const announcementType = announcement.type || "Update";

            div.innerHTML = `
                <h3>${announcement.title}</h3>
                <p><strong>Community:</strong> ${communityName} | <strong>Type:</strong> ${announcementType}</p>
                <p>${announcement.content}</p>
                <p class="date">${new Date(announcement.date).toLocaleDateString()}</p>
                <button onclick="toggleRead(${announcement.id})">
                    ${announcement.read ? 'Mark as Unread' : 'Mark as Read'}
                </button>
                <button onclick="toggleBookmark(${announcement.id})">
                    ${announcement.bookmarked ? 'Remove Bookmark' : 'Bookmark'}
                </button>
            `;
            announcementList.appendChild(div);
        });

        // Update load more button visibility
        if (loadMoreBtn) {
            loadMoreBtn.style.display = sorted.length > visibleAnnouncements ? 'block' : 'none';
        }
    }

    // Filter announcements based on user input
    function filterAnnouncements() {
        let filtered = announcements;

        // Search filter (if searchInput exists)
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(searchTerm) ||
                a.content.toLowerCase().includes(searchTerm)
            );
        }

        // Community filter (if filterCommunitySelect exists)
        if (filterCommunitySelect && filterCommunitySelect.value !== "all") {
            const communityFilter = filterCommunitySelect.value;
            filtered = filtered.filter(a => a.communityId === communityFilter); // Assuming communityId is on announcement object
        }

        // Type filter (if filterTypeSelect exists)
        if (filterTypeSelect && filterTypeSelect.value !== "all") {
            const typeFilter = filterTypeSelect.value;
            filtered = filtered.filter(a => a.type && a.type.toLowerCase() === typeFilter); // Assuming 'type' field exists on announcement object
        }

        return filtered;
    }

    // Sort announcements based on selection
    function sortAnnouncements(list) {
        if (filterDateSelect) {
            return list.sort((a, b) => filterDateSelect.value === "latest" ? b.date - a.date : a.date - b.date);
        }
        return list; // Return unsorted if no sort select
    }

    // Toggle read/unread state
    window.toggleRead = async function(id) {
        const announcement = announcements.find(a => a.id === id);
        if (announcement) {
            try {
                const response = await fetch(`${API_BASE_URL}/announcements/${id}/read`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ read: !announcement.read }) // Toggle the read status
                });

                if (response.ok) {
                    announcement.read = !announcement.read; // Update local state
                    displayAnnouncements(); // Re-display
                } else {
                    const errorData = await response.json();
                    alert(`Failed to update read status: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error("Error toggling read status:", error);
                alert("An error occurred while updating the read status.");
            }
        }
    }

    // Toggle bookmark state
    window.toggleBookmark = async function(id) {
        const announcement = announcements.find(a => a.id === id);
        if (announcement) {
            try {
                const response = await fetch(`${API_BASE_URL}/announcements/${id}/bookmark`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ bookmarked: !announcement.bookmarked }) // Toggle the bookmark status
                });

                if (response.ok) {
                    announcement.bookmarked = !announcement.bookmarked; // Update local state
                    displayAnnouncements(); // Re-display
                } else {
                    const errorData = await response.json();
                    alert(`Failed to update bookmark status: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error("Error toggling bookmark status:", error);
                alert("An error occurred while updating the bookmark status.");
            }
        }
    }

    // Event Listeners for filtering, sorting, searching
    // Check if elements exist before adding listeners
    if (searchInput) searchInput.addEventListener("input", displayAnnouncements);
    if (filterCommunitySelect) filterCommunitySelect.addEventListener("change", displayAnnouncements);
    if (filterTypeSelect) filterTypeSelect.addEventListener("change", displayAnnouncements);
    if (filterDateSelect) filterDateSelect.addEventListener("change", displayAnnouncements);

    // Load more announcements dynamically
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", function () {
            visibleAnnouncements += 5;
            displayAnnouncements();
        });
    }

    // Highlight active sidebar link
    function setActiveSidebar() {
        const currentPath = window.location.pathname.split("/").pop();
        document.querySelectorAll(".sidebar nav a").forEach(link => {
            const linkHref = link.getAttribute("href").split("/").pop();
            link.classList.toggle("active", linkHref === currentPath || (currentPath === "" && linkHref === "index.html"));
        });
    }

    // Initial page load
    fetchAnnouncements();
    setActiveSidebar();
});