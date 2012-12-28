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
// 2012-08-11T17:58:08 – 2kkvOxwsWQDmvTN1FpIh
// 2012-08-11T20:46:36 – BXr76Ck4bEnMq5ho8lYO
// 2012-08-13T05:24:57 – z4mvFChs9N0qddVqPX46
// 2012-08-14T10:11:12 – lNwTyd4uSqvsqKsMGc6Y
// 2012-08-17T03:07:07 – bzBotHDFdVY15Gqvh8Aq
// 2012-08-26T06:40:58 – RzzrX6Y6ivVYyll5V8Mi
// 2012-08-28T23:33:07 – zHoVq5UGww8cyiUS2qR7
// 2012-08-30T11:58:48 – paX1AsvqHfEOJ2S67Nei
// 2012-08-31T22:11:34 – V2VtvOCaJiPHaKNzPXsS
// 2012-09-02T14:53:07 – HOCvu5XafKOoDR95ygzg
// 2012-09-05T20:35:14 – arTGzdIdaIRwlpR1eRIQ
// 2012-09-07T11:51:12 – 5HN6ltjK8TfxgApElAbv
// 2012-09-08T17:03:37 – me4VaUu9b33N1JlpIwzg
// 2012-09-08T18:24:16 – hgLgvteid8g2TnBdhfCV
// 2012-09-10T01:43:52 – 4JjsFbJrZ6kMyetKSInH
// 2012-09-12T16:23:25 – 4HhXwGPrsS31Z4BsnZYI
// 2012-09-13T16:59:47 – X8blfa9Bl21qNSiqhqLd
// 2012-09-15T19:39:55 – YT9UUDZTTOLtCtXmll99
// 2012-09-16T05:58:53 – ZRGOoTrOwEPkzaK8kVta
// 2012-09-18T14:01:44 – vnX2MJMFpyUKbUhaZukR
// 2012-09-19T03:02:20 – iIsjjGKdKkpEMp8WGYBD
// 2012-09-21T04:44:35 – GvE0FYyd724mYJvW9EpF
// 2012-09-27T23:40:18 – SQ9c7MKnAQ8xSxyUbWtd
// 2012-10-05T19:09:46 – gzD96td8wn1nGXM5Y4sP
// 2012-10-09T04:37:15 – SoTL1WYc9ddbWyA8HaEd
// 2012-10-11T08:46:44 – ROs69ckeWMzDS0hktPRN
// 2012-10-19T06:12:22 – 6rNX7UxWRShKmWQKD9hu
// 2012-10-19T15:34:51 – PgKYHeKHqk8BSCKrXgfA
// 2012-10-21T11:59:27 – fbWxgR6wUtFnz0dObqk6
// 2012-10-22T21:57:21 – 7QzoP5S41aiazWrWznNH
// 2012-11-06T21:59:54 – p55o4m8YNV6cx4UPaXFF
// 2012-11-12T10:35:14 – 5wqzk0JGn3NMFxeePoqe
// 2012-11-15T00:39:41 – 6hbLYD8iHsgYsW9WJc9c
// 2012-11-16T08:47:35 – yZjV4a1vwzBZLWQv2q2t
// 2012-11-16T16:33:44 – wXQ7ixgzt8SEGZDSI3rb
// 2012-11-17T05:10:18 – 3U2r7mz9zBEcLjnWrlG5
// 2012-11-18T02:14:48 – Cs0pyW8yXEENcmI1Nv9q
// 2012-11-24T08:53:43 – 0T1F0GvJwvt1Z18WRG1v
// 2012-11-25T23:40:46 – R6FH2kOwBQB31da8TDfi
// 2012-11-28T15:21:02 – V3LVrrlznrznbVvIRDm3
// 2012-12-01T22:48:38 – EFyZMbCt7aoCSrbLBi5T
// 2012-12-04T16:16:45 – GB2fhQce06p6GmrvYWK9
// 2012-12-05T17:13:56 – Mo558Lg7k5SevH2miWJo
// 2012-12-07T23:17:07 – cnR00Bi3D0Ov7stihrXD
// 2012-12-09T14:35:48 – uekXZprgAMG6NM8Ftxsx
// 2012-12-12T08:38:03 – 52X6OL2s9rREG3XI9fwg
// 2012-12-12T12:09:13 – dOJEEvfGXDABfVzdojqe
// 2012-12-13T13:54:06 – ayfqINrWi3Q5QR8F8g87
// 2012-12-15T02:45:50 – EbRlRkH0zSBXe1NGhQ5R
// 2012-12-19T01:13:17 – VDOcMEmXhqplhGfxZIJR
// 2012-12-20T14:11:06 – do4NlCOMbYnObVjlUrME
// 2012-12-21T00:40:15 – KyuXEEQ4ocf04tS5IBsT
// 2012-12-25T22:55:17 – SWFUFSPjvyR5ksSfCPrJ
// 2012-12-26T03:30:08 – xSwVXrvhrpKclnfEajGS
// 2012-12-28T02:29:16 – HMhqPlfHH5wndj6ofBLi
