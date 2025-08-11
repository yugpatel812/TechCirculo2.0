document.addEventListener("DOMContentLoaded", function () {
    // Sample data (Replace with API call if needed)
    const communities = [
      { id: 1, name: "Web Development", description: "A community for web developers." },
      { id: 2, name: "AI & ML", description: "Exploring artificial intelligence and machine learning." },
      { id: 3, name: "Cybersecurity", description: "Discussions on ethical hacking and security." },
    ];

    const testimonials = [
      { name: "Alice Johnson", text: "TechCirculo helped me connect with like-minded professionals!" },
      { name: "Mark Smith", text: "A great platform for tech enthusiasts." },
    ];

    const communityContainer = document.getElementById("community-list");
    const testimonialContainer = document.getElementById("testimonial-list");

    function loadCommunities() {
      communityContainer.innerHTML = "";
      communities.forEach((community) => {
        const div = document.createElement("div");
        div.classList.add("community-item");
        div.innerHTML = `
              <h3>${community.name}</h3>
              <p>${community.description}</p>
              <button class="join-btn" data-id="${community.id}">Join</button>
          `;
        communityContainer.appendChild(div);
      });

      // Attach event listeners after elements are created
      document.querySelectorAll(".join-btn").forEach(button => {
        button.addEventListener("click", function () {
          alert(`You joined community ID: ${this.dataset.id}`);
        });
      });
    }

    function loadTestimonials() {
      testimonialContainer.innerHTML = "";
      testimonials.forEach((testimonial) => {
        const div = document.createElement("div");
        div.classList.add("testimonial-item");
        div.innerHTML = `<p>"${testimonial.text}"</p><h4>- ${testimonial.name}</h4>`;
        testimonialContainer.appendChild(div);
      });
    }

    // Scroll to Features Section
    document.querySelector(".cta-button").addEventListener("click", function () {
        document.querySelector(".features").scrollIntoView({ behavior: "smooth" });
    });

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

    // Community Slider
    const slider = document.querySelector(".communities-grid");
    const slides = document.querySelectorAll(".community-card");
    let currentIndex = 0;
    const totalSlides = slides.length;
    const slideInterval = 3000;

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

    let autoSlide = setInterval(nextSlide, slideInterval);

    document.querySelector(".prev-btn").addEventListener("click", () => {
      clearInterval(autoSlide);
      prevSlide();
      autoSlide = setInterval(nextSlide, slideInterval);
    });

    document.querySelector(".next-btn").addEventListener("click", () => {
      clearInterval(autoSlide);
      nextSlide();
      autoSlide = setInterval(nextSlide, slideInterval);
    });

    slider.addEventListener("mouseenter", () => clearInterval(autoSlide));
    slider.addEventListener("mouseleave", () => autoSlide = setInterval(nextSlide, slideInterval));

    // Load data dynamically
    loadCommunities();
    loadTestimonials();
});
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("section");
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible"); // Show section when in view
          } else {
            entry.target.classList.remove("visible"); // Hide section when out of view
          }
        });
      },
      { threshold: 0.2 } // Adjust threshold for earlier/later visibility
    );
  
    sections.forEach((section) => {
      section.classList.add("section"); // Ensure all sections have base styles
      observer.observe(section);
    });
  });
  document.addEventListener("DOMContentLoaded", function () {
    const featureCards = document.querySelectorAll(".feature-card");
  
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Delay each feature-card appearance
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, index * 600); // Adjust delay (300ms per card)
          } else {
            // Remove class when out of view for re-triggering animation
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.3 } // Adjust threshold if needed
    );
  
    featureCards.forEach((card) => {
      observer.observe(card);
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    const communityCards = document.querySelectorAll(".community-card");
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.animation = `filmStrip 1.5s ease-in-out forwards`;
            }, index * 400); // Stagger effect like a moving film reel
          } else {
            entry.target.style.animation = "none"; // Reset for continuous effect
          }
        });
      },
      { threshold: 0.3 }
    );
  
    communityCards.forEach((card) => observer.observe(card));
  });
  document.addEventListener("DOMContentLoaded", function () {
    const communityCards = document.querySelectorAll(".community-card");
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, index * 250); // Staggered effect
          } else {
            entry.target.classList.remove("visible"); // Replay animation when scrolling up
          }
        });
      },
      { threshold: 0.3 }
    );
  
    communityCards.forEach((card) => observer.observe(card));
  });
  document.addEventListener("DOMContentLoaded", function () {
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
  });
  
  