// Holds a gradient <def> for each level (which are ints).
var gradientDefsForLevels = {};

// Based on http://jsfiddle.net/nra29/2/

// svg:   the owning <svg> element
// id:    an id="..." attribute for the gradient
// stops: an array of objects with <stop> attributes

// <radialGradient id="level1Gradient" gradientUnits="userSpaceOnUse" >
//     <stop offset="0%"  stop-color="#224" />
// </radialGradient>

function createGradient(svg, gradientAttrs, stops) {
  var svgNS = svg.namespaceURI;
  var grad  = document.createElementNS(svgNS, 'radialGradient');
  
  _.each(gradientAttrs, function(value, key) {
    grad.setAttribute(key, value);
  });
  
  for (var i = 0; i < stops.length; i++) {
    var attrs = stops[i];
    var stop = document.createElementNS(svgNS, 'stop');
    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        stop.setAttribute(attr, attrs[attr]);
      }
    }
    grad.appendChild(stop);
  }

  var defs = svg.querySelector('defs') ||
      svg.insertBefore(document.createElementNS(svgNS, 'defs'), svg.firstChild);

  return defs.appendChild(grad);
}

function refStringForGradientDef(gradientDef) {
  return 'url(\'#' + gradientDef.id + '\')';
}

function setUpGradients() {
  var svg = $('#svgBoard')[0];
  for (var i = 0; i < 8; ++i) {
    var gradientId = 'level' + i + "Gradient";
    var gradientDef = createGradient(svg, { 
      id: gradientId, 
      gradientUnits: 'userSpaceOnUse', 
      r: 400, cx: 480, cy: 480
    },
    [{ 
      offset: '30%', 
      'stop-color': colorScale(i), 
    },
    { 
      offset: '100%', 
      'stop-color': d3.rgb(colorScale(i)).darker(2).toString() 
    }]
    );
    
    gradientDefsForLevels[i] = gradientDef;
  }
}
