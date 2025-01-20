/*
  WELCOME! All of the code written is open source and used a tutorial found on Youtube about "Incremental Clickers".
  Some of this code I had to find myself, if its bad, I know, this is my first time working with JS, as I've used HTML and stuff but not to this degree.
  Enjoy reading through my garbage code, and if you want to critique, go ahead.

  THANKS! - gord (s1887204)
*/

// GAME //
// GAME //
var game = {
    score: 0,
    totalClicks: 0,
    clickValue: 1,
    retain_how_much_cps_toward_click: 0,
    version: 0.000,
    
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
    }
  };

  // JSONS //
  // JSONS //
  let upgrade_info_json = {};
  let achievements_info_json = {};

  // EVENT EMITTER //
  // EVENT EMITTER //
  const eventEmitter = new EventTarget();

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
    name: [
      "Cursor",
      "Cursor Miners",
      "Cursor Gremlins",
    ],
    image: [
      "bdgs/cursor_icon.png",
      "bdgs/cursor_miner_icon.png",
      "bdgs/cursor_gremlin_icon.png",
    ],
    count: [0, 0, 0],
    incomeidle: [
      1,
      25,
      100,
    ],
    cost: [],
    base_cost: [
      25,
      500,
      1500,
    ],

    purchase: function(index) {
      if (game.score >= this.cost[index]) {
        game.score -= this.cost[index];
        this.count[index]++;
        this.cost[index] = Math.ceil((this.base_cost[index] * this.count[index]) * 1.15); // PURCHASE MULTIPLIER
        display.updateScore();
        display.updateShop();
        display.updateUpgrades();
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
        document.getElementById("shopContainer").innerHTML += '<table class="shopButton" onclick="buildings.purchase('+i+')"><tr><td id="image"><img src="images/'+buildings.image[i]+'"></td><td id="nameAndCost"><p>'+buildings.name[i]+'</p><p><span>'+buildings.cost[i]+'</span> Clicks</p></td><td id="amount"><span>'+buildings.count[i]+'</span></td></tr></table>'
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

function reload_jsons(callback) {
  console.log("Loading JSONS...")
    setTimeout(() => {
      // upgrade info json //
     reloadJSON("../data/JSON/upgrades_info.json", (jsonData) => {
      if (jsonData) {
      //  console.log('Reloaded JSON Data:', jsonData);
       upgrade_info_json = {};
       upgrade_info_json = jsonData;
      //  console.log(upgrade_info_json);
     };
    });

    reloadJSON("../data/JSON/achievements_info.json", (jsonData) => {
      if (jsonData) {
       achievements_info_json = {};
       achievements_info_json = jsonData; 
      };

      if (callback) callback();
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
      upgrades_purchased: upgrades.purchased,
      achievements_awarded : achievements.awarded,
    };
    localStorage.setItem("gameSave", JSON.stringify(game_save));
    console.log("Game saved!")
    notify("Saved game...", 3000)
  };

  // LOAD GAME //
  // LOAD GAME //
  function load_game() {
    // console.log(upgrade_info_json)
    
    for (const category in upgrade_info_json) {
      for (const upgrade_value in category) {
        if (typeof (upgrade_info_json[category][upgrade_value]) !== "undefined") {
          if (upgrades[category][upgrade_value] !== upgrade_info_json[category][upgrade_value]) {
            upgrades[category][upgrade_value] = upgrade_info_json[category][upgrade_value]
          }
          // console.log(category + " // " + upgrade_value + " // " + upgrade_info_json[category][upgrade_value])
        }
      }
    };

    for (const category in achievements_info_json) {
      for (const achievement_value in category) {
        if (typeof (achievements_info_json[category][achievement_value]) !== "undefined") {
          if (achievements[category][achievement_value] !== achievements_info_json[category][achievement_value]) {
            achievements[category][achievement_value] = achievements_info_json[category][achievement_value];
          };
          // console.log(category + " // " + achievement_value + " // " + achievements_info_json[category][achievement_value]);
        };
      };
    };

    var saved_game = JSON.parse(localStorage.getItem("gameSave"))
    if (localStorage.getItem("gameSave") !== null) {
      if (typeof saved_game.score !== "undefined") game.score = saved_game.score;
      if (typeof saved_game.total_score !== "undefined") game.total_score = saved_game.totalScore;
      if (typeof saved_game.total_clicks !== "undefined") game.total_clicks = saved_game.totalClicks;
      
      if (typeof saved_game.buildings_counts !== "undefined") {
        for (i = 0; i < saved_game.buildings_counts.length; i++) {
          buildings.count[i] = saved_game.buildings_counts[i];
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
      };
      if (typeof saved_game.achievements_awarded !== "undefined") {
        for (i = 0; i < saved_game.achievements_awarded.length; i++) {
          achievements.awarded[i] = saved_game.achievements_awarded[i];
        }
      };
      notify("Successfully loaded game...", 4500)
    };
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
      click_display = game.clickValue + cps_thats_added;
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
  function notify(msg, duration) {
    // gets notification container;
    let container = document.getElementById("notificationContainer");

    // make new notification label
    let element = document.createElement("div");
    element.textContent = msg;
    element.classList.add("unselectable", "notification");
    
    // clean the container if there are 4 children
    if (container.children.length == 4) {
      container.children[1].remove()
    };

    // append the child element to the container to make that list like UI thing.
    container.appendChild(element);

    // slowly fade the element
    fade_out(element, duration, 0, function() {
      element.remove()
    })
    // console.log(container.children.length)
  }

  document.getElementById("gameclicker").addEventListener("click", function(event) {
    game.totalClicks++;
    game.click()

    createNumberOnClicker(event)
  }, false);

  // ON WEBSITE LOADED //
  // ON WEBSITE LOADED //
  window.onload = function() {
    reload_jsons(function() {
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

  // woag 500+ lines of code