document.addEventListener("DOMContentLoaded", function() {
    // Quick Links Sidebar elements
    const quickLinksIcon = document.getElementById("quicklinks-icon");
    const quickLinksSidebar = document.getElementById("quicklinks-sidebar");
    const closeQuickLinksButton = document.getElementById("close-quicklinks");
    const quickLinksContainer = document.getElementById("quick-links-sidebar");
    const quickLinksSection = document.getElementById("quick-links-section");
    const addLinkButton = document.getElementById("add-link-button");
    const quicklinkNameInput = document.getElementById("quicklink-name");
    const quicklinkUrlInput = document.getElementById("quicklink-url");
    const githubLink = document.getElementById("github-link");
    
    // Set the link to GitHub page (if you are seeing this don't ask why I made it so unconventional.)
    const gitHubUrl = "https://github.com/StyingDev/StyTab"; 

    // Add click event listener
    githubLink.addEventListener("click", function() {
        window.open(gitHubUrl, "_blank");
    });

    // Predefined static links
    const predefinedLinks = [
        { name: "Reddit", url: "https://www.reddit.com" },
        { name: "GitHub", url: "https://www.github.com" },
        { name: "YouTube", url: "https://www.youtube.com" }
    ];

    // Save predefined links to localStorage if not already saved
    function savePredefinedLinks() {
        let quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
        const predefinedSaved = localStorage.getItem("predefinedLinks");

        // If predefined links are not saved in localStorage, add them
        if (!predefinedSaved) {
            quickLinks = [...predefinedLinks, ...quickLinks]; 
            localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
            localStorage.setItem("predefinedLinks", true); 
        }
    }

    // Load QuickLinks from localStorage
    function loadQuickLinks() {
        const quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];

        quickLinksContainer.innerHTML = ""; 
        quickLinksSection.innerHTML = ""; 

        quickLinks.forEach((link, index) => {
            const linkElement = document.createElement("a");
            linkElement.href = link.url;
            linkElement.textContent = link.name;
            linkElement.target = "_blank";

            // Create delete button for all links
            const deleteButton = document.createElement("img");
            deleteButton.src = "icons/Setting-close-icon.svg";
            deleteButton.alt = "Delete Link";
            deleteButton.classList.add("delete-link");
            deleteButton.id = "delete-link";
            deleteButton.style.width = "16px";
            deleteButton.style.height = "16px";
            deleteButton.style.marginLeft = "10px";

            // Add event listener to delete button
            deleteButton.addEventListener("click", () => {
                removeQuickLink(index); // Allow removal for all links (predefined and custom)
            });

            const linkWrapper = document.createElement("div");
            linkWrapper.appendChild(linkElement);
            linkWrapper.appendChild(deleteButton);
            quickLinksContainer.appendChild(linkWrapper); 

            // Append to quick-links section
            const sectionLink = linkElement.cloneNode(true); 
            quickLinksSection.appendChild(sectionLink); 
        });
    }

    // Save QuickLinks to localStorage and update both sections
    function saveQuickLinks(name, url) {
        const quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
        quickLinks.push({ name, url });
        localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
        loadQuickLinks();
    }

    // Remove QuickLink from localStorage
    function removeQuickLink(index) {
        const quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
        quickLinks.splice(index, 1); 
        localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
        loadQuickLinks(); 
    }

    // Toggle Quick Links sidebar visibility when quick links icon is clicked
    quickLinksIcon.addEventListener("click", () => {
        quickLinksSidebar.classList.toggle("active");
    });

    // Close Quick Links sidebar when the close button is clicked
    closeQuickLinksButton.addEventListener("click", () => {
        quickLinksSidebar.classList.remove("active");
    });

    // Handle button click to add new QuickLink
    addLinkButton.addEventListener("click", () => {
        const name = quicklinkNameInput.value.trim();
        const url = quicklinkUrlInput.value.trim();
        
        if (name && url) {
            saveQuickLinks(name, url); 
            quicklinkNameInput.value = ""; 
            quicklinkUrlInput.value = "";
        }
    });

    savePredefinedLinks();

    loadQuickLinks();
});