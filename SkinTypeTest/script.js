//sets the coordinates of toronto// 
//https://pmc.ncbi.nlm.nih.gov/articles/PMC12971093/ - flaws with the scale
//https://www.skincancer.org/risk-factors/skin-type/
const lat = 43.47;
const lng = -79.70;
const alt = 100;
const dt = new Date().toISOString().slice(0, 10);

const myHeaders = new Headers();
myHeaders.append("x-access-token", "openuv-jk4qrmud32o42-io");
myHeaders.append("Content-Type", "application/json");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};

let currentUVIndex = 0;

fetch(`https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}&alt=${alt}&dt=${dt}`, requestOptions)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("OpenUV response:", data);

    const uvIndex = data?.result?.uv;

    if (uvIndex !== undefined) {
      currentUVIndex = uvIndex;
      const peakUVIndex = data?.result?.uv_max;
      const peakUVTime = data?.result?.uv_max_time;
      const peakTime = peakUVTime ? new Date(peakUVTime) : null;
      const peakTimeLabel = peakTime && Number.isFinite(peakTime.getTime())
        ? peakTime.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
        : "Unavailable";
      const uvValueElement = document.getElementById("uv-index");
      if (uvValueElement) {
        const { bgColor, category } = getUVCategory(uvIndex);
        uvValueElement.innerHTML = `
          <div style="background-color: ${bgColor}; padding: 15px; align border-radius: 8px; text-align: center; width:100%; font-weight: bold; color: white;">
            <p>UV Index: ${uvIndex} (${category})</p>
            <p>Peak UV Index: ${peakUVIndex ?? "Unavailable"}</p>
            <p>Peak expected: ${peakTimeLabel}</p>
          </div>
        `;
      }
    } else {
      console.error("UV data not found in response.");
    }
  })
  .catch(error => {
    console.error("Error fetching UV data:", error);
  });
//sets the uv index categories based on the value and assigns a colour to them//
function getUVCategory(uvIndex) {
  if (uvIndex < 3) {
    return { bgColor: "#4CAF50", category: "Low", color: "green" };
  } else if (uvIndex < 6) {
    return { bgColor: "#FFEB3B", category: "Moderate", color: "yellow" };
  } else if (uvIndex < 8) {
    return { bgColor: "#FF9800", category: "High", color: "orange" };
  } else if (uvIndex < 11) {
    return { bgColor: "#F44336", category: "Very High", color: "red" };
  } else {
    return { bgColor: "#9C27B0", category: "Extreme", color: "purple" };
  }
}

var safe_exposure_time = {
  st1: 10,
  st2: 20,
  st3: 30,
  st4: 40,
  st5: 50,
  st6: 60
};

//sets the types of skin and its characteristics//
var skinCharacteristics = {
  type1: {
    description: "Very sensitive to sun light",
    details: "Pale white skin, blue/green eyes, blond/red hair. Always burns, never tans."
  },
  type2: {
    description: "Sensitive to sun light",
    details: "Fair skin, blue eyes. Usually burns, tans minimally."
  },
  type3: {
    description: "Moderate sensitivity to sun light",
    details: "Darker white skin. Sometimes burns, tans gradually."
  },
  type4: {
    description: "Low sensitivity to sun light",
    details: "Olive skin, rarely burns. Tans easily and well."
  },
  type5: {
    description: "Very low sensitivity to sun light",
    details: "Brown skin, very rarely burns. Tans very easily."
  },
  type6: {
    description: "Minimal sensitivity to sun light",
    details: "Dark skin, never burns. Always deeply pigmented."
  }
};

let selectedSkinType = null;

document.addEventListener("DOMContentLoaded", function () {
  const startBtn = document.getElementById("start-btn");
  const submitBtn = document.getElementById("submit-btn");
  const questionIntro = document.getElementById("question-intro");
  const questionContent = document.getElementById("question-content");
  const resultsDiv = document.getElementById("results");
  const question = {
    label: "Choose the description that best matches your skin:",
    options: Object.entries(skinCharacteristics).map(([value, characteristics], index) => ({
      value,
      text: `Skin Type ${index + 1}`,
      details: `${characteristics.description}. ${characteristics.details}`
    }))
  };

  function displaySkinTypeQuestion() {
    const optionsHTML = question.options.map(option => `
      <div style=" background-color: #f9f9f9; border-radius: 8px; padding: 1rem; cursor: pointer; text-align: left; display: flex; flex-direction: column; justify-content: center;" class="skin-type-option" data-value="${option.value}">
        <label style="cursor: pointer; display: block; font-size: 1rem; font-family: arial; font-weight: bold; margin: 0;">
          <input type="radio" name="skin-type-selection" value="${option.value}" style="margin: 0 1rem 0.5rem 1rem;">
          ${option.text}
        </label>
        <p style="margin: 0.5rem 1rem 0.5rem 1rem; font-size: 1rem; font-family: arial; color: #666;">${option.details}</p>
      </div>
    `).join('');

    questionContent.innerHTML = `
      <p style="font-size: 1.3rem; margin-top:2em; margin-bottom: 1.5rem;">UV rays don't affect everyone the same, skin type plays a significant role in determining safe exposure times.</p>
      <p style="font-size: 1rem; font-family: arial; font-weight: bold; margin-top: 0; margin-bottom: 1.5rem;">${question.label}</p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%; margin: 0 auto;">
        ${optionsHTML}
      </div>
    `;

    questionContent.hidden = false;
    submitBtn.style.display = 'block';

    // Add change listeners to radio buttons
    const radios = document.querySelectorAll(`input[name="skin-type-selection"]`);
    radios.forEach(radio => {
      radio.addEventListener("change", function () {
        selectedSkinType = this.value;
      });
    });

    // Add click listeners to option boxes
    const optionDivs = document.querySelectorAll(".skin-type-option");
    optionDivs.forEach(div => {
      div.addEventListener("click", function () {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
        selectedSkinType = radio.value;
      });
    });
  }

  function calculateAdjustedExposureTime(baseSafeTime, uvIndex) {
    let multiplier = 1;

    if (uvIndex < 3) {
      multiplier = 1.5; // low UV = 50% more safe time
    } else if (uvIndex < 6) {
      multiplier = 1.2; // moderate UV = 20% more safe time
    } else if (uvIndex < 8) {
      multiplier = 0.8; // high UV = 20% less safe time
    } else if (uvIndex < 11) {
      multiplier = 0.5; // very high UV = 50% less safe time
    } else {
      multiplier = 0.25; // extremely high UV = 75% less safe time
    }

    return Math.round(baseSafeTime * multiplier);
  }

  function updateResults() {
    if (!selectedSkinType) {
      alert("Please select your skin type before submitting.");
      return false;
    }

    const skinType = selectedSkinType;
    const skinTypeNum = skinType.replace("type", "");
    const skinInfo = skinCharacteristics[skinType];

    const baseSafeTime = safe_exposure_time["st" + skinTypeNum];
    const adjustedSafeTime = calculateAdjustedExposureTime(baseSafeTime, currentUVIndex);
    const { bgColor, category } = getUVCategory(currentUVIndex);

    resultsDiv.innerHTML = `
      <h2>Your Results</h2>

      <div style="background-color: #ffe492ff; width: 100%; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
        <h3>You have ${skinType.charAt(0).toUpperCase() + skinType.slice(1)} Skin</h3>
        <p><strong>${skinInfo.description}</strong></p>
        <p>${skinInfo.details}</p>
      </div>

      <div style="background-color: ${bgColor}; width: 100%; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: left; color: white;">
        <h3 style="margin-top: 0; color: white;">Current UV Index: ${currentUVIndex} (${category})</h3>
        <p><strong>Safe Exposure Time:</strong> ${adjustedSafeTime} minutes before sun burn</p>
        <p style="font-size: 0.9rem; opacity: 0.9;">Base safe time for your skin type: ${baseSafeTime} minutes (adjusted for current UV conditions)</p>
      </div>

      ${category === "Moderate" ? '<img src="imgs/sunscreen.png" alt="Sunscreen" style="display: block; max-width: 100%; height: auto; margin: 0 auto 20px;">' : ""}

      <button id="reset-btn" type="button" style="margin-top: 20px; background-color: rgb(255, 170, 0); color: white;">Reset Test</button>
    `;

    document.getElementById("reset-btn").addEventListener("click", resetTest);
    
    // Scroll results to top of page
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  function resetTest() {
    selectedSkinType = null;
    resultsDiv.innerHTML = "";
    questionContent.hidden = true;
    submitBtn.style.display = "none";
    questionIntro.style.display = "flex";
    questionIntro.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  questionContent.hidden = true;
  startBtn.addEventListener("click", function () {
    questionIntro.style.display = "none";
    displaySkinTypeQuestion();
  });

  submitBtn.addEventListener("click", function () {
    if (updateResults()) {
      questionContent.hidden = true;
      submitBtn.style.display = "none";
    }
  });
});

