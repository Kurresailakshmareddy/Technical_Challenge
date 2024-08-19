// Select elements using const for fixed references
const menuBtn = document.getElementById("menuBtn");
const sideNav = document.getElementById("sideNav");
const menuIcon = document.getElementById("menu"); // Assuming this is the correct ID for the menu icon

// Set initial position for sideNav
sideNav.style.right = "-250px";

// Add click event listener to menuBtn
menuBtn.addEventListener("click", () => {
    if (sideNav.style.right === "-250px") {
        sideNav.style.right = "0";
    } else {
        sideNav.style.right = "-250px";
    }
});

// Add click event listener to document to close sideNav when clicking outside
document.addEventListener("click", (event) => {
    const isClickInsideNav = sideNav.contains(event.target);
    const isClickOnMenuBtn = menuBtn.contains(event.target);

    if (!isClickInsideNav && !isClickOnMenuBtn && sideNav.style.right === "0px") {
        sideNav.style.right = "-250px";
    }
});

// Initialize SmoothScroll
document.addEventListener('DOMContentLoaded', function() {
    const scroll = new SmoothScroll('a[href*="#"]', {
        speed: 1000,
        speedAsDuration: true
    });
});


// Get the current year
const currentYear = new Date().getFullYear();
// Set the current year in the element with id 'currentYear'
document.getElementById('currentYear').textContent = currentYear;
