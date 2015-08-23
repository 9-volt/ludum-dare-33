var scale = function(domainStart, domainEnd, rangeStart, rangeEnd) {
  return function(value) {
    return ((value - domainStart) / (domainEnd - domainStart)) * (rangeEnd - rangeStart) + rangeStart;
  }
}

/*
  pad(10, 4);      // 0010
  pad(9, 4);       // 0009
  pad(123, 4);     // 0123
  pad(10, 4, '-'); // --10
 */
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
