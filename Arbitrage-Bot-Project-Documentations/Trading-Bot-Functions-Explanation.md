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
