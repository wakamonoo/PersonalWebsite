//FLASHLIGHT EFFECT
document.addEventListener("mousemove", updateFlashlight);
document.addEventListener("touchmove", updateFlashlight);

function updateFlashlight(e) {
  const overlay = document.querySelector(".flashlight-overlay");

  let x, y;
  if (e.touches) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }

  overlay.style.setProperty("--x", `${x}px`);
  overlay.style.setProperty("--y", `${y}px`);
}

// WAKA-BOT
window.onload = function () {
  setTimeout(() => {
    const chatButton = document.getElementById("chatButton");
    chatButton.classList.add("cartoon-animate");
    setTimeout(() => {
      chatButton.classList.remove("cartoon-animate");
    }, 1000);
  }, 7500);
};

function toggleChat() {
  const chatBox = document.getElementById("chatBox");
  const isVisible = window.getComputedStyle(chatBox).display !== "none";

  if (isVisible) {
    chatBox.style.display = "none";
    document.removeEventListener("click", closeChatOutside);
  } else {
    chatBox.style.display = "flex";
    setTimeout(() => {
      document.addEventListener("click", closeChatOutside);
    }, 100);
  }
}

function closeChatOutside(event) {
  const chatBox = document.getElementById("chatBox");
  const chatButton = document.getElementById("chatButton");

  if (!chatBox.contains(event.target) && event.target !== chatButton) {
    chatBox.style.display = "none";
    document.removeEventListener("click", closeChatOutside);
  }
}

function sendFAQ(question) {
  sendMessage(question);
  document.getElementById("faqContainer").style.display = "none";
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
}

async function sendMessage(customMessage = null) {
  const inputElement = document.getElementById("userInput");
  const input = customMessage || inputElement.value.trim();
  const responseDiv = document.getElementById("response");

  if (!input) return;

  appendMessage("user", input);
  if (!customMessage) inputElement.value = "";

  document.getElementById("faqContainer").style.display = "none";

  const loadingMessage = document.createElement("div");
  loadingMessage.className = "message bot-message";
  loadingMessage.innerHTML = `
    <div class="bot-icon">
      <img src="images/aibou.png" alt="Robot Icon" width="24" height="24">
    </div>
    <div class="loading-container">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `;
  responseDiv.appendChild(loadingMessage);
  scrollToBottom();

  try {
    const aiResponse = await fetch(
      "https://wakamonoo-site-backend.onrender.com/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      }
    );

    if (!aiResponse.ok) {
      throw new Error(
        `Server error: ${aiResponse.status} ${aiResponse.statusText}`
      );
    }

    const aiData = await aiResponse.json();
    let botReply =
      aiData.reply || "Sumemasen! I didn't catch that, kindly ask again.";

    loadingMessage.remove();
    appendMessage("bot", botReply, true);
  } catch (error) {
    console.error("Fetch error:", error);
    loadingMessage.remove();
    appendMessage("bot", "Oops! Something went wrong. Please try again later.");
  }
}

function appendMessage(sender, text, isMarkdown = false) {
  const responseDiv = document.getElementById("response");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  const icon = document.createElement("div");
  icon.classList.add("icon");
  icon.innerHTML =
    sender === "user"
      ? '<img src="images/chat-user.png" alt="User Icon" width="24" height="24">'
      : '<img src="images/aibou.png" alt="Bot Icon" width="24" height="24">';

  const textDiv = document.createElement("div");
  textDiv.classList.add("text");

  if (isMarkdown) {
    textDiv.innerHTML = marked.parse(text);
  } else {
    textDiv.innerText = text;
  }

  messageDiv.appendChild(icon);
  messageDiv.appendChild(textDiv);
  responseDiv.appendChild(messageDiv);

  if (sender === "user") {
    scrollToBottom();
  } else if (sender === "bot") {
    setTimeout(() => {
      messageDiv.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return messageDiv;
}

function scrollToBottom() {
  const responseDiv = document.getElementById("response");
  setTimeout(() => {
    responseDiv.scrollTop = responseDiv.scrollHeight;
  }, 100);
}

// Header Typewriter Effect
const textParts = ["Hi, I'm ", "Joven", " Bataller from The Philippines"];
const h1 = document.getElementById("typewriter");
let i = 0,
  j = 0;
const speed = 100;
let currentText = "";

function typeWriter() {
  if (i < textParts.length) {
    if (i === 1) {
      currentText += `<span class="highlight">${textParts[i][j]}</span>`;
    } else {
      currentText += textParts[i][j];
    }

    h1.innerHTML = currentText + `<span class="cursor"></span>`;

    j++;
    if (j >= textParts[i].length) {
      i++;
      j = 0;
    }

    setTimeout(typeWriter, speed);
  } else {
    h1.innerHTML = currentText + `<span class="cursor"></span>`;
    setTimeout(
      () => document.getElementById("dropText").classList.add("show"),
      500
    );
    setTimeout(animateIcons, 1200);
  }
}

function animateIcons() {
  const icons = document.querySelectorAll(".social-info i");
  icons.forEach((icon, index) => {
    setTimeout(() => icon.classList.add("show"), index * 300);
  });
}

typeWriter();

//img bounce
document.addEventListener("DOMContentLoaded", () => {
  const image = document.querySelector(".photo-me img");
  let position = 0;
  let direction = 1;
  const amplitude = 30;
  const step = 1;
  const interval = 20;

  function bounce() {
    position += step * direction;

    if (position >= amplitude || position <= 0) {
      direction *= -1;
    }

    image.style.transform = `translateY(-${position}px)`;
    setTimeout(bounce, interval);
  }

  bounce();
});

// tab-links
var tablinks = document.querySelectorAll("#about .tab-links");
var tabcontents = document.querySelectorAll("#about .tab-contents");

function opentab(tabname) {
  tablinks.forEach((tablink) => tablink.classList.remove("active-link"));
  tabcontents.forEach((tabcontent) =>
    tabcontent.classList.remove("active-tab")
  );

  event.currentTarget.classList.add("active-link");
  document.getElementById(tabname).classList.add("active-tab");
}
// Open and close side menu
var sidemenu = document.getElementById("sidemenu");

function openmenu() {
  sidemenu.style.right = "0";
}
function closemenu() {
  sidemenu.style.right = "-200px";
}
// Send message to Google Sheet
const scriptURL =
  "https://script.google.com/macros/s/AKfycbxXPL48xLVVTA72KS-zEX73YVhlEJv-3rBSUxm3s2XQoIX-32R4MSlZm2pRkdH7tWMq/exec";
const form = document.forms["submit-to-google-sheet"];
const ms = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then((response) => {
      msg.innerHTML = "Message sent successfully";
      setTimeout(function () {
        msg.innerHTML = "";
      }, 5000);
      form.reset();
    })
    .catch((error) => console.error("Error!", error.message));
});
// tools-cert tab links
var toolsTabLinks = document.querySelectorAll("#tools-cert .tab-links");
var toolsTabContents = document.querySelectorAll("#tools-cert .tab-contents");

function openToolsTab(tabName) {
  toolsTabLinks.forEach((link) => link.classList.remove("active-link"));
  toolsTabContents.forEach((tab) => tab.classList.remove("active-tab"));

  event.currentTarget.classList.add("active-link");
  document.getElementById(tabName).classList.add("active-tab");
}
