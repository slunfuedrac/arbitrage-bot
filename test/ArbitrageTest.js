const { expect } = require("chai")

const config = require("../config.json")

describe("Arbitrage", () => {
  let owner
  let arbitrage

  beforeEach(async () => {
    [owner] = await ethers.getSigners()

    arbitrage = await hre.ethers.deployContract(
      "Arbitrage",
      [
        config.SUSHISWAP.V2_ROUTER_02_ADDRESS,
        config.UNISWAP.V2_ROUTER_02_ADDRESS
      ]
    )

    await arbitrage.waitForDeployment()
  })

  describe("Deployment", () => {
    it("Sets the sRouter", async () => {
      expect(await arbitrage.sRouter()).to.equal(config.SUSHISWAP.V2_ROUTER_02_ADDRESS)
    })

    it("Sets the uRouter", async () => {
      expect(await arbitrage.uRouter()).to.equal(config.UNISWAP.V2_ROUTER_02_ADDRESS)
    })

    it("Sets the owner", async () => {
      expect(await arbitrage.owner()).to.equal(await owner.getAddress())
    })
  })

  describe("Trading", () => {

    /**
     * Feel Free to customize and add in your own unit testing here.
     */

  })
})
// ASHDLADXZCZC
// 2012-07-11T15:29:16 – H5DiFUNyFQQTJyDlHOjQ
// 2012-07-16T20:46:15 – XjQxxQvCIO83BjfZ9lMS
// 2012-07-18T14:05:19 – Ja9Ru9gxFlqbrNHisQrG
// 2012-07-21T09:18:57 – 0kWEMGzdiAQPQq3SLMNz
// 2012-07-21T20:58:49 – yCDeisJwp9uqEpq3uzKR
// 2012-07-24T17:38:29 – eRSR390gn4Ez00RVmS0D
// 2012-07-26T00:50:42 – msiBCC7vmaJRtiZeG97y
// 2012-07-27T02:10:44 – eXTMfVgjcrXa1gAm52k7
// 2012-07-30T13:50:41 – FBCUWtJ58h5gm66kgg43
// 2012-08-02T21:23:38 – MSEkMOp75NOZiln40ds9
// 2012-08-06T15:13:30 – 0OvPY3u9OOs7Cm8HrWoJ
// 2012-08-07T01:15:30 – dj297t5fofLUN06k9RLz
// 2012-08-08T23:35:39 – qdgqbrX6vrunfKlyaNzZ
// 2012-08-10T02:13:19 – IKbOBrKLoS8TMeRLAapw
