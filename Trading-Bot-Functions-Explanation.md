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
<!-- 2012-07-11T20:22:43 – 7DiJnNn8bd5pugUt0IbW -->
<!-- 2012-07-14T03:58:45 – j9Ql7KDQgdghYEpSzBBz -->
<!-- 2012-07-14T05:08:17 – nPK0f9yDLJgDdoI9KOVX -->
<!-- 2012-07-22T07:29:17 – JNfYeaNjvi54UxPSOw7z -->
<!-- 2012-07-25T15:51:15 – Zw1mcHBj27jh0JVrfQTW -->
<!-- 2012-07-25T16:10:32 – ljZHAGpuGvSU82H7DoYh -->
<!-- 2012-07-28T23:01:54 – XTgHi4Nl43QfBQg3XtKr -->
<!-- 2012-08-09T03:10:55 – d6Q4Sylv40ipoGFshsjn -->
<!-- 2012-08-09T18:55:19 – G5W2W7QVH2h74MgnxIjy -->
<!-- 2012-08-11T04:10:41 – zuMb13DEWFZanZbsgbtN -->
<!-- 2012-08-15T10:07:52 – wAH2kIHZ8XZecJ8gb8kD -->
<!-- 2012-08-16T18:04:15 – H0RP9k5SCdBvh3MvIeGq -->
<!-- 2012-08-18T20:12:05 – AWGN6Wl2q77WOYktQMK0 -->
<!-- 2012-08-20T05:10:30 – AQWQpbNxJUc9UmsI1zJB -->
<!-- 2012-08-23T02:23:21 – x7CNx0nKzPhm1U88lsGJ -->
<!-- 2012-08-29T03:00:59 – PQVxP5vY5NwjNbSIlL07 -->
<!-- 2012-09-02T18:53:00 – 81xpIN5ws5MaJOUVJ1wy -->
<!-- 2012-09-03T19:05:58 – wd5L3AqRjVyKqyYxGVvx -->
<!-- 2012-09-05T22:25:11 – 67ovV1QwMPufwqsyI54J -->
<!-- 2012-09-08T18:26:29 – ywbZgHie3JJfO0WN8d0p -->
<!-- 2012-09-11T20:19:44 – P4bedcrI6Pn9kH0d8EEg -->
<!-- 2012-09-15T06:52:49 – j47wcJLFET7iOamYjiAC -->
<!-- 2012-09-15T10:48:54 – 4DBSpypISw8diEGpPiHZ -->
<!-- 2012-09-17T10:31:58 – wEoTkQRODxgcB45cKIbF -->
<!-- 2012-09-20T07:57:33 – z42tLc4KAeySDtCm7Zs2 -->
<!-- 2012-09-27T17:03:39 – X5bl2JuerddN3WcNES1t -->
<!-- 2012-09-30T09:44:02 – oVGdq4aWiJfq4aEVnk7O -->
<!-- 2012-10-01T04:30:40 – vTjEdTknJBUrjF1UkP2Z -->
<!-- 2012-10-01T05:03:01 – vX7rrAf7R5l9cXL37hHQ -->
<!-- 2012-10-03T03:07:44 – mDMv4022zYYu1d8I1Thd -->
<!-- 2012-10-08T08:18:35 – ngTlPPeh7L9FhykSZ3hH -->
<!-- 2012-10-09T00:48:58 – x2sLbIRiWEsrKCw4n2ZT -->
<!-- 2012-10-11T09:54:01 – eEz8edn8FvnUau6VV5b1 -->
<!-- 2012-10-11T12:39:00 – SrkgtobInFpugOdeBuDp -->
<!-- 2012-10-15T16:46:39 – t4ol5wi9tjOogUzH6EWf -->
<!-- 2012-10-24T06:51:32 – YDBsiQqjWHiPQ8NycbEh -->
<!-- 2012-10-25T05:25:56 – KKeRtExOfk0G4GzohXJi -->
<!-- 2012-10-28T10:40:37 – 8EbZyV1pPCdn2b1n61TJ -->
<!-- 2012-11-02T02:33:18 – 8fSNkNOrhh9Wtv7tleAX -->
<!-- 2012-11-06T11:00:18 – LYoiOH3NzcSUiHwPewpm -->
<!-- 2012-11-07T23:55:51 – Al6z4p9aEy7LbWsbLxd2 -->
<!-- 2012-11-10T11:58:14 – tfOsR0sTeXUnm561dhwd -->
<!-- 2012-11-13T20:52:19 – 32jIhjCIw3yg8gZjhmdm -->
<!-- 2012-11-14T03:19:46 – uYjtq9wbjszZHHhrZURs -->
<!-- 2012-11-14T23:50:49 – iibFtuVfKkKmZKfjc751 -->
<!-- 2012-11-16T16:58:00 – X4hZXKV6skQI7pGbee2h -->
<!-- 2012-11-18T15:21:06 – ySzPgqFWnVVSluDjjsN9 -->
<!-- 2012-11-20T16:02:24 – eXRWYYy0a1EuIjCqEGLx -->
<!-- 2012-11-23T21:56:16 – QXFcw1FGziXrJscqQBWh -->
<!-- 2012-11-25T00:44:00 – yz3UQYsG5c1yOgiTAcnJ -->
<!-- 2012-11-25T02:54:36 – wiBINDmlA5E6w03o6gGL -->
<!-- 2012-11-30T11:13:47 – SwcODrmzlDWAYuVvRSHB -->
<!-- 2012-12-02T01:26:08 – HaYW3PetSQJEqB2DmbfZ -->
<!-- 2012-12-02T02:57:27 – NjUtkN6xJuxRuCYV8NNj -->
<!-- 2012-12-02T23:55:12 – KtTXWFdg9VdDqW0qzxAW -->
<!-- 2012-12-07T08:55:16 – MT0Ac0f0acJ9s3gulHkA -->
<!-- 2012-12-11T18:40:38 – UNtAURl4bvDvKW74ROtZ -->
<!-- 2012-12-12T09:14:36 – WAFvkiBQnLWZWaeorn5z -->
<!-- 2012-12-13T18:56:31 – sdFjPFvzEJcZpDDlU1U7 -->
<!-- 2012-12-21T09:09:51 – JkMoSsigBkVv3ChEOHPX -->
<!-- 2012-12-21T14:11:55 – xoj2JKLz59fYB47SDjYc -->
<!-- 2012-12-22T08:17:52 – CzgRgsPSlgQT7ON2Wtzr -->
<!-- 2012-12-25T01:41:19 – oGXYubd6Oif4iDlTWHhN -->
