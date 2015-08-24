# NodeJS testdroid Example

## Setup

#### Add Dependencies

1.) npm dependencies
```sh
$ npm install
```

2.) install mocha globally
```sh
$ npm install -g mocha
```


#### Add Credentials to ./.creds.json

You will need to add some an object that looks this to the directory ./.creds.json, as it is .gitignored

```json
{
    "testdroid": {
		"username": "TESTDROID_USERNAME",
		"password": "TESTDROID_PASSWORD"
	}
}
```

#### to Run the test 

```sh
$ mocha ios_safari.js
```



