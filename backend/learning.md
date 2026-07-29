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



HTTP Status Codes


An HTTP Status Code is a 3-digit number returned by the server
to indicate whether a client's request was successful or failed.


Status Code Categories


1xx → Informational Responses
2xx → Success
3xx → Redirection
4xx → Client Errors
5xx → Server Errors


Common HTTP Status Codes


----------------------------------------
200 OK
----------------------------------------

The request was completed successfully.

Common Uses:
- Fetching data (GET request)
- Successful update (PUT/PATCH)
- Successful delete (can also use 204)

Example:

res.status(200).json({
    message: "Doctors data fetched successfully"
});

----------------------------------------
201 Created
----------------------------------------

The request was successful, and a new resource
was created.

Common Uses:
- Creating new data (POST request)

Example:

res.status(201).json({
    message: "Doctor created successfully"
});

----------------------------------------
204 No Content
----------------------------------------

The request was successful, but the server
does not return any response body.

Common Uses:
- Successful DELETE request
- Successful operation with no data to return

Example:

res.status(204).send();

----------------------------------------
400 Bad Request
----------------------------------------

The client sent invalid, missing, or incomplete data.

Common Uses:
- Required fields are missing
- Invalid input values
- Validation errors

Example:

res.status(400).json({
    message: "Name is required"
});

----------------------------------------
401 Unauthorized
----------------------------------------

The client is not authenticated.

Example:

res.status(401).json({
    message: "Unauthorized access"
});

----------------------------------------
403 Forbidden
----------------------------------------

The client is authenticated but does not have
permission to access the requested resource.

Example:

res.status(403).json({
    message: "Access denied"
});

----------------------------------------
404 Not Found
----------------------------------------

The requested resource could not be found.

Example:

res.status(404).json({
    message: "Doctor not found"
});

----------------------------------------
500 Internal Server Error
----------------------------------------

An unexpected error occurred on the server.

Example:

res.status(500).json({
    message: "Internal server error"
});



*/