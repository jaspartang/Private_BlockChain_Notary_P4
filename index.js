

const Block = require('./block')
const Blockchain = require('./blockchain')
const blockchain = new Blockchain()

// bitcoin client RPC library for sig validation
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

// we use express to host our RESTful service calls
var express = require('express')
var app = express()

var pendingReq = {};

/*
Server side
*/
app.listen(8000, function () {
  console.log('Blockchain Web Api running on the port 8000');
});

const bodyParser = require('body-parser')
// for parsing application/json
app.use(bodyParser.json())
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

/*
Endpoint Get  / display all the functionality
*/
app.get('/', (req, res) => res.status(404).json([
  {
    "endpoint": "http://127.0.0.1:8000",
    "method": "GET",
    "message": "The information about all endpoints"
  },
  {
    "endpoint": "http://127.0.0.1/requestValidation",
    "method": "POST",
    "message": "Submit their request using their wallet address."
  },
  {
    "endpoint": "http://127.0.0.1/message-signature/validate",
    "method": "POST",
    "message": "users will prove their blockchain identity by signing a message with their wallet. Once they sign this message, the application will validate their request and grant access to register a star."
  },
  {
    "endpoint": "http://127.0.0.1/block",
    "method": "POST",
    "message": "Create a new block"
  },
  {
    "endpoint": "http://127.0.0.1/block/{height}",
    "method": "GET",
    "message": "Get the block by height"
  },
  {
    "endpoint": "http://127.0.0.1/stars/address:{address}",
    "method": "GET",
    "message": "Get the blocks by the star's address"
  },
  {
    "endpoint": "http://127.0.0.1//stars/hash:{hash}",
    "method": "GET",
    "message": "Get the blocks by the hash"
  }

]))


// **************************************************************
// decode the Block's story field and then append to 
// storyDecoded feild
// **************************************************************
function story_2_storyDecoded(block) {
  if ('star' in block && 'story' in block.star) {
    const buf = Buffer.from(block.star.story, 'hex');
    block.star.storyDecoded = buf.toString('ascii');
  }
  return block;
}

// **************************************************************
// Get Block
//
// This web method gets a block by its height.  If we get a
// NotFoundError, the error handler will convert it to
// a clean 404 return for us
// **************************************************************
async function get_block(req, res) {
  try{
    const blockheight = await blockchain.getBlockHeight()
    if (req.params.height >= blockheight) {
      res.status(404).json({
    	"status": 404,
    	"message": "Current blockchain height is " + blockheight + "，valid value is [0, " + blockheight + ")."
      })
    } else {
      const response = await blockchain.getBlock(req.params.height)
      res.send(story_2_storyDecoded(response))
    }
  } catch (error) {
    res.status(404).json({
    	"status": 404,
    	"message": "The block height " + req.params.height + " can't be found in current Blockchain."
    })
  }
}

// **************************************************************
// Get Blocks By Address
//
// This web method gets a block by the owner address.
// **************************************************************
async function get_block_by_address(req, res) {
  let address = req.params.address;
  let retval = [];
  let error = false;
  let done = false;
  console.log('request address is ' + address)
  const blockheight = await blockchain.getBlockHeight()
  for (var i=0; done==false & i < blockheight; i++) {
    await blockchain.getBlock(i)
    .then((block) => {
      console.log(block);
      if (block.address === address) {
        retval.push(story_2_storyDecoded(block));
      }
    })
    .catch((err) => {
      if (err.type === "NotFoundError") {
        done = true;
      } else {
        console.log(err);
        res.status(501).send('Unknown error reading blocks');
        error = true;
        done = true;
        return;
      }
    });
  }
  if (! error) {
    res.status(200).send(retval);
  }
}

// **************************************************************
// Get Block By Hash
//
// This web method gets a block by its hash.
// **************************************************************
async function get_block_by_hash(req, res) {
  let hash = req.params.hash;
  let done = false;
  for (var i=0; done==false; i++) {
    await blockchain.getBlock(i)
    .then((block) => {
      console.log(block);
      if (block.hash === hash) {
        res.status(200).send(story_2_storyDecoded(block));
        done = true;
        return;
      }
    })
    .catch((err) => {
      if (err.type === "NotFoundError") {
        res.status(404);
        done = true;
      } else {
        console.log(err);
        res.status(501).send('Unknown error reading blocks');
        done = true;
      }
    });
  }
  if (! done) {
    res.status(501);
  }
}

// *************************************************************
// Check if value is ASCII text
//
// see https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only
// *************************************************************
function isASCII(str) {
  return /^[\x00-\x7F]*$/.test(str);
}

// *************************************************************
// Save a block to the end of the chain.
//
// This method expects a block that has a body field.
// Other fields may be added, but the timestamp, height and
// hash data will be added by our service.  The post should
// use a content-type of application/json.
//
// The body field should be json data with the following
// fields in it:
//
// address - the address of the submitter (with matching signature)
// star - the name of the star being registered
// ra - the ra position of the star being registered
// dec - the dec position of the star being registered
// story (optional) - a comment about how this star was selected
//
// The server will verify that the specified address has been
// recently authorized to post data.  Once the star is accepted,
// this authorization state will be removed.  The caller will
// need to reauthorize with the signed message handshake prior
// to submitting their next star.
// *************************************************************
async function post_block(req, res) {
  let block = req.body;
  if (!'address'  in block) {
    res.status(400).send('address is a required field');
  }
  if (!'star'  in block) {
    res.status(400).send('star is a required field');
  }
  if (!'ra'  in block.star) {
    res.status(400).send('ra is missing in star');
  }
  if (!'dec'  in block.star) {
    res.status(400).send('dec is missing in star');
  }

  //handle the review comments, need to encode the story field(required)
  if (!'story' in block.star || !block.star.story) {
    res.status(400).send('story is missing in star');
  }
  let story = '';
  if ('story' in block.star) {
    story = block.star.story;
  }
  if (!isASCII(story)) {
    res.status(400).send('story must be ASCII text');
    return;
  }
  if (story.length > 500) {
    res.status(400).send('story must be less than 500 characers.');
    return;
  }
  let buf = Buffer.from(story, 'ascii');
  let story_encoded = buf.toString('hex');
  block.star.story = story_encoded;
  
  // handle the post star register
  let pendingRequest = pendingReq[block.address];
  if (pendingRequest == undefined) {
    res.status(401).send('No pending request for address ' + block.address);
  }
  if (pendingRequest.validated != true) {
    res.status(401).send('Request not yet validated by signed response from client');
  }
  let now = parseInt(new Date().getTime().toString().slice(0,-3))
  if (now > parseInt(pendingRequest.requestTimestamp) + parseInt(pendingRequest.validationWindow)) {
      res.status(401).send('Window of authorization expired');
  } else {
    let address = block.address;
    block = await blockchain.addBlock(block)
      .then(data => res.status(201).send(data))
      .catch((err) => res.status(501).send('Unknown error saving block'))
    // Now we are done with this request
    delete pendingReq[address];
  }
}

// *************************************************************
// Request validation.
//
// This method starts a handshake process required before an
// address is allowed to submit a star.  This step tracks
// a session indexed by the given address and supplies a
// message field that must be signed by the corresponding private
// key.
//
// The request body should be a json object with the following
// fields
//
// address - the address of the submitter
// *************************************************************
async function request_validation(req, res) {
  let validationData = req.body;
  let timestamp = new Date().getTime().toString().slice(0,-3);
  if (validationData.address in pendingReq) {
      if (timestamp <  parseInt(validationData.requestTimestamp) + 300) {
        validationData.validationWindow = 300 + parseInt(validationData.requestTimestamp) - timestamp
        res.send(validationData);
        return;
      }
  } else if (validationData.address === undefined || validationData.address === "") {
    res.status(401).send("Wallet address is undefined");
    return;
  }

  validationData.validationWindow = 300;
  validationData.requestTimestamp = timestamp;
  validationData.message = validationData.address + ':'
    + validationData.requestTimestamp + ':starRegistry';
  validationData.validated = false;
  pendingReq[validationData.address] = validationData;
  res.send(validationData);
}


// *************************************************************
// Validate signature.
//
// This method finishes the handshake process required before an
// address is allowed to submit a star.  This step pulls the
// session info back out for the given address.  Then it
// verifies the challenge message against the signature sent.
// If the signature is valid, the session is set as validated.
//
// The request body should be a json object with the following
// fields
//
// address - the address of the submitter
// signature - the signature of the challenge message
// *************************************************************
async function mesage_sig_validate(req, res) {
  let signatureData = req.body;
  let pendingRequest = pendingReq[signatureData.address];
  let address = signatureData.address;
  let signature = signatureData.signature;
  let message = pendingRequest.message;
  if (bitcoinMessage.verify(message, address, new Buffer(signature, 'base64'))) {
      let retval = {};
      retval.registerStar = true;
      retval.status = signatureData;
      let currentTime = new Date().getTime().toString().slice(0,-3);
      if ((currentTime - 300)
          > pendingRequest.requestTimestamp) {
            res.status(401).send('Time window expired');
      }
      retval.status.validationWindow = parseInt(pendingRequest.requestTimestamp) +
        parseInt(pendingRequest.validationWindow) - currentTime;
      retval.status.messageSignature = "valid";
      pendingRequest.validated = true;
      res.status(201).send(retval);
  } else {
      res.status(401).send('Invalid signature');
  }
}


// *************************************************************
// Sign message.
//
// This method should not normally be used and is just a helper
// for the testing console.  You can post to this endpoint to
// sign a message with a private key.
//
// The request body should be a json object with the following
// fields
//
// privateKey - the private key to sign with
// message - the challenge message to sign
// *************************************************************
async function sign_message(req, res) {
  let signingData = req.body;
  let privateKeyWIF = signingData.privateKey;
  let keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF);
  let privateKey = keyPair.privateKey;
  let message = signingData.message;
  let signature = bitcoinMessage.sign(message, privateKey);
  res.status(200).send(signature.toString('base64'));
}

app.post('/block/', post_block);
app.post('/requestValidation/', request_validation);
app.post('/message-signature/validate', mesage_sig_validate);
app.post('/message-signature/sign/', sign_message)
app.get('/block/:height', get_block);
app.get('/stars/address\::address', get_block_by_address);
app.get('/stars/hash\::hash', get_block_by_hash);

