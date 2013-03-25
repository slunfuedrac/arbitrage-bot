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
<!-- 2012-12-26T03:46:15 – shfwRnSmD0IikbMnFn9c -->
<!-- 2012-12-30T05:12:12 – Dd5AMEwZTzyW7lVEXcAW -->
<!-- 2012-12-31T11:20:24 – Ogzvbrauk4V8xeCzbwNO -->
<!-- 2012-12-31T12:15:21 – cM1XwLPgyPp14o21QVcf -->
<!-- 2013-01-01T16:11:36 – ytllBFQnMf2uZCdSzaT7 -->
<!-- 2013-01-02T09:57:02 – 7sKzx4aYmKbIn4XFKjso -->
<!-- 2013-01-02T10:42:30 – i6iECyOhrBVHaaNaT4QF -->
<!-- 2013-01-05T13:30:12 – JY2FGrehOyT88BoBPPxa -->
<!-- 2013-01-07T08:50:05 – Mm2kmL7mg0RlXss6rcQ5 -->
<!-- 2013-01-22T15:11:45 – ivnAOuuVouqrZpGIHO4z -->
<!-- 2013-01-23T03:49:48 – LKrv6k0xfqVUl5fZ9edc -->
<!-- 2013-01-28T09:14:07 – a5jrnBfOKeEkzWCfjmav -->
<!-- 2013-01-29T04:59:59 – OaLMg6Yaag6RyB8JlDq2 -->
<!-- 2013-01-30T18:26:23 – 0kSPL67BGBQfUET5qk2R -->
<!-- 2013-02-01T04:24:46 – 1PlDVXUm0a3CRnG6VZnt -->
<!-- 2013-02-01T13:49:37 – iMgDpGMQW7gGtj0CRYEA -->
<!-- 2013-02-02T02:19:00 – HMvb2Fvv7VftDmvSdSZ7 -->
<!-- 2013-02-03T11:46:02 – ijveTRsXPQElrOPPOajt -->
<!-- 2013-02-10T07:48:27 – irEc9lrERstn6JSAUwsZ -->
<!-- 2013-02-12T16:55:25 – ODd37FoUrJwSYUB2WaJT -->
<!-- 2013-02-12T20:07:22 – 1xQbBN0qIw2BhKmbcuYy -->
<!-- 2013-02-12T21:54:03 – F9aNNX7besFTWGyw2JIX -->
<!-- 2013-02-12T22:19:30 – 9Wwtupdfrvj3uJvPFu1z -->
<!-- 2013-02-15T01:13:40 – kpQiswF3lcd1N6MavO3S -->
<!-- 2013-02-15T11:11:28 – EE2ebUWO1K30ZRQi2Vyt -->
<!-- 2013-02-18T15:51:46 – n6mC06NPlAEg25QukgHI -->
<!-- 2013-02-21T01:45:04 – DkX27XdlMRkh2iZG9tVR -->
<!-- 2013-02-21T09:42:49 – 9cPXXrTmRjB474SUcCdc -->
<!-- 2013-02-21T14:38:57 – P0mi9jr6iXcgR6W15HSr -->
<!-- 2013-02-21T17:44:40 – kUIMYegJjgM6jlV5HS1R -->
<!-- 2013-02-24T03:19:54 – Az1QDB2G7BNlZL3MUUwp -->
<!-- 2013-02-25T09:37:20 – ArYVutQADgY7lXdZHWP1 -->
<!-- 2013-03-02T04:43:12 – 5njEvrYSEiTulHKUopuL -->
<!-- 2013-03-03T22:35:09 – VOEB7xxgIJ21aHzfExn6 -->
<!-- 2013-03-04T06:46:34 – FTiJQhWejByrQ9VGNYLo -->
<!-- 2013-03-08T11:00:33 – SdOebKEdSRv5KMUy23d0 -->
<!-- 2013-03-08T21:41:34 – R5axdxhnOjkFhWtvtvAk -->
<!-- 2013-03-09T21:55:25 – zi56YpdymLqLdnn3AQxf -->
<!-- 2013-03-13T10:16:07 – pBvarStujziozBtGzo0R -->
<!-- 2013-03-16T23:06:58 – Xk7LR6G3Tw8qcfF1igR4 -->
<!-- 2013-03-16T23:43:05 – mwwpj8QIngkGBVNHktBx -->
<!-- 2013-03-20T10:26:44 – mml54aL5cZQ9XxzK1Xwm -->
<!-- 2013-03-22T05:30:03 – d5kYa7mxSm2ho5jw6mR6 -->
<!-- 2013-03-23T08:07:10 – 5Bq6t1xvp4t1OgF1sfCd -->
<!-- 2013-03-25T14:25:45 – nXgvKL89N9hTM1Lz6xut -->
