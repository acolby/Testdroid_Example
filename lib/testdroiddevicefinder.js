var request = require('request');
var q = require('q');
var creds = require('../.creds.json');

// creds
var USER_NAME = creds.testdroid.username;
var PASSWORD = creds.testdroid.password;

var calls = {
    'getAccessToken': function(){
        var call = '/oauth/token?client_id=testdroid-cloud-api&grant_type=password&username=' + USER_NAME + '&password=' + PASSWORD;
        return testdroidAPI(call, null, 'POST');
    },
    'getDevices': function(limit, type){

        var call = '/api/v2/devices?';
        call += (typeof limit === 'number')?('limit=' + limit + '&'):('limit=0&');
        call += (typeof type === 'string')?('search=' + type):('');

        return this.getAccessToken(USER_NAME, PASSWORD)
        .then(function(data){
            return testdroidAPI(call, data);
        });

    }
};

function testdroidAPI(call, authObject, method) {
    method = method || "GET"
    var deffered = q.defer();
    var host = 'https://cloud.testdroid.com';
    var uri = host + call;
    var req = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        uri: uri,
        method: method
    };

    if(authObject){
        req.headers.Authorization = "bearer " + authObject.access_token;
    }

    request(req, function(err, res, body) {
        if(err){
            deffered.reject(err);
        }else{
            if(err){
                deffered.reject(err);
            }else{
                var payload = JSON.parse(res.body);
                if(payload.error){
                    deffered.reject(payload);
                }else{
                    deffered.resolve(payload);
                }
            }                
        }
    });
    return deffered.promise;
}

module.exports = calls;