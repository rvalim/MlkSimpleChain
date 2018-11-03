const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cypher = require('../utils/cypher');
const { Block } = require('../model/block');
const { BlockChain } = require('../simpleChain')

const chain = new BlockChain();

decodeStory = block => {
    block.body.star.story = cypher.toHexDecode(block.body.star.story);

    return block;
}

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.status(200).json('Hello myfriend, look for README.md to instructios');
});

app.get('/block/:height', function (req, res) {
    let height = req.params.height;

    chain.getBlockByHeight(height)
        .then(block => res.status(200).json(decodeStory(block)))
        .catch(err => {
            console.log(err);
            res.status(400).json(err.message)
        });
});

//recupera a estrela pelo hash(do block) 
//Isso ja esta pronto! =D
app.get('/stars/hash::hash', async function (req, res) {
    let hash = req.params.hash;

    try {
        let block = await chain.getBlockByHash(hash);
        res.status(200).json(decodeStory(block));
    } catch (err) {
        res.status(400).json(`Error on finding a block by hash ${hash}`);
    }
});

//recupera as estrelas de uma carteira
//Terei que armazenar a chave e valor
//  chave = address
//  valor = [] (de height)
app.get('/stars/address::address', async function (req, res) {
    let address = req.params.address;

    try {
        let blocks = await chain.getBlocksByWallet(address);
        blocks.forEach(block => decodeStory(block));
        res.status(200).json(blocks);
    } catch (err) {
        console.log(err);
        res.status(400).json(`Error finding stars by wallet ${address}`);
    }
});

//Adiciona uma estrela a blockchain
//Passo 1: RequestValidation
//Passo 2: Validate Signature
//Passo 3: Exclui a request validation
app.post('/block', function (req, res) {
    let data = req.body;


    chain.addBlock(new Block(data))
        .then(block => res.status(200).send(decodeStory(block)))
        .catch(err => {
            console.log(err);
            res.status(400).json(err.message)
        });
});

//Requisicao de validacao
//Feita por wallet address
//Tempo max de 300seg (5 min)
//  deve-se salvar a requisicao
//  ela deve ser exclui-da apos 5 min
//Retorna a mensagem de validacao
app.post('/requestvalidation', function (req, res) {
    let address = req.body.address;
    chain.getAuthorization(address)
        .then((result) => res.status(200).send(result))
        .catch((err) => res.status(400).send('Error generating validation window' + err.message));
});

//Prove blockchain identity
//Envia assinatura e assinatura
//caso valida retorna conforme abaixo
app.post('/message-signature/validate', async function (req, res) {
    const address = req.body.address;
    const signature = req.body.signature;

    return chain.verifyAuthorization(address, signature)
        .then(result => {
            if (!result.registerStar)
                res.status(400).send(`Invalid signature for address ${result.status.address}`);

            res.status(200).send(result)
        })
        .catch(err => res.status(400).send(err.message));
});

app.all('*', function (req, res) {
    res.status(404).send('Page not found');
});


app.listen(8000, () => console.log(`Server is running on port 8000`));