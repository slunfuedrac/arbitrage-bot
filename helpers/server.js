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
