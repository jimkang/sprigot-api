var camera = {
  locked: false,
  rootSelection: null,  
  boardSelection: null, 
  zoomBehavior: null,
  parsedPreLockTransform: null,

  setUpZoomOnBoard: function(boardSel, rootGroupSel) {
    // Make x and y scaling functions that just returns whatever is passed into 
    // them (same domain and range).
    var width = this.getActualWidth(boardSel.node());
    var height = this.getActualHeight(boardSel.node());

    var x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);

    var y = d3.scale.linear()
      .domain([0, height])
      .range([height, 0]);

    camera.zoomBehavior = 
    d3.behavior.zoom().x(x).y(y).scaleExtent([1, 1])
      .on("zoom", camera.syncZoomEventToTransform);

    camera.boardSelection = boardSel;
    
    // When zoom and pan gestures happen inside of #boardSVG, have it call the 
    // zoom function to make changes.
    camera.boardSelection.call(camera.zoomBehavior);

    camera.rootSelection = rootGroupSel;
  },
  // This function applies the zoom changes to the <g> element rather than
  // the <svg> element because <svg>s do not have a transform attribute. 
  // The behavior is connected to the <svg> rather than the <g> because then
  // dragging-to-pan doesn't work otherwise. Maybe something cannot be 
  // transformed while it is receiving drag events?
  syncZoomEventToTransform: function() {
    if (!camera.locked) {
      camera.rootSelection.attr('transform', 
        "translate(" + d3.event.translate + ")" + 
        " scale(" + d3.event.scale + ")");
    }
  },
  resetZoom: function() { 
    if (!camera.locked) {
      rootSelection.attr('transform', "translate(0, 0) scale(1)");
    }
  },
  lockZoomToDefault: function() {
    // console.log("locked to default!");
    camera.resetZoom();
    camera.locked = true;
  },
  lockZoom: function() {
    // console.log("locked!");
    camera.locked = true;
  },
  unlockZoom: function() {
    camera.locked = false;
    // If parsedPreLockTransform is set, restore the zoom transform to that.
    if (camera.parsedPreLockTransform) {
      camera.tweenToNewZoom(camera.parsedPreLockTransform.scale, 
        camera.parsedPreLockTransform.translate, 300);
      camera.parsedPreLockTransform = null;
    }
  },
  lockZoomToDefaultCenterPanAtDataCoords: function(d) {
    // unlockZoom will restore the zoom transform to this.
    camera.parsedPreLockTransform = 
      camera.parseScaleAndTranslateFromTransformString(
        camera.rootSelection.attr('transform'));

    camera.panToCenterOnRect(d);

    camera.lockZoom();
  },
  panToCenterOnRect: function(rect, duration) {
    if (!duration) {
      duration = 300;
    }
    var boardWidth = this.getActualWidth(this.boardSelection.node());
    var boardHeight = this.getActualHeight(this.boardSelection.node());

    var scale = 1.0;
    var oldTransform = camera.rootSelection.attr('transform');

    if (oldTransform) {
      var parsed = 
        camera.parseScaleAndTranslateFromTransformString(oldTransform);
      scale = parsed.scale;
    }

    camera.tweenToNewZoom(scale, 
      [(-rect.x - rect.width/2 + boardWidth/2), 
      (-rect.y - rect.height/2 + boardHeight/2)], duration);
  },

  // newTranslate should be a two-element array corresponding to x and y in 
  // the translation.
  tweenToNewZoom: function(newScale, newTranslate, time) {
    var oldTransform = camera.rootSelection.attr('transform');

    d3.transition().duration(time).tween("zoom", function() {
      var oldScale = 1.0;
      var oldTranslate = [0, 0];
      if (oldTransform) {
        var parsed = 
          camera.parseScaleAndTranslateFromTransformString(oldTransform);
        oldScale = parsed.scale;
        oldTranslate = parsed.translate;
      }
      // console.log("oldScale, newScale, oldTranslate", oldScale, newScale, oldTranslate);
      var interpolateScale = d3.interpolate(oldScale, newScale);
      interpolateTranslation = d3.interpolate(oldTranslate, newTranslate);

      return function(t) {
        // This updates the behavior's scale so that the next time a zoom
        // happens, it starts from here instead of jumping back to what it
        // thought it was last time.        
        // The translate is applied after the scale is applied, so we need to
        // apply the scaling to the behavior ourselves.       
        var currentScale = interpolateScale(t);
        camera.zoomBehavior.scale(currentScale);
        // Same with the translate.
        var currentTranslate = interpolateTranslation(t);
        camera.zoomBehavior.translate(currentTranslate);

        // This sets the transform on the root <g> and changes the zoom and
        // panning.
        camera.rootSelection.attr('transform', 
          "translate(" + currentTranslate[0] + ", " + currentTranslate[1] + ")" + 
          " scale(" + currentScale + ")");         
      };
    });   
  },

  // Returns dict in the form 
  // { scale: int, translate: [translateX, translateY] }
  parseScaleAndTranslateFromTransformString: function(transformString) {
    var parsed = { scale: 1.0, translate: [0, 0] };

    if (transformString && (transformString.length > 0)) {    
      // Transform string will be in the form of "translate(0, 0) scale(1)".
      var scalePiece = transformString.split('scale(')[1];
      if (scalePiece) {
        parsed.scale = parseFloat(scalePiece.substr(0, scalePiece.length - 1));
      }

      var translateFragments = transformString.split(') ')[0].split(',');
      parsed.translate = [
        // Chop out "translate(".
        parseFloat(translateFragments[0].substr(10)),
        parseFloat(translateFragments[1])
      ];
      if (!parsed.translate[1]) {
        console.log("Got NaN out of", translateFragments);
      }
    }
    return parsed;
  },

  getActualHeight: function getActualHeight(el) {
    var height = el.clientHeight;
    if (height < 1) {
      // Firefox doesn't have client heights for SVG elements.
      height = el.parentNode.clientHeight;
    }
    return height;
  },
  getActualWidth: function getActualWidth(el) {
    var height = el.clientWidth;
    if (height < 1) {
      // Firefox doesn't have client heights for SVG elements.
      height = el.parentNode.clientWidth;
    }
    return height;
  },

  translateYFromSel: function translateYFromSel(sel) {
    return sel.attr('transform').split(',')[1].split('.')[0];
  },

  translateXFromSel: function translateXFromSel(sel) {
    return sel.attr('transform').split(',')[0].split('.')[0].split('(')[1];
  },

  panToElement: function panToElement(focusElementSel) {
    var currentScale = camera.zoomBehavior.scale();
    var y = parseInt(camera.translateYFromSel(focusElementSel)) * currentScale;
    var x = parseInt(camera.translateXFromSel(focusElementSel)) * currentScale;

    camera.panToCenterOnRect({
      x: x,
      y: y,
      width: 1,
      height: 1
    },
    750);
  }

}
