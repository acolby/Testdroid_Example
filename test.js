var serverConfigs = require('./serverConfigs/servers.json');
var deviceFinder = require('./lib/testdroiddevicefinder.js');
var creds = require('./.creds.json');
var q = Q = require('q');
var wd = require('wd');
var logger = require("./helpers/logger.js").configure;

///
require('colors');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

exports.should = should;
///
var SCREEN_SHOT_PATH = './screeners';

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
        return driver.get('https://www.google.com')
            .sleep(10000)
            .saveScreenshot('./test.png')
            .sleep(4000)
            .setOrientation('LANDSCAPE')
            .sleep(4000)
            .saveScreenshot('./test2.png')
            .sleep(4000)
            .elementByName('q')
            .then(function(el){
                console.log(el);
                return pinch(el);
            })
            .sleep(4000)
            .saveScreenshot('./test3.png');
    });
});

// javascript
function pinch(el) {
  return Q.all([
    el.getSize(),
    el.getLocation(),
  ]).then(function(res) {
    var size = res[0];
    var loc = res[1];
    var center = {
      x: loc.x + size.width / 2,
      y: loc.y + size.height / 2
    };
    var a1 = new wd.TouchAction(this);
    a1.press({el: el, x: center.x, y:center.y - 100}).moveTo({el: el}).release();
    var a2 = new wd.TouchAction(this);
    a2.press({el: el, x: center.x, y: center.y + 100}).moveTo({el: el}).release();
    var m = new wd.MultiAction(this);
    m.add(a1, a2);
    return m.perform();
  }.bind(this));
}
wd.addPromiseChainMethod('pinch', pinch);
wd.addElementPromiseChainMethod('pinch', function() {
  return this.browser.pinch(this);
});