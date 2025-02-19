const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");

// API KEY SETUP
const API_KEY = "AIzaSyDv92d7AZgqgMMdutLtx9FL2tiBFhbfJ-E";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";

// storing every bot and user conversation so the bot can know the chat history
const chatHistory = [];

// function to create a message element
const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// function to scroll to the bottom of the chat container
const scrollToBottom = () =>
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

// simulate typing effect for bot response
const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  const words = text.split(" ");
  let wordIndex = 0;

  // set an interval to type each word
  const typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent +=
        (wordIndex === 0 ? "" : " ") + words[wordIndex++];
      botMsgDiv.classList.remove("loading");
      scrollToBottom();
    } else {
      clearInterval(typingInterval);
    }
  }, 40);
};
// Make the api call and generate the bot response
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  // Add user message to chat history
  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Process the response text and display with typing effect
    const responseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    typingEffect(responseText, textElement, botMsgDiv);
  } catch (error) {
    console.log(error);
  }
};

//Handle the form submission
const handleFormSubmit = (e) => {
  e.preventDefault();
  userMessage = promptInput.value.trim();

  if (!userMessage) return;

  //   clearing prompt input value
  promptInput.value = "";

  //   Generate user message HTML and add it to the chats containers
  const userMsgHTML = `<p class="message-text"></p>`;
  const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  setTimeout(() => {
    //   Generate user message HTML and add it to the chats containers after 600ms
    const botMsgHTML = ` <img src="gemini-pic.svg" class="avatar" /><p class="message-text">Just a sec...</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();

    generateResponse(botMsgDiv);
  }, 600);
};

promptForm.addEventListener("submit", handleFormSubmit);
