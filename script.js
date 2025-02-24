const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = promptForm.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggle = document.querySelector("#theme-toggle-btn");

// API KEY SETUP
const API_KEY = "AIzaSyDv92d7AZgqgMMdutLtx9FL2tiBFhbfJ-E";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let typingInterval, controller;
// storing every bot and user conversation so the bot can know the chat history
const chatHistory = [];

const userData = { message: "", file: {} };

// function to create a message element with the given content and classes
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
  typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent +=
        (wordIndex === 0 ? "" : " ") + words[wordIndex++];
      scrollToBottom();
    } else {
      clearInterval(typingInterval);
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
    }
  }, 40);
};
// Make the api call and generate the bot response
// const generateResponse = async (botMsgDiv) => {
//   const textElement = botMsgDiv.querySelector(".message-text");
//   controller = new AbortController();
//   // Add user message and file data to chat history
//   chatHistory.push({
//     role: "user",
//     parts: [
//       { text: userData.message },
//       ...(userData.file.data
//         ? [
//             {
//               inline_data: (({ fileName, isImage, ...rest }) => rest)(
//                 userData.file
//               ),
//             },
//           ]
//         : []),
//     ],
//   });
//   try {
//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ contents: chatHistory }),
//       signal: controller.signal,
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error.message);

//     // Process the response text and display with typing effect
//     const responseText = data.candidates[0].content.parts[0].text
//       .replace(/\*\*([^*]+)\*\*/g, "$1")
//       .trim();
//     typingEffect(responseText, textElement, botMsgDiv);
//     // adding the models response to the chat history for better interactions
//     chatHistory.push({
//       role: "model",
//       parts: [{ text: responseText }],
//     });
//     console.log(chatHistory);
//   } catch (error) {
//     textElement.style.color = "#d62939";
//     textElement.textContent =
//       error.name === "AbortError"
//         ? "Request generation stopped"
//         : error.message;
//     botMsgDiv.classList.remove("loading");
//     document.body.classList.remove("bot-responding");
//   } finally {
//     userData.file = {};
//     scrollToBottom();
//   }
// };
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  controller = new AbortController();

  // Add user message and file data to chat history
  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data
        ? [
            {
              inline_data: (({ fileName, isImage, ...rest }) => rest)(
                userData.file
              ),
            },
          ]
        : []),
    ],
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
      signal: controller.signal,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Process the response text and display with typing effect
    const responseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();

    typingEffect(responseText, textElement, botMsgDiv);

    // Add the model's response to chat history
    chatHistory.push({
      role: "model",
      parts: [{ text: responseText }],
    });

    console.log(chatHistory);

    // Speak the AI's response
    speak(responseText);
  } catch (error) {
    textElement.style.color = "#d62939";
    textElement.textContent =
      error.name === "AbortError"
        ? "Request generation stopped"
        : error.message;
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
  } finally {
    userData.file = {};
    scrollToBottom();
  }
};

//Handle the form submission
const handleFormSubmit = (e) => {
  e.preventDefault();
  const userMessage = promptInput.value.trim();
  // if the bot is still responding restrict the user from sending a new message.
  if (!userMessage || document.body.classList.contains("bot-responding"))
    return;

  //   clearing prompt input value
  promptInput.value = "";
  userData.message = userMessage;
  document.body.classList.add("bot-responding", "chats-active");
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");

  //   Generate user message HTML and add it to the chats containers
  // adding the attachment message weather its an image or a file
  const userMsgHTML = `<p class="message-text"></p>
  ${
    userData.file.data
      ? userData.file.isImage
        ? `<img src="data:${userData.file.mime_type};base64,
    ${userData.file.data}" class="img-attachment" />`
        : `<p class="file-attachment"><span class="material-symbols-rounded"> 
    description</span>${userData.file.fileName}</p>`
      : ""
  }`;
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

// Handle file input change (file upload)
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);

  // clearing the input file value
  reader.onload = (e) => {
    fileInput.value = "";
    // germini only receives the base64 string of the file
    const base64String = e.target.result.split(",")[1];
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add(
      "active",
      isImage ? "img-attached" : "file-attached"
    );

    // Store file data in userData obj
    userData.file = {
      fileName: file.name,
      data: base64String,
      mime_type: file.type,
      isImage,
    };
  };
});

// Handle file upload cancel
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
});

// stop ongoing bot response
document.querySelector("#stop-response-btn").addEventListener("click", () => {
  userData.file = {};
  controller?.abort();
  clearInterval(typingInterval);
  chatsContainer
    .querySelector(".bot-message.loading")
    .classList.remove("loading");
  document.body.classList.remove("bot-responding");
});

// Delete all chats
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  chatHistory.length = 0;
  chatsContainer.innerHTML = "";
  document.body.classList.remove("bot-responding", "chats-active");
});

// Handle suggestions click to add to prompt input
document.querySelectorAll(".suggestions-item").forEach((item) => {
  item.addEventListener("click", () => {
    promptInput.value = item.querySelector(".text").textContent;
    promptForm.dispatchEvent(new Event("submit"));
  });
});

// show/hide controls for mobile on prompt input focus
document.addEventListener("click", ({ target }) => {
  const wrapper = document.querySelector(".prompt-wrapper");
  const shouldHide =
    target.classList.contains("prompt-input") ||
    (wrapper.classList.contains("hide-controls") &&
      (target.id === "add-file-btn" || target.id === "stop-response-btn"));
  wrapper.classList.toggle("hide-controls", shouldHide);
});

// toggle theme dark/light and save in local storage for persistence
themeToggle.addEventListener("click", () => {
  const isLightTheme = document.body.classList.toggle("light-theme");
  localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
  themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";
});
//set initial theme from local storage
const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);
themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";

promptForm.addEventListener("submit", handleFormSubmit);
promptForm
  .querySelector("#add-file-btn")
  .addEventListener("click", () => fileInput.click());

// VOICE AI

// Function to get available voices

const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.lang = "en-US"; // Set language for speech recognition

// Start listening for voice input
function startListening() {
  document.getElementById("output").textContent = "Listening...";
  recognition.start(); // Start speech recognition
}

// Event listener when recognition results are available
// recognition.onresult = async (event) => {
//   const transcript = event.results[0][0].transcript;
//   document.getElementById("output").textContent = "You: " + transcript;
//   console.log("User said:", transcript); // Log the spoken text

//   try {
//     const aiResponse = await askGemini(transcript); // Get response from Gemini AI
//     speak(aiResponse); // Convert AI response to speech
//   } catch (error) {
//     console.error("Error with Gemini API request:", error);
//     speak("Sorry, there was an issue processing your request.");
//   }
// };

recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  promptInput.value = transcript; // Set voice input in the text field
  promptForm.dispatchEvent(new Event("submit")); // Submit like a typed message
};

// Error handling for speech recognition
recognition.onerror = function (event) {
  console.error("Speech recognition error:", event.error);
  document.getElementById("output").textContent =
    "Error occurred: " + event.error;
};

let conversationHistory = []; // Stores chat history

async function askGemini(userInput) {
  // Add user message to history
  conversationHistory.push({
    role: "user",
    parts: [{ text: userInput }],
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: conversationHistory, // Send the entire conversation
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Full API Response:", data); // Log full response to debug
    const aiReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't understand.";

    // Add AI response to history
    conversationHistory.push({
      role: "model",
      parts: [{ text: aiReply }],
    });

    document.getElementById("output").textContent = "AI: " + aiReply;
    console.log("AI Response:", aiReply);

    return aiReply;
  } catch (error) {
    console.error("Error with Gemini API request:", error);
    return "Sorry, there was an issue processing your request.";
  }
}

function getVoices() {
  return new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      resolve(voices);
    };
  });
}
getVoices().then((voices) => console.log(voices.map((v) => v.name)));

// Function to speak with a specific voice
async function speak(
  text,
  voiceName = "Microsoft Zira - English (United States)"
) {
  const voices = await getVoices();
  const utterance = new SpeechSynthesisUtterance(
    text.replace(/\*/g, "") // Remove asterisks from text
  );

  // Find and set the desired voice
  const selectedVoice = voices.find((voice) => voice.name === voiceName);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    console.warn(`Voice "${voiceName}" not found, using default.`);
  }

  speechSynthesis.speak(utterance);
}

//   Function to speak out the text using SpeechSynthesisUtterance
// function speak(text) {
//   // Replace any asterisks (*) with an empty string, effectively ignoring them
//   const cleanedText = text.replace(/\*/g, ""); // Removes all asterisks

//   const speech = new SpeechSynthesisUtterance(cleanedText);
//   speech.rate = 1;
//   speech.pitch = 1;
//   speech.volume = 1;
//   window.speechSynthesis.speak(speech);
// }

// Function to stop any ongoing speech synthesis
function stopSpeaking() {
  window.speechSynthesis.cancel(); // Cancel ongoing speech
  document.getElementById("output").textContent = "Speech stopped.";
}
