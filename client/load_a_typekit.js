function loadATypeKit(typekitURL, done) {
  var head = d3.select('head');

  var typekitScript = head.append('script').attr({
    type: 'text/javascript',
    src: typekitURL
  });
  var typekitScriptEl = typekitScript.node();
  typekitScriptEl.onload = function loadTypeKit() {
    try {
      Typekit.load({
        active: done,
        inactive: done
      });
    } 
    catch (e) {
      debugger;
    }
  };
}

