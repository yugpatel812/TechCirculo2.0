document.addEventListener("DOMContentLoaded", function () {
    // API Configuration
    const API_BASE_URL = "http://localhost:8084";
    
    // Sample testimonials data (keeping as static for now)
    const testimonials = [
        { name: "Alice Johnson", text: "TechCirculo helped me connect with like-minded professionals!" },
        { name: "Mark Smith", text: "A great platform for tech enthusiasts." },
    ];

    // DOM Elements
    const communityContainer = document.querySelector(".communities-grid");
    const testimonialContainer = document.getElementById("testimonial-list");

    // Fetch communities from API
    async function fetchCommunities() {
        try {
            console.log("Fetching communities from API...");
            const response = await fetch(`${API_BASE_URL}/communities/all`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const communities = await response.json();
            console.log("Communities fetched:", communities);
            return communities;
        } catch (error) {
            console.error("Error fetching communities:", error);
            // Return fallback data if API fails
            return [
                { 
                    id: 1, 
                    name: "Web Development", 
                    description: "A community for web developers.",
                    memberCount: 2400,
                    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"
                },
                { 
                    id: 2, 
                    name: "AI & ML", 
                    description: "Exploring artificial intelligence and machine learning.",
                    memberCount: 1800,
                    image: "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWl8ZW58MHx8MHx8fDA%3D"
                },
                { 
                    id: 3, 
                    name: "Cybersecurity", 
                    description: "Discussions on ethical hacking and security.",
                    memberCount: 8800,
                    image: "https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3liZXJzZWN1cml0eXxlbnwwfHwwfHx8MA%3D"
                }
            ];
        }
    }

    // Default community images for fallback
    const defaultImages = [
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop",
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=300&h=200&fit=crop",
        "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YW5kcm9pZHxlbnwwfHwwfHx8MA%3D%3D",
        "https://plus.unsplash.com/premium_photo-1663023612721-e588768ef403?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8d2ViJTIwZGV2fGVufDB8fDB8fHww",
        "https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3liZXJzZWN1cml0eXxlbnwwfHwwfHx8MA%3D%3D",
        "https://plus.unsplash.com/premium_photo-1688678097425-00bba1629e32?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGNsb3VkJTIwZW5naW5lZXJpbmd8ZW58MHx8MHx8fDA%3D",
        "https://plus.unsplash.com/premium_photo-1661878265739-da90bc1af051?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGF0YSUyMHNjaWVuY2V8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWl8ZW58MHx8MHx8fDA%3D"
    ];

    // Format member count for display
    function formatMemberCount(count) {
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + "k";
        }
        return count.toString();
    }

    // Load communities dynamically
    async function loadCommunities() {
        try {
            // Show loading state
            communityContainer.innerHTML = '<div class="loading">Loading communities...</div>';
            
            const communities = await fetchCommunities();
            
            // Clear container
            communityContainer.innerHTML = "";
            
            // Create community cards
            communities.forEach((community, index) => {
                const div = document.createElement("div");
                div.classList.add("community-card");
                
                // Use API image if available, otherwise use default images
                const imageUrl = community.image || community.imageUrl || defaultImages[index % defaultImages.length];
                const memberCount = community.memberCount || community.members || Math.floor(Math.random() * 10000) + 1000;
                
                div.innerHTML = `
                    <img
                        src="${imageUrl}"
                        alt="${community.name}"
                        onerror="this.src='${defaultImages[0]}'"
                    />
                    <div class="community-content">
                        <h3>${community.name}</h3>
                        <p>${formatMemberCount(memberCount)} members</p>
                    </div>
                `;
                
                communityContainer.appendChild(div);
            });

            // Update total slides count for slider
            updateSliderFunctionality();
            
            // Update hero stats with real data
            updateHeroStats(communities);
            
        } catch (error) {
            console.error("Error loading communities:", error);
            communityContainer.innerHTML = '<div class="error">Failed to load communities. Please try again later.</div>';
        }
    }

    // Update hero statistics based on community data
    function updateHeroStats(communities) {
        const totalMembers = communities.reduce((sum, community) => {
            return sum + (community.memberCount || community.members || 0);
        }, 0);
        
        const communityCount = communities.length;
        const dailyEvents = Math.floor(communityCount * 2); // Estimate based on communities
        
        // Update the data-target attributes
        const statsNumbers = document.querySelectorAll(".stat-number");
        if (statsNumbers[0]) statsNumbers[0].setAttribute("data-target", Math.max(totalMembers, 10000));
        if (statsNumbers[1]) statsNumbers[1].setAttribute("data-target", Math.max(communityCount, 50));
        if (statsNumbers[2]) statsNumbers[2].setAttribute("data-target", Math.max(dailyEvents, 100));
        
        // Restart counter animation with new values
        animateCounters();
    }

    // Update slider functionality for dynamic content
    function updateSliderFunctionality() {
        const slider = document.querySelector(".communities-grid");
        const slides = document.querySelectorAll(".community-card");
        let currentIndex = 0;
        const totalSlides = slides.length;
        const slideInterval = 3000;

        // Clear any existing intervals
        if (window.communitySliderInterval) {
            clearInterval(window.communitySliderInterval);
        }

        if (totalSlides === 0) return;

        function showSlide(index) {
            slider.style.transform = `translateX(-${index * 100}%)`;
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            showSlide(currentIndex);
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            showSlide(currentIndex);
        }

        window.communitySliderInterval = setInterval(nextSlide, slideInterval);

        // Update button event listeners
        const prevBtn = document.querySelector(".prev-btn");
        const nextBtn = document.querySelector(".next-btn");

        if (prevBtn) {
            prevBtn.replaceWith(prevBtn.cloneNode(true)); // Remove old listeners
            document.querySelector(".prev-btn").addEventListener("click", () => {
                clearInterval(window.communitySliderInterval);
                prevSlide();
                window.communitySliderInterval = setInterval(nextSlide, slideInterval);
            });
        }

        if (nextBtn) {
            nextBtn.replaceWith(nextBtn.cloneNode(true)); // Remove old listeners
            document.querySelector(".next-btn").addEventListener("click", () => {
                clearInterval(window.communitySliderInterval);
                nextSlide();
                window.communitySliderInterval = setInterval(nextSlide, slideInterval);
            });
        }

        slider.addEventListener("mouseenter", () => clearInterval(window.communitySliderInterval));
        slider.addEventListener("mouseleave", () => window.communitySliderInterval = setInterval(nextSlide, slideInterval));
    }

    // Load testimonials (keeping static for now)
    function loadTestimonials() {
        if (!testimonialContainer) return;
        
        testimonialContainer.innerHTML = "";
        testimonials.forEach((testimonial) => {
            const div = document.createElement("div");
            div.classList.add("testimonial-item");
            div.innerHTML = `<p>"${testimonial.text}"</p><h4>- ${testimonial.name}</h4>`;
            testimonialContainer.appendChild(div);
        });
    }

    // Scroll to Features Section
    

    // Dynamic Navigation Link Highlight
    let navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach(link => {
        link.addEventListener("click", function () {
            navLinks.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Feature Card Hover Effect
    let featureCards = document.querySelectorAll(".feature-card");
    featureCards.forEach(card => {
        card.addEventListener("mouseover", () => (card.style.backgroundColor = "#e0e0e0"));
        card.addEventListener("mouseout", () => (card.style.backgroundColor = "#f9f9f9"));
    });

    // Intersection Observer for sections
    const sections = document.querySelectorAll("section");
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                } else {
                    entry.target.classList.remove("visible");
                }
            });
        },
        { threshold: 0.2 }
    );

    sections.forEach((section) => {
        section.classList.add("section");
        sectionObserver.observe(section);
    });

    // Feature cards animation observer
    const featureCardsObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add("visible");
                    }, index * 600);
                } else {
                    entry.target.classList.remove("visible");
                }
            });
        },
        { threshold: 0.3 }
    );

    featureCards.forEach((card) => {
        featureCardsObserver.observe(card);
    });

    // Community cards animation observer
    function setupCommunityCardsObserver() {
        const communityCards = document.querySelectorAll(".community-card");
        
        const communityObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add("visible");
                        }, index * 250);
                    } else {
                        entry.target.classList.remove("visible");
                    }
                });
            },
            { threshold: 0.3 }
        );

        communityCards.forEach((card) => communityObserver.observe(card));
    }

    // Hero heading typewriter effect
    function initializeHeroTypewriter() {
        const headingText = "Connect with Your University Tech Community";
        const headingElement = document.getElementById("hero-heading");
        let index = 0;

        function typeWriter() {
            if (index < headingText.length) {
                headingElement.innerHTML += headingText.charAt(index);
                index++;
                setTimeout(typeWriter, 50);
            }
        }
        typeWriter();
    }

    // Animate counters
    function animateCounters() {
        const counters = document.querySelectorAll(".stat-number");
        counters.forEach(counter => {
            const target = +counter.getAttribute("data-target");
            let count = 0;
            const increment = target / 100;

            function updateCounter() {
                if (count < target) {
                    count += increment;
                    counter.innerText = Math.floor(count) + "+";
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target + "+";
                }
            }
            updateCounter();
        });
    }

    // Refresh data function (can be called manually or on interval)
    async function refreshData() {
        console.log("Refreshing community data...");
        await loadCommunities();
    }

    // Initialize everything
    async function initialize() {
        // Initialize hero typewriter
        initializeHeroTypewriter();
        
        // Load communities from API
        await loadCommunities();
        
        // Load testimonials
        loadTestimonials();
        
        // Setup community cards observer after communities are loaded
        setTimeout(setupCommunityCardsObserver, 500);
        
        // Initialize counter animation
        setTimeout(animateCounters, 1000);
    }

    // Main load function for communities
    async function loadCommunities() {
        const communities = await fetchCommunities();
        
        // Clear container
        communityContainer.innerHTML = "";
        
        // Create community cards
        communities.forEach((community, index) => {
            const div = document.createElement("div");
            div.classList.add("community-card");
            
            // Handle different possible API response formats
            const imageUrl = community.image || community.imageUrl || community.thumbnail || defaultImages[index % defaultImages.length];
            const memberCount = community.memberCount || community.members || community.totalMembers || Math.floor(Math.random() * 10000) + 1000;
            const description = community.description || community.desc || `Join the ${community.name} community`;
            
            div.innerHTML = `
                <img
                    src="${imageUrl}"
                    alt="${community.name}"
                    onerror="this.src='${defaultImages[index % defaultImages.length]}'"
                />
                <div class="community-content">
                    <h3>${community.name}</h3>
                    <p>${formatMemberCount(memberCount)} members</p>
                </div>
            `;
            
            // Add click event for community interaction
            div.addEventListener("click", () => {
                console.log(`Clicked on community: ${community.name}`);
                // You can add navigation logic here
                // window.location.href = `community.html?id=${community.id}`;
            });
            
            communityContainer.appendChild(div);
        });

        // Update slider functionality with new content
        updateSliderFunctionality();
    }

    // Auto-refresh data every 5 minutes (optional)
    setInterval(refreshData, 5 * 60 * 1000);

    // Expose refresh function globally for manual calls
    window.refreshCommunityData = refreshData;

    // Start the application
    initialize();
});