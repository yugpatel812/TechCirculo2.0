// API Configuration
        const API_BASE_URL = "http://localhost:8084";
        
        // Sample data for fallback
        const fallbackCommunities = [
            { id: 1, name: "AI & Machine Learning", memberCount: 12450, description: "Exploring AI frontiers" },
            { id: 2, name: "Web Development", memberCount: 8920, description: "Building the future web" },
            { id: 3, name: "Cybersecurity", memberCount: 15600, description: "Defending the digital world" },
            { id: 4, name: "Data Science", memberCount: 11200, description: "Extracting insights from data" },
            { id: 5, name: "Mobile Development", memberCount: 7850, description: "Creating amazing mobile experiences" },
            { id: 6, name: "Blockchain", memberCount: 9300, description: "Building decentralized applications" }
        ];

        // Counter Animation
        function animateCounters() {
            const counters = document.querySelectorAll('.stat-number');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const counter = entry.target;
                        const target = +counter.getAttribute('data-target');
                        const increment = target / 100;
                        let count = 0;

                        function updateCount() {
                            if (count < target) {
                                count += increment;
                                counter.textContent = Math.floor(count).toLocaleString();
                                requestAnimationFrame(updateCount);
                            } else {
                                counter.textContent = target.toLocaleString();
                            }
                        }
                        updateCount();
                        observer.unobserve(counter);
                    }
                });
            });

            counters.forEach(counter => observer.observe(counter));
        }

        // Scroll Reveal Animation
        function initScrollReveal() {
            const reveals = document.querySelectorAll('.reveal');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            reveals.forEach(reveal => observer.observe(reveal));
        }

        // Fetch and update communities (if API is available)
        async function fetchCommunities() {
            try {
                const response = await fetch(`${API_BASE_URL}/communities/all`);
                if (!response.ok) throw new Error('API not available');
                const communities = await response.json();
                return communities;
            } catch (error) {
                console.log('Using fallback data');
                return fallbackCommunities;
            }
        }

        // Update community data in the carousel
        async function updateCommunityData() {
            try {
                const communities = await fetchCommunities();
                const track = document.querySelector('.communities-track');
                
                // Keep the existing animation, just update data if needed
                // This maintains the visual design while allowing dynamic data
                console.log('Communities loaded:', communities.length);
            } catch (error) {
                console.error('Error updating communities:', error);
            }
        }

        // Mobile menu toggle
        function initMobileMenu() {
            const toggle = document.querySelector('.mobile-toggle');
            const menu = document.querySelector('.nav-menu');
            
            if (toggle) {
                toggle.addEventListener('click', () => {
                    menu.classList.toggle('active');
                });
            }
        }

        // Smooth scrolling for navigation links
        function initSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            animateCounters();
            initScrollReveal();
            updateCommunityData();
            initMobileMenu();
            initSmoothScroll();
        });

        // Auto-refresh community data every 5 minutes
        setInterval(updateCommunityData, 5 * 60 * 1000);