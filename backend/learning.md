/*
        Response Object (res)


The response object (res) is used to send a response
from the server back to the client.

Common Response Methods:
- res.send()      : Sends a text or HTML response.
- res.json()      : Sends a JSON response.
- res.status()    : Sets the HTTP status code.
- res.sendFile()  : Sends a file as the response.

              Routing


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

/*
REST API (Representational State Transfer)

REST (Representational State Transfer) is an architectural style
used for designing web APIs. It defines a set of rules and
principles that make APIs simple, scalable, and easy to use.

What is a RESTful API?


A RESTful API is an API that follows the REST architecture.

A RESTful API typically uses:
- HTTP protocol
- URLs (Endpoints)
- HTTP Methods
- JSON (JavaScript Object Notation) for data exchange


Common HTTP Methods


GET    -> Retrieve data
POST   -> Create new data
PUT    -> Update existing data
DELETE -> Remove data


Example Endpoints


GET    /students        -> Get all students
GET    /students/1      -> Get student with ID 1

POST   /students        -> Create a new student

PUT    /students/1      -> Update student with ID 1

DELETE /students/1      -> Delete student with ID 1


Example URLs


GET    /students
POST   /students
PUT    /students/1
DELETE /students/1


*/