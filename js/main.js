var game = {
    score: 0,
    totalScore: 0,
    totalClicks: 0,
    clickValue: 1,
    version: 0.000,
    
    click: function() {
      this.addToScore(this.clickValue);
    },

    addToScore: function(amount) {
      this.score += amount;
      this.totalScore += amount;
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

  var buildings = {
    name: [
      "Cursor",
      "Cursor Miners",
      "Cursor Gremlins",
    ],
    image: [
      "bdgs/cursor_icon.png",
      "no_texture.png",
      "no_texture.png",
    ],
    count: [0, 0, 0],
    incomeidle: [
      .5,
      10,
      100
    ],
    cost: [
      75,
      250,
      1000,
    ],

    purchase: function(index) {
      if (game.score >= this.cost[index]) {
        game.score -= this.cost[index];
        this.count[index]++;
        this.cost[index] = Math.ceil(this.cost[index] * 1.15);
        display.updateScore();
        display.updateShop();
        display.updateUpgrades();
      }
    }
  };

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
        document.getElementById("upgradeContainer").innerHTML = "";
        for (i = 0; i < upgrades.name.length; i++) {
            if (!upgrades.purchased[i]) {
                if (upgrades.type[i] == "building" && buildings.count[upgrades.buildingIndex[i]] >= upgrades.requirement[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img src="images/'+upgrades.image[i]+'"title=" '+upgrades.name[i]+' &#10; '+upgrades.description[i]+' &#10; ('+upgrades.cost[i]+' clicks)" onclick="upgrades.purchase('+i+')">'
                } else if (upgrades.type == "click" && game.totalClicks >= upgrades.requirement[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img src="images/'+upgrades.image[i]+'"title=" '+upgrades.name[i]+' &#10; '+upgrades.description[i]+' &#10; ('+upgrades.cost[i]+' clicks)" onclick="upgrades.purchase('+i+')">'
                }
            }
        }
    }
  };

  function save_game() {
    var game_save = {
      score: game.score,
      total_score: game.totalScore,
      total_clicks: game.totalClicks,
      click_value: game.clickValue,
      version: game.version,
      buildings_counts: buildings.count,
      buildings_income: buildings.incomeidle,
      buildings_cost: buildings.cost,
      upgrades_purchased: upgrades.purchased,
    }
    localStorage.setItem("gameSave", JSON.stringify(game_save));
  };

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
        }
      };
      if (typeof saved_game.buildings_cost !== "undefined") {
        for (i = 0; i < saved_game.buildings_cost.length; i++) {
          buildings.cost[i] = saved_game.buildings_cost[i];
        }
      };
      if (typeof saved_game.buildings_income !== "undefined") {
        for (i = 0; i < saved_game.buildings_income.length; i++) {
          buildings.incomeidle[i] = saved_game.buildings_income[i];
        }
      };
      if (typeof saved_game.upgrades_purchased !== "undefined") {
        for (i = 0; i < saved_game.upgrades_purchased.length; i++) {
          upgrades.purchased[i] = saved_game.upgrades_purchased[i];
        }
      };
    }
  };
  
  function reset_game_save() {
      if (confirm("Are you really sure you want to reset your game data?")) {
        var new_game_save = {};
        localStorage.setItem("gameSave", JSON.stringify(new_game_save))
        location.reload()
      };
  };

  setInterval(function() {
    game.addToScore(game.getScorePerSecond());
  }, 1000); // 1000 MS = 1 Second

  setInterval(function() {
    display.updateScore();
    display.updateUpgrades();
  }, 10000) // 10000 MS = 10 Seconds

  setInterval(function() {
    save_game();
  }, 30000); // 30000 MS = 30 Seconds

  document.getElementById("gameclicker").addEventListener("click", function() {
    game.totalClicks++;
    game.click()
  }, false);

  window.onload = function() {
    load_game();
    display.updateScore();
    display.updateUpgrades();
    display.updateShop();
  };

  document.addEventListener("keydown", function(event) {
      if (event.ctrlKey && event.which == 83) { // Key = CTRL + S
        event.preventDefault();
        save_game();
      } else if (event.ctrlKey && event.which == 81) { // Key = CTRL + Q
        event.preventDefault();
        reset_game_save();
      }

  }, false);