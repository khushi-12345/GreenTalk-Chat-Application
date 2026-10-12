const STORAGE_KEY = "greentalk-messages-v1";

const starterContacts = [
  {
    id: "aarav",
    name: "Aarav Sharma",
    avatar: "A",
    online: true,
    messages: [
      { from: "them", text: "Hey Khushi! 👋", time: "10:24 AM" },
      { from: "me", text: "Hi Aarav! How are you?", time: "10:25 AM" },
      { from: "them", text: "I am good! How is your project?", time: "10:26 AM" }
    ]
  },
  {
    id: "priya",
    name: "Priya Verma",
    avatar: "P",
    online: true,
    messages: [
      { from: "them", text: "Hello Khushi 😊", time: "Yesterday" }
    ]
  },
  {
    id: "rahul",
    name: "Rahul Singh",
    avatar: "R",
    online: false,
    messages: [
      { from: "them", text: "Send me the project code.", time: "Monday" }
    ]
  },
  {
    id: "sana",
    name: "Sana Khan",
    avatar: "S",
    online: true,
    messages: [
      { from: "them", text: "Are we studying today?", time: "Sunday" }
    ]
  }
];

const $ = id => document.getElementById(id);

const contactsEl = $("contacts");
const messagesEl = $("messages");
const messageInput = $("messageInput");
const contactSearch = $("contactSearch");
const typingEl = $("typing");

let state = loadState();
let replyTimer;

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.contacts) && parsed.contacts.length) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Could not load saved chats:", error);
  }

  return {
    contacts: starterContacts,
    activeId: "aarav"
  };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    showToast("Unable to save data in this browser.");
  }
}

function activeContact() {
  return state.contacts.find(c => c.id === state.activeId)
    || state.contacts[0];
}

function safeText(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function currentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getPreview(contact) {
  const last = contact.messages.at(-1);

  if (!last) return "Start a conversation";

  return (last.from === "me" ? "You: " : "") + last.text;
}

function renderContacts() {
  const query = contactSearch.value.trim().toLowerCase();

  const filtered = state.contacts.filter(contact =>
    contact.name.toLowerCase().includes(query) ||
    contact.messages.some(message =>
      message.text.toLowerCase().includes(query)
    )
  );

  if (!filtered.length) {
    contactsEl.innerHTML =
      '<p class="empty">No contacts found.</p>';
    return;
  }

  contactsEl.innerHTML = filtered.map(contact => `
    <button
      class="contact ${contact.id === state.activeId ? "active" : ""}"
      data-id="${safeText(contact.id)}"
    >
      <div class="avatar">${safeText(contact.avatar)}</div>

      <div class="contact-info">
        <span class="contact-name">
          ${safeText(contact.name)}
        </span>

        <span class="contact-preview">
          ${safeText(getPreview(contact))}
        </span>
      </div>
    </button>
  `).join("");
}

function renderMessages() {
  const contact = activeContact();

  if (!contact) return;

  $("chatName").textContent = contact.name;
  $("chatAvatar").textContent = contact.avatar;

  $("chatStatus").textContent = contact.online
    ? "🟢 Online (demo)"
    : "Last seen recently (demo)";

  const messages = contact.messages;

  if (!messages.length) {
    messagesEl.innerHTML =
      '<p class="empty">Say hello to start chatting! 👋</p>';
    return;
  }

  messagesEl.innerHTML =
    '<div class="date-label">TODAY · DEMO CHAT</div>' +
    messages.map(message => `
      <div class="message ${
        message.from === "me" ? "outgoing" : "incoming"
      }">
        <div class="message-text">${safeText(message.text)}</div>

        <div class="message-meta">
          ${safeText(message.time)}
          ${message.from === "me"
            ? '<span class="ticks">✓✓</span>'
            : ""}
        </div>
      </div>
    `).join("");

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderApp() {
  renderContacts();
  renderMessages();
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function selectContact(id) {
  const exists = state.contacts.some(c => c.id === id);

  if (!exists) return;

  state.activeId = id;
  saveState();
  renderApp();

  document.querySelector(".app").classList.add("chat-open");
  messageInput.focus();
}

function sendMessage(text) {
  const cleanText = text.trim();

  if (!cleanText) return;

  const contact = activeContact();

  contact.messages.push({
    from: "me",
    text: cleanText,
    time: currentTime()
  });

  saveState();
  renderApp();

  messageInput.value = "";
  messageInput.focus();

  simulateReply(contact.id);
}

function simulateReply(contactId) {
  // Demo reply only; no real person or server is connected.
  clearTimeout(replyTimer);

  typingEl.classList.remove("hidden");

  replyTimer = setTimeout(() => {
    typingEl.classList.add("hidden");

    const contact = state.contacts.find(c => c.id === contactId);

    if (!contact) return;

    const replies = [
      "Nice! 😊",
      "Okay, sounds good!",
      "Thanks for your message!",
      "Got it 👍",
      "Tell me more!"
    ];

    contact.messages.push({
      from: "them",
      text: replies[Math.floor(Math.random() * replies.length)],
      time: currentTime()
    });

    saveState();
    renderApp();
  }, 1200);
}

// Send messages
$("messageForm").addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(messageInput.value);
});

// Select a contact
contactsEl.addEventListener("click", event => {
  const button = event.target.closest("[data-id]");

  if (button) {
    selectContact(button.dataset.id);
  }
});

// Search contacts and message previews
contactSearch.addEventListener("input", renderContacts);

// Add a new demo contact
$("addContact").addEventListener("click", () => {
  const name = prompt("Enter the new contact's name:");

  if (name === null) return;

  const cleanName = name.trim();

  if (!cleanName) {
    showToast("Please enter a name.");
    return;
  }

  const duplicate = state.contacts.some(c =>
    c.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (duplicate) {
    showToast("This contact already exists.");
    return;
  }

  state.contacts.unshift({
    id: "user-" + Date.now(),
    name: cleanName,
    avatar: cleanName.charAt(0).toUpperCase(),
    online: false,
    messages: []
  });

  state.activeId = state.contacts[0].id;

  saveState();
  renderApp();

  document.querySelector(".app").classList.add("chat-open");
  showToast("Contact added successfully!");
});

// Add a smiley
$("emojiButton").addEventListener("click", () => {
  messageInput.value += " 😊";
  messageInput.focus();
});

// Back to contacts on mobile
$("backButton").addEventListener("click", () => {
  document.querySelector(".app").classList.remove("chat-open");
});

// Show chat information
$("chatInfo").addEventListener("click", () => {
  const contact = activeContact();

  alert(
    "Contact: " + contact.name +
    "\nStatus: " + (contact.online ? "Online (demo)" : "Offline (demo)") +
    "\nMessages: " + contact.messages.length +
    "\n\nThis is a frontend-only demo."
  );
});

// Sync changes between tabs of the same browser
window.addEventListener("storage", event => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;

  try {
    const incoming = JSON.parse(event.newValue);

    if (Array.isArray(incoming.contacts) &&
        incoming.contacts.length) {
      state = incoming;
      renderApp();
    }
  } catch (error) {
    console.error("Could not sync browser data:", error);
  }
});

renderApp();