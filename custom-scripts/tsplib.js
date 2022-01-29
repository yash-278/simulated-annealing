//  Utilities for processing TSPLIB data

"use strict";

//  Load a TSPLIB problem from a string

function tsplib_load_problem(s) {
  var r = new Reader(s);

  var edgeweight = false;
  var cities = [];
  var mincoord = Number.MAX_VALUE,
    maxcoord = Number.MIN_VALUE,
    minX = Number.MAX_VALUE,
    maxX = Number.MIN_VALUE,
    minY = Number.MAX_VALUE,
    maxY = Number.MIN_VALUE;
  var display_scale = 0.9; // Scale to avoid hitting edges
  var l;
  while ((l = r.nextLine())) {
    var m;
    if ((m = l.match(/^\s*EDGE_WEIGHT_TYPE\s*:\s+(\w+)\s*$/))) {
      /* We accept the following kinds of co-ordinate
                   specifications.  Only EUC_2D actually represents
                   out calculation of cost, but the others are close
                   enough to be useful test cases, even if the optimum
                   may vary from that intended in the original data
                   set. */
      if (!m[1].match(/^(?:EUC_2D|CEIL_2D|GEO|ATT)$/i)) {
        alert("Cannot load problem: unsupported" + " EDGE_WEIGHT_TYPE of " + m[1]);
        return false;
      } else {
        edgeweight = true;
      }
    }

    if ((m = l.match(/\s*(\d+)\s+([\d\.\+\-e]+)\s+([\d\.\+\-e]+)/i))) {
      m[1] = m[1].replace(/^0+/, "");
      cities[m[1]] = [m[2], m[3]];
      mincoord = Math.min(mincoord, m[2]);
      mincoord = Math.min(mincoord, m[3]);
      maxcoord = Math.max(maxcoord, m[2]);
      maxcoord = Math.max(maxcoord, m[3]);
      minX = Math.min(minX, m[2]);
      maxX = Math.max(maxX, m[2]);
      minY = Math.min(minY, m[3]);
      maxY = Math.max(maxY, m[3]);
    }
  }

  if (!edgeweight) {
    alert("EDGE_WEIGHT_TYPE not specified.");
    return false;
  }

  //  Verify that all of the co-ordinates were specified

  for (var i = 1; i < cities.length; i++) {
    if (!cities[i]) {
      alert("Co-ordinates for city " + i + " not specified.");
      return false;
    }
  }

  territory.x = [];
  territory.y = [];
  territory.iorder = [];
  territory.solution = null;

  /*  The following code may appear gnarly, but it
            accomplishes a simple goal.  Co-ordinates in a
            TSPLIB problem file can have any units whatsoever.
            We need to map them to the 0 -- 1 co-ordinate
            space of our map, centre the graph within the
            map, and scale it to leave a small border around
            the graph without changing the aspect ratio of the
            original co-ordinates.  This is what the following
            code does, however messy it may seem.  */

  var biasX = 0,
    biasY = 0,
    biasB;
  var extentX = maxX - minX,
    extentY = maxY - minY;
  var boundbox = Math.max(extentX, extentY);

  if (extentX < extentY) {
    biasX = (boundbox - extentX) / 2;
  }

  if (extentY < extentX) {
    biasY = (boundbox - extentY) / 2;
  }

  biasB = (1 - display_scale) / 2;

  function xformX(x) {
    return ((x - minX + biasX) / boundbox) * display_scale + biasB;
  }

  function xformY(y) {
    return 1 - (((y - minY + biasY) / boundbox) * display_scale + biasB);
  }

  territory.ncity = cities.length - 1;
  for (var i = 1; i < cities.length; i++) {
    territory.x[i] = xformX(cities[i][0]);
    territory.y[i] = xformY(cities[i][1]);
    territory.iorder[i] = i;
  }
  changed = true;
  return true;
}

//  Load a TSPLIB solution from a string

function tsplib_load_solution(s, auto) {
  var r = new Reader(s);

  territory.solution = null;

  var toursection = false;
  var tour = [];
  var l;
  while ((l = r.nextLine())) {
    var m;
    if ((m = l.match(/^\s*TOUR_SECTION\s*$/))) {
      toursection = true;
    }

    if ((m = l.match(/^\s*([\d]+)\s*$/))) {
      if (m[1] >= 1) {
        tour.push(m[1]);
      }
    }
  }

  if (!toursection) {
    alert("TOUR_SECTION not specified.");
    return false;
  }

  /*  Tour should contain as many items as cities.
        
            If we're auto-loading a solution, the problem
            may not have yet finished loading.  We trust that
            the solution in the TSPLIB directory will match
            the problem and don't perform the check at this
            time.  */

  if (!auto) {
    if (territory.ncity != tour.length) {
      alert(
        "Solution does not have the same number of cities (" +
          tour.length +
          ") as the map (" +
          territory.ncity +
          ")."
      );
      return false;
    }
  }

  //  Verify that all of the co-ordinates were specified

  for (var i = 1; i <= territory.ncity; i++) {
    var found = false;
    for (j = 0; j < tour.length; j++) {
      if (tour[j] == i) {
        found = true;
        break;
      }
    }
    if (!found) {
      alert("Solution does not contain city " + i + ".");
      return false;
    }
  }

  territory.solution = [];

  for (var i = 1; i <= territory.ncity; i++) {
    territory.solution[i] = tour[i - 1];
  }

  changed = true;
  return true;
}

//  Output the current map as a TSPLIB problem file

function tsplib_output_map() {
  var s = "";

  function fmt(v) {
    return v.toFixed(6).replace(/0+$/, "");
  }

  s += "NAME : experiment\n";
  s += "TYPE: TSP\n";
  s += "COMMENT: Fourmilab TSP experiment\n";
  s += "DIMENSION : " + territory.ncity + "\n";
  s += "EDGE_WEIGHT_TYPE: EUC_2D\n";
  s += "NODE_COORD_SECTION\n";

  for (var i = 1; i <= territory.ncity; i++) {
    s += i + " " + fmt(territory.x[i]) + " " + fmt(1 - territory.y[i]) + "\n";
  }

  s += "EOF\n";

  return s;
}

//  Output a path as a TSPLIB tour

function tsplib_output_tour() {
  var s = "";

  s += "NAME : experiment.tour\n";
  s += "TYPE: TOUR\n";
  s += "DIMENSION : " + territory.ncity + "\n";
  s += "TOUR_SECTION\n";

  for (var i = 1; i <= territory.ncity; i++) {
    s += territory.iorder[i] + "\n";
  }

  s += "-1\n";
  s += "EOF\n";

  return s;
}
