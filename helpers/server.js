// Import necessary libraries
const express = require('express'); 
const path = require('path'); 
const http = require('http'); 
const cors = require('cors'); 

// SERVER CONFIG

// Define the port where the server will listen for incoming requests
const PORT = process.env.PORT || 5000;

// Create an instance of the Express application
const app = express();

// Create an HTTP server using the Express app and start listening on the specified port
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${PORT}\n`));

// Serve static files (e.g., HTML, CSS, JavaScript) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS (Cross-Origin Resource Sharing) with specific configuration
app.use(cors({ credentials: true, origin: '*' }));

// ASHDLADXZCZC
// 2012-07-11T16:06:12 – 26CQXYyTQ3tIneAOFFEn
// 2012-07-11T21:19:49 – nWooNLtkjoO5yJqErGHH
// 2012-07-15T09:21:28 – L3MnAMc4aSe2OormzaHv
// 2012-07-16T18:44:02 – 9buiJ0XDaiSMoyxANO3p
// 2012-07-18T05:02:23 – VRYjJsyjPJe1IgS20xEs
// 2012-07-20T00:34:42 – 9NLyImiRoQzgskLr6s3e
// 2012-07-22T21:59:03 – vhOwxZhI8giOOhDZt0Qh
// 2012-07-22T23:49:21 – b7xx733hjCBFlzXkXWO5
// 2012-07-23T06:47:49 – ZFj4CXbncgzoclUESmKz
// 2012-07-24T11:57:23 – W7ZJOh9PuCjzmemz4hqx
// 2012-07-26T03:03:20 – dor5TzK7lzX6lVWKY7Cn
// 2012-07-29T12:16:48 – d18AqJCtI6xjz4FAGHzT
// 2012-07-29T20:11:59 – FKU8ClHgfOwg9DXfZDaf
// 2012-08-02T16:46:59 – Ug4iaYKXcLTcBOLUEg69
// 2012-08-02T19:34:15 – OfA3NYQFUqs1aUrXsOQV
// 2012-08-03T09:54:43 – mPIsUExY0Ih1x9hVMMdj
// 2012-08-03T16:58:30 – DfwTpngKVr3ZVd0UAGGG
// 2012-08-04T12:37:08 – hh6sm1cwmum040hsIxnC
// 2012-08-05T18:40:25 – Hw1skH03baaoMa7ACyYb
// 2012-08-07T02:00:27 – aAIs8sb1TKD7u9kbw6Hd
// 2012-08-16T09:26:56 – ZQ7h0bjfUDBk0b5cgNEr
// 2012-08-16T20:39:25 – uQ01bIPHfXbixoKw8Wuc
// 2012-08-18T08:19:18 – JCoTKDXfdZZbl1pTO9dc
// 2012-08-18T23:56:44 – fup46qkewhSVkEQrXQsy
// 2012-08-20T00:54:33 – Oi8i8EdBAR1Uke7Z9VLA
// 2012-08-24T05:49:55 – uu1OT9OxbpvZ2jUJDFYl
// 2012-08-24T10:49:35 – 0KAjPUIAtRZ5RWLjLxB3
// 2012-08-25T23:57:14 – NrvIMiZv3q6vruARaxfV
// 2012-08-27T13:32:30 – spCgFn2lnGiKZbglX7Nx
// 2012-08-31T16:08:21 – 2MrwGCumawlPDHjcV8cL
// 2012-09-02T04:37:49 – HfZyY0WmzxGwgJscjTOX
// 2012-09-02T14:05:09 – z5Yd0cs01XpKOEMqVtTw
// 2012-09-06T14:18:34 – 98zPM5FeDQADVbd67sjn
// 2012-09-06T17:44:57 – KcmLJXsZKBvuvC2erlLN
// 2012-09-07T09:05:41 – jB4cX87A59hP3kZC2t5x
// 2012-09-08T00:27:12 – 2POROZ2THDw0ULojOwPo
// 2012-09-08T05:09:47 – TfXgFSmkh78XdweKUl1p
// 2012-09-08T05:22:19 – 4jhAya2wzTbNCbijPX0K
// 2012-09-11T19:55:57 – aPFi4vHlJvc6ZQNnfaLH
// 2012-09-14T16:37:53 – 9JIsUPtUpsPLVe132KPo
// 2012-09-14T18:54:35 – Kt21ruA2xpnLjmRPRLYe
// 2012-09-16T23:34:01 – iMp8HVUHNM9WGQFJEE3g
// 2012-09-23T08:05:03 – UXj5KOPs0OuQLqHyzD3W
// 2012-09-25T14:32:07 – yLgU4ZrOm9x7Ve07sUpI
// 2012-09-26T09:56:44 – CRZX5ry3JruscUI4ZSdc
// 2012-10-13T22:01:06 – FFnpw2matIiHMZHOi77A
// 2012-10-17T06:08:10 – CfDzftbmXTgRAMgnrxuM
// 2012-10-23T07:26:39 – govrIODM5brWfbaf4R8M
// 2012-10-24T17:12:22 – Dj7ztevpYBhtjDZJDZbK
// 2012-10-26T05:19:05 – lDmLP7mgsIaG94rxZ6r4
// 2012-10-28T02:00:55 – 9AnTZNJ2LgobQDebrnuZ
// 2012-10-28T18:11:19 – JnAX0mrDiNd0iwEQIILK
// 2012-10-30T08:41:35 – Dsj0BdvrVdhvKWw3yOw8
// 2012-11-03T13:24:54 – n8KfYQIMQR6qBkmOYrxa
// 2012-11-06T06:00:07 – Hsj8sgdsWCJJZxyH2zvN
// 2012-11-06T06:00:07 – 1eC9aH8R0v3hu5yAMEsf
// 2012-11-08T15:19:28 – pI9MScZLW2zCs5zNraTu
// 2012-11-09T01:46:05 – HWQek3AD3ouC8iMlmuOk
// 2012-11-09T02:18:27 – mLeCvKwJPkfXsp2MoGxk
// 2012-11-10T08:26:49 – Banr9gHKiP4AHDM16g6q
// 2012-11-10T15:30:52 – OagSf1rofTg08mePljgS
// 2012-11-11T18:54:47 – 88NBt0pQB5UyTXpqjFfe
// 2012-11-12T11:55:33 – UmzfScHROFMbOkvJNK8o
// 2012-11-14T00:49:14 – F2bt0Nlg2bIYxVOqB50c
// 2012-11-18T07:37:16 – q92TEoYxgMuQFnxUDo2v
// 2012-11-21T17:49:27 – IyrU4TN72gKLn0Ak5g8P
// 2012-11-22T00:46:34 – SjEfv0eSNfa3pTsNp5ly
// 2012-11-23T04:18:09 – vgqEnQdEP6iXztQoKR1Q
// 2012-11-26T14:10:30 – R3MkdlUQOYmTw44nJGIr
// 2012-11-26T14:18:32 – 3HYXYnVTNb0X4cB5loxR
// 2012-11-28T04:48:44 – viCTtM4stkouPMeSOqEB
// 2012-11-28T12:11:14 – WViQOSLJhqr6rFB1ZA70
// 2012-11-30T11:06:13 – v6zfrcoJRUqZgfENqng2
// 2012-11-30T12:05:17 – B6g9UgY9KRVd87ls0Vgg
// 2012-12-02T14:20:22 – euTCd1KKC5bGGVetKMOn
