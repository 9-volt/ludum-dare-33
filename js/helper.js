var scale = function(domainStart, domainEnd, rangeStart, rangeEnd) {
  return function(value) {
    return ((value - domainStart) / (domainEnd - domainStart)) * (rangeEnd - rangeStart) + rangeStart;
  }
}
