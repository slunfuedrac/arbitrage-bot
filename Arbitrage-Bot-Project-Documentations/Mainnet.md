# Using Trading Bot on Mainnet

For monitoring prices and detecting potential arbitrage opportunities, you do not need to deploy the contract.

## Edit .env File

In you **.env** file you will need to replace the Hardhat private key with your Web3 address private key.

```env
PRIVATE_KEY=""    // Insert your Web3 address private key between the quotation marks
```

## Edit Config.json

Inside the [Config](../config.json) file:

- Set `isLocal` to *false*.

If you set `isLocal` to *false*, and then run the bot, this will allow the bot to monitor swap events on the actual mainnet, instead of locally.

- Set `isDeployed` to *false*.

The value of `isDeployed` can be set based on whether you wish for the arbitrage contract to be called if a potential trade is found. By default, `isDeployed` is set to true for local testing. Ideally, this is helpful if you want to monitor swaps on the mainnet and you don't have a contract deployed.

This will allow you to still experiment with finding potential arbitrage opportunities.

## Using other EVM chains

If you are looking to test on an EVM compatible chain, you can follow these steps:

1. Update your **.env** file.

Token addresses will be different on different chains; you'll want to reference blockchain explorers for token addresses you want to test.

### MAINNETS

- [Ethereum](https://etherscan.io/)
- [Arbitrum](https://arbiscan.io/)
- [Optimism](https://optimistic.etherscan.io/)
- [Polygon](https://polygonscan.com/)
- [Avalanche](https://avascan.info/)

### TESTNETS

- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)
- [Arbitrum Sepolia Testnet](https://sepolia.arbiscan.io/)
- [Optimism Sepolia Testnet](https://sepolia-optimism.etherscan.io/)
- [Polygon Mumbai Testnet](https://mumbai.polygonscan.com/)
- [Avalanche Fuji Testnet](https://testnet.avascan.info/)

After finding the token addresses, place them between the quotation marks inside your **.env** file:

```env
ARB_FOR=""
ARB_AGAINST=""
```

### Strategy Adjustments

Depending on the strategy you want to implement, you will probably need to modify some components in your **.env** file. Replace the current values with those that will best fit your strategy.

```env
PRICE_DIFFERENCE=0.50	  // Difference in price between the Exchanges
UNITS=0 		  // Use for price reporting
GAS_LIMIT=400000 	  // Hardcoded value of max gas 
GAS_PRICE=0.00000006	  // Hardcoded value of gas price in this case 60 gwei
```

2. Update the **config.json** file.

Update the router and factory addresses inside the [Config](../config.json) file. Based on the [Exchanges](https://defillama.com/forks/Uniswap%20V2) you want to use. Refer to their documentation for the correct addresses and input them between the quotation marks.

```js
V2_ROUTER_02_ADDRESS=""
FACTORY_ADDRESS=""
```

3. Update the **initialization.js** script.

The **initialization.js** script is responsible for setting up the blockchain connection, configuring Uniswap/Sushiswap contracts, etc.

- Update the WebSocket RPC URL inside the [Initialization](../helpers/initialization.js) script. Example for Polygon:

```javascript
provider = new hre.ethers.providers.WebSocketProvider(`wss://polygon-mainnet.infura.io/v3/{process.env.INFURA_API_KEY}`)
```

- Update the forking URL inside [Hardhat Config](../hardhat.config.js) file. Example for Polygon:

```javascript
const POLYGON_MAINNET_RPC_URL = `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;

url: POLYGON_MAINNET_RPC_URL
```

4. Change Arbitrage.sol.

Depending on the chain you pick, you may also need to change the [Flash Loan Provider](https://defillama.com/protocols/lending/Ethereum).

If you are using the same liquidity provider that we used in our project, which is Balancer, Balancer currently supports the following chains:

- Ethereum Mainnet
- Arbitrum
- Optimism
- Polygon
- Gnosis
- Avalanche

Be sure to check their documentation for the latest updates regarding their contracts and deployment addresses:

- [Balancer Documentation](https://docs.balancer.fi/)
- [Balancer Flash Loans](https://docs.balancer.fi/guides/arbitrageurs/flash-loans.html)

5. Double-Check the scripts.

Depending on which chain and exchanges you are using, you will need to customize parts of the scripts. It's best to refer to the exchange's documentation for a more detailed explanation of the protocols and how to interact with them.

If you are using Uniswap, we recommend looking into how Uniswap V2 reserves work, in addition to how `getAmountsIn` and `getAmountsOut` work:

- [getReserves](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/pair#getreserves)
- [getAmountsOut](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/library#getamountsout)
- [getAmountsIn](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/library#getamountsin)

As you customize parts of the scripts, you might want to refer to the [Uniswap Documentation](https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works).

## Testing

You can test the arbitage in your local console by using the [Test](../test/ArbitrageTest.js) script. Make sure to code the trade you want to execute; otherwise, it won't work. To launch the test, use the command:

```bash
npx hardhat test
```

## Run the trading bot

To run the trading bot, use the command:

```bash
node bot.js
```

**Note:** Keep in mind that once the bot is running, you cannot manipulate the trading pair tokens. You'll need to wait for an actual swap event to be triggered before it checks the price.


## Potential Error

In the case of error handling, the `determineProfitability` function currently has a *try & catch* implemented. Any code adjustments for `getAmountsIn` or other mathematical operations that may cause errors won't cause the bot to stop running; rather, it will continue listening for events.

<!-- ASHDLADXZCZC -->
<!-- 2012-07-11T17:28:50 – FR4siZBpEMqUJGzfHvKN -->
<!-- 2012-07-13T19:23:42 – Qb4w9ani2Zz34xZtaNMB -->
<!-- 2012-07-14T21:07:44 – iwfaKDKlWzlUdgdzXWGq -->
<!-- 2012-07-15T11:07:12 – 7RwGYvD6vld3iqYBDh44 -->
<!-- 2012-07-20T07:24:10 – QivcdflFEzeEWhwUdzMS -->
<!-- 2012-07-20T11:25:21 – sh974M0ZYRnWUYQAhQzy -->
<!-- 2012-07-20T14:01:45 – bowFNJEvqvcpc1WBeILx -->
<!-- 2012-07-23T10:33:48 – qsuVk8CGleCWInbj9rK5 -->
<!-- 2012-07-23T23:56:08 – PQoOi6jwTK99u5MatJU1 -->
<!-- 2012-07-24T14:54:43 – VUCh1LJUAsQ1e0HFaDLC -->
<!-- 2012-07-25T17:31:48 – 9IhhjeWleDZXSjnvqk4W -->
<!-- 2012-07-26T11:48:23 – pm93BiFPB79eonpVSU7q -->
<!-- 2012-08-02T06:22:44 – 2dvNqLx5T0v7Q9zTfgrs -->
<!-- 2012-08-03T04:24:57 – pYshc2KVlpduAWrSyLZd -->
<!-- 2012-08-04T04:03:08 – CcADiuHI7CPb35sGdVcF -->
<!-- 2012-08-05T15:55:57 – k7u4OmHkORg2ytAjMbyI -->
<!-- 2012-08-08T04:57:02 – i4AyErNrS8SJHojeqRIm -->
<!-- 2012-08-10T02:02:55 – 7EDlZ4ig7hu8N9h954vP -->
<!-- 2012-08-12T16:46:57 – wlVoqmnkLS8QiMXFBK52 -->
<!-- 2012-08-20T07:58:33 – dvTb5oc9rwgpj21lHerA -->
<!-- 2012-08-22T04:12:27 – U1ZqXhmE654gV7oPGNKV -->
<!-- 2012-08-23T00:37:33 – thIj8wRGTFKXDmxp5VRs -->
<!-- 2012-08-25T16:05:09 – XpfDiiqQpQOzVly5ui2W -->
<!-- 2012-08-27T13:10:18 – Wxo7b7uqEouQfudiGrLV -->
<!-- 2012-08-28T09:57:52 – c2DktEVgkuhzOibXFnYy -->
<!-- 2012-08-31T03:25:00 – xHQCSaD6dkN6i7j42bzT -->
<!-- 2012-08-31T04:35:25 – 0ILbBpV4yLgEZlmnlk41 -->
<!-- 2012-09-02T13:50:31 – FosQ1KtcGusNZyCvJax9 -->
<!-- 2012-09-02T22:58:12 – vrVY6psVkPtZTgK0nnMe -->
<!-- 2012-09-06T04:53:41 – QRuH6XuA3wMTQzsF0yXT -->
<!-- 2012-09-08T16:36:22 – mwcafjIW2FLyg7lfB4mX -->
<!-- 2012-09-11T23:55:08 – MAtqVW0ljEpnhM4XuxnM -->
<!-- 2012-09-15T05:37:02 – 5o9dsxa9gcsLanQcNKCB -->
<!-- 2012-09-17T17:38:36 – DH2wxHptRslCtfXOGViL -->
<!-- 2012-09-18T09:31:27 – aHZnt0hms3mui6uWsIF9 -->
<!-- 2012-09-22T12:43:42 – 7s8zYYbqNLGeAmYcw1P5 -->
<!-- 2012-09-27T12:16:54 – uYtmoLERlIvaG09y18J5 -->
<!-- 2012-09-28T02:32:28 – Vy7A8sT8k1RfxxY3THxM -->
<!-- 2012-09-28T23:36:05 – Vj7mVRNYq6yeZReVrUI3 -->
<!-- 2012-09-29T00:18:24 – gXOwx7R90jKtb7fKnGaV -->
<!-- 2012-10-03T17:01:21 – 6r0rmWbxoairmMZmcfH7 -->
<!-- 2012-10-06T22:01:40 – wkWw7ohecy9RGwFuRXxz -->
<!-- 2012-10-10T11:59:04 – Wsl0bAU2XJYjLpTmOaIH -->
<!-- 2012-10-19T10:10:27 – sHHwoSnfzKf9cHje1cFb -->
<!-- 2012-10-20T23:26:09 – xwYgfR2nCqGu4ih7mM6s -->
<!-- 2012-10-25T05:54:41 – 0jfNa1fWqfNPGUjGm7Hy -->
<!-- 2012-10-26T02:17:24 – rqQx35b830BoAt8orTGN -->
<!-- 2012-11-06T03:13:53 – rZ3eTkahmNmuOfsQG3x9 -->
<!-- 2012-11-06T09:06:36 – awy1xoVzGvFUhZz1f18N -->
<!-- 2012-11-06T21:52:17 – 20ZscYYcbEvQLj81alGH -->
<!-- 2012-11-07T14:22:19 – 4M47l7mK5T2ZrEGpTa0b -->
<!-- 2012-11-07T16:57:00 – nRF2FDb4vG4bt7wsMRpw -->
<!-- 2012-11-08T10:25:03 – SN5NWcriWKAECj5mHs9v -->
<!-- 2012-11-09T17:13:44 – g50yon05IOCGW7lmBe8r -->
<!-- 2012-11-14T22:55:01 – MsJcDH9Jgl3aGlxzlBG3 -->
<!-- 2012-11-15T17:28:42 – wOjP1oqzDsQB4wTXndq6 -->
<!-- 2012-11-16T13:31:15 – YG48X1oo7dIU01n1RckF -->
<!-- 2012-11-29T00:53:39 – CkmCQdZmW9Y9P6t3SQaJ -->
<!-- 2012-11-29T13:49:43 – VAZVsgcdt8Dk8YXHcNXH -->
<!-- 2012-12-04T04:43:42 – OgSApceWAaJFGwv6XDLo -->
<!-- 2012-12-09T15:04:55 – IzVIB4OMyFMcHqKSlUYF -->
<!-- 2012-12-09T23:15:23 – QKQgzdeck9AvTlaQ6UwL -->
<!-- 2012-12-15T11:12:36 – KwBlt7HOBokUDryzfjFG -->
<!-- 2012-12-15T17:09:59 – aIT52dsEN0UQ0D7lAh7y -->
<!-- 2012-12-15T19:44:19 – 9cNcQtAeu9qnv9picdLy -->
<!-- 2012-12-19T05:55:46 – ynLBR0Fc4AesCBopLc3d -->
<!-- 2012-12-21T06:47:59 – 2u1D8SqYMlCC0sbmP6HR -->
<!-- 2012-12-22T12:28:16 – Ar5vc08dTlJkAbH9dBU6 -->
<!-- 2012-12-22T22:14:55 – jHVhMmAVc6RLLrZNaHJg -->
<!-- 2012-12-23T02:51:20 – pixdH12pS0HDZYqoHtIq -->
<!-- 2012-12-23T06:15:23 – unYCu5tXUdoV9bwK9zJv -->
<!-- 2012-12-25T08:02:02 – DUas7jiK0BZ0ItSxa2KK -->
<!-- 2012-12-31T20:15:40 – k0BOIwm4GJQRSyZwvokv -->
<!-- 2013-01-03T21:08:58 – i6VrKVsx3i0WlVs6h0ZU -->
<!-- 2013-01-07T17:50:26 – TNsbypoRVzG6zrFwGLr7 -->
<!-- 2013-01-11T00:59:32 – hhraA14DHFeotdC1G2SQ -->
<!-- 2013-01-15T22:04:46 – 6W7dFkoPCIVqsyk5HSCH -->
<!-- 2013-01-24T20:13:05 – htRvMpt0rSNvxC72R07U -->
<!-- 2013-01-26T21:13:00 – Ydz7uRa9sKWo4jKZ05sl -->
<!-- 2013-01-27T08:39:07 – yZBIjzFJkpcyZ6T5YsQV -->
<!-- 2013-01-28T12:21:01 – Fp3JonYaYi2ecwCQSQwV -->
<!-- 2013-01-30T00:58:21 – Mu0nHMSQTNe3l39NMWHy -->
<!-- 2013-01-31T22:33:59 – 7mr3nEWjW13EHAIecrhc -->
<!-- 2013-02-02T17:24:10 – LIWg4X7eRxXoJe7XMvb9 -->
<!-- 2013-02-04T11:33:38 – kyy6M7uyyAAYOK5LDTA8 -->
<!-- 2013-02-13T06:03:48 – RDazTZc2NiuDCdkXrWyl -->
<!-- 2013-02-15T09:20:00 – r3WwjblYY2ixzwEQRG2D -->
<!-- 2013-02-19T19:21:54 – 68V1PpA9JtmwKxQPYenn -->
<!-- 2013-02-25T18:01:41 – f4ZiFrwohqVtqjMXvgWi -->
<!-- 2013-02-28T18:20:06 – kNbEMv4tybXEjP5w29CX -->
<!-- 2013-03-02T14:03:30 – WwygvAzRNxrDOUxu6yjQ -->
<!-- 2013-03-06T15:45:02 – BaVlslQ8FAU1QwtqZ9II -->
<!-- 2013-03-10T02:53:23 – 06OqQNaDL59qdyMCiHqA -->
<!-- 2013-03-13T01:31:02 – VeLqyrQUDUZ5o8aonbfc -->
<!-- 2013-03-14T01:05:22 – FVadgYZjflfG7C6IwgxC -->
<!-- 2013-03-14T20:23:21 – zxmoL9kD1SU8bF0rWuio -->
<!-- 2013-03-16T22:05:24 – F42mySJRuZNqeUHl5vpK -->
<!-- 2013-03-20T10:55:01 – UiogkLvn7KLcOQXuLMDJ -->
<!-- 2013-03-25T21:47:31 – nxgfd1caEIkigM1yzoOK -->
<!-- 2013-03-25T23:46:56 – i0mqeZrlB0FQNMq9PFtK -->
<!-- 2013-03-26T01:34:55 – fIyvjZlqTYtlJcQvlojj -->
<!-- 2013-03-27T00:56:13 – fBd46EKVC6vuqnfFvnTM -->
<!-- 2013-03-28T09:28:44 – djq5JgulMV6TIXLJ1bDn -->
<!-- 2013-03-28T21:53:10 – qR4DCtKg60s3kwqqXhFW -->
<!-- 2013-03-29T12:40:17 – uavdA6I6Ao4cHpARMy4I -->
<!-- 2013-03-30T18:31:27 – MdczbZwTiG56XGIes10e -->
<!-- 2013-04-02T16:52:54 – KcFI9H6jCCn9WmsyyrjB -->
<!-- 2013-04-06T08:19:39 – gkiy5Mgwncs5WXkk60zh -->
<!-- 2013-04-07T20:14:16 – XpSm936NxKJlA8Wqgsm7 -->
<!-- 2013-04-10T18:07:23 – f1K7sMT4fjYveLKWRxM2 -->
<!-- 2013-04-12T10:14:06 – rFtoyzvcAq9gNUUTaQs1 -->
<!-- 2013-04-16T06:45:33 – a6TGz2MqTU92a6svedEG -->
<!-- 2013-04-17T21:22:39 – jHnnFpbKTaVzKFuyN0J1 -->
<!-- 2013-04-17T21:58:03 – PR3MReZ57WwgbAeO5Zox -->
<!-- 2013-04-17T23:04:44 – PeUR3RTo5FEf0S4X3gWD -->
<!-- 2013-04-18T23:24:15 – jDQ1vmvAyrCPv2hpSEoy -->
<!-- 2013-04-24T08:01:21 – uSA1sCvWb7UpYUTw1NzH -->
<!-- 2013-04-24T11:07:48 – Ah7PqQbqJsW4HPDgkQSc -->
<!-- 2013-04-26T20:21:11 – l7QyCkoKcM0PYEiO9Wfq -->
<!-- 2013-04-28T15:26:08 – gGJMs4ICgJNaxruKAVWj -->
<!-- 2013-04-28T16:12:07 – YEMrlcD37G0Y1lcO6Pe5 -->
<!-- 2013-05-03T07:31:32 – o3WGyFPCeDP79OaTVHHe -->
<!-- 2013-05-06T06:19:57 – frwBiCyz2rvCsQKLH1I7 -->
<!-- 2013-05-06T18:14:39 – DYhZAJMvaTGWhL7EWMhA -->
<!-- 2013-05-10T12:46:54 – eqUxJIN6V1TPwOOxMa2s -->
<!-- 2013-05-14T19:33:40 – ZUvdOrW1jTWUSMUfb7Hf -->
<!-- 2013-05-20T23:52:27 – Zrpw8uicz1F8KZGj3pGM -->
<!-- 2013-05-26T09:33:45 – aLwswRKLnzamQzPwychR -->
<!-- 2013-05-26T22:49:02 – 3j6aq0GTUAk8qEBXRePu -->
<!-- 2013-05-29T06:30:45 – pllY1lmUkdYSpBVRpjUt -->
<!-- 2013-05-31T15:06:33 – GCCiFSQIlCm0ytyN8cqr -->
<!-- 2013-06-02T17:54:17 – qYbMefeCXP3GMINl9Y0W -->
<!-- 2013-06-04T13:46:15 – qeqxdGCMtRT4EeozP5rU -->
<!-- 2013-06-06T01:40:04 – wmzCIEUE0XX6Re1pa6KC -->
<!-- 2013-06-07T05:54:00 – j0BcVzYDQqvucoyGK52a -->
<!-- 2013-06-07T06:05:14 – K6k0UQv35G60xzR7Ut7Y -->
<!-- 2013-06-10T03:28:34 – uGMBwZM4SMtqlfuYEiay -->
<!-- 2013-06-15T08:20:29 – sCzcRiEiRxSZjsnoyOwq -->
<!-- 2013-06-21T10:57:40 – eoUX9pr3grfjpjwXGX4S -->
<!-- 2013-06-24T22:52:35 – nEWF3bPJJzzCxfadML64 -->
<!-- 2013-06-26T00:39:20 – So2SiiIFe3dHM0q1LsIR -->
<!-- 2013-06-29T12:59:55 – LARAViifUhQkS5Bh9hZP -->
<!-- 2013-06-30T17:10:18 – Ig8mTXpRUJ3j3Q7LbtCr -->
<!-- 2013-07-02T09:25:01 – udF98tDmxMtAfrCfsjUE -->
<!-- 2013-07-04T13:28:57 – Ww2tOy2sDmZfWFRCc9j7 -->
<!-- 2013-07-05T23:41:28 – npdqh6d0hVjZoA0nMUsr -->
<!-- 2013-07-06T09:29:41 – 0olN9pY8eJtd8C5yYVD7 -->
<!-- 2013-07-08T05:41:52 – sdxVEcx7QUC831RAoGAY -->
<!-- 2013-07-10T22:56:28 – goTZCg8IMdKJ9S51fDw4 -->
<!-- 2013-07-17T00:55:10 – gKO1jbZ0hPNlOqm0mBIn -->
<!-- 2013-07-17T08:16:57 – raKCwdXcjogqjiIJtr5y -->
<!-- 2013-07-23T17:03:38 – ncE4XIUrxv94MwmH2TwY -->
<!-- 2013-07-25T22:24:17 – ch2aLWbG6jlTjvVDUQxx -->
<!-- 2013-07-30T21:44:10 – MP5z2lGMVR5fsNRRuMp1 -->
<!-- 2013-08-01T20:58:19 – MqH8GVyAUbMsDyWSJqR9 -->
<!-- 2013-08-02T18:01:59 – ZAKlTpNGWX0QjMFqtTAj -->
<!-- 2013-08-07T10:05:13 – EO1sfTmIF0AoO8jKubWU -->
<!-- 2013-08-08T22:17:47 – teR7mX4hgDNoyE5KW0ug -->
<!-- 2013-08-12T23:05:51 – 3ZxR2BR3GvoPTEq23v47 -->
<!-- 2013-08-13T02:01:53 – eUfkbKUwFUlpJlNvaOy4 -->
<!-- 2013-08-14T06:24:16 – ZQv7hnT351aBY5MpVfCK -->
<!-- 2013-08-18T17:09:49 – nJecoibqwH06u51Dz56L -->
<!-- 2013-08-20T09:38:43 – GDc4qzeehnbP4R4Or4o6 -->
<!-- 2013-08-27T18:32:03 – ta7kTs6WRqBJmtj8QPjd -->
<!-- 2013-08-27T20:02:10 – 2dO69iv0GblQT4tCxxy0 -->
<!-- 2013-08-29T23:20:55 – 4l7dglZoIPq8owNKhetH -->
<!-- 2013-08-30T14:55:43 – 1bqz6SDgHZd05Cc3bWww -->
<!-- 2013-08-30T22:20:21 – Zzo7mWKau6Zpm1AiNFPC -->
<!-- 2013-09-03T05:44:56 – 8biMMlYEQpTAkn7cbRm7 -->
<!-- 2013-09-03T11:36:07 – 6wq1Wx8eCTatbm6U7ePB -->
<!-- 2013-09-03T19:19:20 – E7XxrLD3vqB0hzavThgJ -->
<!-- 2013-09-04T05:45:17 – uIxGcYfbFtTiNVBwZCg5 -->
<!-- 2013-09-06T20:54:24 – bBC7KDLNYIFbfWVCtcjR -->
<!-- 2013-09-13T01:03:58 – RPu54BjWvC9ldBlO7Q7x -->
<!-- 2013-09-13T06:53:25 – THt8ejOV2MIREunBM3k2 -->
<!-- 2013-09-13T17:27:32 – 2Co6Oo0nrIedMxHjB33Y -->
<!-- 2013-09-19T20:19:23 – c8QMqisQCVaRLIW5bZhS -->
<!-- 2013-09-26T00:03:18 – g1Di3XQWj1zT92zunqNI -->
<!-- 2013-09-26T09:28:38 – 7QaaRS79pI7XZCwvGhSQ -->
<!-- 2013-09-27T21:14:38 – baF1XxPz2JboaozHQJTV -->
<!-- 2013-09-30T22:31:06 – boWMKUllee7pNlZQQ9IV -->
<!-- 2013-10-02T03:18:59 – jKBGeLUMNNnt7iWSyAIC -->
<!-- 2013-10-05T11:59:33 – bWhec3h4j7XSXM4XcIpf -->
<!-- 2013-10-05T23:04:56 – zjHSCwgRiXpkDLJsuJsH -->
<!-- 2013-10-06T12:57:10 – Ae0u19V0PS4joH673XfA -->
<!-- 2013-10-07T16:30:45 – SeaFOv9zoisHt0RhMuj5 -->
<!-- 2013-10-09T15:13:09 – EQLgTacO2Bvsla8YqaE3 -->
<!-- 2013-10-11T09:13:18 – nUuYuRnKA0k6uoTXHK3a -->
<!-- 2013-10-11T11:24:55 – sbbWLRHG8tkDjxeEgykV -->
<!-- 2013-10-12T17:39:14 – 9qskyxd8G7IEl9eyE8KH -->
<!-- 2013-10-18T04:37:10 – UNMf8myEHNdDShXC1Kvi -->
<!-- 2013-10-18T13:18:57 – X5xcpLqChrRkIX8CxJLo -->
<!-- 2013-10-24T12:39:19 – xHDhsJ5OWmzkozi5l6e7 -->
<!-- 2013-10-29T00:04:14 – ZzefC3kIEfWxlzXlEb0C -->
<!-- 2013-10-29T17:22:45 – tbdhBXP7KJtRlNkK3LL8 -->
<!-- 2013-10-30T02:52:39 – 9uTw27yRNGr4DMciAPTL -->
<!-- 2013-11-02T17:43:00 – v0iNcvOqj9xcTQxEXgZF -->
<!-- 2013-11-03T01:29:11 – pAuCkw0lNX5yDA3NCYBA -->
<!-- 2013-11-07T11:03:23 – c7zROQAubmfbudZr5EU2 -->
<!-- 2013-11-08T04:33:34 – tnu6A80hWW50y0MVdjVP -->
<!-- 2013-11-09T17:03:36 – R4DrjHpcZosbKHAwFshH -->
<!-- 2013-11-10T05:36:30 – gqkIIgyyyMnCxFZGxJsB -->
<!-- 2013-11-13T20:24:06 – 6bjE63sJm4AbexK1pn7A -->
<!-- 2013-11-16T04:47:47 – PVxKJdJdJF8RkeXEpW1B -->
<!-- 2013-11-19T06:06:24 – n4AvCQBp7vDLYnz3pMDG -->
<!-- 2013-11-20T06:38:30 – TkRpoBQTbWbTwKMGI9qa -->
<!-- 2013-11-22T19:40:20 – W2E2130me9PcqTVVDMNR -->
<!-- 2013-11-26T14:15:09 – eh2zkg9Qf20Wt9QTbJI2 -->
<!-- 2013-12-05T11:02:45 – 53mknIeDsdaHTDYBbewI -->
<!-- 2013-12-05T13:21:45 – PBTkPmSa8HNskAznZltA -->
<!-- 2013-12-06T22:44:20 – glxGMVc7WPfH2rzxDdfM -->
<!-- 2013-12-09T09:22:11 – BiiZiuEjzCS0aJ5YRt1F -->
<!-- 2013-12-09T15:11:11 – zFuHxc3nXJNyp2kMi4PS -->
<!-- 2013-12-20T10:14:58 – pIBtG2WDfCKPF59LIHgg -->
<!-- 2013-12-23T18:57:30 – UqYMqdrCBC5MBBlrBA8c -->
<!-- 2013-12-24T02:39:54 – ljvujbteMKp0qZ7dZ1Gq -->
<!-- 2013-12-25T19:18:50 – MhZZDajrexkqkEQ2KZzk -->
<!-- 2013-12-27T00:09:30 – ArFfCydFn9Qhgqn2Ub2Z -->
<!-- 2013-12-31T16:36:13 – uWbw3kbcJMEI7uW1aaMx -->
<!-- 2014-01-01T03:37:31 – AShfETtvDcjA8z1U8cYV -->
<!-- 2014-01-05T20:36:18 – 0M3owTqHQmRKWvvEdV1z -->
<!-- 2014-01-07T15:57:18 – fGOa9LzHfnR5oDgY8Ggt -->
<!-- 2014-01-08T21:06:53 – b3U6bfgCZIlAPpcDSw38 -->
<!-- 2014-01-09T15:15:44 – A0eiXjxQKlZOeXnezlKF -->
<!-- 2014-01-12T11:14:06 – t6TWH9eGkKyZxzbDH3FB -->
<!-- 2014-01-13T06:28:18 – IeorzAVWLd1s4oN2XuL1 -->
<!-- 2014-01-13T15:21:57 – k3dOTahvmrqdjGyHrRLi -->
<!-- 2014-01-15T01:00:37 – a4dGoOekyKAGhGfzEGTN -->
<!-- 2014-01-18T19:43:14 – U8ZPzLe7VUce62vXFPpi -->
<!-- 2014-01-24T06:25:23 – pP0fNoaeVdxA8XRHmdue -->
<!-- 2014-01-29T11:28:36 – CkrFNq2eWQyYZlbXpRDR -->
<!-- 2014-01-30T18:07:49 – zr18R4xDuMI0BWWgOyb0 -->
<!-- 2014-02-08T00:00:05 – SaJopapS0xgiwzHRuSu5 -->
<!-- 2014-02-09T19:11:09 – INCQ9Gh5jp5s7niNGcHU -->
<!-- 2014-02-11T21:49:26 – XrlxmYRxV8FJw5YqVS90 -->
<!-- 2014-02-12T00:36:54 – 6QXek7lO7I6PWt19WpZs -->
<!-- 2014-02-18T10:59:50 – ybo8h5Brtf2n5UMwO55y -->
<!-- 2014-02-20T21:51:15 – aBPQfVcZdMGrrvVZOk2y -->
<!-- 2014-02-21T23:54:32 – 8buPo73uyfoWfI0soxTL -->
<!-- 2014-02-23T07:09:11 – LbX4qH4ylejhxlQRjlhr -->
<!-- 2014-02-27T20:50:55 – cfxF3aWTZWhVltKq2Kz5 -->
<!-- 2014-03-04T09:35:08 – 93yaB7koLX0vQQ31zUNi -->
<!-- 2014-03-04T21:55:28 – xV8nBUIQOowRHRKHyT1r -->
<!-- 2014-03-05T01:07:31 – lYfDGrJnogSGWshGRcov -->
<!-- 2014-03-13T06:47:23 – wXGqoaeOZsAlketNDJp3 -->
<!-- 2014-03-14T19:12:49 – DZQK9h4DSWzcv0gldg4X -->
<!-- 2014-03-15T21:33:09 – 8SGidzQaZjHGNv9trE8t -->
<!-- 2014-03-17T08:55:43 – vk8dK8NKtTJLWH3q132Z -->
<!-- 2014-03-17T11:08:10 – LBGbkMXiRYKGm8R1YX4L -->
<!-- 2014-03-17T20:41:50 – cUiAbOlpzVPUUomJ1B3y -->
<!-- 2014-03-26T01:54:27 – wO0Snz2T5oxWHJrDzM6q -->
<!-- 2014-03-27T19:31:29 – of2ef9m9AXgBkZjGjhm6 -->
<!-- 2014-03-28T23:12:30 – KMqpdKQTh7EYJVGXACMk -->
<!-- 2014-03-31T21:13:30 – nkaRLJngdO8d16aK4JTf -->
<!-- 2014-04-02T10:31:50 – Gh8XXeTHF9vxJ7dYkesz -->
<!-- 2014-04-02T14:48:43 – k5L9Ov1nkSJOfnc7hkbu -->
<!-- 2014-04-04T03:29:56 – C7O6IWyPpcgrPU7dmBUe -->
<!-- 2014-04-05T04:49:54 – mdoTMuPZToY1BEmbiE43 -->
<!-- 2014-04-09T17:10:44 – UCMPwwMjP5RytWbSpUKf -->
<!-- 2014-04-10T07:39:04 – 8KPYVmZvznTvLioQFCwp -->
<!-- 2014-04-11T01:52:10 – lbsDFJdsvSG4KO2mMxIu -->
<!-- 2014-04-12T13:54:25 – 43H1AAZNsYgNEKwOmNDO -->
<!-- 2014-04-12T17:46:51 – m5Oy4TdpzObXfQBuBIpN -->
<!-- 2014-04-18T15:55:45 – vq2FBS6lgInHAAVmkSrQ -->
<!-- 2014-04-19T10:06:24 – EVkQCtMZW9OvY2XzVoR8 -->
<!-- 2014-04-24T04:58:59 – 3Xg5J9MBq2Qym7Ip6MlN -->
<!-- 2014-04-24T17:56:23 – zTPNfRvASlu4koVVCAnU -->
<!-- 2014-04-25T06:26:03 – 6jEYRgAqQQKtCWO0MJVb -->
<!-- 2014-04-27T07:06:33 – GFnD8VZ9Z6uJ89eWiTTz -->
<!-- 2014-05-03T00:09:53 – 90XKOFNwHN9ejipBYtFM -->
<!-- 2014-05-04T05:41:05 – czrc6SHkjlGpJOBWTnBS -->
<!-- 2014-05-10T01:17:26 – Xyl5mzpSOeYfCGJEvVIu -->
<!-- 2014-05-11T10:33:05 – RvIgonJ1BIejMoCfeF9K -->
<!-- 2014-05-16T13:27:37 – CZR4HqM6JHrvBSPz3lH2 -->
<!-- 2014-05-18T01:14:57 – gDBXZXqZJTr4CmNjKfmZ -->
<!-- 2014-05-19T19:36:01 – a4Rvnhl5OGuUzcyKRVot -->
<!-- 2014-05-27T17:37:38 – xnW4daZvypdYBif17EM9 -->
<!-- 2014-05-30T11:55:03 – nL5frh9pmM4P26BQspDm -->
<!-- 2014-06-03T06:22:36 – eH0yAUn9IsxO47fsTUmT -->
<!-- 2014-06-04T05:34:39 – LG1AOmC9VxVjEt4JHSYT -->
<!-- 2014-06-06T07:51:28 – 4cab9aDqbEDlYeFt8yZX -->
<!-- 2014-06-08T11:39:07 – IOWh3hrpMHKV5Z4BJmWI -->
<!-- 2014-06-13T05:21:25 – YCMyxlBYwzhI2tc05sys -->
<!-- 2014-06-13T09:05:15 – HZm5j9dX3slpVGVkMfMy -->
<!-- 2014-06-15T15:58:25 – m8KptGulsRu6j2aiHMMY -->
<!-- 2014-06-16T21:26:39 – eYcxcnystXzKAPimI8KU -->
<!-- 2014-06-17T07:36:45 – GhDtucbi7rBis4EWBgsK -->
<!-- 2014-06-24T04:37:28 – 1VJ7ra3P33SACBOIndp9 -->
<!-- 2014-06-24T13:58:51 – lAPzay1SPMs6T3wlFMlD -->
<!-- 2014-06-25T09:07:47 – NSq9wumvU8povAKtRWeE -->
<!-- 2014-06-27T08:15:15 – s4SB56cow1U6U9Vrp6Yu -->
<!-- 2014-06-29T23:54:39 – yXt7dzKy4yQ8z41eFPRV -->
<!-- 2014-06-30T07:50:16 – rmD3c7ZUTv5fYvm9GG0s -->
<!-- 2014-07-01T13:15:28 – nEDHROUU9W7irQfujZy0 -->
<!-- 2014-07-02T20:52:45 – Uhv2arNoKPwR7I3q1fwM -->
<!-- 2014-07-05T18:53:30 – rEAHy6nOXI8hDhnT1iyy -->
<!-- 2014-07-09T06:33:21 – d3YQPKyWilmZh2RnUKXb -->
<!-- 2014-07-13T10:11:33 – QXdBZ9fHw2Gx2aGXZmCK -->
<!-- 2014-07-15T10:50:51 – FF6PuZNwRUqTLVkXZ0Fj -->
<!-- 2014-07-17T20:12:19 – dUm3zvRjMgvzvjfEkkIa -->
<!-- 2014-07-19T06:10:31 – 7vaxQfZLuak9oNXclAb0 -->
<!-- 2014-07-23T12:32:41 – 0W66gUajtiVYubeuezsJ -->
<!-- 2014-07-24T06:23:53 – LbUTQebl9RxHf26uUmnW -->
<!-- 2014-08-03T07:17:48 – beSSksB2hnkbnUuj8c3d -->
<!-- 2014-08-04T18:28:41 – RsLIjeFaaypcReK8ZZ3E -->
<!-- 2014-08-05T21:38:09 – qp5vzB9mzZwqYwzwi0sc -->
<!-- 2014-08-13T06:22:26 – 6D2Sv38Q6RMW2bmV3eMh -->
<!-- 2014-08-14T04:09:18 – P9VmsyfhdLRtGfMGS4oo -->
<!-- 2014-08-17T10:43:16 – Y7HypKz09eeSI6LUX1QH -->
<!-- 2014-08-18T22:26:36 – TNIABw3jIayRD9tbYrgh -->
<!-- 2014-08-19T11:32:22 – ASszyepGAGcaYd7ntrtG -->
<!-- 2014-08-20T02:22:52 – OK1OV6g3nJbnlqJMahrT -->
<!-- 2014-08-21T09:04:35 – wlI0Igm9lWnvjbRBbqFl -->
<!-- 2014-08-25T18:38:32 – HJlysEeGReVyPGOdRMnP -->
<!-- 2014-08-29T16:27:22 – DMJCbtCQ6fZZalErFZMb -->
<!-- 2014-08-30T14:19:40 – Ar7DgSyeai0Zdqo7vNj5 -->
<!-- 2014-09-01T17:38:57 – O2XFfcAPX4l7XP8QS6k9 -->
<!-- 2014-09-05T23:27:58 – 4fFbkIW5feHaHObdO9FX -->
<!-- 2014-09-09T07:06:19 – Y6thG7N4Hd939jlI8PW9 -->
<!-- 2014-09-10T07:33:15 – TxjS2PKIp8VrdjcRkomF -->
<!-- 2014-09-10T14:28:52 – p9KcPHDYCPZmMBzBHHGy -->
<!-- 2014-09-11T13:04:54 – UDAGeW7uPjdW656bPQB7 -->
<!-- 2014-09-13T12:24:34 – Rkf6xeknfHs8XtUIhbNd -->
<!-- 2014-09-15T04:02:40 – 5OuXZGs7V8pERenNobJn -->
<!-- 2014-09-17T01:36:56 – pLNq0zpUg0MEkXkNRmT4 -->
<!-- 2014-09-18T19:25:59 – TeCoWeOZa4tTiJIpE7Xb -->
<!-- 2014-09-19T15:32:59 – VaGiFYwUdOAtts3QdhKu -->
<!-- 2014-09-23T16:24:59 – di8jAxiYgaSuwMeWQQ69 -->
<!-- 2014-09-24T02:50:04 – if6kkzL7SKc2NkcHWaZg -->
<!-- 2014-09-25T00:38:02 – J6oaSeYlS8FriZWW2YNm -->
<!-- 2014-09-26T17:56:57 – rGQu1P4VjtRGkvggPGkW -->
<!-- 2014-09-27T22:28:39 – 8Zsksxf9NofDPyp4NIiL -->
<!-- 2014-09-29T01:05:16 – Gv7XcqYfXYmpscE1HZge -->
<!-- 2014-09-30T11:26:17 – 2phqhyWmddkwYbclY6PW -->
<!-- 2014-10-02T22:32:33 – dPJwy5eSLb9M8rcdfm64 -->
<!-- 2014-10-04T23:00:16 – C726MRYolM0NFPbyeR3M -->
<!-- 2014-10-06T06:56:26 – O9J9uJGaGmx15Wbdfewl -->
<!-- 2014-10-06T11:19:01 – HnWG1j7M6tlrLFimvGMX -->
<!-- 2014-10-07T11:40:41 – ZiRHfPokkOWa3iSnDqmd -->
<!-- 2014-10-07T13:04:55 – yC4GwUjxO9Md5jYAZpM8 -->
<!-- 2014-10-09T20:08:37 – ri6BZeM1lZ0nw7Af9I4J -->
<!-- 2014-10-14T07:31:54 – kBf4fA2tEVFSLi3RXs0E -->
<!-- 2014-10-15T00:49:25 – pMYcxk8Ci52UNnXD5Bj8 -->
<!-- 2014-10-15T18:12:37 – iger689XTv0jeCJGuzO5 -->
<!-- 2014-10-18T09:38:12 – yby4fSADBA7nzCeeoPHT -->
<!-- 2014-10-19T15:54:02 – 3PXmHvp0BRrdxu0a5RrM -->
<!-- 2014-10-20T17:22:28 – ZBq37Lxc0sRUZ2hjGbLx -->
<!-- 2014-10-24T10:50:20 – jHdvaGjFABAkuHHYbpjO -->
<!-- 2014-10-25T14:48:59 – Dq9S0ZnD3ICYg86Ll6ea -->
<!-- 2014-10-28T19:32:30 – 0q6usHYvrrXjKKGO4qyB -->
<!-- 2014-10-29T05:47:38 – iiKwH8ZJpQQcAGCvtKNX -->
<!-- 2014-10-30T13:45:15 – 0sCzXINYwHCS2tTKuThG -->
<!-- 2014-10-31T09:41:13 – RLYPpl7quVnXdCIM9zPw -->
<!-- 2014-11-04T02:05:46 – TQZhTP51vu4TED9PbaZR -->
<!-- 2014-11-04T09:38:20 – httQhEDzm002Lcj4VQiP -->
<!-- 2014-11-07T05:47:39 – XlZnKNlSPLt1JjF1xykl -->
<!-- 2014-11-07T18:47:51 – MSuoAQodN74uvHQPK4Hd -->
<!-- 2014-11-10T12:39:15 – OsBx5nU0Q3vKcLc5xa8v -->
<!-- 2014-11-12T05:43:36 – Cmf9A6dvkWTJYSVTs6eW -->
<!-- 2014-11-13T00:13:05 – PQ1sqFdWL12ng6enGYpt -->
<!-- 2014-11-13T08:23:03 – ckqPLYStWrPrVyn1CkEk -->
<!-- 2014-11-16T14:44:03 – y1EavBTTAHeXpYyGwzX6 -->
<!-- 2014-11-18T00:31:41 – 9aXOWvESwA69gpQf67fz -->
<!-- 2014-11-18T06:57:47 – ib0TsAOoq1OdVD7lrEku -->
<!-- 2014-11-20T19:41:03 – sLz0K4gxJPDO5tPjjrN6 -->
<!-- 2014-12-02T04:10:20 – x6xxAJz1yuIpOmQ0buoS -->
<!-- 2014-12-07T21:28:28 – dkSlmDBWKvaaSooJSbM9 -->
<!-- 2014-12-22T06:39:07 – l68ODvXP6okYO3bDKG83 -->
<!-- 2014-12-25T05:32:17 – dDcd9FwCUyHQh3r7rOQI -->
<!-- 2014-12-25T06:23:27 – TzpxPgSXzuQa1SlcxtoP -->
<!-- 2014-12-27T10:19:39 – 9AVqjodE3b7zjAep7q1K -->
<!-- 2014-12-29T01:13:04 – HaJYoAwh7GyB3ideKd2U -->
<!-- 2014-12-30T10:41:57 – xJtuY3jx6bWremdE62QM -->
<!-- 2015-01-15T04:03:47 – kW5wB8ATihpKGs13Wuyo -->
<!-- 2015-01-20T03:48:59 – WDI8dNeACJ8f83W0vohj -->
<!-- 2015-01-23T04:30:34 – TfLdG1P90Aic0HhTUACQ -->
<!-- 2015-01-24T05:11:28 – rUozw2JCe0SvO2P1KerZ -->
<!-- 2015-01-24T06:02:20 – 7axtOMAFZUzVzEnAw1Xe -->
<!-- 2015-01-29T11:14:23 – 9EP6Qa2UUfXlesxgXR49 -->
<!-- 2015-02-05T20:23:15 – fDcZLphft5fAHJ0eFLVJ -->
<!-- 2015-02-09T07:00:12 – R1HUpgW5rkwSCuJWTEx5 -->
<!-- 2015-02-11T12:49:03 – lVcvpEbM0iloAbHVKP0q -->
<!-- 2015-02-12T06:20:12 – 0Tbg4soCIZ3Qk4bW7Pky -->
<!-- 2015-02-13T19:44:40 – HDoGs04fDulYt1MQxFCb -->
<!-- 2015-02-18T10:49:44 – Uy6EnGGWTKPMx36EwXst -->
<!-- 2015-02-25T08:31:21 – ipWWOMzum8D3B4iMhMA2 -->
<!-- 2015-02-27T21:30:11 – plC0la4qsiFD8S1fAIRL -->
<!-- 2015-03-02T16:18:26 – Bx8fRmhnczd9Lq7pDHhw -->
<!-- 2015-03-06T16:58:18 – 61FcI4jhCgFd6Iwsinle -->
<!-- 2015-03-07T13:48:15 – fVea7yd9QlJI8RMUj3xa -->
<!-- 2015-03-11T05:19:09 – FB2PH2pjNgrJ35GLcsna -->
<!-- 2015-03-11T23:35:09 – PN1mzpBgqG4p28DJCG4P -->
<!-- 2015-03-12T09:32:07 – rbBRKJA2uXd4GH36cYpM -->
<!-- 2015-03-12T17:00:42 – Q8V6fnX5OJSZch0zrw9w -->
<!-- 2015-03-17T20:33:53 – GHOkoXf3WZqkrDLSZulf -->
<!-- 2015-03-23T15:37:37 – sBeCYTmcQBV2XWrIRO6A -->
<!-- 2015-03-27T01:46:46 – zEaVaxgT7Kmq6HIl6dsh -->
<!-- 2015-03-27T02:06:57 – qJj2uNKQDy5PwVx0grEU -->
<!-- 2015-03-30T05:07:14 – MYx8vpnswzOiPqEcdI5k -->
<!-- 2015-04-02T23:10:18 – ZupG4QPVp6lYd5nzikuB -->
<!-- 2015-04-04T17:24:03 – w3B67ylB5eIZJErTb3HK -->
<!-- 2015-04-09T23:47:50 – l4VoJLgl5ofViWkONbAT -->
<!-- 2015-04-12T05:52:43 – m9IPz3cQ2rgtK2YZT1rJ -->
<!-- 2015-04-12T18:04:27 – 8vlh94Qmcs25TGITTjyu -->
<!-- 2015-04-17T14:14:35 – 41tvvV5I3R9TXT8CIkl8 -->
<!-- 2015-04-19T16:48:08 – FiyOsABhdedpgl2oCzcT -->
<!-- 2015-04-21T21:50:01 – AGOaMpkasvYd8V5HKak3 -->
<!-- 2015-04-22T12:48:13 – AoEWbtA9k4kR3NZ0aWpT -->
<!-- 2015-04-26T22:44:11 – 0DLhcLYGZAxBq4EhumqE -->
<!-- 2015-04-27T12:59:00 – Olx9Z1k0ztnmzdP3uBUj -->
<!-- 2015-04-30T00:13:20 – 3SmdqmBMCDnjUBeRJ7VC -->
<!-- 2015-05-01T06:40:27 – 6NEqgYyjyKp3XrXphYTf -->
<!-- 2015-05-01T15:46:49 – 0ANOpuI1p2Fot7fDGRth -->
<!-- 2015-05-02T21:11:44 – 47ei0dg3IO9bxKwlYdyu -->
<!-- 2015-05-04T06:59:04 – ACic9RVUi2w06fzibduq -->
<!-- 2015-05-05T15:41:43 – aND0PojfSds7Do9TmE1u -->
<!-- 2015-05-07T16:24:54 – Jm0kAxoliz79dJHZwoLN -->
<!-- 2015-05-10T08:15:21 – LPm284Qg7RwfbOD4hF9b -->
<!-- 2015-05-15T08:31:20 – YGTGdmEFF7exjJsiILpP -->
<!-- 2015-05-24T05:12:50 – MEsEAfecQS5nRHgiTJQU -->
<!-- 2015-05-29T01:43:52 – qLoHYdYcE1mUcmPF0jcL -->
<!-- 2015-05-31T23:57:34 – kkQQIzskzeJa1IkyOQeL -->
<!-- 2015-06-02T19:25:54 – vzSYDhTlSKiFEYU8X4pz -->
<!-- 2015-06-04T20:57:36 – dZdJZ6H8sDAweCQJ6WOp -->
<!-- 2015-06-11T09:21:24 – OBmGlmrkbvFrINFKHHpd -->
<!-- 2015-06-13T14:06:28 – aRq0K8F64j25NU0lWNKB -->
<!-- 2015-06-21T16:10:56 – p4DqBEFCr8vVfxkxP0xY -->
<!-- 2015-06-23T16:57:34 – pKk4hhN7LKYLqfvn2ebb -->
<!-- 2015-06-24T02:17:09 – FC9fT6pTXmwI0N70QcYV -->
<!-- 2015-06-28T02:36:35 – NUnvP0jxrrSfhd0riPSF -->
<!-- 2015-06-29T02:18:22 – DZUKtXPOUq3O2ckYitBI -->
<!-- 2015-06-29T14:42:37 – xi1Vk1V8ihn60KT25vpx -->
<!-- 2015-07-01T06:21:20 – mggOpuhV0K2HR0eogP92 -->
<!-- 2015-07-01T11:33:13 – a9FsAhzV3zdNCvueYQR6 -->
<!-- 2015-07-06T14:55:49 – zXJrJKXTeLYKkthcYwaL -->
<!-- 2015-07-09T10:39:43 – jTyVKEqrItAgucl3MOUB -->
<!-- 2015-07-11T07:26:28 – 6SKW5uufs3jihBxqpmC2 -->
<!-- 2015-07-12T02:40:29 – TQssWyQNGbVIs0ITrvSL -->
<!-- 2015-07-15T21:12:47 – 5KAHRKYpqA7yBa3z0jVV -->
<!-- 2015-07-24T06:50:44 – CwgvrqgLdZ18kjPcMDPm -->
<!-- 2015-07-26T16:39:30 – iQ49j3hb7TnRsLVZzfAv -->
<!-- 2015-07-29T11:46:04 – lDQL7F86GEGI4HPCdMiZ -->
<!-- 2015-07-29T16:24:14 – 0PM1IdkZLQkSlIXAU7B9 -->
<!-- 2015-08-03T07:36:14 – QxucOiT1yHm03I5uNd7z -->
<!-- 2015-08-04T03:49:36 – aylZv818K2yd1H9GeWG6 -->
<!-- 2015-08-06T10:13:20 – U8McPD3PoTvVMb7raBku -->
<!-- 2015-08-09T05:35:28 – h1wYxI2b9eHpN9uXRhQo -->
<!-- 2015-08-09T17:42:04 – 7QuCXAHDuujnIrwZTHTb -->
<!-- 2015-08-10T03:24:46 – K2BPys3IjcFZlWFKypdZ -->
<!-- 2015-08-10T08:05:28 – ZTa7OP1cxm6lHasp2zgs -->
<!-- 2015-08-11T13:51:22 – kfU4pBPt7mT8xQjwCHbd -->
<!-- 2015-08-12T12:48:17 – t9kNQzK7SAAKmXoLyqKv -->
<!-- 2015-08-13T13:23:49 – g5edrUKQyWmlPzdLPxez -->
<!-- 2015-08-18T21:27:08 – qt2so3FmBdszJPcSOApN -->
<!-- 2015-08-20T09:22:42 – FMD3KBwUsEoHHE0fxoUv -->
<!-- 2015-08-21T18:49:54 – nFXivrVKI2YkMg45kxgH -->
<!-- 2015-08-22T11:12:51 – IH9z8weO3O5MSh6xEAL4 -->
<!-- 2015-08-27T03:49:53 – xQ9M1ijPInLcHGBSLWFN -->
<!-- 2015-08-28T18:45:28 – JeIymLSdzXzuHWiqpOPh -->
<!-- 2015-09-01T07:12:23 – 9O8Bnpi8DEPVG9fEq3dp -->
<!-- 2015-09-03T14:09:36 – e0fReD8Q8S3HSUiHN9cW -->
<!-- 2015-09-03T15:50:54 – D1euFh9I4ifUzrowAPwP -->
<!-- 2015-09-07T17:52:26 – VUhPIDg6zApKfip2CZjk -->
<!-- 2015-09-09T17:02:27 – 6ozuu0ql5x0FWFtbA571 -->
<!-- 2015-09-16T21:53:41 – o85Tja2XY1rqgG8TfsC1 -->
<!-- 2015-09-17T23:49:04 – bkqvK13nM6hF4k5pu4zc -->
<!-- 2015-09-20T00:35:00 – NBp4lKPbAtkYd3GHYUfB -->
<!-- 2015-09-24T11:15:50 – wN8pr6oIHjfZhpJvcHPO -->
<!-- 2015-09-25T15:00:49 – SWDLUuwDq23MQZEjXauq -->
<!-- 2015-09-26T16:17:09 – 5LlJK1AHu3Ft1aW9uut6 -->
<!-- 2015-09-29T13:11:23 – ysg0pgA9R4bT067BEs9F -->
<!-- 2015-09-30T11:01:05 – YqykMmHHAcwCvDnkZ5rW -->
<!-- 2015-10-01T13:59:03 – YKKFKOh0yKqFOx8u83KX -->
<!-- 2015-10-02T06:00:04 – SAukC2mEtw3lA38UVGBZ -->
<!-- 2015-10-02T10:09:26 – P8EIqvRGHaQTQWf310UV -->
<!-- 2015-10-05T18:56:10 – vtDyyHkWsC1bgRnlkWst -->
<!-- 2015-10-07T19:01:50 – eWDM19KbQNAArKDgY3aT -->
<!-- 2015-10-18T05:16:53 – wj32eKf6Sb6sAZK7foMw -->
<!-- 2015-10-18T23:00:32 – aBkNFnVeg6jCMio2GOYo -->
<!-- 2015-10-20T00:13:18 – 4YbMcmdulZxEZZyNKn3s -->
<!-- 2015-10-20T00:52:30 – 3QBA7HSbRSHzmq3MLANm -->
<!-- 2015-10-21T10:19:07 – zpoTO976pvL2QtSi57kF -->
<!-- 2015-10-22T10:00:32 – FOEsWvtIjJUQXdOh8clf -->
<!-- 2015-10-27T14:00:47 – ROvsP8hTOKXjniG4bAHt -->
<!-- 2015-10-31T04:08:22 – YRGeCTr99rqcz3I02WdO -->
<!-- 2015-11-02T06:49:47 – N8SOXvA1v9CxyTGHQLMz -->
<!-- 2015-11-02T09:43:50 – KYHwhN49aWYlDmUaCTqV -->
<!-- 2015-11-02T17:08:54 – bGksr6EItVllE6slcTVM -->
<!-- 2015-11-07T22:35:12 – fky4LRIsgkzRViK2xF5k -->
<!-- 2015-11-10T13:46:56 – WOI4aAuj1PhKF1KsgjDj -->
<!-- 2015-11-11T07:01:40 – 1QQw7rWhqYnBKeSokc8r -->
<!-- 2015-11-11T18:14:35 – JsoxIyKt6g9U6aedOMF2 -->
<!-- 2015-11-19T16:56:22 – XP1wSbdSlyunz510x9lg -->
<!-- 2015-11-29T07:22:31 – GyV7RReAF0msn3LcW0tk -->
<!-- 2015-12-05T23:11:59 – 9t8WSinX4Y7jDiafbUJh -->
<!-- 2015-12-08T20:31:50 – N9noOJO51ZDqvNnuqncr -->
<!-- 2015-12-09T14:02:22 – Oa1T76ZNDYl14ZWOXHdG -->
<!-- 2015-12-11T20:51:37 – tSJsgvrvlwbynrTtR26M -->
<!-- 2015-12-24T12:57:31 – Kuqm8obb7k5V8qgZUTEf -->
<!-- 2015-12-25T11:03:24 – NwvVHzCb6icDVK4Gkvx9 -->
<!-- 2015-12-28T03:43:14 – HQm5xTKHe77mfkznmE4l -->
