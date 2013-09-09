function createAPIEnvoy(serverURL) {

var APIEnvoy = {
  serverURL: serverURL
};

APIEnvoy.request = function request(jsonBody, done) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', this.serverURL);
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
};

APIEnvoy.addRequestToQueue = function addRequestQueue(queueName, shouldFire) {

};

return APIEnvoy;
}

