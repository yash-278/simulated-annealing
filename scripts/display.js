/*  Travelling Salesman Problem User Interaction  */

"use strict";

//  State globals

var animationInterval = 50; // Milliseconds per animation step
var running = false; // Are we running?
var animationTimer = null; // Animation timer
var stepping = false; // Is stepping in progress ?
var changed = false; // Do we need to repaint the canvas ?
var animating = false; // Running an animation ?
var animateTicks = 20; // Update animation this many steps
var animateTick; // Animation tick counter

// Graphics objects for the canvas
var c; // Canvas
var cwid; // Canvas width
var chgt; // Canvas height
var ctx; // Context for canvas

// The travelling salesman problem solver
var territory;

//  Initialise when the page has finished loading

function tspInit() {
  if (!canvasP()) {
    return; // Dumb browser; don't proceed further
  }

  //  Get graphics elements
  c = document.getElementById("map"); // Canvas
  cwid = c.width; // Canvas width
  chgt = c.height; // Canvas height
  ctx = c.getContext("2d"); // Context
  ctx.scale(cwid, chgt); // Scale to plot 0-1 range

  log = document.getElementById("log");

  /*  Create and initialise the Travel object.  Create
            the initial problem, ready to be solved.  */
  territory = new Travel();
  territory.newProblem(30);
  territory.placeCities();
  changed = true;

  //  Create listener for mouse down events
  c.addEventListener("mousedown", mouseClick, false);

  /*  Inititally uncheck and disable the
            "Show optimal solution" checkbox.  */
  showOptimalState(false, true);

  //  Start the animation
  running = true;
  reAnimator();
}

//  reAnimator  --  Perform animated updates when we're running

function reAnimator() {
  /*  If the user has paused the animation, do nothing.
            Because we don't reset the animation timer, we won't
            be called again.  */
  if (running) {
    if (animating && --animateTick <= 0) {
      animating = !territory.solveStep();
      changed = true;
      animateTick = animateTicks;
      if (!animating) {
        if (tracing) {
          show(
            "Solution with path length " +
              territory.path.toFixed(6) +
              " at temperature " +
              territory.t.toFixed(6)
          );
          territory.showPath();
        }
        document.getElementById("animate").disabled = false;
      }
    }

    drawScreen();
    // Wind the cat
    animationTimer = window.setTimeout(reAnimator, animationInterval);
  }
}

//  changeField  --  Respond to change in experiment parameter fields

function changeField() {
  window.clearTimeout(animationTimer);
  animationTimer = null;
  running = true;
  reAnimator();
}

//  drawScreen  --  Paint the screen

function drawScreen() {
  if (changed) {
    //  Clear the background of the map

    ctx.fillStyle = "#D0D0D0";
    ctx.fillRect(0, 0, 1, 1);

    //  If there's a cost of crossing the river, draw it

    var rcost = parseInt(document.getElementById("rcost").value);
    rcost = Math.max(-100, Math.min(100, rcost));
    if (rcost != 0) {
      ctx.strokeStyle = "#0000FF";
      ctx.lineWidth = 1.0 / cwid;
      ctx.lineCap = "square";
      ctx.beginPath();
      ctx.moveTo(0.5, 0);
      ctx.lineTo(0.5, 1);
      ctx.stroke();
    }

    //  Plot the itinerary among the cities

    if (territory.ncity > 1) {
      ctx.strokeStyle = "#8080FF";
      ctx.lineWidth = 1.0 / cwid;
      ctx.lineCap = "square";
      ctx.beginPath();
      ctx.moveTo(territory.x[territory.iorder[1]], territory.y[territory.iorder[1]]);
      for (var i = 2; i <= territory.ncity; i++) {
        ctx.lineTo(territory.x[territory.iorder[i]], territory.y[territory.iorder[i]]);
      }
      ctx.closePath();
      ctx.stroke();
    }

    if (document.getElementById("showOptimal").checked) {
      drawSolution();
    }

    //  Draw the cities on the map

    for (var i = 1; i <= territory.ncity; i++) {
      drawCity(territory.x[i], territory.y[i]);
    }
    changed = false;
  }
}

//  drawCity  --  Draw a city at the specified location

function drawCity(px, py) {
  var rg = ctx.createRadialGradient(px, py, 0, px, py, 0.01);
  rg.addColorStop(0, "#FF0000");
  rg.addColorStop(1, "#B00000");
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(px, py, 0.01, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.closePath();
}

//  drawSolution  --  If there is a solution, plot it

function drawSolution() {
  if (territory.solution && territory.ncity > 1) {
    for (var i = 1; i <= territory.ncity; i++) {
      ctx.strokeStyle = "rgba(0, 255, 0, 1.0)";
      ctx.lineWidth = 1.0 / cwid;
      ctx.lineCap = "square";
      ctx.beginPath();
      ctx.moveTo(territory.x[territory.solution[1]], territory.y[territory.solution[1]]);
      for (var i = 2; i <= territory.ncity; i++) {
        ctx.lineTo(territory.x[territory.solution[i]], territory.y[territory.solution[i]]);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

//  newButton  --  Generate a new map of city positions

function newButton() {
  territory.newProblem(0);
  territory.placeCities();
  showOptimalState(false, true);
  changed = true;
}

//  Solve all at once, show result

function solveButton() {
  if (territory.ncity >= 4) {
    var goal = parseInt(document.getElementById("goal").value);
    var rcost = parseInt(document.getElementById("rcost").value);
    rcost = Math.max(-100, Math.min(100, rcost));
    document.getElementById("solve").disabled = true;
    territory.solve(goal, rcost);
    if (tracing) {
      territory.showPath();
    }
    document.getElementById("solve").disabled = false;
    changed = true;
  } else {
    alert("Cannot solve for fewer than 4 cities.");
  }
}

/*  Step through the solution at each iteration.  Special
        gimmick: the Step button can be used to halt an
        animation and return to step mode.  */

function stepButton() {
  if (animating) {
    document.getElementById("animate").disabled = false;
    animating = false;
    stepping = true;
  }
  if (!stepping) {
    if (territory.ncity >= 4) {
      var goal = parseInt(document.getElementById("goal").value);
      var rcost = parseInt(document.getElementById("rcost").value);
      rcost = Math.max(-100, Math.min(100, rcost));
      territory.solveStart(goal, rcost);
      document.getElementById("step").value = "Next";
      stepping = true;
    } else {
      alert("Cannot solve for fewer than 4 cities.");
    }
  }
  stepping = !territory.solveStep();
  changed = true;
  if (!stepping) {
    if (tracing) {
      show(
        "Solution with path length " +
          territory.path.toFixed(6) +
          " at temperature " +
          territory.t.toFixed(6)
      );
    }
    alert("Solution: path length " + territory.path.toFixed(6));
    document.getElementById("step").value = "Step";
  }
}

/*  Animate the solution.  You can begin animation from the
        initial state or when stepping through a solution.  */

function animateButton() {
  if (!animating) {
    if (territory.ncity >= 4) {
      if (stepping) {
        stepping = false;
        document.getElementById("step").value = "Step";
      } else {
        var goal = parseInt(document.getElementById("goal").value);
        var rcost = parseInt(document.getElementById("rcost").value);
        rcost = Math.max(-100, Math.min(100, rcost));
        territory.solveStart(goal, rcost);
      }
      document.getElementById("animate").disabled = true;
      animating = true;
      animateTick = 1; // Force immediate update
    } else {
      alert("Cannot solve for fewer than 4 cities.");
    }
  }
}

//  placeButton  --  Place random cities

function placeButton() {
  var n = parseInt(document.getElementById("ncities").value);
  if (n > 3 && n <= 300) {
    territory.newProblem(n);
    territory.placeCities();
    showOptimalState(false, true);
    changed = true;
  } else {
    alert("Number of cities must be between 4 and 300.");
  }
}

//  traceChanged  --  State of trace checkbox changed

function traceChanged() {
  tracing = document.getElementById("trace").checked;
  document.getElementById("console").style.display = tracing ? "inline" : "none";
}

//  tsplibChanged  --  State of TSPLIB tools checkbox changed

function tsplibChanged() {
  var tsplib = document.getElementById("tsplibc").checked;
  document.getElementById("tsplib").style.display = tsplib ? "inline" : "none";
}

//  showOptimalState  --  Set state of showOptimal checkbox

function showOptimalState(checked, disabled) {
  document.getElementById("showOptimal").checked = checked;
  document.getElementById("showOptimal").disabled = disabled;
  document.getElementById("checkOptimal").style.color = disabled ? "#808080" : "inherit";
}

//  loadProblemFile  --  Load problem or solution from file

function loadProblemFile() {
  var f = document.getElementById("P_problemfile").files[0];
  if (f) {
    var r = new FileReader();
    r.onload = function (e) {
      document.getElementById("tsprob").value = r.result;
      if (f.name.match(/\.tour$/)) {
        tsplib_load_solution(tsprob.value, true);
        // Solution loaded.  Enable its display
        showOptimalState(false, false);
        document.getElementById("showOptimal").disabled = false;
      } else {
        tsplib_load_problem(tsprob.value);
        /*  Inititally uncheck and disable the
                        "Show optimal solution" checkbox.  */
        showOptimalState(false, true);
      }
    };
    r.readAsText(f, "UTF-8");
  } else {
    alert("Please choose a file to load.");
  }
}

//  loadProblemURL  --  Load problem from URL

function loadProblemURL(url, autorun) {
  var purl = url;
  if (purl === "") {
    alert("Please specify the problem URL or choose a standard problem.");
  } else {
    /* If the URL has a trailing exclamation point, it
               is a TSPLIB problem which has a known solution
               available in a .opt.tour file in the directory. */
    var hasSol = url.match(/!$/);
    if (hasSol) {
      url = url.replace(/!$/, "");
    }
    //  Allow specification of standard problem by just name
    if (url.match(/^\w[\w\/]+$/)) {
      url = "../tsplib/" + url + ".tsp";
    }
    var ureq = new XMLHttpRequest();
    ureq.open("GET", url, true);

    ureq.onload = function (e) {
      if (ureq.readyState == 4 && ureq.status == 200) {
        tsprob.value = ureq.responseText;
        tsplib_load_problem(tsprob.value);
        /*  Inititally uncheck and disable the
                        "Show optimal solution" checkbox.  */
        showOptimalState(false, true);

        //  Now try to load a solution URL, if one exists

        if (hasSol) {
          var surl = url.replace(/\.tsp/, ".opt.tour");
          var sureq = new XMLHttpRequest();
          sureq.open("GET", surl, true);

          sureq.onload = function (e) {
            if (sureq.readyState == 4 && sureq.status == 200) {
              tsplib_load_solution(sureq.responseText, true);
              // Solution loaded.  Enable its display
              showOptimalState(false, false);
            } else {
              alert('Solution for problem "' + purl + '" not found.');
            }
          };
          sureq.send(null);
        }
      } else {
        alert('Problem "' + purl + '" not found.');
      }
    };
    ureq.send(null);
  }
}

//  mouseClick  --  Handle mouse click event

function mouseClick(e) {
  //  Huh?  Internet Exploder <= 8 reports buttons 1+ everybody else
  if (e.button <= 1) {
    var p = mousePos(e);

    //  Transform click co-ordinates into our 0-1 space
    var x = p[0] / (cwid - 1.0),
      y = p[1] / (chgt - 1.0);
    if (territory.ncity < 300) {
      territory.addCity(x, y);
      showOptimalState(false, true);
      changed = true;
    } else {
      alert("Maximum number of cities is 300.");
    }
  }
}

//  mousePos  -- Return position within canvas of a mouse event

function mousePos(e) {
  var x, y;

  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  x -= c.offsetLeft;
  y -= c.offsetTop;

  return [x, y];
}

//  Test if browser supports canvas and can get graphical context
function canvasP() {
  return !!document.createElement("canvas").getContext;
}

//  Display a string on the debug console or standard output

function show(s) {
  if (log) {
    if (log.value.length > 16384) {
      log.value = log.value.slice(-16384);
    }
    log.value += s + "\n";
    log.scrollTop = log.scrollHeight;
  } else {
    console.log(s);
  }
}
