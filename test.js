var serverConfigs = require('./serverConfigs/servers.json');
var deviceFinder = require('./lib/testdroiddevicefinder.js');
var creds = require('./.creds.json');
var q = require('q');
var wd = require('wd');

var SCREEN_SHOT_PATH = './screeners';

function setup() {

    // Server Driver
    var serverConfig = serverConfigs.testdroid;
    serverConfig.password = creds.testdroid.password;
    serverConfig.username = creds.testdroid.username;

    var driver = wd.remote(serverConfig, 'promiseChain');

    // Find and initalize device
    var desired = {};
    var deffered = q.defer();
    console.log('pulling public devices from testdroid api...');
    return deviceFinder.getDevices(50, 'iPhone')
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
            throw new Exception('No Devices Found');
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
        return driver.init(serverConfig, desired);
    });
}


describe("ios safari", function() {

    // give mocha two minutes before timeing out

	this.timeout(120000);
	var driver = null;
    before(function(done) {
        setup()
		.then(function(driv){
			driver = driv;
            console.log('YEAH')
			done();
		}).catch(function(err){
            console.log('FUCK!!! error: \n', err, '\n ... exiting, goodbye!');
			process.exit();
		});
    });

    it("should get the url", function() {
        return driver
            .get('https://www.nike.com')
            .sleep(1000)
            .waitForElementByName('q', 5000)
            .sendKeys('nike')
            .sendKeys(wd.SPECIAL_KEYS.Return)
            .sleep(1000)
            .title().should.eventually.include('nike');
    });

});