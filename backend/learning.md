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



Controllers (Business Logic)


A controller is a server-side function that receives an HTTP request,
processes the request by executing the application's business logic,
interacts with the database or services if needed, and sends an
appropriate HTTP response back to the client.

Responsibilities of a Controller:
- Receive HTTP requests
- Validate request data
- Execute business logic
- Interact with the database
- Send HTTP responses

Example:

const getDoctors = (req, res) => {
    res.status(200).json({
        message: "Doctors fetched successfully"
    });
};


Types of Errors

Errors are mistakes in a program that prevent it from working correctly. In programming, the two main types of errors are:

1. Syntax Error
2. Runtime Error


1. Syntax Error

 Definition
A **Syntax Error** is an error that occurs when the programmer does not follow the rules (syntax) of the programming language. The compiler or interpreter detects these errors before the program runs.

Causes
- Missing semicolon (`;`)
- Missing brackets (`{}` or `()`)
- Misspelled keywords
- Incorrect punctuation
- Wrong statement structure

Example

Incorrect Code

```c
#include <stdio.h>

int main() {
    printf("Hello World")
    return 0;
}
```

Error
```
Missing semicolon (;) after the printf statement.
```

Correct Code

```c
#include <stdio.h>

int main() {
    printf("Hello World");
    return 0;
}
```

Characteristics
- Detected before program execution.
- Program cannot run until the error is fixed.
- Easy to identify because the compiler shows the line number.

---

# 2. Runtime Error

Definition
A **Runtime Error** is an error that occurs while the program is executing. The program compiles successfully, but it crashes or behaves unexpectedly during execution.

Causes
- Division by zero
- Invalid array index
- File not found
- Memory allocation failure
- Null pointer access

Example

 Incorrect Code

```c
#include <stdio.h>

int main() {
    int a = 10;
    int b = 0;

    printf("%d", a / b);

    return 0;
}
```

Error
```
Division by zero
```

Correct Code

```c
#include <stdio.h>

int main() {
    int a = 10;
    int b = 2;

    printf("%d", a / b);

    return 0;
}
```

Characteristics
- Occurs during program execution.
- Program compiles successfully but crashes or stops while running.
- Harder to identify than syntax errors.



# Difference Between Syntax Error and Runtime Error

| Syntax Error | Runtime Error |
|---------------|---------------|
| Occurs due to incorrect programming syntax. | Occurs while the program is running. |
| Detected during compilation. | Detected during execution. |
| Program cannot execute until fixed. | Program starts but may crash or stop unexpectedly. |
| Examples: Missing semicolon, missing bracket, misspelled keyword. | Examples: Division by zero, file not found, invalid memory access. |
| Easier to detect because the compiler reports the error. | Harder to detect because it happens during execution. |

---

# Summary

## Syntax Error
A syntax error occurs when the rules of the programming language are violated. These errors are detected before execution, and the program cannot run until they are corrected.

## Runtime Error
A runtime error occurs while the program is running. Although the program compiles successfully, it may crash or stop unexpectedly because of issues such as division by zero, invalid memory access, or missing files.


// mysql -u root -p
student table
*/

