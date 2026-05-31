const app = {
  skills: JSON.parse(localStorage.getItem("skills")) || [],
  
  init() {
    this.setupRouter();
    this.setupForm();
    document.getElementById("search").addEventListener("input", (e) => this.search(e.target.value));
  },

  setupRouter() {
    const handleHash = () => {
      const hash = window.location.hash.slice(1) || "/home";
      this.showPage(hash.split("?")[0], hash.includes("?") ? new URLSearchParams(hash.split("?")[1]) : null);
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
  },

  navigate(path) {
    window.location.hash = path;
  },

  showPage(route, params) {
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    if (route === "/add") {
      document.getElementById("add-page").classList.remove("hidden");
    } else if (route.startsWith("/skill")) {
      const id = params?.get("id");
      this.renderDetail(id);
      document.getElementById("detail-page").classList.remove("hidden");
    } else {
      this.renderHome();
      document.getElementById("home-page").classList.remove("hidden");
    }
  },

  setupForm() {
    document.getElementById("skill-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const photoInput = document.getElementById("photo");
      let photoBase64 = "";
      
      if (photoInput.files[0]) {
        photoBase64 = await this.fileToBase64(photoInput.files[0]);
      }

      const rawVideos = document.getElementById("videos").value.trim();
      const videos = rawVideos ? rawVideos.split("\n").map(v => v.trim()).filter(Boolean) : [];

      const newSkill = {
        id: Date.now().toString(),
        name: document.getElementById("name").value,
        skill: document.getElementById("skill").value,
        location: document.getElementById("location").value,
        contact: document.getElementById("contact").value.replace(/\D/g, ""),
        desc: document.getElementById("desc").value,
        photo: photoBase64 || "https://ui-avatars.com/api/?name=" + encodeURIComponent(document.getElementById("name").value),
        videos,
        createdAt: new Date().toISOString()
      };

      this.skills.push(newSkill);
      localStorage.setItem("skills", JSON.stringify(this.skills));
      
      alert("✅ Skill published successfully!");
      e.target.reset();
      this.navigate("/home");
    });
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  renderHome() {
    const grid = document.getElementById("skills-grid");
    const noRes = document.getElementById("no-results");
    grid.innerHTML = "";
    
    if (this.skills.length === 0) {
      noRes.classList.remove("hidden");
      return;
    }
    noRes.classList.add("hidden");

    this.skills.forEach(s => {
      grid.innerHTML += `
        <div class="card" onclick="app.navigate('/skill?id=${s.id}')">
          <img src="${s.photo}" alt="${s.name}" class="profile-img">
          <h3>${s.name}</h3>
          <span class="badge">${s.skill}</span>
          <p>📍 ${s.location}</p>
          <p class="desc-preview">${s.desc.substring(0, 100)}${s.desc.length > 100 ? "..." : ""}</p>
        </div>
      `;
    });
  },

  renderDetail(id) {
    const s = this.skills.find(skill => skill.id === id);
    const container = document.getElementById("detail-content");
    if (!s) {
      container.innerHTML = "<p>Skill not found.</p>";
      return;
    }

    const videoHTML = s.videos.length > 0 
      ? `<h3 style="margin-top:20px;">🎥 Tutorials / Demos</h3>
         <div class="video-grid">
           ${s.videos.map(url => {
             const id = this.extractYouTubeId(url);
             if (!id) return `<p>Invalid video link: ${url}</p>`;
             return `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe></div>`;
           }).join("")}
         </div>` 
      : "<p style='margin-top:15px; color:#777;'>No videos added yet.</p>";

    container.innerHTML = `
      <img src="${s.photo}" alt="${s.name}" class="profile-img">
      <h1>${s.skill}</h1>
      <p class="badge">By ${s.name}</p>
      <p>📍 ${s.location}</p>
      <p style="margin: 15px 0; text-align: left; line-height: 1.6;">${s.desc.replace(/\n/g, "<br>")}</p>
      <a class="contact-btn" href="https://wa.me/${s.contact}" target="_blank">💬 Chat on WhatsApp</a>
      ${videoHTML}
    `;
  },

  search(query = "") {
    const val = query.toLowerCase();
    const filtered = this.skills.filter(s =>
      s.skill.toLowerCase().includes(val) ||
      s.location.toLowerCase().includes(val) ||
      s.name.toLowerCase().includes(val)
    );
    
    const grid = document.getElementById("skills-grid");
    const noRes = document.getElementById("no-results");
    grid.innerHTML = "";
    
    if (filtered.length === 0) {
      noRes.classList.remove("hidden");
      return;
    }
    noRes.classList.add("hidden");

    filtered.forEach(s => {
      grid.innerHTML += `
        <div class="card" onclick="app.navigate('/skill?id=${s.id}')">
          <img src="${s.photo}" alt="${s.name}" class="profile-img">
          <h3>${s.name}</h3>
          <span class="badge">${s.skill}</span>
          <p>📍 ${s.location}</p>
          <p class="desc-preview">${s.desc.substring(0, 100)}${s.desc.length > 100 ? "..." : ""}</p>
        </div>
      `;
    });
  },

  extractYouTubeId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/.*v=))([\w-]{11})/);
    return match ? match[1] : null;
  }
};

// Initialize app
app.init();
