function request(url, jsonBody, done) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', settings.serverURL);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('accept', 'application/json');

  xhr.onload = function gotSprig() {
    var retrieved = false;

    if (this.status === 200) {
      var response = JSON.parse(this.responseText);
      done(null, response);
    } 
    else {
      done(this.status, null);
    }
  };

  xhr.send(JSON.stringify(jsonBody));
}

