/**
 * Points System API Service
 * Handles all communication with backend points system
 */
class PointsApiService {
    constructor() {
        this.baseUrl = 'http://localhost:8084/api'; // Updated to correct backend port
        this.websocket = null;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || { id: 1 };
        this.listeners = {
            pointsUpdate: [],
            badgeEarned: [],
            levelUp: [],
            leaderboardUpdate: [],
            activityUpdate: []
        };
        
        this.connectWebSocket();
    }

    // HTTP API Methods

    /**
     * Get authorization headers with JWT token
     */
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    /**
     * Award points to user for an activity
     */
    async awardPoints(activityType, referenceId = null, metadata = {}) {
        try {
            // Simple points mapping for different activities
            const pointsMapping = {
                'POST_CREATED': 10,
                'POST_LIKED': 2,
                'COMMENT_CREATED': 5,
                'COMMENT_LIKED': 1,
                'PROFILE_COMPLETED': 20,
                'DAILY_LOGIN': 5,
                'WEEKLY_STREAK': 25,
                'EVENT_ATTENDED': 15,
                'COURSE_COMPLETED': 50,
                'LEVEL_UP': 100
            };
            
            const points = pointsMapping[activityType] || 5; // Default 5 points
            const reason = `${activityType} activity`;
            
            const response = await fetch(`${this.baseUrl}/points/award?points=${points}&reason=${encodeURIComponent(reason)}`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to award points');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error awarding points:', error);
            return { success: false, message: 'Failed to award points' };
        }
    }

    /**
     * Get current user's points data
     */
    async getUserPoints() {
        try {
            const response = await fetch(`${this.baseUrl}/points/my-points`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user points');
            }
            
            // Get response text first to handle malformed JSON
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            try {
                return JSON.parse(responseText);
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
                console.error('Response text:', responseText);
                
                // Return fallback data structure
                return {
                    totalPoints: 0,
                    currentLevel: 1,
                    currentStreak: 0,
                    points: 0,
                    level: 1,
                    streak: 0,
                    profileName: 'User',
                    badges: []
                };
            }
        } catch (error) {
            console.error('Error fetching user points:', error);
            throw error;
        }
    }

    /**
     * Get user's transaction history
     */
    async getUserHistory(limit = 20) {
        try {
            const response = await fetch(`${this.baseUrl}/points/my-history?limit=${limit}`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user history');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user history:', error);
            return [];
        }
    }

    /**
     * Get leaderboard
     */
    async getLeaderboard(limit = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/points/leaderboard?limit=${limit}`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            
            // Get response text first to handle malformed JSON
            const responseText = await response.text();
            console.log('Leaderboard raw response:', responseText);
            
            try {
                return JSON.parse(responseText);
            } catch (jsonError) {
                console.error('Leaderboard JSON parsing error:', jsonError);
                console.error('Response text:', responseText);
                
                // Return empty leaderboard
                return [];
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }

    /**
     * Get user's rank
     */
    async getUserRank() {
        try {
            const response = await fetch(`${this.baseUrl}/points/my-rank`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user rank');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user rank:', error);
            return { rank: null, totalUsers: 0 };
        }
    }

    /**
     * Get user's badges
     */
    async getUserBadges() {
        try {
            const response = await fetch(`${this.baseUrl}/points/user/${this.currentUser.id}/badges`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user badges');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user badges:', error);
            throw error;
        }
    }

    /**
     * Get comprehensive points statistics
     */
    async getPointsStatistics() {
        try {
            const response = await fetch(`${this.baseUrl}/points/user/${this.currentUser.id}/stats`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch points statistics');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching points statistics:', error);
            throw error;
        }
    }

    /**
     * Get available activity types
     */
    async getActivityTypes() {
        try {
            const response = await fetch(`${this.baseUrl}/points/activities`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch activity types');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching activity types:', error);
            throw error;
        }
    }

    /**
     * Get all available badges
     */
    async getAllBadges() {
        try {
            const response = await fetch(`${this.baseUrl}/badges`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch badges');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching badges:', error);
            throw error;
        }
    }

    // WebSocket Methods

    /**
     * Connect to WebSocket for real-time updates
     */
    connectWebSocket() {
        console.log('Connecting to WebSocket for real-time points updates...');
        
        // Load SockJS and STOMP libraries if not already loaded
        this.loadWebSocketLibraries().then(() => {
            this.initializeWebSocketConnection();
        }).catch(error => {
            console.error('Failed to load WebSocket libraries:', error);
        });
    }

    /**
     * Load SockJS and STOMP libraries dynamically
     */
    loadWebSocketLibraries() {
        return new Promise((resolve, reject) => {
            // Check if libraries are already loaded
            if (typeof SockJS !== 'undefined' && typeof Stomp !== 'undefined') {
                resolve();
                return;
            }

            // Load SockJS
            const sockjsScript = document.createElement('script');
            sockjsScript.src = 'https://cdn.jsdelivr.net/npm/sockjs-client@1.6.1/dist/sockjs.min.js';
            sockjsScript.onload = () => {
                // Load STOMP
                const stompScript = document.createElement('script');
                stompScript.src = 'https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js';
                stompScript.onload = () => resolve();
                stompScript.onerror = () => reject(new Error('Failed to load STOMP library'));
                document.head.appendChild(stompScript);
            };
            sockjsScript.onerror = () => reject(new Error('Failed to load SockJS library'));
            document.head.appendChild(sockjsScript);
        });
    }

    /**
     * Initialize WebSocket connection using SockJS and STOMP
     */
    initializeWebSocketConnection() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No authentication token found. Skipping WebSocket connection.');
                return;
            }

            // Create SockJS connection
            const socket = new SockJS('http://localhost:8084/ws');
            this.stompClient = window.StompJs.Stomp.over(socket);

            // Connect with authentication header
            const connectHeaders = {
                'Authorization': `Bearer ${token}`
            };

            this.stompClient.connect(connectHeaders, (frame) => {
                console.log('STOMP WebSocket connected:', frame);
                this.reconnectAttempts = 0;

                // Subscribe to user-specific queue for private messages
                if (this.currentUser && this.currentUser.username) {
                    this.stompClient.subscribe(`/user/queue/points`, (message) => {
                        const pointsUpdate = JSON.parse(message.body);
                        this.handleWebSocketMessage(pointsUpdate);
                    });

                    // Subscribe to public topic for leaderboard updates
                    this.stompClient.subscribe('/topic/points', (message) => {
                        const pointsUpdate = JSON.parse(message.body);
                        console.log('Leaderboard update received:', pointsUpdate);
                        // Trigger leaderboard refresh if needed
                        if (this.onLeaderboardUpdate) {
                            this.onLeaderboardUpdate(pointsUpdate);
                        }
                    });
                }
            }, (error) => {
                console.error('STOMP connection error:', error);
                this.handleWebSocketReconnect();
            });
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
        }
    }

    /**
     * Handle WebSocket reconnection
     */
    handleWebSocketReconnect() {
        if (!this.reconnectAttempts) this.reconnectAttempts = 0;
        if (this.reconnectAttempts < 3) {
            this.reconnectAttempts++;
            console.log(`WebSocket reconnection attempt ${this.reconnectAttempts}/3...`);
            setTimeout(() => this.connectWebSocket(), 5000);
        } else {
            console.log('Max WebSocket reconnection attempts reached. Real-time updates disabled.');
        }
    }

    /**
     * Handle incoming WebSocket messages
     */
    handleWebSocketMessage(message) {
        console.log('Received WebSocket message:', message);
        
        switch (message.type) {
            case 'points_update':
                this.notifyListeners('pointsUpdate', message.data);
                break;
            case 'badge_earned':
                this.notifyListeners('badgeEarned', message.data);
                break;
            case 'level_up':
                this.notifyListeners('levelUp', message.data);
                break;
            case 'leaderboard_update':
                this.notifyListeners('leaderboardUpdate', message.data);
                break;
            case 'activity_update':
                this.notifyListeners('activityUpdate', message.data);
                break;
        }
    }

    /**
     * Add event listener for real-time updates
     */
    addEventListener(eventType, callback) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].push(callback);
        }
    }

    /**
     * Remove event listener
     */
    removeEventListener(eventType, callback) {
        if (this.listeners[eventType]) {
            const index = this.listeners[eventType].indexOf(callback);
            if (index > -1) {
                this.listeners[eventType].splice(index, 1);
            }
        }
    }

    /**
     * Notify all listeners of an event
     */
    notifyListeners(eventType, data) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    }

    /**
     * Close WebSocket connection
     */
    disconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }

    // Utility Methods

    /**
     * Set current user (call when user logs in)
     */
    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Reconnect WebSocket with new user ID
        this.disconnect();
        setTimeout(() => this.connectWebSocket(), 1000);
    }

    /**
     * Format points for display
     */
    formatPoints(points) {
        if (points >= 1000000) {
            return (points / 1000000).toFixed(1) + 'M';
        } else if (points >= 1000) {
            return (points / 1000).toFixed(1) + 'K';
        }
        return points.toString();
    }

    /**
     * Get level progress percentage
     */
    getLevelProgress(currentLevel, totalPoints) {
        const currentLevelPoints = (currentLevel - 1) * 100;
        const nextLevelPoints = currentLevel * 100;
        const progressPoints = totalPoints - currentLevelPoints;
        return Math.min(100, (progressPoints / 100) * 100);
    }

    /**
     * Get activity type display info
     */
    getActivityDisplayInfo(activityType) {
        const activityInfo = {
            'POST_CREATED': { name: 'Post Created', icon: '📝', color: '#4CAF50' },
            'POST_LIKED': { name: 'Post Liked', icon: '👍', color: '#2196F3' },
            'COMMENT_CREATED': { name: 'Comment Added', icon: '💬', color: '#FF9800' },
            'COMMENT_LIKED': { name: 'Comment Liked', icon: '❤️', color: '#E91E63' },
            'PROFILE_COMPLETED': { name: 'Profile Completed', icon: '👤', color: '#9C27B0' },
            'DAILY_LOGIN': { name: 'Daily Login', icon: '📅', color: '#607D8B' },
            'WEEKLY_STREAK': { name: 'Weekly Streak', icon: '🔥', color: '#FF5722' },
            'EVENT_ATTENDED': { name: 'Event Attended', icon: '🎪', color: '#795548' },
            'COURSE_COMPLETED': { name: 'Course Completed', icon: '🎓', color: '#3F51B5' },
            'LEVEL_UP': { name: 'Level Up!', icon: '⬆️', color: '#FFC107' }
        };
        
        return activityInfo[activityType] || { name: activityType, icon: '⭐', color: '#666' };
    }
}

// Create global instance
window.pointsApi = new PointsApiService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PointsApiService;
}