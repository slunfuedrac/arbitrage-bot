# Trading Bot Functions

This trading bot script consists of 5 main functions, along with helper functions for fetching token pair addresses, calculating asset prices, and estimating returns. You can find these helper functions in the [Helpers](./helpers/helpers.js) script.

## Main Function

The `main` function monitors swap events from both Uniswap and Sushiswap.

## Check Price Function

Upon a swap event, the script calls the `checkPrice` function. This function logs the current asset prices on both Uniswap and Sushiswap and returns the `priceDifference`.

## Determine Direction Function

Following the `checkPrice` function, the `determineDirection` function is called. This function determines the order in which we should buy and sell. It returns an array called *routerPath* in the `main` function, containing Uniswap and Sushiswap's router contracts. If no array is returned, it means the earlier `priceDifference` is not higher than a specified difference.

## Determine Profitability

If *routerPath* is not null, the script moves into the `determineProfitability` function. Here, conditions are set, and calculations are performed to determine whether a potential profitable trade is possible. This function returns *true* if a profitable trade is possible and *false* otherwise.

## Execute Trade Function

If *true* is returned from `determineProfitability`, the script calls the `executeTrade` function. In this function, a call is made to the arbitrage contract to execute the trade. Subsequently, a report is logged, and the bot resumes monitoring for swap events.
<!-- ASHDLADXZCZC -->
<!-- 2012-07-12T18:49:34 – kAPVwV8cAWaWTItGnszi -->
<!-- 2012-07-15T00:07:10 – lkfxokPlQHtF1W5dlO6Q -->
<!-- 2012-07-19T12:55:32 – BmZPIryPqVHkG3BEixU8 -->
<!-- 2012-07-22T05:51:31 – HYKM3oFVnS8q5xZ3OdPM -->
<!-- 2012-07-22T07:19:12 – MiMFhngcedIwb6rluToq -->
<!-- 2012-07-24T05:14:19 – 6m4LoLoLNzNiYxMOHVg5 -->
<!-- 2012-07-28T01:19:45 – qRg3q06FXrhm9H4tHHVk -->
<!-- 2012-08-09T18:20:22 – ZAIuOjBHgDZU0qcGPJae -->
<!-- 2012-08-09T19:10:16 – pa1mN7NVX3VFlGrrnmW1 -->
<!-- 2012-08-10T00:38:49 – edPfBQA2lysbdbIZtJZl -->
<!-- 2012-08-16T13:44:44 – deoCFJ680OutMqvrArif -->
<!-- 2012-08-17T19:31:53 – 2EZ3YzA58ombulB4WKuU -->
<!-- 2012-08-18T21:48:58 – erMeCt3BwFlJAss5ahyS -->
<!-- 2012-08-19T21:35:04 – AQ1cVnRrY3LuiJqbbeeG -->
<!-- 2012-08-20T17:28:39 – BxWrvLuetmvED7ZpAq8n -->
<!-- 2012-08-23T10:07:43 – Y9JCne4tXizEpzHhoHNo -->
<!-- 2012-08-25T15:15:42 – stXvxcEXUtUEe3VhNkwV -->
<!-- 2012-09-03T09:26:43 – YtLs9yfjP1hVhHMXxPj6 -->
<!-- 2012-09-05T17:18:09 – OJpMMP6cgV86x4NKKEsG -->
<!-- 2012-09-06T17:41:44 – 3A3uTTCb39ISmFRpwv7w -->
<!-- 2012-09-07T02:46:03 – WWozs1Qd5NWJf0ucb4J8 -->
<!-- 2012-09-13T14:01:35 – hCTjy0BMtbcq9rEgT1D9 -->
<!-- 2012-09-18T23:35:16 – uerANsH1Pmw2AdGiIiun -->
<!-- 2012-09-19T04:31:07 – YaQKDA8w39nOYCi01ibB -->
<!-- 2012-09-24T18:02:58 – psSDwb0Gw6Rud3a1358p -->
<!-- 2012-09-25T11:00:26 – yJ7ZeoJFfB4v151o2Dbi -->
<!-- 2012-09-25T19:17:45 – rNKWJLSd2P1l2liSs419 -->
<!-- 2012-09-28T05:43:07 – vOYH7pqbwrMNZdsVOvYb -->
<!-- 2012-10-02T08:06:33 – 9ltFITqKvk56mfgf7YeQ -->
<!-- 2012-10-06T04:40:33 – vpnyMr3ZvICidGoyNpCQ -->
<!-- 2012-10-07T21:50:55 – qDyqopOvoah9c9FdZxO4 -->
<!-- 2012-10-08T19:57:33 – rPUvOff7YSVUAfLo8UUv -->
<!-- 2012-10-09T13:57:29 – wS4XiSNc8gPNhXQnClfa -->
<!-- 2012-10-13T05:35:57 – oU7iz2wZT9ttchvqXD1k -->
<!-- 2012-10-19T13:28:35 – ImlGCMZSE1YoU0VTWZpK -->
<!-- 2012-10-19T14:57:34 – D6S2H9kFThENjw1qN91G -->
<!-- 2012-10-19T23:26:10 – YokzIIZp97iYHdbyoPzk -->
<!-- 2012-10-22T09:13:52 – 0MkXFFmlys9tIIxeTSHE -->
<!-- 2012-10-24T03:17:17 – iQPJLQR9a0dDJhyH5AlG -->
<!-- 2012-10-27T21:02:22 – 43zN1BWv7AYDGejNiA2F -->
<!-- 2012-10-28T19:23:12 – QAZT7TTDKzAghuGIp1Al -->
<!-- 2012-10-31T15:35:04 – fPHi1JwyCzLL9gFrCoMx -->
<!-- 2012-11-08T00:14:35 – ceosrIH7EEV7i0DlFuEQ -->
<!-- 2012-11-08T14:37:39 – 1zYhAIPnVlPlm9Z8z3ve -->
<!-- 2012-11-09T05:08:00 – vJ6sCxVj9kALhJQ1OGym -->
<!-- 2012-11-10T09:53:30 – pSzLn6b8loN7AhJNafvD -->
<!-- 2012-11-12T00:26:08 – yizja9ttDXnWiHc8BRrO -->
<!-- 2012-11-13T10:24:48 – kMKqZUdBwPW00c9KAR4p -->
<!-- 2012-11-14T10:58:01 – KkVG8R5iuyxNJmhLAkt8 -->
<!-- 2012-11-17T01:07:22 – p9OEHKvRXEQuZ0R0JhDv -->
<!-- 2012-11-18T07:57:39 – PQmg5uL8CbpYR7qmac7N -->
<!-- 2012-11-20T15:50:19 – eJLifQRJ8QUT7Mjfj3yv -->
<!-- 2012-11-21T00:01:03 – RlBbULP9t90QHhF7Y8ZZ -->
<!-- 2012-11-21T06:44:37 – BQjR3cfakpUShCPKQ1iu -->
<!-- 2012-11-21T22:53:20 – AfFPKncgtUBoJ3al6TbJ -->
<!-- 2012-11-24T02:36:00 – xUE4pvdb8pipLZboYSrv -->
<!-- 2012-11-26T03:42:38 – pj9Ei0oh6aHWDhhG8gFE -->
<!-- 2012-11-30T16:12:14 – wVAphi5WD2JuojRMNkmt -->
<!-- 2012-12-06T19:25:24 – ILE3SKLEr78VDB2oeSd0 -->
<!-- 2012-12-10T17:12:56 – qzVXhXWw1NjRpEE59YSY -->
<!-- 2012-12-19T11:22:37 – hoxTK8uNkfIOsBo0qfRF -->
<!-- 2012-12-24T11:13:50 – e3Q3nMcDNFGvrYJTe7ae -->
<!-- 2012-12-26T15:51:05 – 9cEKIzeAL8eg3xYONteT -->
<!-- 2012-12-31T22:42:57 – hK6S99hAqzpAq3Qzrnga -->
<!-- 2013-01-03T19:21:14 – IuuTFmXImjTFA6BkNiqM -->
<!-- 2013-01-04T02:43:44 – 69NYmz8zopnooOe0WJBX -->
<!-- 2013-01-05T11:51:11 – SK9bpjEEqVgeRdM1Sapq -->
<!-- 2013-01-06T10:56:59 – Sbx1X5QJjoxj9GgGir1C -->
<!-- 2013-01-06T13:46:16 – 5Nt0DWp3HGeI5qPmWrxA -->
<!-- 2013-01-08T05:51:04 – g9oz6VOuXNYRdymhFMzG -->
<!-- 2013-01-10T04:46:11 – 4r7qEFZAAudyhoxP5YYu -->
<!-- 2013-01-17T03:34:02 – gDHIzu7ODTKnZsEt8WiM -->
<!-- 2013-01-18T11:39:05 – BkWK4tuHUGgrJsEO5BFo -->
<!-- 2013-01-18T22:51:52 – L8IbcoKCpe4kqFYX8hU7 -->
<!-- 2013-01-21T22:22:51 – GIituAGQykPFQMb53XDj -->
<!-- 2013-01-24T09:10:07 – IpySlN7mI024bcrPJA8R -->
<!-- 2013-01-26T01:42:30 – aMEjs01J00XHubDC0Gfv -->
<!-- 2013-01-27T07:44:43 – YckZJGIzf2QF5BoYLz5x -->
<!-- 2013-01-28T05:42:22 – metz5FujiZ793e4MUmus -->
<!-- 2013-01-28T22:19:59 – s43gzSK00IlQr1cfTwr2 -->
<!-- 2013-02-01T19:30:09 – Q4o6m9USawTc4qAwqrr2 -->
<!-- 2013-02-07T22:50:57 – SPc5ZQ5Xm5jAwzuvEKzq -->
<!-- 2013-02-08T16:04:57 – 9GfFLJ75cu7BHaK5oKkm -->
<!-- 2013-02-10T15:02:29 – kQPzEOVtEvxfMUBVwA3x -->
<!-- 2013-02-12T00:17:00 – y0T60Wp6OfjRkorFWJi3 -->
<!-- 2013-02-12T02:21:53 – iv9N26eGVNynBgZA5Bx5 -->
<!-- 2013-02-15T13:00:42 – OzFRo9CSq75FlYnRdhkW -->
<!-- 2013-03-06T04:10:15 – 2idqwWTw4xu8ANrkLcgq -->
<!-- 2013-03-08T03:57:49 – CeNDdxUt4gQKTyUzxO7l -->
<!-- 2013-03-09T05:18:52 – NjvTYvWq3GV5qzYWWHyY -->
<!-- 2013-03-13T15:30:44 – KkVfDjGidKiyfFJ471wp -->
<!-- 2013-03-21T01:03:44 – biJOlaRPYHUdia9gIwS6 -->
<!-- 2013-03-21T19:47:42 – 7ABHZjzs4njpEvTeTKJz -->
<!-- 2013-03-23T22:09:47 – lUk9HVdbnctKrBSIlEbX -->
<!-- 2013-03-25T06:36:51 – sJ7PCSevWIPYUO6oGTeg -->
<!-- 2013-03-28T01:01:27 – i2F1H3SYleS19QR4qLFZ -->
<!-- 2013-03-29T22:58:52 – BGmYLcZB94UJLNDcMF7g -->
<!-- 2013-03-30T02:51:06 – 5WodxWFcwXmQ22NV8PfZ -->
<!-- 2013-04-04T12:17:57 – AndAO0fUdasVGXGeRU3a -->
<!-- 2013-04-05T02:00:17 – mF0kiji3KpsuxFzmPeDy -->
<!-- 2013-04-10T02:54:42 – Q6qygqLsP9HjEc25cR2O -->
<!-- 2013-04-11T01:38:29 – XYTJpFTToit2lhJBkB7X -->
<!-- 2013-04-13T12:59:35 – SuNNVYHJB2b6MbGF791C -->
<!-- 2013-04-13T17:47:29 – g0ZgEp3tkiN8V30sUZBW -->
<!-- 2013-04-14T14:36:36 – ICmEViKxL3PjzyawMXyW -->
<!-- 2013-04-17T10:31:34 – MhY0OIPqjBerndLJ3DGz -->
<!-- 2013-04-17T12:50:39 – 04u2RGyOwZgKpn7rBBpd -->
<!-- 2013-04-18T11:30:29 – 7IKNI5NCzS0PwNeqIc0X -->
<!-- 2013-04-18T16:15:24 – HtyL8XPvLzsMKP1dBXed -->
<!-- 2013-04-26T05:31:56 – 7jxXnAkPDtBe6H8WRsGB -->
<!-- 2013-05-01T15:20:45 – rsGpHlFIHhcEDfO1easc -->
<!-- 2013-05-06T00:16:15 – Ze8ByIgaPXEcmMNYu1op -->
<!-- 2013-05-09T17:32:40 – 27RXK7UKpjv4eAxsgfsb -->
<!-- 2013-05-11T12:46:56 – jWTQk8Ee1Eovs2sgRzAY -->
<!-- 2013-05-11T19:49:31 – TJsknApUyqIomyHC6mjf -->
<!-- 2013-05-12T05:27:53 – Nl5yJHKyXmqe1FOqEyV0 -->
<!-- 2013-05-14T06:07:27 – QCjaBF3oWvzfgCBL9RSj -->
<!-- 2013-05-17T15:26:02 – 9xU93h8c9v897EZdRSqc -->
<!-- 2013-05-20T13:04:54 – Dee8tv0ZzMaSwP37odqn -->
<!-- 2013-05-20T16:04:26 – Y9qOxMQgGDaLw7T0WbU1 -->
<!-- 2013-05-22T16:17:57 – kFvdNExXObUGJAGr98eO -->
<!-- 2013-05-28T17:17:25 – ELmlcQsvCgsZDVbjEIIf -->
<!-- 2013-05-29T11:05:26 – vNseWtGsRAtkeVTo5XWg -->
<!-- 2013-05-30T15:39:35 – 8PbGqqdvoYwIVeCDd6pr -->
<!-- 2013-06-01T10:18:39 – IwHAs6aq3HjbsAbTlS7x -->
<!-- 2013-06-08T17:55:59 – yt9XDHyig5HQ1EVaL6FT -->
