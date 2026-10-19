
const inventory = new Set();
let currentMinutes = 18 * 60;
let alertLevel = 0;

const sceneTitle = document.getElementById("scene-title");
const sceneText = document.getElementById("scene-text");
const choicesContainer = document.getElementById("choices-container");
const characterName = document.getElementById("character-name");
const timeDisplay = document.getElementById("time-display");
const alertDisplay = document.getElementById("alert-display");
const inventoryDisplay = document.getElementById("inventory-display");
const messageDisplay = document.getElementById("message-display");

function addEvidence(item) {
  inventory.add(item);
  renderStatus();
  messageDisplay.textContent = `Evidence collected: ${item}.`;
}

function renderStatus() {
  const hours = Math.floor(currentMinutes / 60);
  const minutes = currentMinutes % 60;
  const displayHour = hours > 12 ? hours - 12 : hours;
  timeDisplay.textContent = `${displayHour}:${String(minutes).padStart(2, "0")} PM`;
  alertDisplay.textContent = alertLevel >= 2 ? "High" : alertLevel === 1 ? "Raised" : "Low";
  inventoryDisplay.textContent = inventory.size ? [...inventory].join(", ") : "None";
}

function endingForCurrentState() {
  if (alertLevel >= 3) return "endingCaught";
  if (currentMinutes >= 19 * 60) return "endingExile";
  return null;
}

function updateScene(sceneName) {
  const scene = scenes[sceneName];
  if (!scene) return;

  if (sceneName === "library" && inventory.has("Skeleton Key") && inventory.has("Terminal Log Clue")) {
    sceneName = "endingTruth";
  }

  const current = scenes[sceneName];
  sceneTitle.textContent = current.title;
  sceneText.textContent = current.text;
  characterName.textContent = current.character || "";
  choicesContainer.replaceChildren();
  messageDisplay.textContent = "";

  current.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice.text;
    button.addEventListener("click", () => {
      currentMinutes += choice.minutes ?? 5;
      alertLevel += choice.alert ?? 0;
      if (choice.action) choice.action();

      const forcedEnding = endingForCurrentState();
      if (forcedEnding) {
        updateScene(forcedEnding);
      } else if (choice.nextScene) {
        updateScene(choice.nextScene);
      } else {
        renderStatus();
      }
    });
    choicesContainer.appendChild(button);
  });

  renderStatus();
}

const scenes = {
  mediaLab: {
    title: "The Media Lab",
    character: "Starting point | 6:00 PM",
    text: "Rows of glowing monitors cast long shadows across silent editing suites. The heavy oak door clicked shut as evening security protocols engaged. This is where you were last seen before the exam drive vanished.",
    choices: [
      { text: "Head to the Computer Lab and check the access logs", nextScene: "computerLab" },
      { text: "Sneak toward the Locked Administrative Hallway", nextScene: "administrativeHallway", alert: 1 },
      { text: "Check your desk in the Journalism Office", nextScene: "journalismOffice" }
    ]
  },
  computerLab: {
    title: "The Computer Lab",
    character: "A nervous tech-club president hunches over a terminal.",
    text: "Desktop towers fill the cavernous room. The tech-club president mutters about firewall logs and encrypted data packets. Digital breadcrumbs may reveal who accessed the master terminal.",
    choices: [
      { text: "Ask the president about the access logs", action: () => addEvidence("Terminal Log Clue"), nextScene: "computerLabAfterLogs" },
      { text: "Search open student workstations for a cipher hint", action: () => addEvidence("Cipher Hint"), nextScene: "computerLab", alert: 2 },
      { text: "Head into the adjoining Custodial Corridor", nextScene: "custodialCorridor" },
      { text: "Return to the Media Lab", nextScene: "mediaLab" }
    ]
  },
  computerLabAfterLogs: {
    title: "The Computer Lab",
    character: "The access log points to an unauthorized attempt from the Library.",
    text: "The log confirms someone tried to reach the master terminal from the Library shortly before the drive disappeared. You have a lead, but you still need the key to the rare manuscript section.",
    choices: [
      { text: "Go to the Journalism Office", nextScene: "journalismOffice" },
      { text: "Look for another route through the Custodial Corridor", nextScene: "custodialCorridor" },
      { text: "Return to the Media Lab", nextScene: "mediaLab" }
    ]
  },
  journalismOffice: {
    title: "The Journalism Office",
    character: "Your desk is buried under old issues and deadline notes.",
    text: "Whiteboards crowd the walls with story pitches and notes about the controversial grading glitch. Your investigative files may connect the vice principal to the missing drive.",
    choices: [
      { text: "Search the desk drawer", action: () => addEvidence("Skeleton Key"), nextScene: "journalismOfficeAfterSearch" },
      { text: "Review the printed notes on the grading glitch", action: () => addEvidence("Grading Glitch Evidence"), nextScene: "journalismOfficeAfterNotes" },
      { text: "Return to the Computer Lab", nextScene: "computerLab" },
      { text: "Return to the Media Lab", nextScene: "mediaLab" }
    ]
  },
  journalismOfficeAfterSearch: {
    title: "The Journalism Office",
    character: "The Library Skeleton Key is tucked inside a photo album.",
    text: "You found the key among your records from past investigative pieces. The Library is still the best place to find out what happened to the drive.",
    choices: [
      { text: "Go to the Computer Lab for the access logs", nextScene: "computerLab" },
      { text: "Head toward the Locked Administrative Hallway", nextScene: "administrativeHallway" },
      { text: "Return to the Media Lab", nextScene: "mediaLab" }
    ]
  },
  journalismOfficeAfterNotes: {
    title: "The Journalism Office",
    character: "The printed evidence ties the grading glitch to the vice principal.",
    text: "The notes point to an administrative cover-up, but they do not tell you where the drive went. Find the terminal log and the Library key before the deadline.",
    choices: [
      { text: "Go to the Computer Lab", nextScene: "computerLab" },
      { text: "Search the desk drawer for the Library key", action: () => addEvidence("Skeleton Key"), nextScene: "journalismOfficeAfterSearch" },
      { text: "Return to the Media Lab", nextScene: "mediaLab" }
    ]
  },
  administrativeHallway: {
    title: "The Locked Administrative Hallway",
    character: "Flashlight beams sweep past portraits of former principals.",
    text: "The corridor smells of floor wax and authority. The vice principal's office is closed, and the roaming custodian is nearby.",
    choices: [
      { text: "Pick the vice principal's office lock", nextScene: "endingCaught", alert: 3 },
      { text: "Hide in the janitorial closet and follow the side vent", nextScene: "library" },
      { text: "Retreat to the Media Lab", nextScene: "mediaLab" }
    ]
  },
  custodialCorridor: {
    title: "The Custodial Corridor",
    character: "The nighttime custodian is organizing the supply closet.",
    text: "Utility sinks, chemical buckets, and folding chairs line the narrow corridor. The strict custodian keeps the area meticulously organized and may know where the Library key went.",
    choices: [
      { text: "Reason with the custodian about the missing Library key", action: () => addEvidence("Skeleton Key"), nextScene: "custodialKey" },
      { text: "Squeeze past the mop buckets toward the Library side stairwell", nextScene: "library", alert: 1 },
      { text: "Return to the Computer Lab", nextScene: "computerLab" }
    ]
  },
  custodialKey: {
    title: "The Custodial Corridor",
    character: "The custodian lends you the Skeleton Key.",
    text: "Your clean track record convinces the custodian to help. The key is yours, but the Library's access logs can tell you whether it is safe to open the rare manuscript section.",
    choices: [
      { text: "Go to the Computer Lab for the terminal log", nextScene: "computerLab" },
      { text: "Take the side stairwell to the Library", nextScene: "library" },
      { text: "Stay in the corridor and return to the Computer Lab", nextScene: "computerLab" }
    ]
  },
  library: {
    title: "The Silent Library",
    character: "The rare manuscript section is sealed behind a heavy lock.",
    text: "Moonlight cuts between towering mahogany shelves. A hollowed-out dictionary is rumored to hide the missing drive, but the inner stacks are locked.",
    choices: [
      { text: "Force the lock or search the stacks without a plan", nextScene: "endingCaught", alert: 3 },
      { text: "Slip out through the exit to the Inner Courtyard", nextScene: "innerCourtyard" },
      { text: "Return through the side vent to the Administrative Hallway", nextScene: "administrativeHallway" },
      { text: "Backtrack to the Custodial Corridor", nextScene: "custodialCorridor" }
    ]
  },
  innerCourtyard: {
    title: "The Inner Courtyard",
    character: "The main gate is locked; second-floor windows overlook the quad.",
    text: "An oak tree stands exposed beneath the night sky. You can still double back, but time is running short and the gate will not open from this side.",
    choices: [
      { text: "Rush the main exit gate without solving the mystery", nextScene: "endingExile" },
      { text: "Watch the second-floor windows, then head back into the Library", nextScene: "library" },
      { text: "Double back through the Custodial Corridor", nextScene: "custodialCorridor" }
    ]
  },
  endingTruth: {
    title: "Ending 1: The Truth Exposed",
    character: "True ending",
    text: "The Skeleton Key opens the gated carrel. Inside a hollowed-out dictionary, you find the missing flash drive and proof of the grading glitch. The head student journalist admits hiding it to protect compromised students. Together, you publish the truth, clear your name, and the lockdown lifts.",
    choices: []
  },
  endingCaught: {
    title: "Ending 2: Caught in the Crossfire",
    character: "Detention ending",
    text: "A metallic click echoes down the corridor. The custodian catches you in the flashlight beam, and the vice principal turns your after-hours investigation into evidence against you. You are suspended; the drive stays hidden and the grading scandal is buried.",
    choices: []
  },
  endingExile: {
    title: "Ending 3: Digital Exile",
    character: "Incomplete ending",
    text: "The deadline passes without enough evidence to clear your name. By morning, campus security finds you at a terminal. The drive is anonymously returned days later, but you lose your editor position and never learn what was hidden in the Library.",
    choices: []
  }
};

renderStatus();
updateScene("mediaLab");

