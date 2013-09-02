var TextStuff = {
  graph: null, 
  treeRenderer: null,
  store: null,
  sprigot: null,

  pane: null,
  textpane: null,
  textcontent: null,
  titleField: null,
  editZone: null,
  addButton: null,
  deleteButton: null,
  emphasizeCheckbox: null,
  OKCancelDialog: null,
  editAvailable: true
};

TextStuff.init = function init(sprigotSel, graph, treeRenderer, store, 
  sprigot) {

  this.graph = graph;
  this.treeRenderer = treeRenderer;
  this.store = store;
  this.sprigot = sprigot;

  this.pane = sprigotSel.append('div')
    .classed('pane', true).attr('id', 'nongraphPane');
  
  this.pane.append('div').attr('id', 'questionDialog');
  
  this.textpane = this.pane.append('div').attr('id', 'textpane');
  
  this.editZone = this.textpane.append('div').classed('editZone', true);
  this.titleField = this.editZone.append('span').classed('sprigTitleField', true);
  this.textcontent = 
    this.editZone.append('div').classed('textcontent', true).attr('tabindex', 0);

  if (this.editAvailable) {
    this.addButton = this.textpane.append('button').text('+')
      .classed('newsprigbutton', true).classed('editcontrol', true);
    this.deleteButton = this.textpane.append('button').text('-')
      .classed('deletesprigbutton', true).classed('editcontrol', true);
    this.emphasizeCheckbox = this.textpane.append('label').text('Emphasize')
      .classed('editcontrol', true);
    this.textpane.append('input').attr({
      type: 'checkbox',
      id: 'emphasize'
    })
    .classed('editcontrol', true);
  }

  this.editZone.style('display', 'none');
  this.titleField.style('display', 'none');
  d3.selectAll('#textpane *').style('display', 'none');

  if (this.editAvailable) {
    this.textcontent.on('click', this.startEditing.bind(this));
    this.titleField.on('click', this.startEditing.bind(this));

    // Globals!
    this.addButton.on('click', this.sprigot.respondToAddChildSprigCmd);
    this.deleteButton.on('click', this.showDeleteSprigDialog);

    this.emphasizeCheckbox.on('click', 
      this.respondToEmphasisCheckClick.bind(this))
    this.editZone.on('keydown', this.respondToEditZoneKeyDown.bind(this));
  }
}

TextStuff.syncTextpaneWithTreeNode = function syncTextpaneWithTreeNode(treeNode) {
  this.textcontent.datum(treeNode);
  this.titleField.datum(treeNode);

  this.textcontent.html(treeNode.body);
  this.titleField.html(treeNode.title);
  this.emphasizeCheckbox.attr('value', Graph.focusNode.emphasize ? 'on' : null);
}

TextStuff.showTextpaneForTreeNode = function showTextpaneForTreeNode(treeNode) {
  this.syncTextpaneWithTreeNode(treeNode);

  d3.selectAll('#textpane :not(.sprigTitleField)').style('display', 'block');
  this.editZone.style('display', 'block');    
  this.uncollapseTextpane();
}

TextStuff.fadeInTextPane = function fadeInTextPane(transitionTime) {
  if (this.editZone.style('display') === 'none') {
    var textpaneEditControls = d3.selectAll('#textpane :not(.sprigTitleField)');
    this.textpane.style('opacity', 0);
    textpaneEditControls.style('opacity', 0);
    this.editZone.style('opacity', 0);

    textpaneEditControls.style('display', 'block')
      .transition().duration(transitionTime)
      .style('opacity', 1);

    this.editZone.style('display', 'block')
      .transition().duration(transitionTime)
      .style('opacity', 1);

    this.textpane
      .transition().duration(transitionTime)
      .style('opacity', 1);
  }
}

TextStuff.initialTextPaneShow = function initialTextPaneShow(focusSel) {
  setTimeout(function doIt() {
    this.syncTextpaneWithTreeNode(focusSel.datum(), this.graph.focusEl);
    this.fadeInTextPane(750);
  }
  .bind(this),
  725);
}

TextStuff.uncollapseTextpane = function uncollapseTextpane() {
  var textPaneIsCollapsed = this.pane.classed('collapsedPane');
  if (textPaneIsCollapsed) {
    toggleGraphExpansion();
  }
}

TextStuff.showTitle = function showTitle() {
  this.titleField.text(this.titleField.datum().title);
  this.titleField.style('display', 'block');
}


/* Editing */

TextStuff.makeId = function makeId(lengthOfRandomPart) {
  return 's' + uid(lengthOfRandomPart);
}

TextStuff.changeEditMode = function changeEditMode(editable, skipSave) {
  if (!this.editAvailable) {
    return;
  }

  this.textcontent.attr('contenteditable', editable);
  this.titleField.attr('contenteditable', editable);
  this.editZone.classed('editing', editable);

  if (editable) {
    this.showTitle();
    this.textcontent.node().focus();
    // TODO: Make the cursor bolder? Flash the cursor?
  }
  else {
    this.titleField.style('display', 'none');

    var editedNode = this.textcontent.datum();
    editedNode.body = this.textcontent.html();

    var newTitle = this.titleField.text();
    var titleChanged = (newTitle !== editedNode.title);
    editedNode.title = newTitle;
    if (titleChanged) {
      d3.select('#' + editedNode.id + ' text').text(editedNode.title);
    }

    this.textcontent.datum(editedNode);
    this.titleField.datum(editedNode);

    if (!skipSave) {
      this.store.saveSprigFromTreeNode(this.textcontent.datum(), 
        this.sprigot.docId);
    }
  }
}

TextStuff.endEditing = function endEditing() {
  if (this.editZone.classed('editing')) {
    this.changeEditMode(false);
  }
}

TextStuff.showDeleteSprigDialog = function showDeleteSprigDialog() {
  this.OKCancelDialog = new OKCancelDialog('#questionDialog', 
    'Do you want to delete this?', 'Delete', 
    this.sprigot.respondToDeleteSprigCmd,
    function removeOKCancelDialog() {
      delete this.OKCancelDialog;
    }
    .bind(this)
  );
  this.OKCancelDialog.show();  
}

/* Responders */

TextStuff.respondToEmphasisCheckClick = function respondToEmphasisCheckClick(d) {
  if (this.graph.focusNode) {
    this.graph.focusNode.emphasize = (this.value === 'on');
    this.treeRenderer.update(this.graph.nodeRoot);
  }
}

TextStuff.respondToEditZoneKeyDown = function respondToEditZoneKeyDown() {
  if ((d3.event.metaKey || d3.event.ctrlKey) && d3.event.which === 13) {
    d3.event.stopPropagation();
    if (this.editZone.classed('editing')) {
      this.changeEditMode(false);
    } 
  }
}

TextStuff.startEditing = function startEditing() {
  d3.event.stopPropagation();
  if (!this.editZone.classed('editing')) {
    this.changeEditMode(true);
  }
}

