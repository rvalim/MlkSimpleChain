# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].


### Configuring your project
Versions and Dependencies
  - Node.js: v10.5.0
  - Crypto-js: 3.1.9-1
  - Express: 4.16.4
  - Level: 4.0.0
  - bitcoinjs-message: 2.0.0
  - bitcoinjs-lib: 4.0.2

Use NPM to install the dependencies of the project.
```
npm install
```


## Running the server

To test code:
1: Open a command prompt or shell terminal after install node.js.
2: Navigate to the root folder of the project
3: Be sure you ran the 'npm install' command, to download the dependencies
4: Use node to run the server at port 8000
```
node .\server\server.js
```

## The Services's Routes

### Get Block 

Retrieves the JSON's Block of a given position:

#### URL
  /block/:height
#### Method
  GET
#### URL Params
  Required:
  height=[integer]
#### Data Params
  None
#### Success Response
  Code: 200
  Content: 
  ```
  {
    "hash": "2d8d8be5347a4c47724ba227e90b6822ce6b34c434377e987200e4a7ab0aeb4e",
    "height": 0,
    "body": "First block in the chain - Genesis block",
    "time": "1539835366",
    "previousBlockHash": ""
  }
  ```
#### Error Response
  Code: 400
  Content: 
  ```
  "Key not found in database [1]"
  ```


### Add new Block 

Adds new block to the chain:

#### URL
  /block
#### Method
  POST
#### URL Params
  None
#### Data Params
  Type: JSON
  Required:
  ```
  {
        "body": "[CONTENT]"
  }
  ```
#### Success Response
  Code: 200
  Content: 
  ```
  {
    "hash": "",
    "height": 0,
    "body": "Second block",
    "time": 0,
    "previousBlockHash": ""
  }
  ```
#### Error Response
  Code: 400
  Content: 
  ```
  "The body's block can't be empty"
  ```



### Request Authorization

Request authorization to add a block:

#### URL
  /requestvalidation
#### Method
  POST
#### URL Params
  None
#### Data Params
  Type: JSON
  Required:
  ```
  {
  "address": "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY"
  }
  ```
#### Success Response
  Code: 200
  Content: 
  ```
  {
      "address": "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY",
      "requestTimeStamp": "1540739395",
      "message": "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY:1540739395:starRegistry",
      "validationWindow": 288
  }
  ```
#### Error Response
  Code: 400
  Content: 
  ```
  "The body's block can't be empty"
  ```


### Verify Authorization

The client need to sign the message received when he asked for authorization.
Then calling this service, he can prove he own the address.

#### URL
  /message-signature/validate
#### Method
  POST
#### URL Params
  None
#### Data Params
  Type: JSON
  Required:
  ```
  {
  "address": "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY",
  "signature": "H8nm4hDwTkHovLCC+NxIDo17nM25TmJGdZ9WeNCFl5LOI0jEeeLYxRm/cFCpdmEbKGCAmz24N37InBJu5OLZpis="
  }
  ```
#### Success Response
  Code: 200
  Content: 
  ```
  {
      "registerStar": true,
      "status": {
          "address": "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY",
          "requestTimeStamp": "1540739395",
          "message": "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY:1540739395:starRegistry",
          "validationWindow": 296,
          "messageSignature": "valid"
      }
  }
  ```
#### Error Response
  Code: 400
  Content: 
  ```
  "No authorization request was made"
  ```
  "Validation Window Expired"
  ```
  {
    "registerStar": false,
    "status": {
        "address": "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY",
        "requestTimeStamp": "1540739767",
        "message": "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY:1540739767:starRegistry",
        "validationWindow": 139,
        "messageSignature": "invalid"
    }
  }
  ```

### Get Block by wallet

By a given wallet, return an array of blocks

#### URL
  /stars/address/:address
#### Method
  GET
#### URL Params
  Required:
  address: string
#### Data Params
  None
#### Success Response
  Code: 200
  Content: 
  ```
  [
    {
      "hash": "745f32958e79bbbc14470ef48a9de4a247792be2a5d50761efa79544e457be95",
      "height": 0,
      "body": {
          "address": "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY",
          "star": {
              "dec": "-26° 29''' 24.9",
              "ra": "16h 29m 1.0s",
              "story": "First block in the chain - Genesis block"
          }
      },
      "time": "1540739355",
      "previousBlockHash": ""
    }
  ]
  ```

  

### Get Block by hash

By a given hash, return the intire block

#### URL
  /stars/hash/:hash
#### Method
  GET
#### URL Params
  Required:
  hash: string
#### Data Params
  None
#### Success Response
  Code: 200
  Content: 
  ```
  {
    "hash": "745f32958e79bbbc14470ef48a9de4a247792be2a5d50761efa79544e457be95",
    "height": 0,
    "body": {
        "address": "16qenXoAms4BRT2Ntj3V5maZEUVP7UaTkY",
        "star": {
            "dec": "-26° 29''' 24.9",
            "ra": "16h 29m 1.0s",
            "story": "First block in the chain - Genesis block"
        }
    },
    "time": "1540739355",
    "previousBlockHash": ""
  }
  ```
#### Error Response
  Code: 400
  Content: 
  ```
  "Error on finding a block by hash ..."
  ```
