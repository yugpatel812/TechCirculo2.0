 // Global Data
        const userData = [
            {
                id: 1,
                name: "Arjun Sharma",
                role: "student",
                points: 12450,
                weeklyChange: 342,
                streak: 15,
                level: 8,
                status: "online",
                lastActive: "2 minutes ago",
                joinDate: "2023-09-15",
                location: "Mumbai, India",
                bio: "Full-stack developer passionate about React and Node.js",
                skills: ["JavaScript", "React", "Node.js", "MongoDB"],
                profilePic: null,
                initials: "AS"
            },
            {
                id: 2,
                name: "Dr. Priya Patel",
                role: "teacher",
                points: 18750,
                weeklyChange: 156,
                streak: 42,
                level: 12,
                status: "online",
                lastActive: "5 minutes ago",
                joinDate: "2022-03-10",
                location: "Bangalore, India",
                bio: "Computer Science Professor specializing in AI/ML",
                skills: ["Python", "Machine Learning", "Data Science", "TensorFlow"],
                profilePic: null,
                initials: "PP"
            },
            {
                id: 3,
                name: "Rahul Verma",
                role: "alumni",
                points: 15200,
                weeklyChange: -45,
                streak: 8,
                level: 10,
                status: "away",
                lastActive: "1 hour ago",
                joinDate: "2020-01-20",
                location: "Pune, India",
                bio: "Senior Software Engineer at Google, mentor for junior developers",
                skills: ["Java", "Spring Boot", "Microservices", "Docker"],
                profilePic: null,
                initials: "RV"
            },
            {
                id: 4,
                name: "Sneha Gupta",
                role: "student",
                points: 9870,
                weeklyChange: 278,
                streak: 23,
                level: 6,
                status: "online",
                lastActive: "Just now",
                joinDate: "2023-11-05",
                location: "Delhi, India",
                bio: "UI/UX Designer learning frontend development",
                skills: ["Figma", "HTML", "CSS", "JavaScript"],
                profilePic: null,
                initials: "SG"
            },
            {
                id: 5,
                name: "Prof. Amit Kumar",
                role: "teacher",
                points: 22100,
                weeklyChange: 89,
                streak: 67,
                level: 15,
                status: "offline",
                lastActive: "2 hours ago",
                joinDate: "2021-08-12",
                location: "Chennai, India",
                bio: "Database Systems expert and research supervisor",
                skills: ["SQL", "Database Design", "PostgreSQL", "Oracle"],
                profilePic: null,
                initials: "AK"
            },
            {
                id: 6,
                name: "Maya Singh",
                role: "alumni",
                points: 16800,
                weeklyChange: 134,
                streak: 12,
                level: 11,
                status: "online",
                lastActive: "15 minutes ago",
                joinDate: "2019-05-30",
                location: "Hyderabad, India",
                bio: "Data Scientist at Microsoft, Python enthusiast",
                skills: ["Python", "R", "Data Analysis", "Machine Learning"],
                profilePic: null,
                initials: "MS"
            },
            {
                id: 7,
                name: "Vikram Joshi",
                role: "student",
                points: 11250,
                weeklyChange: 189,
                streak: 19,
                level: 7,
                status: "away",
                lastActive: "30 minutes ago",
                joinDate: "2023-07-22",
                location: "Kolkata, India",
                bio: "Mobile app developer specializing in Flutter",
                skills: ["Flutter", "Dart", "Firebase", "Android"],
                profilePic: null,
                initials: "VJ"
            },
            {
                id: 8,
                name: "Ananya Reddy",
                role: "admin",
                points: 19500,
                weeklyChange: 67,
                streak: 85,
                level: 14,
                status: "online",
                lastActive: "8 minutes ago",
                joinDate: "2021-12-01",
                location: "Mumbai, India",
                bio: "Platform administrator and community manager",
                skills: ["Community Management", "System Admin", "DevOps"],
                profilePic: null,
                initials: "AR"
            }
        ];

        let currentTab = 'global';
        let filteredUsers = [...userData];

        // Initialize Dashboard
        function initializeDashboard() {
            updateDateTime();
            renderLeaderboard();
            initializeCharts();
            startLiveUpdates();
            generateActivityFeed();
        }

        // Update Date/Time
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

        // Tab Switching
        function switchTab(tab) {
            currentTab = tab;
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            renderLeaderboard();
        }

        // Render Leaderboard
        function renderLeaderboard() {
            const tbody = document.getElementById('leaderboardBody');
            let users = [...userData];

            // Filter by tab
            if (currentTab !== 'global') {
                if (currentTab === 'community') {
                    users = users.filter(user => user.role === 'admin' || user.level >= 10);
                } else {
                    users = users.filter(user => user.role === currentTab.slice(0, -1));
                }
            }

            // Sort by points (default)
            users.sort((a, b) => b.points - a.points);

            tbody.innerHTML = users.map((user, index) => `
                <tr onclick="showUserProfile(${user.id})">
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
                                <p>${user.location}</p>
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
                            <button class="btn" style="padding: 0.5rem; background: var(--primary-blue); color: white; border-radius: 6px;" onclick="event.stopPropagation(); viewProfile(${user.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn" style="padding: 0.5rem; background: var(--accent-green); color: white; border-radius: 6px;" onclick="event.stopPropagation(); messageUser(${user.id})">
                                <i class="fas fa-message"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Initialize Charts
        function initializeCharts() {
            // Monthly Points Chart
            const monthlyCtx = document.getElementById('monthlyPointsChart').getContext('2d');
            new Chart(monthlyCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                    datasets: [{
                        label: 'Points Earned',
                        data: [185000, 220000, 195000, 245000, 268000, 290000, 275000, 312000],
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
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return (value / 1000) + 'K';
                                }
                            }
                        }
                    }
                }
            });

            // Role Distribution Chart
            const roleCtx = document.getElementById('roleDistributionChart').getContext('2d');
            new Chart(roleCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Students', 'Teachers', 'Alumni', 'Admins'],
                    datasets: [{
                        data: [60, 25, 12, 3],
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
            new Chart(activityCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                    datasets: [{
                        label: 'Active Users',
                        data: [890, 920, 995, 1050, 1120, 1180, 1220, 1247],
                        borderColor: 'rgb(245, 158, 11)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });

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
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });

            // User Growth Chart
            const growthCtx = document.getElementById('userGrowthChart').getContext('2d');
            new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                    datasets: [
                        {
                            label: 'New Users',
                            data: [45, 52, 38, 67, 74, 89, 95, 127],
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Total Users',
                            data: [512, 564, 602, 669, 743, 832, 927, 1054],
                            borderColor: 'rgb(30, 64, 175)',
                            backgroundColor: 'rgba(30, 64, 175, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    }
                }
            });

            // Activity Heatmap (simplified as bar chart)
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
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }

        // Generate Activity Feed
        function generateActivityFeed() {
            const activities = [
                { user: 'Arjun Sharma', action: 'earned the "Code Master" badge', icon: 'fa-medal', color: 'var(--primary-gold)', time: '2 minutes ago' },
                { user: 'Dr. Priya Patel', action: 'published a new tutorial on Machine Learning', icon: 'fa-book', color: 'var(--primary-blue)', time: '5 minutes ago' },
                { user: 'Sneha Gupta', action: 'reached Level 6', icon: 'fa-arrow-up', color: 'var(--accent-green)', time: '8 minutes ago' },
                { user: 'Maya Singh', action: 'helped solve a complex algorithm problem', icon: 'fa-lightbulb', color: 'var(--accent-purple)', time: '12 minutes ago' },
                { user: 'Vikram Joshi', action: 'started a 15-day coding streak', icon: 'fa-fire', color: 'var(--accent-red)', time: '18 minutes ago' },
                { user: 'Prof. Amit Kumar', action: 'mentored 5 new students this week', icon: 'fa-users', color: 'var(--accent-green)', time: '25 minutes ago' },
                { user: 'Ananya Reddy', action: 'moderated the Web Development community', icon: 'fa-shield-alt', color: 'var(--gray-600)', time: '35 minutes ago' },
                { user: 'Rahul Verma', action: 'shared insights on system design', icon: 'fa-share', color: 'var(--primary-blue)', time: '45 minutes ago' }
            ];

            const feedContainer = document.getElementById('activityFeedContent');
            feedContainer.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon" style="background: ${activity.color};">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">
                            <strong>${activity.user}</strong> ${activity.action}
                        </div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </div>
            `).join('');
        }

        // User Profile Functions
        function showUserProfile(userId) {
            const user = userData.find(u => u.id === userId);
            if (!user) return;

            const modal = document.getElementById('userModal');
            const content = document.getElementById('userProfileContent');
            
            content.innerHTML = `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div class="profile-pic-fallback" style="width: 100px; height: 100px; font-size: 2rem; margin: 0 auto 1rem;">
                        ${user.initials}
                    </div>
                    <h2 style="margin-bottom: 0.5rem;">${user.name}</h2>
                    <span class="role-badge role-${user.role}" style="font-size: 0.875rem;">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                </div>
                
                <div style="display: grid; gap: 1.5rem;">
                    <div>
                        <h4 style="margin-bottom: 0.5rem; color: var(--gray-700);">Bio</h4>
                        <p style="color: var(--gray-600);">${user.bio}</p>
                    </div>
                    
                    <div>
                        <h4 style="margin-bottom: 0.5rem; color: var(--gray-700);">Skills</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${user.skills.map(skill => `
                                <span style="background: var(--gray-100); padding: 0.25rem 0.75rem; border-radius: 16px; font-size: 0.875rem; color: var(--gray-700);">
                                    ${skill}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <h4 style="margin-bottom: 0.5rem; color: var(--gray-700);">Statistics</h4>
                            <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
                                <div style="margin-bottom: 0.5rem;"><strong>Points:</strong> ${user.points.toLocaleString()}</div>
                                <div style="margin-bottom: 0.5rem;"><strong>Level:</strong> ${user.level}</div>
                                <div style="margin-bottom: 0.5rem;"><strong>Streak:</strong> ${user.streak} days</div>
                                <div><strong>Joined:</strong> ${new Date(user.joinDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 style="margin-bottom: 0.5rem; color: var(--gray-700);">Location</h4>
                            <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-map-marker-alt" style="color: var(--accent-red);"></i>
                                    <span>${user.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            modal.classList.add('show');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('show');
        }

        function viewProfile(userId) {
            showUserProfile(userId);
        }

        function messageUser(userId) {
            const user = userData.find(u => u.id === userId);
            alert(`Opening message dialog for ${user.name}...`);
        }

        // Export Functions
        function exportData(format) {
            const timestamp = new Date().toISOString().slice(0, 10);
            alert(`Exporting data to ${format.toUpperCase()} format...\nFile: techcirculo-analytics-${timestamp}.${format}`);
        }

        // Notification Functions
        function toggleNotifications() {
            alert('Showing notifications:\n• 3 new badges earned\n• 2 new community posts\n• 1 direct message\n• 1 system update');
        }

        // Live Updates
        function startLiveUpdates() {
            setInterval(() => {
                updateDateTime();
                // Simulate real-time updates
                const randomUser = userData[Math.floor(Math.random() * userData.length)];
                randomUser.points += Math.floor(Math.random() * 10) + 1;
                randomUser.lastActive = 'Just now';
            }, 30000);
        }

        // Initialize on load
        document.addEventListener('DOMContentLoaded', initializeDashboard);

        // Filter handlers
        document.getElementById('roleFilter').addEventListener('change', function() {
            const selectedRole = this.value;
            if (selectedRole === 'all') {
                filteredUsers = [...userData];
            } else {
                filteredUsers = userData.filter(user => user.role === selectedRole);
            }
            renderLeaderboard();
        });

        document.getElementById('userSearch').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            if (searchTerm === '') {
                filteredUsers = [...userData];
            } else {
                filteredUsers = userData.filter(user => 
                    user.name.toLowerCase().includes(searchTerm) ||
                    user.location.toLowerCase().includes(searchTerm) ||
                    user.bio.toLowerCase().includes(searchTerm)
                );
            }
            renderLeaderboard();
        });

        document.getElementById('leaderboardSort').addEventListener('change', function() {
            const sortBy = this.value;
            switch(sortBy) {
                case 'points':
                    userData.sort((a, b) => b.points - a.points);
                    break;
                case 'activity':
                    userData.sort((a, b) => b.streak - a.streak);
                    break;
                case 'joined':
                    userData.sort((a, b) => new Date(a.joinDate) - new Date(b.joinDate));
                    break;
            }
            renderLeaderboard();
        });

        // Close modal when clicking outside
        document.addEventListener('click', function(event) {
            const modal = document.getElementById('userModal');
            if (event.target === modal) {
                closeModal('userModal');
            }
        });

        // Keyboard navigation for modals
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal.show');
                openModals.forEach(modal => {
                    modal.classList.remove('show');
                });
            }
        });

        // Responsive table handling
        function handleTableResponsive() {
            const table = document.getElementById('leaderboardTable');
            const container = table.parentElement;
            
            if (window.innerWidth < 768) {
                container.style.overflowX = 'auto';
                table.style.minWidth = '800px';
            } else {
                container.style.overflowX = 'visible';
                table.style.minWidth = 'auto';
            }
        }

        window.addEventListener('resize', handleTableResponsive);
        handleTableResponsive();

        // Animate numbers on load
        function animateNumbers() {
            const kpiValues = document.querySelectorAll('.kpi-value');
            kpiValues.forEach(element => {
                const target = parseInt(element.textContent.replace(/,/g, ''));
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        element.textContent = target.toLocaleString();
                        clearInterval(timer);
                    } else {
                        element.textContent = Math.floor(current).toLocaleString();
                    }
                }, 16);
            });
        }

        // Add smooth scrolling for navigation
        function smoothScrollTo(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        // Lazy loading for charts
        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chartId = entry.target.querySelector('canvas').id;
                    // Chart is already initialized, but we could add lazy loading here
                    chartObserver.unobserve(entry.target);
                }
            });
        });

        document.querySelectorAll('.chart-container').forEach(container => {
            chartObserver.observe(container);
        });

        // Add loading states
        function showLoading(elementId) {
            const element = document.getElementById(elementId);
            element.innerHTML = '<div class="loading" style="margin: 2rem auto;"></div>';
        }

        function hideLoading(elementId, content) {
            const element = document.getElementById(elementId);
            element.innerHTML = content;
        }

        // Simulate data refresh
        function refreshData() {
            showLoading('leaderboardBody');
            
            setTimeout(() => {
                // Simulate new data
                userData.forEach(user => {
                    user.points += Math.floor(Math.random() * 50);
                    user.weeklyChange = Math.floor(Math.random() * 200) - 100;
                });
                
                renderLeaderboard();
                generateActivityFeed();
            }, 1000);
        }

        // Add refresh button functionality
        const refreshInterval = setInterval(() => {
            // Auto-refresh every 5 minutes
            const now = new Date();
            if (now.getMinutes() % 5 === 0 && now.getSeconds() === 0) {
                refreshData();
            }
        }, 1000);

        // Performance optimization - debounce search
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

        const debouncedSearch = debounce(function(searchTerm) {
            if (searchTerm === '') {
                filteredUsers = [...userData];
            } else {
                filteredUsers = userData.filter(user => 
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.bio.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            renderLeaderboard();
        }, 300);

        document.getElementById('userSearch').addEventListener('input', function() {
            debouncedSearch(this.value);
        });

        // Add tooltips for better UX
        function addTooltips() {
            const tooltipElements = document.querySelectorAll('[data-tooltip]');
            tooltipElements.forEach(element => {
                element.addEventListener('mouseenter', function() {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = this.getAttribute('data-tooltip');
                    tooltip.style.cssText = `
                        position: absolute;
                        background: var(--gray-800);
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-size: 0.875rem;
                        z-index: 1000;
                        pointer-events: none;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    `;
                    document.body.appendChild(tooltip);
                    
                    const rect = this.getBoundingClientRect();
                    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                    
                    setTimeout(() => tooltip.style.opacity = '1', 10);
                    
                    this._tooltip = tooltip;
                });
                
                element.addEventListener('mouseleave', function() {
                    if (this._tooltip) {
                        this._tooltip.remove();
                        this._tooltip = null;
                    }
                });
            });
        }

        // Initialize tooltips after DOM is ready
        setTimeout(addTooltips, 100);

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(event) {
            if (event.ctrlKey || event.metaKey) {
                switch(event.key) {
                    case 'f':
                        event.preventDefault();
                        document.getElementById('userSearch').focus();
                        break;
                    case 'r':
                        event.preventDefault();
                        refreshData();
                        break;
                }
            }
        });

        // Add success notifications for actions
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: ${type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'};
                color: white;
                border-radius: 8px;
                z-index: 3000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                box-shadow: var(--shadow-lg);
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);
            
            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Add more realistic data updates
        function simulateRealtimeUpdates() {
            setInterval(() => {
                // Simulate user activities
                const activities = [
                    'earned a new badge',
                    'completed a challenge',
                    'helped another user',
                    'posted in the community',
                    'reached a new level',
                    'started a learning streak'
                ];
                
                const randomUser = userData[Math.floor(Math.random() * userData.length)];
                const randomActivity = activities[Math.floor(Math.random() * activities.length)];
                
                // Update notification count
                const badge = document.querySelector('.notification-badge');
                const currentCount = parseInt(badge.textContent);
                badge.textContent = currentCount + 1;
                
                // Add to activity feed
                const feedContainer = document.getElementById('activityFeedContent');
                const newActivity = document.createElement('div');
                newActivity.className = 'activity-item';
                newActivity.style.opacity = '0';
                newActivity.innerHTML = `
                    <div class="activity-icon" style="background: var(--accent-green);">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">
                            <strong>${randomUser.name}</strong> ${randomActivity}
                        </div>
                        <div class="activity-time">Just now</div>
                    </div>
                `;
                
                feedContainer.insertBefore(newActivity, feedContainer.firstChild);
                
                setTimeout(() => {
                    newActivity.style.opacity = '1';
                    newActivity.style.transition = 'opacity 0.3s ease';
                }, 10);
                
                // Remove oldest activity if more than 8
                const activities_items = feedContainer.querySelectorAll('.activity-item');
                if (activities_items.length > 8) {
                    activities_items[activities_items.length - 1].remove();
                }
                
            }, 15000); // Every 15 seconds
        }

        // Start real-time simulation
        simulateRealtimeUpdates();

        console.log('TechCirculo Analytics Dashboard initialized successfully!');
        console.log('Features loaded:');
        console.log('- Interactive KPI Dashboard');
        console.log('- Dynamic Leaderboard with Tabs');
        console.log('- Advanced Data Visualization');
        console.log('- Real-time Activity Feed');
        console.log('- User Profile System');
        console.log('- Responsive Design');
        console.log('- Live Updates & Notifications');