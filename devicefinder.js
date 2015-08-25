var serverConfigs = require('./serverConfigs/servers.json');
var deviceFinder = require('./lib/testdroiddevicefinder.js');
var creds = require('./.creds.json');
var q = require('q');

// Handle Uncaught Exceptions
process.on('uncaughtException', function(err) {
    console.log('uncaugth excetion!!!: ');
    console.log(err);
});

// Server Driver
var serverConfig = serverConfigs.testdroid;
serverConfig.password = creds.testdroid.password;
serverConfig.username = creds.testdroid.username;

function findDevices() {

    var searchTerm = (!!process.env.DEVICE)?(process.env.DEVICE):('iPhone');
    // Find and initalize device
    var deffered = q.defer();
    console.log('pulling public devices from testdroid api...');

    return deviceFinder.getDevices(100, searchTerm)
    .then(function(devices) {
        devices = devices.data;
        // once all devices are found        
        if(devices.length > 0){
            // find first unlocked device
            for(var i = 0; i < devices.length; i++){
                console.log(devices.length);
                if(devices[i].locked === true){
                    devices.splice(i, 1);
                    i--;
                }else{
                    var desired = {};
                    desired.testdroid_username = creds.testdroid.username;
                    desired.testdroid_password = creds.testdroid.password;
                    desired.testdroid_target = 'safari or browser';
                    desired.testdroid_project = 'Test';
                    desired.testdroid_testrun = 'TestRun';
                    desired.testdroid_device = devices[i].displayName;
                    desired.platformName = 'iOS or Android';
                    desired.deviceName = devices[i].displayName;
                    desired.browserName = 'safari or browser';
                    devices[i] = desired;
                }
            }
        }else{
            throw new Error('No Devices Found');
        }
        return devices;
    });
}

findDevices()
.then(function(val){
    console.log(val);
})
.catch(function(err){
    console.log(err);
});