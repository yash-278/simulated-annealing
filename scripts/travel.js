/*

        This file implements the Travel object which manages
        the solution of the travelling salesman problem.
        
        This file is agnostic with regard to the solver
        algorithm.  It calls specific code in the solver
        for algorithm-specific operations.

    */

"use strict";

function Travel() {
  this.solveInit(); // Perform solver-specific initialisation
  this.newProblem(0);
}

//  Create a new problem, allocating arrays

Travel.prototype.newProblem = function (ncities) {
  this.ncity = ncities;
  this.x = new Array(this.ncity + 1); // Array of X co-ordinates
  this.y = new Array(this.ncity + 1); // Array of Y co-ordinates
  this.iorder = new Array(this.ncity + 1); // Order of traversal
};

//  Randomly position cities on the map and set initial order

Travel.prototype.placeCities = function () {
  for (var i = 1; i <= this.ncity; i++) {
    this.x[i] = Math.random();
    this.y[i] = Math.random();
    this.iorder[i] = i;
  }
};

//  Add a city at specified co-ordinates

Travel.prototype.addCity = function (x, y) {
  this.ncity++;
  this.x[this.ncity] = x;
  this.y[this.ncity] = y;
  this.iorder[this.ncity] = this.ncity;
};

//  Perform solution in one whack

Travel.prototype.solve = function (goal, rivercost) {
  this.iorder = this.solveTSP(this.x, this.y, this.iorder, this.ncity, goal, rivercost, tracing);
};

/*  Show the optimised path on the console log

        We print the path in order of the itinerary,
        showing the city number, its X and Y co-ordinates,
        the computed cost of the edge from that city to
        the next (wrapping around at the bottom) and an
        "R" if river crossing has a nonzero cost and this
        edge crosses the river.  */

Travel.prototype.showPath = function () {
  show("     City        X         Y       Cost");
  for (var i = 1; i <= this.ncity; i++) {
    var ii = this.iorder[i],
      jj = this.iorder[i == this.ncity ? 1 : i + 1],
      cost = alen(this.x[ii], this.x[jj], this.y[ii], this.y[jj]),
      crossing = rcross != 0 && this.x[ii] < 0.5 != this.x[jj] < 0.5 ? " R" : "";
    show(
      "     " +
        ffixed(ii, 3, 0) +
        "     " +
        ffixed(this.x[ii], 8, 4) +
        "  " +
        ffixed(this.y[ii], 8, 4) +
        " " +
        ffixed(cost, 8, 4) +
        crossing
    );
  }
};

//  These global variables are hidden arguments to the functions below

var goodbad = 1; // Maximise (1) or minimise (-1)
var rcross = 0; // Cost (in length) to cross river
var showmoves; // Show moves ?
var tracing = false; // Trace solution ?
var log; // Where to log debug output

/*  If we're running under node.js, this is the
        main program.

        usage: nodejs travelling.js [cities [goal [river]]]
        where   cities  Number of cities
                goal    1 to minimise, -1 to maximise
                river   Cost to cross river, -100 to 100  */

if (typeof window === "undefined") {
  var t = new Travel();

  var cities = 30,
    goal = 1,
    river = 0;

  if (process.argv[2]) {
    cities = parseInt(process.argv[2]);
  }
  if (process.argv[3]) {
    goal = parseInt(process.argv[3]);
  }
  if (process.argv[4]) {
    river = parseInt(process.argv[4]);
  }

  tracing = true;
  t.newProblem(cities);
  t.placeCities();
  if (true) {
    t.solve(goal, river);
  } else {
    t.annealStart(goal, river);
    for (var j = 0; j < t.ncity * 4; j++) {
      if (t.annealStep()) {
        break;
      }
    }
  }
  t.showPath();
}

/*  Format a number with a specified field size
        and decimal places.  If the number, edited to
        the specified number of decimal places, is
        larger than the field, the entire number will
        be returned.  If the number is so small it
        would be displayed as all zeroes, it is
        returned in exponential form.  */

function ffixed(n, width, decimals) {
  var e = n.toFixed(decimals);
  if (e === "0." + new Array(decimals + 1).join("0")) {
    e = n.toPrecision(decimals - 2);
  }
  var s = new Array(width + 1).join(" ") + e;
  return s.substring(s.length - Math.max(width, e.length));
}

//  Return a random bit as a Boolean value

function irbit1() {
  return Math.random() < 0.5;
}

/*  Calculate logical length between two points in the plane
        taking into account whether we are minimising or
        maximising travel distance and the cost of crossing
        the vertical river in the centre of the map.  */

function alen(x1, x2, y1, y2) {
  //  Square a number

  function sqr(x) {
    return x * x;
  }

  return goodbad * (Math.sqrt(sqr(x2 - x1) + sqr(y2 - y1)) + (x1 < 0.5 != x2 < 0.5 ? rcross : 0));
}
