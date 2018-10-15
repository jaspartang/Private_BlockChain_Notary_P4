# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install express with --save flag
```
npm install express --save
```
- Install bitcoinjs-message with --save flag
```
npm install bitcoinjs-message --save
```
- Install bitcoinjs-lib with --save flag
```
npm install bitcoinjs-lib --save
```

## Testing

To test code:
```
node index.js
```

## Endpoint 

### POST http://localhost:8000/requestValidation

```

curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
  "address": "1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS"
}'
```
Returns representation of created Validation Window in Response body.

```
{
	"address":"1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS",
	"validationWindow":300,
	"requestTimestamp":"1539612871",
	"message":"1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS:1539612871:starRegistry",
	"validated":false
}
```


### Endpoint POST http://localhost:8000/message-signature/validate
```
curl -X POST \
  http://localhost:8000/message-signature/validate \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
  "address":"1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS",
  "signature":"ICCaVRvND73VhoAUUMZ6mibyhPSrEDUwZ1t3O57NfLtAbnvb1nOCiNGiJFht853IrhkYKjo5XX8ZyC0gg1nT1S0="
}'

```
Successful Response
```
{
	"registerStar":true,
	"status":
	{
		"address":"1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS"
		"signature":"ICCaVRvND73VhoAUUMZ6mibyhPSrEDUwZ1t3O57NfLtAbnvb1nOCiNGiJFht853IrhkYKjo5XX8ZyC0gg1nT1S0=",
		"validationWindow":256,
		"messageSignature":"valid"
	}
}
```

### Endpoint POST http://localhost:8000/block/
Post a new block with cur command:
```
curl -X POST \
  http://localhost:8000/block \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
  "address": "1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```
Successful Response

```
{
	"address":"1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS",
	"star":
	{
		"dec":"-26° 29' 24.9",
		"ra":"16h 29m 1.0s",
		"story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
	},
	"height":1,
	"time":"1539541038",
	"previousBlockHash":"9f9048afa44c8308ba94f8a75de3df2479dd1dadd6457888e34f7298ddcb4a94",
	"hash":"f5911874b22eb8429ab1e8bfebc570704ea1970e656219b66740e519a93a5d34"
}
```


### Endpoint GET /block/{height}
read block information by its height.
```
curl -X GET \
  http://localhost:8000/block/1 \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
```
Returns representation of the Block object in Response Body
```
{
	"address":"1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS",
	"star":
	{
		"dec":"-26° 29' 24.9",
		"ra":"16h 29m 1.0s",
		"story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
		"storyDecoded":"Found star using https://www.google.com/sky/"
	},
	"height":1,
	"time":"1539541038",
	"previousBlockHash":"9f9048afa44c8308ba94f8a75de3df2479dd1dadd6457888e34f7298ddcb4a94",
	"hash":"f5911874b22eb8429ab1e8bfebc570704ea1970e656219b66740e519a93a5d34"
}
```

### Endpoint GET /stars/hash:{blockHash}
read Block with Star by Blocks' hash.
```
curl -X GET \
  'http://localhost:8000/stars/hash:f5911874b22eb8429ab1e8bfebc570704ea1970e656219b66740e519a93a5d34' \
  -H 'Cache-Control: no-cache' \
```
Got a response like below:
```
{
	"address":"1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS",
	"star":
	{
		"dec":"-26° 29' 24.9",
		"ra":"16h 29m 1.0s",
		"story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
		"storyDecoded":"Found star using https://www.google.com/sky/"
	},
	"height":1,
	"time":"1539541038",
	"previousBlockHash":"9f9048afa44c8308ba94f8a75de3df2479dd1dadd6457888e34f7298ddcb4a94",
	"hash":"f5911874b22eb8429ab1e8bfebc570704ea1970e656219b66740e519a93a5d34"
}
```

### Endpoint GET /stars/address:{walletAddress}
read all Blocks with Stars by wallet address which was used to register them.
```
curl -X GET \
  'http://localhost:8000/stars/address:1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS' \
  -H 'Cache-Control: no-cache' \
```
Got a response like below:
```
[
	{
		"address":"1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS",
		"star":
		{
			"dec":"-26° 29' 24.9",
			"ra":"16h 29m 1.0s",
			"story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
			"storyDecoded":"Found star using https://www.google.com/sky/"
		},
		"height":1,
		"time":"1539541038",
		"previousBlockHash":"9f9048afa44c8308ba94f8a75de3df2479dd1dadd6457888e34f7298ddcb4a94",
		"hash":"f5911874b22eb8429ab1e8bfebc570704ea1970e656219b66740e519a93a5d34"
	}
]
```