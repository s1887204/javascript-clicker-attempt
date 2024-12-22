// GAME //
// GAME //
var game = {
    score: 0,
    totalClicks: 0,
    clickValue: 1,
    version: 0.000,
    
    click: function() {
      this.addToScore(this.clickValue);
    },

    addToScore: function(amount) {
      this.score += amount;
      this.totalClicks += amount;
      display.updateScore();
    },

    getScorePerSecond: function() {
      var scorePerSecond = 0;
      for (i = 0; i < buildings.name.length; i++) {
        scorePerSecond += buildings.incomeidle[i] * buildings.count[i];
      }
      return scorePerSecond;
    }
  };

  // UPGRADES //
  // UPGRADES //
  var upgrades = {
    name: [
        "Stone Fingers",
    ],
    description: [
        "Cursors are twice as efficient.",
    ],
    image: [
        "bdgs/cursor_icon.png",
    ],
    type: [
        "building",
    ],
    cost: [
        300,
    ],
    buildingIndex: [
        0,
    ],
    requirement: [
        1,
    ],
    bonus: [
        2,
    ],
    purchased: [false],

    purchase: function(index) {
        if (!this.purchased[index] && game.score >= this.cost[index]) {
            if (this.type[index] == "building" && buildings.count[this.buildingIndex[index]] >= this.requirement[index]) {
                game.score -= this.cost[index];
                buildings.incomeidle[this.buildingIndex[index]] *= this.bonus[index];
                this.purchased[index] = true

                display.updateScore()
                display.updateUpgrades();
            } else if (this.type[index] == "click" && game.totalClicks >= this.requirement[index]) {
                game.score -= this.cost[index];
                game.clickValue *= this.bonus[index];
                this.purchased[index] = true

                display.updateScore()
                display.updateUpgrades();
            }
        }
    }
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
      100
    ],
    base_incomeidle: [
      1,
      25,
      100
    ],
    cost: [
      50,
      200,
      500,
    ],

    purchase: function(index) {
      if (game.score >= this.cost[index]) {
        game.score -= this.cost[index];
        this.count[index]++;
        this.cost[index] = Math.ceil(this.cost[index] * 1.15); // PURCHASE MULTIPLIER
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
      document.getElementById("score").innerHTML = game.score;
      document.getElementById("scorepersecond").innerHTML = game.getScorePerSecond();
      document.title = game.score + " clicks - javascript-clicker-attempt"
    },

    updateShop: function() {
      document.getElementById("shopContainer").innerHTML = "";
      for (i = 0; i < buildings.name.length; i++) {
        document.getElementById("shopContainer").innerHTML += '<table class="shopButton" onclick="buildings.purchase('+i+')"><tr><td id="image"><img src="images/'+buildings.image[i]+'"></td><td id="nameAndCost"><p>'+buildings.name[i]+'</p><p><span>'+buildings.cost[i]+'</span> Clicks</p></td><td id="amount"><span>'+buildings.count[i]+'</span></td></tr></table>'
      }
    },

    updateUpgrades: function() {
        document.getElementById("upgradeContainer").innerHTML = "<div></div>";
        for (i = 0; i < upgrades.name.length; i++) {
            if (!upgrades.purchased[i]) {
                if (upgrades.type[i] == "building" && buildings.count[upgrades.buildingIndex[i]] >= upgrades.requirement[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img src="images/'+upgrades.image[i]+'"title=" '+upgrades.name[i]+' &#10; '+upgrades.description[i]+' &#10; ('+upgrades.cost[i]+' clicks)" onclick="upgrades.purchase('+i+')">'
                } else if (upgrades.type == "click" && game.totalClicks >= upgrades.requirement[i]) {
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
    name: [
        "A new budget beginning...",
        "Lend a hand?",
        "Mutated Hands",
        "Clicker Thousand-er.",
    ],
    description: [
        "Start your journey by clicking the button once.",
        "Buy a cursor to help you.",
        "Buy over 100 cursors",
        "Get 1000 clicks.",
    ],
    image: [
        "achvs/new_beginning.png",
        "no_texture.png",
        "no_texture.png",
        "no_texture.png",
    ],
    type: [
        "click",
        "building",
        "building",
        "score",
    ],
    requirement: [
        1,
        1,
        100,
        1000,
    ],
    objectIndex: [
        -1,
        0,
        0,
        -1
    ],
    awarded: [false, false, false, false],

    earn: function(index) {
        console.log("unlocking achievement: " + this.name[index])
        this.awarded[index] = true;
        display.updateAchievements();
    },
  }
  
  // SAVE GAME //
  // SAVE GAME //
  function save_game() {
    var game_save = {
      score: game.score,
      total_score: game.totalScore,
      total_clicks: game.totalClicks,
      click_value: game.clickValue,
      version: game.version,
      buildings_counts: buildings.count,
      upgrades_purchased: upgrades.purchased,
      achievements_awarded : achievements.awarded,
    };
    localStorage.setItem("gameSave", JSON.stringify(game_save));
  };

  // LOAD GAME //
  // LOAD GAME //
  function load_game() {
    var saved_game = JSON.parse(localStorage.getItem("gameSave"))
    if (localStorage.getItem("gameSave") !== null) {
      if (typeof saved_game.score !== "undefined") game.score = saved_game.score;
      if (typeof saved_game.total_score !== "undefined") game.total_score = saved_game.totalScore;
      if (typeof saved_game.total_clicks !== "undefined") game.total_clicks = saved_game.totalClicks;
      if (typeof saved_game.click_value !== "undefined") game.click_value = saved_game.clickValue;
      
      if (typeof saved_game.buildings_counts !== "undefined") {
        for (i = 0; i < saved_game.buildings_counts.length; i++) {
          buildings.count[i] = saved_game.buildings_counts[i];
        
          if (buildings.count[i] >= 1) {
            buildings.cost[i] = Math.ceil((buildings.count[i] * buildings.cost[i]) * 1.15); // PURCHASE MULTIPLIER
            buildings.incomeidle[i] = (buildings.count[i] * buildings.base_incomeidle[i])
          }
        }
      };
      if (typeof saved_game.upgrades_purchased !== "undefined") {
        for (i = 0; i < saved_game.upgrades_purchased.length; i++) {
          upgrades.purchased[i] = saved_game.upgrades_purchased[i];
        }
      };
      if (typeof saved_game.achievements_awarded !== "undefined") {
        for (i = 0; i < saved_game.achievements_awarded.length; i++) {
          achievements.awarded[i] = saved_game.achievements_awarded[i];
        }
      };
    }
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

  // CREATE NUMBER ON CLICK //
  // CREATE NUMBER ON CLICK //
  function createNumberOnClicker(event) {
    // grab the clicker
    let clicker = document.getElementById("gameclicker");

    // get position the clicker was clicked in
    let clickerOffset = clicker.getBoundingClientRect()
    let position = {
      x: event.pageX - clickerOffset.left + give_random_number(-10, 10),
      y: event.pageY - clickerOffset.top,
    }

    // make click value label
    let element = document.createElement("div");
    element.textContent = "+ " + game.clickValue;
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

  document.getElementById("gameclicker").addEventListener("click", function(event) {
    game.totalClicks++;
    game.click()

    createNumberOnClicker(event)
  }, false);

  // ON WEBSITE LOADED //
  // ON WEBSITE LOADED //
  window.onload = function() {
    load_game();
    display.updateScore();
    display.updateUpgrades();
    display.updateShop();
    display.updateAchievements();
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