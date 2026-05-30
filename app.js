let skills = JSON.parse(localStorage.getItem("skills")) || [];

function toggleForm() {
  document.getElementById("formCard").classList.toggle("hidden");
  renderSkills();
}

function addSkill() {
  let newSkill = {
    name: document.getElementById("name").value,
    skill: document.getElementById("skill").value,
    location: document.getElementById("location").value,
    contact: document.getElementById("contact").value,
    desc: document.getElementById("desc").value
  };

  skills.push(newSkill);
  localStorage.setItem("skills", JSON.stringify(skills));

  alert("Skill published!");

  document.querySelectorAll("input, textarea").forEach(i => i.value = "");

  renderSkills();
}

function renderSkills(list = skills) {
  let container = document.getElementById("skills");

  container.innerHTML = "";

  list.forEach(s => {
    container.innerHTML += `
      <div class="card skill">
        <h3>👤 ${s.name}</h3>
        <span class="badge">${s.skill}</span>
        <p>📍 ${s.location}</p>
        <p>${s.desc}</p>

        <a class="contact" href="https://wa.me/${s.contact}" target="_blank">
          💬 Contact on WhatsApp
        </a>
      </div>
    `;
  });
}

function searchSkills() {
  let value = document.getElementById("search").value.toLowerCase();

  let filtered = skills.filter(s =>
    s.skill.toLowerCase().includes(value) ||
    s.location.toLowerCase().includes(value)
  );

  renderSkills(filtered);
}

// initial load
renderSkills();