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
