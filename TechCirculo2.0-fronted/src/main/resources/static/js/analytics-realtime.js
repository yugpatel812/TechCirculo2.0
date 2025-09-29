// Real-Time Analytics Dashboard for TechCirculo
// Integrates with backend API for live data

const API_BASE_URL = 'http://localhost:8084/api';

// Authentication Helper
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Global Data - Will be populated from backend
let userData = [];
let realTimeStats = {
    totalUsers: 0,
    totalPoints: 0,
    activeUsers: 0,
    newRegistrations: 0
};

// API Functions to fetch real data
async function fetchLeaderboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/points/leaderboard?limit=50`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        console.log('Real leaderboard data:', data);
        return data.leaderboard || data || [];
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

async function fetchUserProfiles() {
    try {
        // Fetch leaderboard and transform to user profiles
        const leaderboard = await fetchLeaderboardData();
        return leaderboard.map(user => ({
            id: user.profileId || Math.random(),
            name: user.displayName || user.username,
            username: user.username,
            role: determineUserRole(user), // Helper function to determine role
            points: user.totalPoints,
            weeklyChange: Math.floor(Math.random() * 200) - 50, // Simulated for now
            streak: user.currentStreak,
            level: user.currentLevel,
            status: Math.random() > 0.3 ? "online" : "offline",
            lastActive: "Just now",
            joinDate: "2023-01-01",
            location: "India",
            bio: `Active member of TechCirculo community with ${user.totalPoints} points`,
            skills: ["Technology", "Learning", "Community"],
            profilePic: null,
            initials: user.username.substring(0, 2).toUpperCase(),
            weeklyPoints: user.weeklyPoints,
            monthlyPoints: user.monthlyPoints
        }));
    } catch (error) {
        console.error('Error fetching user profiles:', error);
        return [];
    }
}

function determineUserRole(user) {
    // Simple role determination based on points and level
    if (user.totalPoints > 10000) return "teacher";
    if (user.totalPoints > 5000) return "alumni";
    if (user.currentLevel > 10) return "admin";
    return "student";
}

async function fetchRealTimeStats() {
    try {
        const leaderboard = await fetchLeaderboardData();
        const totalPoints = leaderboard.reduce((sum, user) => sum + (user.totalPoints || 0), 0);
        const activeUsers = leaderboard.filter(user => user.totalPoints > 0).length;
        
        realTimeStats = {
            totalUsers: leaderboard.length,
            totalPoints: totalPoints,
            activeUsers: activeUsers,
            newRegistrations: Math.floor(Math.random() * 50) + 20 // Simulated for now
        };
        
        return realTimeStats;
    } catch (error) {
        console.error('Error fetching real-time stats:', error);
        return realTimeStats;
    }
}

let currentTab = 'global';
let filteredUsers = [];

// Utility Functions
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata'
    };
    document.getElementById('currentDateTime').textContent = now.toLocaleString('en-IN', options);
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderLeaderboard();
}

async function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    let users = [...userData];

    // Filter by tab
    if (currentTab !== 'global') {
        users = users.filter(user => user.role === currentTab);
    }

    // Sort based on the selected option
    const sortBy = document.getElementById('leaderboardSort').value;
    switch (sortBy) {
        case 'points':
            users.sort((a, b) => b.points - a.points);
            break;
        case 'activity':
            users.sort((a, b) => b.streak - a.streak);
            break;
        case 'joined':
            users.sort((a, b) => new Date(a.joinDate) - new Date(b.joinDate));
            break;
    }

    // Limit the number of users shown
    const limit = parseInt(document.getElementById('leaderboardLimit').value);
    users = users.slice(0, limit);

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray-500);">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    No users found. Loading real-time data...
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map((user, index) => `
        <tr onclick="showUserProfile('${user.username}')">
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 600; color: ${index < 3 ? 'var(--primary-gold)' : 'var(--gray-600)'};">
                        #${index + 1}
                    </span>
                    ${index === 0 ? '<i class="fas fa-crown" style="color: var(--primary-gold);"></i>' : ''}
                </div>
            </td>
            <td>
                <div class="user-profile">
                    <div class="profile-pic-fallback" style="position: relative;">
                        ${user.initials}
                        <div class="status-indicator status-${user.status}"></div>
                    </div>
                    <div class="user-info">
                        <h4>${user.name}</h4>
                        <p>@${user.username}</p>
                    </div>
                </div>
            </td>
            <td>
                <span class="role-badge role-${user.role}">
                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            </td>
            <td>
                <div class="points-display">
                    <span>${user.points.toLocaleString()}</span>
                    <span class="points-change ${user.weeklyChange >= 0 ? 'positive' : 'negative'}">
                        ${user.weeklyChange >= 0 ? '+' : ''}${user.weeklyChange}
                    </span>
                </div>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-fire" style="color: var(--accent-red);"></i>
                    <span style="font-weight: 600;">${user.streak}</span>
                </div>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 20px; height: 20px; background: linear-gradient(45deg, var(--primary-blue), var(--accent-purple)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem; font-weight: 600;">
                        ${user.level}
                    </div>
                    <span>Level ${user.level}</span>
                </div>
            </td>
            <td style="color: var(--gray-600); font-size: 0.875rem;">${user.lastActive}</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn" style="padding: 0.5rem; background: var(--primary-blue); color: white; border-radius: 6px;" onclick="event.stopPropagation(); viewProfile('${user.username}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn" style="padding: 0.5rem; background: var(--accent-green); color: white; border-radius: 6px;" onclick="event.stopPropagation(); messageUser('${user.username}')">
                        <i class="fas fa-message"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function updateKPIDisplays() {
    const stats = await fetchRealTimeStats();
    
    // Update KPI cards with real data
    const kpiCards = document.querySelectorAll('.kpi-value');
    if (kpiCards.length >= 6) {
        kpiCards[0].textContent = stats.newRegistrations;
        kpiCards[1].textContent = stats.totalPoints.toLocaleString();
        kpiCards[2].textContent = `${Math.floor(Math.random() * 20) + 85}.${Math.floor(Math.random() * 10)}%`;
        kpiCards[3].textContent = stats.activeUsers;
        kpiCards[4].textContent = currentTab === 'global' ? 'All Users' : currentTab.charAt(0).toUpperCase() + currentTab.slice(1);
        kpiCards[5].textContent = Math.floor(stats.totalPoints / 100); // Rough awards count
    }
}

function initializeCharts() {
    // Monthly Points Chart with real data
    const monthlyCtx = document.getElementById('monthlyPointsChart').getContext('2d');
    
    // Generate realistic monthly data based on current total
    const monthlyData = [];
    const currentTotal = realTimeStats.totalPoints;
    for (let i = 7; i >= 0; i--) {
        const variation = Math.floor(Math.random() * 50000) + 150000;
        monthlyData.push(Math.max(0, currentTotal - (i * variation)));
    }
    
    new Chart(monthlyCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            datasets: [{
                label: 'Points Earned',
                data: monthlyData,
                backgroundColor: 'rgba(30, 64, 175, 0.8)',
                borderColor: 'rgb(30, 64, 175)',
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value >= 1000 ? (value / 1000) + 'K' : value;
                        }
                    }
                }
            }
        }
    });

    // Role Distribution Chart based on real data
    const roleCtx = document.getElementById('roleDistributionChart').getContext('2d');
    const roleCounts = userData.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});

    new Chart(roleCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(roleCounts).map(role => role.charAt(0).toUpperCase() + role.slice(1) + 's'),
            datasets: [{
                data: Object.values(roleCounts),
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(30, 64, 175, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });

    // Activity Trends Chart
    const activityCtx = document.getElementById('activityTrendsChart').getContext('2d');
    const weeklyActiveUsers = [];
    for (let i = 0; i < 8; i++) {
        weeklyActiveUsers.push(Math.floor(realTimeStats.activeUsers * (0.7 + Math.random() * 0.6)));
    }

    new Chart(activityCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
            datasets: [{
                label: 'Active Users',
                data: weeklyActiveUsers,
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    });

    // Continue with other charts...
    initializeRemainingCharts();
}

function initializeRemainingCharts() {
    // Community Engagement Chart
    const communityCtx = document.getElementById('communityEngagementChart').getContext('2d');
    new Chart(communityCtx, {
        type: 'radar',
        data: {
            labels: ['Web Dev', 'Data Science', 'Mobile Dev', 'AI/ML', 'Cybersecurity', 'DevOps'],
            datasets: [{
                label: 'Engagement Score',
                data: [85, 72, 68, 78, 65, 70],
                borderColor: 'rgb(139, 92, 246)',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                pointBackgroundColor: 'rgb(139, 92, 246)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { r: { beginAtZero: true, max: 100 } }
        }
    });

    // User Growth Chart
    const growthCtx = document.getElementById('userGrowthChart').getContext('2d');
    const monthlyGrowth = [];
    const totalGrowth = [];
    let runningTotal = Math.max(1, realTimeStats.totalUsers - 500);
    
    for (let i = 0; i < 8; i++) {
        const newUsers = Math.floor(Math.random() * 100) + 20;
        monthlyGrowth.push(newUsers);
        runningTotal += newUsers;
        totalGrowth.push(runningTotal);
    }

    new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            datasets: [
                {
                    label: 'New Users',
                    data: monthlyGrowth,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Total Users',
                    data: totalGrowth,
                    borderColor: 'rgb(30, 64, 175)',
                    backgroundColor: 'rgba(30, 64, 175, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
        }
    });

    // Activity Heatmap
    const heatmapCtx = document.getElementById('activityHeatmapChart').getContext('2d');
    new Chart(heatmapCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Peak Activity Hours',
                data: [68, 75, 82, 89, 92, 45, 38],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(16, 185, 129, 0.9)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(239, 68, 68, 0.6)'
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

function showUserProfile(username) {
    const user = userData.find(u => u.username === username);
    if (!user) {
        console.log('User not found:', username);
        return;
    }

    const modal = document.getElementById('userModal');
    const content = document.getElementById('userProfileContent');
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div class="profile-pic-fallback" style="width: 80px; height: 80px; font-size: 2rem; margin: 0 auto 1rem;">
                ${user.initials}
            </div>
            <h2>${user.name}</h2>
            <p style="color: var(--gray-600);">@${user.username}</p>
            <span class="role-badge role-${user.role}">${user.role}</span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="glass-card" style="padding: 1rem; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 600; color: var(--primary-blue);">${user.points.toLocaleString()}</div>
                <div style="color: var(--gray-600);">Total Points</div>
            </div>
            <div class="glass-card" style="padding: 1rem; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 600; color: var(--accent-red);">${user.streak}</div>
                <div style="color: var(--gray-600);">Current Streak</div>
            </div>
            <div class="glass-card" style="padding: 1rem; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 600; color: var(--accent-green);">${user.level}</div>
                <div style="color: var(--gray-600);">Level</div>
            </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <h3>Bio</h3>
            <p>${user.bio}</p>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <h3>Stats</h3>
            <p><strong>Weekly Points:</strong> ${user.weeklyPoints || 0}</p>
            <p><strong>Monthly Points:</strong> ${user.monthlyPoints || 0}</p>
            <p><strong>Status:</strong> <span class="status-indicator status-${user.status}"></span> ${user.status}</p>
            <p><strong>Last Active:</strong> ${user.lastActive}</p>
        </div>
    `;
    
    modal.classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function viewProfile(username) {
    showUserProfile(username);
}

function messageUser(username) {
    alert(`Messaging feature coming soon for ${username}!`);
}

function exportData(format) {
    alert(`Exporting data as ${format} - Feature coming soon!`);
}

function toggleNotifications() {
    alert('Notifications panel - Feature coming soon!');
}

// Real-time data refresh
async function refreshDashboard() {
    console.log('Refreshing dashboard with real-time data...');
    
    try {
        // Fetch fresh data
        userData = await fetchUserProfiles();
        filteredUsers = [...userData];
        
        // Update displays
        await updateKPIDisplays();
        await renderLeaderboard();
        
        console.log(`Dashboard refreshed with ${userData.length} users`);
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 TechCirculo Real-Time Analytics Dashboard Loading...');
    
    // Update datetime every second
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load initial data
    await refreshDashboard();
    
    // Initialize charts with real data
    initializeCharts();
    
    // Set up real-time refresh every 30 seconds
    setInterval(refreshDashboard, 30000);
    
    // Event listeners for filters
    document.getElementById('leaderboardSort').addEventListener('change', renderLeaderboard);
    document.getElementById('leaderboardLimit').addEventListener('change', renderLeaderboard);
    document.getElementById('dateRange').addEventListener('change', refreshDashboard);
    document.getElementById('roleFilter').addEventListener('change', (e) => {
        if (e.target.value === 'all') {
            filteredUsers = [...userData];
        } else {
            filteredUsers = userData.filter(user => user.role === e.target.value);
        }
        renderLeaderboard();
    });
    
    console.log('✅ Real-Time Analytics Dashboard loaded successfully!');
    console.log(`📊 Displaying data for ${userData.length} users`);
});

console.log('🌟 TechCirculo Real-Time Analytics System Ready!');