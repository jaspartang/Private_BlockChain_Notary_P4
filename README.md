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
	"requestTimestamp":"1539531349",
	"validationWindow":300,
	"message":"1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS:1539531349:starRegistry",
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
  "signature":"H6pxZur5Ur7+2nGe9FV4XoqIBlGafU5RXK0WbHcRneBcQDImKMxsRVLhjTTdns0Q791gFAgrrw5OzsLZ06HThOw="
}'
```
Successful Response
```
{
	"registerStar":true,
	"status":
	{
		"address":"1Er4BXqQPcp9Mdp7EaACFaHMvxCPTQAsxS",
		"signature":"H6pxZur5Ur7+2nGe9FV4XoqIBlGafU5RXK0WbHcRneBcQDImKMxsRVLhjTTdns0Q791gFAgrrw5OzsLZ06HThOw=",
		"validationWindow":144,
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
then you can get block via the following methods.

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
		"story":"Found star using https://www.google.com/sky/"
	},
	"height":1,
	"time":"1539531643",
	"previousBlockHash":"d63a6914c8e375b5e9ce67d26f96761745a518bebd54d54e9f0dd78ed9a6a48f",
	"hash":"cb119c31fd942fdf7afea56fd62bdb64fdb8547ad5189d3dbd95dccb681f9b71"
}
```

### Endpoint GET /stars/hash:{blockHash}
read Block with Star by Blocks' hash.
```
curl -X GET \
  'http://localhost:8000/stars/hash:438595a37aa7ed5cc6cdd376cb1b66fe9169fb532ccff1343cc17fa0e7e9967f' \
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
		"story":"Found star using https://www.google.com/sky/"
	},
	"height":1,"time":"1539531643",
	"previousBlockHash":"d63a6914c8e375b5e9ce67d26f96761745a518bebd54d54e9f0dd78ed9a6a48f",
	"hash":"cb119c31fd942fdf7afea56fd62bdb64fdb8547ad5189d3dbd95dccb681f9b71"
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
				"dec":"-26° 29' 24.9","ra":"16h 29m 1.0s",
				"story":"Found star using https://www.google.com/sky/"
			},
		"height":1,
		"time":"1539531643",
		"previousBlockHash":"d63a6914c8e375b5e9ce67d26f96761745a518bebd54d54e9f0dd78ed9a6a48f",
		"hash":"cb119c31fd942fdf7afea56fd62bdb64fdb8547ad5189d3dbd95dccb681f9b71"
	}
]
```