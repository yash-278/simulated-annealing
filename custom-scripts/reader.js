/*  Tools for reading lines from the string contents
        of a textbox.  */

"use strict";

//  Object to read lines from a string

function Reader(s) {
  this.setSource(s);
}

//  Set a new source to read

Reader.prototype.setSource = function (s) {
  this.source = s;
  this.length = s.length;
  this.rewind();
};

//  Get current reading position

Reader.prototype.tell = function () {
  return this.pos;
};

//  Set reading position

Reader.prototype.seek = function (p) {
  this.pos = p;
};

//  Set to reread the source

Reader.prototype.rewind = function () {
  this.seek(0);
};

//  Get next line from a reader.  Returns null at the end.

Reader.prototype.nextLine = function () {
  var s;

  while (true) {
    if (this.pos >= this.length) {
      return null;
    }
    s = this.source.slice(this.pos).match(/^([^\n]*)/);
    if (!s) {
      return null;
    }
    //  This flailing about allows handling last line missing \n
    this.pos += s[1].length;
    if (this.source.slice(this.pos).match(/^\n/)) {
      this.pos++;
    }
    return s[1];
  }
};
