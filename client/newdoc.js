function createNewDocForm(opts) {

var newDocForm = {
  docId: null,
  store: null,
  opts: opts,
  newDocFormSel: null,
  controllerType: 'form'
};

newDocForm.init = function init(initDone) {
  this.opts = opts ? opts : {};
  var body = d3.select('body');
  this.newDocFormSel = body.select('.sprigot');

  if (this.opts.forceRebuild && !this.newDocFormSel.empty()) {
    this.newDocFormSel.remove();
    this.newDocFormSel = body.select('.sprigot');
  }

  this.store = createStore();

  if (this.newDocFormSel.empty()) {
    this.newDocFormSel = body.append('section').classed('sprigot', true);

    var head = d3.select('head');
    head.append('link').attr({
      rel: 'stylesheet',
      type: 'text/css',
      href: 'form.css'
    });

    loadATypeKit('//use.typekit.net/med0yzx.js', initDone);    
  }
};

newDocForm.load = function load(opts) {
  this.render([{
    title: 'New Sprigot document',
    fields: [
      {
        id: 'name',
        name: 'Name',
        type: 'text'
      },
      {
        id: 'author',
        name: 'Author',
        type: 'text'
      },
      {
        id: 'admin',
        name: 'Admin',
        type: 'text'
      },
      {
        id: 'format',
        name: 'Format',
        type: 'select',
        options: [
          'sprigot',
          'glog'
        ]
      }
    ],
    submit: {
      action: function submitNewDocument(formValues) {
        var store = createStore();
        var newDoc = {
          id: uid(8),
          rootSprig: uid(8),
          authors: [
            formValues.author
          ],
          admins: [
            formValues.author
          ]
        };

        var rootSprig = {
          id: newDoc.rootSprig,
          doc: newDoc.id,
          title: formValues.name,
          body: 'Hello. Type some stuff here.',
          children: []
        };

        store.createNewDoc(newDoc, rootSprig, function done(error, response) {
          if (error) {
            console.log('Error while saving doc:', error);
          }
          else {
            console.log('Saved doc:', response);
            Director.direct('#/' + newDoc.id + '/' + rootSprig.id + 
              '?forceRebuild=true');
          }
        });
      },
      name: 'Make it!'
    }
  }]);

  setTimeout(function doneOnNextTick() { opts.done(); }, 0);
};

newDocForm.render = function render(forms) {
  var sprigs = this.newDocFormSel.selectAll('.sprig')
    .data(forms, function(d) { return d.id; });

  var newSprigs = sprigs.enter().append('div')
    .classed('sprig', true)
    .classed('textpane', true);

  newSprigs.append('div').classed('title', true);
  var sprigBody = newSprigs.append('div').classed('sprigbody', true);

  sprigs.select('.title').text(function getTitle(d) {return d.title;});
  // sprigs.select('.sprigbody').html(function getBody(d) {return d.body;});
  
  var sprigsToRemove = sprigs.exit();
  sprigsToRemove.remove();

  sprigBody.each(this.setUpFields);

  sprigBody.append('button').classed('submit-button', true)
    .text(function getName(d) { return d.submit.name; })
    .on('click', function onSubmit(d) {
      var formValues = getFormValues(this.parentElement, d.fields)
      d.submit.action(formValues);
    });

};

newDocForm.setUpFields = function setUpFields(d) {
  var fields = d3.select(this).selectAll('.field-group').data(d.fields);
  var newFields = fields.enter().append('div').classed('field-group', true);

  newFields.append('label')
    .attr({
      id: function getId(d) { return d.id + '_label'; },
      for: function getFor(d) { return d.id; }
    })
    .text(function getName(d) { return d.name; });

  newFields.append('input').attr('id', function getId(d) { return d.id; });

  fields.exit().remove();
};

function getFormValues(formEl, fields) {
  var valuesForFieldIds = {};
  var form = d3.select(formEl);

  function getFieldValueFromForm(field) {
    valuesForFieldIds[field.id] = form.select('#' + field.id).node().value;
  }

  fields.forEach(getFieldValueFromForm);

  return valuesForFieldIds;
}


return newDocForm;
}
