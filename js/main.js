/*
  WELCOME! All of the code written is open source and used a tutorial found on Youtube about "Incremental Clickers".
  Some of this code I had to find myself, if its bad, I know, this is my first time working with JS, as I've used HTML and stuff but not to this degree.
  Enjoy reading through my garbage code, and if you want to critique, go ahead.


  Warning: Project has used AI technology, like ChatGPT to help remidate any issues that the game has had.

  THANKS! - gord (s1887204)
*/

// GAME //
// GAME //
var game = {
    score: 0,
    totalClicks: 0,
    clickValue: 1,
    retain_how_much_cps_toward_click: 0,
    version: "0.0.0",
    
    click: function() {
      let cps_to_add = this.getPercentageOfScorePerSecond(this.retain_how_much_cps_toward_click);
      this.addToScore(this.clickValue + cps_to_add);
    },

    addToScore: function(amount) {
      this.score += amount;
      this.totalClicks += amount;
      display.updateScore();
    },

    getPercentageOfScorePerSecond: function(percent) {
      return (this.getScorePerSecond() * percent);
    },

    getScorePerSecond: function() {
      var scorePerSecond = 0;
      for (i = 0; i < buildings.name.length; i++) {
        scorePerSecond += buildings.incomeidle[i] * buildings.count[i];
      }
      return scorePerSecond;
    },

    hasDecimal: function(number) {
      return !Number.isInteger(number);
    }
  };

  // AUDIO //
  // AUDIO //
  var audio = {
    backgroundMusic: null,

    sfx: {},
    sfx_Volume: 1,

    input_received: false,
  }

  // JSONS //
  // JSONS //
  let jsons = {
    upgrades: {},
    achievements: {},
    buildings: {}
  }

  // EVENT EMITTER //
  // EVENT EMITTER //
  const eventEmitter = new EventTarget();

  // BASEURL FOR DATA LOADING //
  // BASEURL FOR DATA LOADING //
  let BASEURL = "";

  // UPGRADES //
  // UPGRADES //
  var upgrades = {
    name: [],
    description: [],
    image: [],
    type: [],
    cost: [],
    buildingIndex: [],
    requirement: [],
    bonus: [],
    purchased: [],

    purchase: function(index) {
        if (!this.purchased[index] && game.score >= this.cost[index]) {
            if (this.type[index] == "building" && buildings.count[this.buildingIndex[index]] >= this.requirement[index]) {
                game.score -= this.cost[index];
                buildings.incomeidle[this.buildingIndex[index]] *= this.bonus[index];
                this.purchased[index] = true

                display.updateScore();
                display.updateUpgrades();
            } else if (this.type[index] == "click" && game.totalClicks >= this.requirement[index]) {
                game.score -= this.cost[index];
                game.clickValue *= this.bonus[index];
                this.purchased[index] = true

                display.updateScore();
                display.updateUpgrades();
            } else if (this.type[index] == "clicktocps" && game.totalClicks >= this.requirement[index]) {
              game.score -= this.cost[index];
              game.retain_how_much_cps_toward_click += this.bonus[index]
              this.purchased[index] = true
              
              display.updateScore();
              display.updateUpgrades();
            }
        }
    },
  };

  // BUILDINGS //
  // BUILDINGS //
  var buildings = {
    name: [],
    image: [],
    count: [],
    incomeidle: [],
    cost: [],
    base_cost: [],
    
    unlocked: [],

    purchase: function(index, clicked) {
      if (game.score >= this.cost[index]) {
        game.score -= this.cost[index];
        this.count[index]++;
        // plays sound //
        if(clicked) { play_sfx_sound(`${BASEURL}audio/sfx/building-click-purchase.mp3`) }

        this.cost[index] = Math.ceil((this.base_cost[index] * this.count[index]) * 1.15); // PURCHASE MULTIPLIER
        display.updateScore();
        display.updateShop();
        display.updateUpgrades();
      } else {
        // plays sound //
        if (clicked) {
          play_sfx_sound(`${BASEURL}audio/sfx/misc-denied.mp3`)
        }
      }
    },

    unlock: function(index) {
      if (this.name[index]) {
        
        if (this.base_cost[index] <= game.score) {
          this.unlocked[index] = true;
          display.updateShop();
          display.updateScore(); 
        }

      }
    }
  };

  // DISPLAY //
  // DISPLAY //
  var display = {
    updateScore: function() {
      document.getElementById("score").innerHTML = abbreviate_number(game.score);
      document.getElementById("scorepersecond").innerHTML = abbreviate_number(game.getScorePerSecond());
      document.title = abbreviate_number(game.score) + " clicks - javascript-clicker-attempt"
    },

    updateShop: function() {
      document.getElementById("shopContainer").innerHTML = "";
      for (i = 0; i < buildings.name.length; i++) {

        if (buildings.base_cost[i] <= game.score) {
          buildings.unlocked[i] = true;
        }

        if (buildings.unlocked[i]) {
          document.getElementById("shopContainer").innerHTML += '<table class="shopButton" onclick="buildings.purchase('+i+', true)"><tr><td id="image"><img src="images/'+buildings.image[i]+'"></td><td id="nameAndCost"><p>'+buildings.name[i]+'</p><p><span>'+buildings.cost[i]+'</span> Clicks</p></td><td id="amount"><span>'+buildings.count[i]+'</span></td></tr></table>'
        } else if (!buildings.unlocked[i] && (buildings.unlocked[(i - 1)] == true || i == 0)) {
          document.getElementById("shopContainer").innerHTML += '<table class="shopButton unselectable"><tr><td id="image"><img class="shoptButtonLocked" src="images/'+buildings.image[i]+'"></td><td id="nameAndCost"><p>???</p><p>??? Clicks</p></td><td id="amount"><span>?</span></td></tr></table>'
        }

      }
    },

    updateUpgrades: function() {
        document.getElementById("upgradeContainer").innerHTML = "";
        for (i = 0; i < upgrades.name.length; i++) {
            if (!upgrades.purchased[i]) {
                // console.log(upgrades.name[i])
                if (upgrades.type[i] == "building" && buildings.count[upgrades.buildingIndex[i]] >= upgrades.requirement[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img src="images/'+upgrades.image[i]+'"title=" '+upgrades.name[i]+' &#10; '+upgrades.description[i]+' &#10; ('+upgrades.cost[i]+' clicks)" onclick="upgrades.purchase('+i+')">'
                } else if (upgrades.type[i] == "click" && game.totalClicks >= upgrades.requirement[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img src="images/'+upgrades.image[i]+'"title=" '+upgrades.name[i]+' &#10; '+upgrades.description[i]+' &#10; ('+upgrades.cost[i]+' clicks)" onclick="upgrades.purchase('+i+')">'
                } else if (upgrades.type[i] == "clicktocps" && game.totalClicks >= upgrades.requirement[i]) {
                   document.getElementById("upgradeContainer").innerHTML += '<img src="images/'+upgrades.image[i]+'"title=" '+upgrades.name[i]+' &#10; '+upgrades.description[i]+' &#10; ('+upgrades.cost[i]+' clicks)" onclick="upgrades.purchase('+i+')">'
                }
            }
        }
    },

    updateAchievements: function() {
        document.getElementById("achievementContainer").innerHTML = "<div></div>"
        for (i = 0; i < achievements.name.length; i++) {
            if (achievements.awarded[i]) {
                document.getElementById("achievementContainer").innerHTML += '<img src="images/'+achievements.image[i]+'" title="'+achievements.name[i]+' &#10; '+achievements.description[i]+'">';
            }
        }
    },
  }; 
  
  // ACHIEVEMENTS //
  // ACHIEVEMENTS //
  var achievements = {
    name: [],
    description: [],
    image: [],
    type: [],
    requirement: [],
    objectIndex: [],
    awarded: [],

    earn: function(index) {
        console.log("unlocking achievement: " + this.name[index])
        this.awarded[index] = true;
        display.updateAchievements();
    },
  }
  
  // RELOADS JSONS //
  // RELOADS JSONS //
  function reloadJSON(filePath, callback) {
    fetch(filePath)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            callback(data); // Pass the JSON data to the callback function
        })
        .catch((error) => {
            console.error('Error loading JSON:', error);
        });
  }

  // RELOADS JSONS //
  // RELOADS JSONS //
  function reload_jsons(callback) {
    console.log("Loading JSONS...")
      setTimeout(() => {
      
      // building info json //
      reloadJSON(`${BASEURL}data/JSON/buildings_info.json`, (jsonData) => {
        if (jsonData) {
        jsons.buildings = {};
        jsons.buildings = jsonData;
        };
      });

      // upgrade info json //
      reloadJSON(`${BASEURL}data/JSON/upgrades_info.json`, (jsonData) => {
        if (jsonData) {
        //  console.log('Reloaded JSON Data:', jsonData);
        jsons.upgrades = {};
        jsons.upgrades = jsonData;
        //  console.log(jsons.upgrades);
        };
      });

      // achivements info json //
      reloadJSON(`${BASEURL}data/JSON/achievements_info.json`, (jsonData) => {
        if (jsonData) {
        jsons.achievements = {};
        jsons.achievements = jsonData; 
        };

        if (callback) {
          callback();
        };

      });

      }, 250) // 250 MS = 0.25 seconds
  }

  // SAVE GAME //
  // SAVE GAME //
  function save_game() {
    var game_save = {
      score: game.score,
      total_score: game.totalScore,
      total_clicks: game.totalClicks,
      version: game.version,
      buildings_counts: buildings.count,
      buildings_unlocked: buildings.unlocked,
      upgrades_purchased: upgrades.purchased,
      achievements_awarded : achievements.awarded,
    };
    localStorage.setItem("gameSave", JSON.stringify(game_save));
    console.log("Game saved!")
    notify("Saved game...", 3000)
  };

  function initalize_game_jsons() {
    if (jsons.achievements == null || jsons.buildings == null || jsons.upgrades == null) {
      notify("One or more jsons failed to load. Reload for possible fix.");
      throw new Error("JSONS failed load! Can not start game! Check internet!")
    }

    if (Array.isArray(jsons.upgrades.upgrades)) {
      const upgrades_ = jsons.upgrades.upgrades;

      upgrades_.forEach(upgrade => {
        upgrades.name.push(upgrade.name);
        upgrades.description.push(upgrade.description);
        upgrades.image.push(upgrade.image);
        upgrades.type.push(upgrade.type);
        upgrades.cost.push(upgrade.cost);
        upgrades.buildingIndex.push(upgrade.buildingIndex);
        upgrades.requirement.push(upgrade.requirement);
        upgrades.bonus.push(upgrade.bonus);
      });

    };

    if (Array.isArray(jsons.buildings.buildings)) {
      const buildings_ = jsons.buildings.buildings;

      buildings_.forEach(building => {
          console.log(`Building: ${building.name} loaded!`)
          buildings.name.push(building.name);
          buildings.image.push(building.image);
          buildings.incomeidle.push(building.incomeidle);
          buildings.base_cost.push(building.base_cost);
      });

    };

    if (Array.isArray(jsons.achievements.achievements)) {
      const achievements_ = jsons.achievements.achievements;


      achievements_.forEach(achievement => {
        console.log(`Achievement: ${achievement.name} loaded!`)
        achievements.name.push(achievement.name);
        achievements.description.push(achievement.description);
        achievements.image.push(achievement.image);
        achievements.type.push(achievement.type);
        achievements.requirement.push(achievement.requirement);
        achievements.objectIndex.push(achievement.objectIndex);
      });
    }
  }

  // LOAD GAME //
  // LOAD GAME //
  function load_game() {
    console.log(jsons.upgrades)

    // fixes bug from loading buildings //
    for (let i = 0; i < buildings.name.length; i++) {
      buildings.count[i] = 0;
      buildings.cost[i] = buildings.base_cost[i];
      buildings.unlocked[i] = false;
    };

    console.log(buildings)

    var saved_game = JSON.parse(localStorage.getItem("gameSave"))
    if (localStorage.getItem("gameSave") !== null && localStorage.getItem("gameSave") !== "undefined") {
      if (typeof saved_game.score !== "undefined") game.score = saved_game.score;
      if (typeof saved_game.total_score !== "undefined") game.total_score = saved_game.totalScore;
      if (typeof saved_game.total_clicks !== "undefined") game.total_clicks = saved_game.totalClicks;
      
      if (typeof saved_game.buildings_counts !== "undefined") {
        for (i = 0; i < saved_game.buildings_counts.length; i++) {
          buildings.count[i] = saved_game.buildings_counts[i];

          if (saved_game.buildings_unlocked[i]) {
            buildings.unlocked[i] = saved_game.buildings_unlocked[i]
          }

          // console.log(buildings.count[i]);
  
          if (buildings.count[i] >= 1) {
            buildings.cost[i] = Math.ceil((buildings.count[i] * buildings.base_cost[i]) * 1.15); // PURCHASE MULTIPLIER
          } else {
            buildings.cost[i] = Math.ceil((buildings.base_cost[i])); // PURCHASE MULTIPLIER
          };
        };
      } else {
        for (i = 0; i < buildings.name.length; i++) {
          buildings.cost[i] = buildings.base_cost[i];
        };
  
        notify("Welcome to javascript-clicker-attempt!", 6000);
      }
      if (typeof saved_game.upgrades_purchased !== "undefined") {
        for (i = 0; i < saved_game.upgrades_purchased.length; i++) {
          if (saved_game.upgrades_purchased[i] != null) {
            upgrades.purchased[i] = saved_game.upgrades_purchased[i];

            if (upgrades.purchased[i]) {
              if (upgrades.type[i] == "building") {
                buildings.incomeidle[upgrades.buildingIndex[i]] *= upgrades.bonus[i]
              } else if (upgrades.type[i] == "click") {
                game.clickValue *= upgrades.bonus[i]
              } else if (upgrades.type[i] == "clicktocps") {
                game.retain_how_much_cps_toward_click += upgrades.bonus[i]
              }
            }
          }
        }
      };
      if (typeof saved_game.achievements_awarded !== "undefined") {
        for (i = 0; i < saved_game.achievements_awarded.length; i++) {
          achievements.awarded[i] = saved_game.achievements_awarded[i];
        }
      };
      notify("Successfully loaded game...", 4500)
    };

    console.log("New building: ", buildings)
  };
  
  // RESET GAME //
  // RESET GAME //
  function reset_game_save() {
      if (confirm("Are you really sure you want to reset your game data?")) {
        var new_game_save = {};
        localStorage.setItem("gameSave", JSON.stringify(new_game_save))
        location.reload()
      };
  };

  // ACHIEVEMENT POLLING + CPS //
  // ACHIEVEMENT POLLING + CPS //
  setInterval(function() {
    for (i = 0; i < achievements.name.length; i++) {
        if (!achievements.awarded[i]) {
            if (achievements.type[i] == "score" && game.score >= achievements.requirement[i]) achievements.earn(i);
            else if (achievements.type[i] == "click" && game.totalClicks >= achievements.requirement[i]) achievements.earn(i);
            else if (achievements.type[i] == "building" && buildings.count[achievements.objectIndex[i]] >= achievements.requirement[i]) achievements.earn(i);
        }
    };

    for (i = 0; i < buildings.name.length; i++) {
      if (!buildings.unlocked[i]) {
        if (buildings.base_cost[i] <= game.score) {
          if (i == 0) { // exception if it is the first building 
            buildings.unlock(i);
          } else if (buildings.count[(i - 1)] >= 3) {
            buildings.unlock(i);
          }
        };

      }
    };

    game.addToScore(game.getScorePerSecond());
  }, 1000); // 1000 MS = 1 Second

  // DISPLAY UPDATE //
  // DISPLAY UPDATE //
  setInterval(function() {
    display.updateScore();
    display.updateUpgrades();
  }, 10000) // 10000 MS = 10 Seconds

  // GAME SAVING //
  // GAME SAVING //
  setInterval(function() {
    save_game();
  }, 30000); // 30000 MS = 30 Seconds

  // FADE OUT FUNC //
  // FADE OUT FUNC //
  function fade_out(element, duration, final_opacity, call_back) {
    let opacity = 1;

    let elementFadingInterval = window.setInterval(function() {
      if (typeof element == "undefined" && element == null) clearInterval(movementInterval);
      opacity -= 50 / duration

      if (opacity <= final_opacity) {
        clearInterval(elementFadingInterval)
        call_back();
      }

      element.style.opacity = opacity
    }, 50) // 50 MS = 0.05 seconds
  }

  // RNG //
  // RNG //
  function give_random_number(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  // ABBREVIATES NUMBERS USING JS BUILT IN FUNCTION //
  // ABBREVIATES NUMBERS USING JS BUILT IN FUNCTION //
  function abbreviate_number(number) {
    const formatted_number = Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(number)

    return formatted_number
  }

  // CREATE NUMBER ON CLICK //
  // CREATE NUMBER ON CLICK //
  function createNumberOnClicker(event) {
    // grab the clicker
    let clicker = document.getElementById("gameclicker");

    // get position the clicker was clicked in
    let clickerOffset = clicker.getBoundingClientRect()
    let position = {
      x: event.pageX - clickerOffset.left + give_random_number(-15, 20),
      y: event.pageY - clickerOffset.top,
    }

    // get the actual click value
    let cps_thats_added = game.getPercentageOfScorePerSecond(game.retain_how_much_cps_toward_click);

    // decide if it should abbreviate
    let click_display = 0
    if (game.clickValue >= 1000) {
      click_display = abbreviate_number((game.clickValue + cps_thats_added));
    } else {
      if (game.hasDecimal(game.clickValue + cps_thats_added)) {
        click_display = (game.clickValue + cps_thats_added).toFixed(3); // stops the display from being over 2 decimals
      } else {
        click_display = (game.clickValue + cps_thats_added) // just regular
      }
    }
    
    // make click value label
    let element = document.createElement("div");
    element.textContent = "+ " + click_display;
    element.classList.add("number", "unselectable");

    // give click value label the position of the mouse
    element.style.left = position.x + "px";
    element.style.top = position.y + "px";

    // append clicker label to the clicker
    clicker.appendChild(element);

    // slowly rise the element
    let movementInterval = window.setInterval(function(){
      if (typeof element == "undefined" && element == null) clearInterval(movementInterval);

      position.y -= 1.5;
      element.style.top = position.y + "px";
    }, 10); // 10 MS = 0.01 seconds.

    // slowly fade the element
    fade_out(element, 6000, 0.5, function() {
      element.remove()
    })
  }

  // NOTIFICATION SYSTEM //
  // NOTIFICATION SYSTEM //
  function notify(msg, duration = 5000, fade_duration = 1000) {
    const notificationCenter = document.getElementById("notificationContainer");

    // Create a notification element
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = msg;
  
    // Add notification to the center and trigger fade-in
    notificationCenter.appendChild(notification);
  
    // Trigger fade-in by adding a 'show' class
    setTimeout(() => {
      notification.classList.add("show");
    }, 10); // Wait a bit for the DOM to update before starting animation
  
    // Auto-remove after the specified duration (fade out)
    setTimeout(() => {
      notification.style.opacity = 0; // Manually trigger fade-out
      setTimeout(() => notification.remove(), 500); // Remove after fade-out is complete
    }, duration);
  
    // Allow manual dismissal
    notification.addEventListener("click", () => {
      notification.style.opacity = 0; // Trigger fade-out immediately on click
      setTimeout(() => notification.remove(), 500); // Remove after fade-out
    });
  }

  // WHEN BUTTON IS CLICKED //
  // WHEN BUTTON IS CLICKED //
  document.getElementById("gameclicker").addEventListener("click", function(event) {
    play_sfx_sound(`${BASEURL}audio/sfx/button-click.mp3`)

    game.totalClicks++;
    game.click()

    createNumberOnClicker(event)
  }, false);
  // WHEN BUTTON IS CLICKED //
  // WHEN BUTTON IS CLICKED //

  // MAKE SURE CURRENT GAME VERSION IS UP TO DATE IF DOWNLOADED //
  // MAKE SURE CURRENT GAME VERSION IS UP TO DATE IF DOWNLOADED //
  async function version_control() {
    // github version //
    let github_version;
    let current_version;

    try {
      // Fetch the version JSON from github
      const response = await fetch("https://s1887204.github.io/javascript-clicker-attempt/data/JSON/version.json");
      if (!response.ok) {
        throw new Error(`HTTP Error when trying to get version! ${Response.status}`)
      }
      // parse to json
      github_version = await response.json();

      // fetch the version JSON from the game
      const response_2 = await fetch(`${BASEURL}data/JSON/version.json`);
      if (!response_2.ok) {
        throw new Error(`HTTP Error when trying to get version! ${Response.status}`)
      };

      // parse to json twice
      current_version = await response_2.json();

      if (github_version.version !== current_version.version) {
        notify("You are currently running an outdated version! Latest: " + github_version.version + " || Current: " + current_version.version, 5000);
      }

      game.version = current_version.version;
    } catch(error) {
      console.error("Failed to check for updates, Cause:" + error);
      alert("Could not check for updates! Please make sure you are on the internet!")
    }

    if (current_version.version && github_version.version) {
      document.getElementById("versionDisplay").textContent = "javascript-clicker-attempt // Version " + current_version.version + " (Latest " + github_version.version + ")";
    } else if (current_version) {
      document.getElementById("versionDisplay").textContent = "javascript-clicker-attempt // Version " + current_version.version + " (Latest ?.?.?)";
    }
  }

  // DETECT IF BEING RAN LOCALLY OR ON WEB (SETS UP BASEURL DONT REMOVE) //
  // DETECT IF BEING RAN LOCALLY OR ON WEB (SETS UP BASEURL DONT REMOVE) //
  function detect_running_location() {
    if (window.location.protocal == "file:") { // game is being ran from a file
      BASEURL = "./";
      notify("Thanks for downloading!", 2000);

    } else if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") { // game is likely being hosted on local computer
      BASEURL = "./";
      notify("Thanks for downloading and hosting!", 2000);

    } else if (/^\d{1,3}(\.\d{1,3}){3}$/.test(window.location.hostname)) { // game is being ran from an IP (ran from a place without a web link, weird)
      BASEURL = `http://${window.location.hostname}/`;
      notify("This game is being ran from a random IP, be careful on what you do!", 9000);

    } else if (window.location.hostname === "s1887204.github.io") { // game is being ran from the website.
      BASEURL = "https://s1887204.github.io/javascript-clicker-attempt/";
      console.log("Running on official website...")

    } else { // game is likely running from another website.
      BASEURL = "https://s1887204.github.io/javascript-clicker-attempt/";
      console.warn("Game was created by @s1887204. Link: https://github.com/s1887204/javascript-clicker-attempt");
    }
  };

  // SETS UP AUDIO AND THEIR PATHS //
  // SETS UP AUDIO AND THEIR PATHS //
  function audio_setup() {
    // load background music //
    audio.backgroundMusic = document.getElementById("background_music");
    if (audio.backgroundMusic) {
      audio.backgroundMusic.src = `${BASEURL}audio/backgroundMusic/SchemingWeasel_KevinMacleod.mp3`;
    };

  }

  // CHANGES VALUES OF BACKGROUND MUSIC //
  // CHANGES VALUES OF BACKGROUND MUSIC //
  function change_bg_music(play, volume) {
    if (audio.input_received) {
      audio.backgroundMusic.volume = volume;

      if (play && audio.backgroundMusic.paused) {
        audio.backgroundMusic.play();
      } else if (!play && !audio.backgroundMusic.paused) {
        audio.backgroundMusic.pause();
      }
    }
  }

  // PLAYS A SFX SOUND THAT CORRESPONDS TO THE ID //
  // PLAYS A SFX SOUND THAT CORRESPONDS TO THE ID //
  function play_sfx_sound(PATH) {
    if (audio.input_received) {
      const sfx_audio = new Audio(PATH)

      sfx_audio.play().catch(error => {
        console.log("Error playing sfx: ", error)
      });

      sfx_audio.addEventListener("ended", function() {
        sfx_audio.remove();
      });

    }
  }

  // BEGINS SOUNDS WHEN IT CAN //
  // BEGINS SOUNDS WHEN IT CAN //
  function begin_sounds() {
      // plays bg music
      change_bg_music(true, 1)
  }

  // ON WEBSITE LOADED //
  // ON WEBSITE LOADED //
  window.onload = function() {
    // detects the location it is running from
    detect_running_location();

    // checks up on the current version of the game //
    version_control();

    // loads audio
    audio_setup();

    reload_jsons(function() {
      initalize_game_jsons();

      load_game();
      display.updateScore();
      display.updateShop();
      display.updateAchievements();
      display.updateUpgrades();
    });

    console.warn("Hey! Welcome to the console log! Report any errors you may see here! - Gord")
  };

  // ON KEY DOWN EVENT //
  // ON KEY DOWN EVENT //
  document.addEventListener("keydown", function(event) {
      if (event.ctrlKey && event.which == 83) { // Key = CTRL + S
        event.preventDefault();
        save_game();
      } else if (event.ctrlKey && event.which == 81) { // Key = CTRL + Q
        event.preventDefault();
        reset_game_save();
      }

  }, false);

  // WHEN WINDOW IS CLICKED -- GIVES INPUT SO IT CAN PLAY SOUND //
  // WHEN WINDOW IS CLICKED -- GIVES INPUT SO IT CAN PLAY SOUND //
  window.addEventListener("click", function () {
    if (!audio.input_received) 
      { 
        audio.input_received = true; 
        begin_sounds(); 
      }
  })

  // woag 670+ lines of code