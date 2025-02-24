// ai assistant

const btn = document.querySelector(".talk");
const content = document.querySelector(".content");

// function speak(text) {
//   const text_speak = new SpeechSynthesisUtterance(text);
//   text_speak.rate = 1;
//   text_speak.volume = 1;
//   text_speak.pitch = 1;
//   window.speechSynthesis.speak(text_speak);
// }

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

function wishMe() {
  var day = new Date();
  var hour = day.getHours();
  if (hour >= 0 && hour < 12) {
    speak("Good Morning Boss...");
  } else if (hour > 12 && hour < 17) {
    speak("Good Afternoon Boss...");
  } else {
    speak("Good Evening Boss...");
  }
}

window.addEventListener("load", () => {
  speak("Initializing Cartel...");
  wishMe();
});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
//   making it recoginition 2 since we already have recognition in script.js
const recognition2 = new SpeechRecognition();

recognition2.onresult = (event) => {
  const currentIndex = event.resultIndex;
  const transcript = event.results[currentIndex][0].transcript;
  content.textContent = transcript;
  takeCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => {
  content.textContent = "Listening....";
  recognition2.start();
});

function takeCommand(message) {
  if (
    message.includes("cartel") ||
    message.includes("hello") ||
    message.includes("hey")
  ) {
    speak("Hello Sir, How May I Help You?");
  } else if (message.includes("open google")) {
    window.open("https://google.com", "_blank");
    speak("Opening Google...");
  } else if (message.includes("open youtube")) {
    window.open("https://youtube.com", "_blank");
    speak("Opening Youtube...");
  } else if (message.includes("open facebook")) {
    window.open("https://facebook.com", "_blank");
    speak("Opening Facebook...");
  } else if (message.includes("open instagram")) {
    window.open("https://www.instagram.com", "_blank");
    speak("Opening instagram...");
  } else if (message.includes("open tiktok")) {
    window.open("https://www.tiktok.com", "_blank");
    speak("Opening tiktok...");
  } else if (message.includes("open netflix")) {
    window.open("https://www.netflix.com", "_blank");
    speak("Opening netflix...");
  } else if (message.includes("open x")) {
    window.open("https://x.com/?lang=en", "_blank");
    speak("Opening  x...");
  } else if (message.includes("open twitter")) {
    window.open("https://x.com/?lang=en", "_blank");
    speak("Opening twitter ...");
  } else if (
    message.includes("what is") ||
    message.includes("who is") ||
    message.includes("what are")
  ) {
    window.open(
      `https://www.google.com/search?q=${message.replace(" ", "+")}`,
      "_blank"
    );
    const finalText =
      "This is what I found on the internet regarding " + message;
    speak(finalText);
  } else if (message.includes("wikipedia")) {
    window.open(
      `https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`,
      "_blank"
    );
    const finalText = "This is what I found on Wikipedia regarding " + message;
    speak(finalText);
  } else if (message.includes("time")) {
    const time = new Date().toLocaleString(undefined, {
      hour: "numeric",
      minute: "numeric",
    });
    const finalText = time;
    speak(finalText);
  } else if (message.includes("date")) {
    const date = new Date().toLocaleString(undefined, {
      month: "short",
      day: "numeric",
    });
    const finalText = date;
    speak(finalText);
  } else if (message.includes("calculator")) {
    window.open("Calculator:///");
    const finalText = "Opening Calculator";
    speak(finalText);
  } else {
    window.open(
      `https://www.google.com/search?q=${message.replace(" ", "+")}`,
      "_blank"
    );
    const finalText = "I found some information for " + message + " on Google";
    speak(finalText);
  }
}
