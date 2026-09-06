document.addEventListener("DOMContentLoaded", function() {
    const quickLinksIcon        = document.getElementById("quicklinks-icon");
    const quickLinksSidebar     = document.getElementById("quicklinks-sidebar");
    const closeQuickLinksButton = document.getElementById("close-quicklinks");
    const quickLinksContainer   = document.getElementById("quick-links-sidebar");
    const quickLinksSection     = document.getElementById("quick-links-section");
    const addLinkButton         = document.getElementById("add-link-button");
    const quicklinkNameInput    = document.getElementById("quicklink-name");
    const quicklinkUrlInput     = document.getElementById("quicklink-url");
    const githubLink            = document.getElementById("github-link");

    const gitHubUrl = "https://github.com/StyingDev/StyTab";
    githubLink.addEventListener("click", () => window.open(gitHubUrl, "_blank"));

    const predefinedLinks = [
        { name: "Reddit",  url: "https://www.reddit.com"  },
        { name: "GitHub",  url: "https://www.github.com"  },
        { name: "YouTube", url: "https://www.youtube.com" },
    ];

    function savePredefinedLinks() {
        if (localStorage.getItem("predefinedLinks")) return;
        const quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
        localStorage.setItem("quickLinks", JSON.stringify([...predefinedLinks, ...quickLinks]));
        localStorage.setItem("predefinedLinks", true);
    }

    // Only allow http(s) links — without this, a pasted "javascript:..." URL
    // would be stored verbatim and rendered as a live, clickable href.
    function normalizeLinkUrl(raw) {
        let url = raw.trim();
        if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
            url = `https://${url}`;
        }
        try {
            const parsed = new URL(url);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
            return parsed.href;
        } catch {
            return null;
        }
    }

    let editingIndex = null;

    function startEdit(index) {
        const quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
        quicklinkNameInput.value = quickLinks[index].name;
        quicklinkUrlInput.value  = quickLinks[index].url;
        editingIndex = index;
        addLinkButton.textContent = "Save Changes";
        quicklinkNameInput.focus();
    }

    function cancelEdit() {
        editingIndex = null;
        addLinkButton.textContent = "Add Link";
        quicklinkNameInput.value = "";
        quicklinkUrlInput.value  = "";
    }

    let dragSrcIndex = null;

    function onDragStart(e) {
        dragSrcIndex = parseInt(this.dataset.index);
        this.classList.add("ql-dragging");
        e.dataTransfer.effectAllowed = "move";
    }

    function onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        this.classList.add("ql-drag-over");
    }

    function onDragLeave() {
        this.classList.remove("ql-drag-over");
    }

    function onDrop(e) {
        e.stopPropagation();
        this.classList.remove("ql-drag-over");
        const targetIndex = parseInt(this.dataset.index);
        if (dragSrcIndex === null || dragSrcIndex === targetIndex) return;

        const quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
        const [moved] = quickLinks.splice(dragSrcIndex, 1);
        quickLinks.splice(targetIndex, 0, moved);
        localStorage.setItem("quickLinks", JSON.stringify(quickLinks));

        if (editingIndex === dragSrcIndex) {
            editingIndex = targetIndex;
        } else if (dragSrcIndex < targetIndex) {
            if (editingIndex > dragSrcIndex && editingIndex <= targetIndex) editingIndex--;
        } else {
            if (editingIndex >= targetIndex && editingIndex < dragSrcIndex) editingIndex++;
        }

        loadQuickLinks();
    }

    function onDragEnd() {
        document.querySelectorAll(".ql-item").forEach(el =>
            el.classList.remove("ql-dragging", "ql-drag-over"));
        dragSrcIndex = null;
    }

    function loadQuickLinks() {
        const quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];

        quickLinksContainer.innerHTML = "";
        quickLinksSection.innerHTML   = "";

        quickLinks.forEach((link, index) => {
            const row = document.createElement("div");
            row.className = "ql-item";
            row.draggable = true;
            row.dataset.index = index;

            const handle = document.createElement("span");
            handle.className = "ql-drag-handle";
            handle.textContent = "⠿";
            handle.title = "Drag to reorder";

            const linkEl = document.createElement("a");
            linkEl.href = link.url;
            linkEl.textContent = link.name;

            const menuBtn = document.createElement("button");
            menuBtn.className = "ql-menu-btn";
            menuBtn.title = "Options";
            menuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>`;
            menuBtn.addEventListener("click", e => {
                e.stopPropagation();
                const isOpen = row.classList.contains("ql-expanded");
                document.querySelectorAll(".ql-item.ql-expanded").forEach(el => el.classList.remove("ql-expanded"));
                if (!isOpen) row.classList.add("ql-expanded");
            });

            const editBtn = document.createElement("button");
            editBtn.className = "ql-edit-btn ql-action";
            editBtn.title = "Edit";
            editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`;
            editBtn.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();
                row.classList.remove("ql-expanded");
                startEdit(index);
            });

            const deleteBtn = document.createElement("img");
            deleteBtn.src = "icons/Setting-close-icon.svg";
            deleteBtn.alt = "Delete";
            deleteBtn.classList.add("delete-link", "ql-action");
            deleteBtn.style.cssText = "width:16px;height:16px;cursor:pointer;";
            deleteBtn.addEventListener("click", e => {
                e.stopPropagation();
                row.classList.remove("ql-expanded");
                removeQuickLink(index);
            });

            row.append(handle, linkEl, menuBtn, editBtn, deleteBtn);
            row.addEventListener("dragstart",  onDragStart);
            row.addEventListener("dragover",   onDragOver);
            row.addEventListener("dragleave",  onDragLeave);
            row.addEventListener("drop",       onDrop);
            row.addEventListener("dragend",    onDragEnd);
            quickLinksContainer.appendChild(row);

            const pill = document.createElement("a");
            pill.href = link.url;
            pill.textContent = link.name;
            quickLinksSection.appendChild(pill);
        });
    }

    function saveQuickLinks(name, url) {
        const quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
        quickLinks.push({ name, url });
        localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
        loadQuickLinks();
    }

    function removeQuickLink(index) {
        const quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
        quickLinks.splice(index, 1);
        localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
        if (editingIndex === index) cancelEdit();
        else if (editingIndex > index) editingIndex--;
        loadQuickLinks();
    }

    addLinkButton.addEventListener("click", () => {
        const name = quicklinkNameInput.value.trim();
        const rawUrl = quicklinkUrlInput.value.trim();
        if (!name || !rawUrl) return;

        const url = normalizeLinkUrl(rawUrl);
        if (!url) {
            quicklinkUrlInput.focus();
            return;
        }

        if (editingIndex !== null) {
            const quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
            quickLinks[editingIndex] = { name, url };
            localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
            cancelEdit();
            loadQuickLinks();
        } else {
            saveQuickLinks(name, url);
            quicklinkNameInput.value = "";
            quicklinkUrlInput.value  = "";
        }
    });

    closeQuickLinksButton.addEventListener("click", () => {
        quickLinksSidebar.classList.remove("active");
        cancelEdit();
    });

    quickLinksIcon.addEventListener("click", () => {
        quickLinksSidebar.classList.toggle("active");
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".ql-item.ql-expanded").forEach(el => el.classList.remove("ql-expanded"));
    });

    savePredefinedLinks();
    loadQuickLinks();
});
