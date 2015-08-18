var serverConfigs = require('./serverConfigs/servers.json');
var deviceFinder = require('./lib/testdroiddevicefinder.js');
var creds = require('./.creds.json');
var q = require('q');
var Q = q;
var wd = require('wd');
var chai = require("chai");
require('colors');
var chaiAsPromised = require("chai-as-promised");
var logger = require("./helpers/logger.js").configure;
var addPinch = require("./lib/Multitouch/pinch.js").addPinch;

/// Chai
chai.use(chaiAsPromised);
var should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

// Configure Assertion Preference
exports.should = should;

// Set Screenshot path base
var SCREEN_SHOT_PATH = './temp';

// Handle Uncaught Exceptions
process.on('uncaughtException', function(err) {
    console.log('uncaugth excetion!!!: ');
    console.log(err);
});

// Server Driver
var serverConfig = serverConfigs.testdroid;
serverConfig.password = creds.testdroid.password;
serverConfig.username = creds.testdroid.username;

var driver = wd.remote(serverConfig, 'promiseChain');

function setup() {
    // Find and initalize device
    var desired = {};
    var deffered = q.defer();
    console.log('pulling public devices from testdroid api...');
    return deviceFinder.getDevices(100, 'iPhone')
    .then(function(devices) {
        // once all devices are found
        console.log(devices.data.length + ' device(s) found');
        
        device = null;

        if(devices.data.length > 0){
            // find first unlocked device
            for(var i = 0; i < devices.data.length; i++){
                if(devices.data[i].locked === false){
                    device = devices.data[i];
                    i = devices.data.length;
                }
            }
        }
        if(device !== null){
            console.log('found Device: ', device.displayName);
        }else{
            throw new Error('No Devices Found');
        }
        
        var desired = {};
        desired.testdroid_username = creds.testdroid.username;
        desired.testdroid_password = creds.testdroid.password;
        desired.testdroid_target = 'safari';
        desired.testdroid_project = 'Test Safari';
        desired.testdroid_testrun = 'TestRun A';
        desired.testdroid_device = device.displayName;
        desired.platformName = 'iOS';
        desired.deviceName = 'iOS Device';
        desired.browserName = 'safari';

        console.log('initalizing device: ', device.displayName);
        // add logger
        logger(driver);
        return driver.init(desired);
    });
}


describe("ios safari", function() {

    // give mocha two minutes before timeing out

	this.timeout(180000);
    before(function(done) {
        setup()
		.then(function(driv){
            console.log('initalized!');
			done();
		}).catch(function(err){
            console.log('OH NOOO!!! error: \n', err, '\n ... exiting, goodbye!');
			process.exit();
		});
    });

    it("should get the url", function() {
        return driver.get('http://store.nike.com/us/en_us/pd/woven-loose-running-pants/pid-10204484/pgid-10298561')
            .sleep(4000)
            .saveScreenshot(SCREEN_SHOT_PATH + '/test.png')
            .sleep(4000)
            .setOrientation('LANDSCAPE')
            .sleep(4000)
            .saveScreenshot(SCREEN_SHOT_PATH + '/test2.png')
            .sleep(4000)            
    });
});