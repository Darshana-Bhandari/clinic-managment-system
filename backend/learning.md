/*
========================================
        Response Object (res)
========================================

The response object (res) is used to send a response
from the server back to the client.

Common Response Methods:
- res.send()      : Sends a text or HTML response.
- res.json()      : Sends a JSON response.
- res.status()    : Sets the HTTP status code.
- res.sendFile()  : Sends a file as the response.

========================================
              Routing
========================================

Routing is the process of defining how an application
responds to a client's request for a specific URL
(endpoint) using an HTTP method such as GET, POST,
PUT, or DELETE.

Examples:
- /          -> Home Route
- /about     -> About Route
- /employee  -> Employee Route
*/

//
// Different Types of Routes
//

// GET    -> Retrieve (fetch) data from the server.
// POST   -> Create or add new data.
// PUT    -> Update existing data.
// DELETE -> Remove existing data.

//
// Request Object (req)
//

// The request object (req) contains information
// sent by the client to the server.
//
// It contains:
// - req.params  -> Route parameters.
// - req.query   -> Query parameters.
// - req.body    -> Data sent in the request body.
// - req.headers -> Request headers.

//
// Response Object (res)
//

// The response object (res) is used to send data
// back to the client.
//
// Common methods:
// - res.send()
// - res.json()
// - res.status()
// - res.sendFile()