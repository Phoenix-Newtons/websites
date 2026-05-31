const app = {
  skills: JSON.parse(localStorage.getItem("skills")) || [],
  
  init() {
    this.setupRouter();
    this.setupForm();
    document.getElementById("search").addEventListener("input", (e) => this.search(e.target.value));
  },// ⚠️ YOUR SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://exzhqanszlmgvzjcpslm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4emhxYW5zemxtZ3Z6amNwc2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODk1NTUsImV4cCI6MjA5NTc2NTU1NX0.2wr7ivDk3VwA1H9jkOVTFn4-Q8h-quaTv3DE39J29pg';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let skills = [];

async function init() {
  await fetchSkills();
  renderSkills();
  document.getElementById("skill-form").addEventListener("submit", addSkill);
  document.getElementById("search").addEventListener("input", searchSkills);
}

async function fetchSkills() {
  const { data, error } = await sb.from("skills").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error:", error);
    alert("Failed to load skills. Check console.");
  } else {
    skills = data || [];
  }
}

async function addSkill(e) {
  e.preventDefault();
  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.textContent = "⏳ Uploading...";

  try {
    // Upload photo
    const photoFile = document.getElementById("photo").files[0];
    let photoUrl = null;
    if (photoFile) {
      const photoName = `${Date.now()}-${photoFile.name}`;
      await sb.storage.from("profiles").upload(photoName, photoFile);
      const { data: { publicUrl } } = sb.storage.from("profiles").getPublicUrl(photoName);
      photoUrl = publicUrl;
    }

    // Upload videos
    const videoFiles = document.getElementById("videos").files;
    const videoUrls = [];
    for (let file of videoFiles) {
      const videoName = `${Date.now()}-${file.name}`;
      await sb.storage.from("videos").upload(videoName, file);
      const { data: { publicUrl } } = sb.storage.from("videos").getPublicUrl(videoName);
      videoUrls.push(publicUrl);
    }

    // Upload documents
    const docFiles = document.getElementById("docs").files;
    const docUrls = [];
    for (let file of docFiles) {
      const docName = `${Date.now()}-${file.name}`;
      await sb.storage.from("documents").upload(docName, file);
      const { data: { publicUrl } } = sb.storage.from("documents").getPublicUrl(docName);
      docUrls.push(publicUrl);
    }

    // Save to database
    const newSkill = {
      name: document.getElementById("name").value,
      skill: document.getElementById("skill").value,
      location: document.getElementById("location").value,
      contact: document.getElementById("contact").value.replace(/\D/g, ""),
      description: document.getElementById("desc").value,
      photo_url: photoUrl,
      video_urls: videoUrls,
      doc_urls: docUrls
    };

    const { error } = await sb.from("skills").insert(newSkill);
    if (error) throw error;

    alert("✅ Skill published successfully!");
    document.getElementById("skill-form").reset();
    await fetchSkills();
    renderSkills();
  } catch (err) {
    console.error(err);
    alert("❌ Error: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "🚀 Publish Skill";
  }
}

function renderSkills(list = skills) {
  const container = document.getElementById("skills");
  container.innerHTML = "";
  
  if (list.length === 0) {
    container.innerHTML = "<p style='text-align:center;color:#777;margin-top:30px'>No skills found. Be the first to share!</p>";
    return;
  }

  list.forEach(s => {
    const img = s.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`;
    container.innerHTML += `
      <div class="card skill">
        <img src="${img}" alt="${s.name}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;float:left;margin-right:15px">
        <h3>👤 ${s.name}</h3>
        <span class="badge">${s.skill}</span>
        <p>📍 ${s.location}</p>
        <p>${s.description || s.desc || ''}</p>
        ${s.video_urls && s.video_urls.length > 0 ? `<p>🎥 ${s.video_urls.length} video(s)</p>` : ''}
        ${s.doc_urls && s.doc_urls.length > 0 ? `<p>📄 ${s.doc_urls.length} document(s)</p>` : ''}
        <a class="contact" href="https://wa.me/${s.contact}" target="_blank">💬 WhatsApp</a>
      </div>
    `;
  });
}

function searchSkills() {
  const value = document.getElementById("search").value.toLowerCase();
  const filtered = skills.filter(s =>
    s.skill.toLowerCase().includes(value) ||
    s.location.toLowerCase().includes(value) ||
    s.name.toLowerCase().includes(value)
  );
  renderSkills(filtered);
}

// Start app
document.addEventListener("DOMContentLoaded", init);

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
