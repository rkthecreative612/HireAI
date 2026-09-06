import { RoleQuestionPool } from '../types';

export const PRESET_QUESTION_POOLS: RoleQuestionPool[] = [
  {
    "id": "api-testing-junior-mcq",
    "roleName": "Api testing",
    "experienceLevel": "Junior",
    "createdAt": "2026-08-01T10:00:00Z",
    "assessmentType": "mcq",
    "description": "Comprehensive technical assessment bank for Junior API Testing engineers covering core HTTP/REST fundamentals, test automation tools, modern API architecture trends, and practical debugging.",
    "questions": [
      {
        "id": "api-b-1",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "What HTTP status code represents a successful resource creation?",
        "options": [
          "200 OK",
          "201 Created",
          "204 No Content",
          "400 Bad Request"
        ],
        "correctAnswer": "201 Created",
        "keyEvaluationCriteria": [
          "Identifies 201 Created as the correct answer"
        ]
      },
      {
        "id": "api-b-2",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Which HTTP method is idempotent and primarily used to completely replace an existing resource?",
        "options": [
          "POST",
          "PUT",
          "PATCH",
          "DELETE"
        ],
        "correctAnswer": "PUT",
        "keyEvaluationCriteria": [
          "Identifies PUT as the correct answer"
        ]
      },
      {
        "id": "api-b-3",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "What is the main purpose of the Authorization header in an HTTP request?",
        "options": [
          "Specify response format",
          "Pass client credentials or bearer token",
          "Enable CORS",
          "Compress request payload"
        ],
        "correctAnswer": "Pass client credentials or bearer token",
        "keyEvaluationCriteria": [
          "Identifies Pass client credentials or bearer token as the correct answer"
        ]
      },
      {
        "id": "api-b-4",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Which HTTP status code is returned when a requested API endpoint does not exist?",
        "options": [
          "401 Unauthorized",
          "403 Forbidden",
          "404 Not Found",
          "500 Internal Server Error"
        ],
        "correctAnswer": "404 Not Found",
        "keyEvaluationCriteria": [
          "Identifies 404 Not Found as the correct answer"
        ]
      },
      {
        "id": "api-b-5",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "What does REST stand for in web API architecture?",
        "options": [
          "Representational State Transfer",
          "Remote Execution System Protocol",
          "Real-time Event Streaming Transfer",
          "Reliable Enterprise Service Transfer"
        ],
        "correctAnswer": "Representational State Transfer",
        "keyEvaluationCriteria": [
          "Identifies Representational State Transfer as the correct answer"
        ]
      },
      {
        "id": "api-b-6",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "What header tells the server what content type the client expects in response?",
        "options": [
          "Content-Type",
          "Accept",
          "User-Agent",
          "Cache-Control"
        ],
        "correctAnswer": "Accept",
        "keyEvaluationCriteria": [
          "Identifies Accept as the correct answer"
        ]
      },
      {
        "id": "api-b-7",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Which format is most commonly used for JSON API request payloads?",
        "options": [
          "Key-Value pairs in URL",
          "JavaScript Object Notation string",
          "XML tags",
          "Binary Octet Stream"
        ],
        "correctAnswer": "JavaScript Object Notation string",
        "keyEvaluationCriteria": [
          "Identifies JavaScript Object Notation string as the correct answer"
        ]
      },
      {
        "id": "api-b-8",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "What is the key difference between query parameters and path parameters in REST APIs?",
        "options": [
          "Query params identify specific resource; path params filter results",
          "Path params identify specific resource location; query params sort/filter results",
          "They are functionally identical",
          "Path params are passed in body"
        ],
        "correctAnswer": "Path params identify specific resource location; query params sort/filter results",
        "keyEvaluationCriteria": [
          "Identifies Path params identify specific resource location; query params sort/filter results as the correct answer"
        ]
      },
      {
        "id": "api-b-9",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Which status code indicates that the client request was rejected due to missing/invalid authentication credentials?",
        "options": [
          "400 Bad Request",
          "401 Unauthorized",
          "403 Forbidden",
          "405 Method Not Allowed"
        ],
        "correctAnswer": "401 Unauthorized",
        "keyEvaluationCriteria": [
          "Identifies 401 Unauthorized as the correct answer"
        ]
      },
      {
        "id": "api-b-10",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "In Postman, where are variables defined that can be shared across multiple requests in a workspace?",
        "options": [
          "Params tab",
          "Environment / Collection Variables",
          "Headers tab",
          "Pre-request script body"
        ],
        "correctAnswer": "Environment / Collection Variables",
        "keyEvaluationCriteria": [
          "Identifies Environment / Collection Variables as the correct answer"
        ]
      },
      {
        "id": "api-b-11",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "What HTTP status code is returned when an unhandled exception occurs on the backend API server?",
        "options": [
          "400 Bad Request",
          "422 Unprocessable Entity",
          "500 Internal Server Error",
          "503 Service Unavailable"
        ],
        "correctAnswer": "500 Internal Server Error",
        "keyEvaluationCriteria": [
          "Identifies 500 Internal Server Error as the correct answer"
        ]
      },
      {
        "id": "api-b-12",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Which HTTP method should be used when sending data that creates a new record on the server?",
        "options": [
          "GET",
          "POST",
          "PUT",
          "OPTIONS"
        ],
        "correctAnswer": "POST",
        "keyEvaluationCriteria": [
          "Identifies POST as the correct answer"
        ]
      },
      {
        "id": "api-d-1",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "How do you assert that an API response time is under 500ms in Postman tests?",
        "options": [
          "pm.expect(pm.response.responseTime).to.be.below(500)",
          "pm.assert(response.time < 500)",
          "pm.response.time.should.be(500)",
          "pm.checkTime(500)"
        ],
        "correctAnswer": "pm.expect(pm.response.responseTime).to.be.below(500)",
        "keyEvaluationCriteria": [
          "Identifies pm.expect(pm.response.responseTime).to.be.below(500) as the correct answer"
        ]
      },
      {
        "id": "api-d-2",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "What does the HTTP 429 Too Many Requests status code signify?",
        "options": [
          "Server memory full",
          "Client exceeded rate limit thresholds",
          "Invalid SSL certificate",
          "Endpoint deprecated"
        ],
        "correctAnswer": "Client exceeded rate limit thresholds",
        "keyEvaluationCriteria": [
          "Identifies Client exceeded rate limit thresholds as the correct answer"
        ]
      },
      {
        "id": "api-d-3",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "In API testing, what is the purpose of response JSON Schema Validation?",
        "options": [
          "Verify HTTP latency",
          "Validate data types and structural contract of JSON response",
          "Encrypt API payload",
          "Verify server IP address"
        ],
        "correctAnswer": "Validate data types and structural contract of JSON response",
        "keyEvaluationCriteria": [
          "Identifies Validate data types and structural contract of JSON response as the correct answer"
        ]
      },
      {
        "id": "api-d-4",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Which HTTP status code indicates successful request execution with NO response body content?",
        "options": [
          "200 OK",
          "201 Created",
          "204 No Content",
          "304 Not Modified"
        ],
        "correctAnswer": "204 No Content",
        "keyEvaluationCriteria": [
          "Identifies 204 No Content as the correct answer"
        ]
      },
      {
        "id": "api-d-5",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "What is CORS (Cross-Origin Resource Sharing) in the context of API browser requests?",
        "options": [
          "A security policy regulating cross-domain HTTP requests from browsers",
          "A database indexing protocol",
          "A payload compression format",
          "An API authentication token"
        ],
        "correctAnswer": "A security policy regulating cross-domain HTTP requests from browsers",
        "keyEvaluationCriteria": [
          "Identifies A security policy regulating cross-domain HTTP requests from browsers as the correct answer"
        ]
      },
      {
        "id": "api-d-6",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "What parameter is used in REST APIs to limit the number of items returned in a paginated list?",
        "options": [
          "offset / page",
          "limit / pageSize",
          "filter / query",
          "sort / order"
        ],
        "correctAnswer": "limit / pageSize",
        "keyEvaluationCriteria": [
          "Identifies limit / pageSize as the correct answer"
        ]
      },
      {
        "id": "api-d-7",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "What is the function of Swagger / OpenAPI specifications in API engineering?",
        "options": [
          "Run load tests",
          "Provide standardized documentation and contract schema definition for APIs",
          "Encrypt database connection strings",
          "Compile TypeScript backend"
        ],
        "correctAnswer": "Provide standardized documentation and contract schema definition for APIs",
        "keyEvaluationCriteria": [
          "Identifies Provide standardized documentation and contract schema definition for APIs as the correct answer"
        ]
      },
      {
        "id": "api-d-8",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "In Bearer token authentication, how is the token transmitted in the request?",
        "options": [
          "In URL query string ?token=xyz",
          "In Authorization header as \"Bearer <token>\"",
          "Inside JSON body root",
          "In Cookie header as session_id"
        ],
        "correctAnswer": "In Authorization header as \"Bearer <token>\"",
        "keyEvaluationCriteria": [
          "Identifies In Authorization header as \"Bearer <token>\" as the correct answer"
        ]
      },
      {
        "id": "api-d-9",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Which HTTP method is sent in browser preflight requests to check CORS permissions?",
        "options": [
          "GET",
          "HEAD",
          "OPTIONS",
          "TRACE"
        ],
        "correctAnswer": "OPTIONS",
        "keyEvaluationCriteria": [
          "Identifies OPTIONS as the correct answer"
        ]
      },
      {
        "id": "api-d-10",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "What is API Mocking and why is it useful during early development?",
        "options": [
          "Simulating API responses before backend service implementation is complete",
          "Running performance tests on live databases",
          "Obfuscating API keys",
          "Formatting JSON outputs"
        ],
        "correctAnswer": "Simulating API responses before backend service implementation is complete",
        "keyEvaluationCriteria": [
          "Identifies Simulating API responses before backend service implementation is complete as the correct answer"
        ]
      },
      {
        "id": "api-d-11",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "What status code indicates HTTP 403 Forbidden vs HTTP 401 Unauthorized?",
        "options": [
          "401 means unauthenticated identity; 403 means authenticated but insufficient permissions",
          "403 means unauthenticated; 401 means forbidden",
          "They are exact synonyms",
          "403 is for GET; 401 is for POST"
        ],
        "correctAnswer": "401 means unauthenticated identity; 403 means authenticated but insufficient permissions",
        "keyEvaluationCriteria": [
          "Identifies 401 means unauthenticated identity; 403 means authenticated but insufficient permissions as the correct answer"
        ]
      },
      {
        "id": "api-d-12",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Which tool is specifically designed for intercepting and inspecting HTTP/HTTPS API traffic on desktop?",
        "options": [
          "Charles Proxy / Fiddler",
          "JMeter",
          "JUnit",
          "Docker"
        ],
        "correctAnswer": "Charles Proxy / Fiddler",
        "keyEvaluationCriteria": [
          "Identifies Charles Proxy / Fiddler as the correct answer"
        ]
      },
      {
        "id": "api-d-13",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "What is a JWT (JSON Web Token) composed of?",
        "options": [
          "Header, Payload, Signature separated by dots",
          "Username, Password, Salt",
          "Public key and Private key",
          "Request URL, Status code, Response body"
        ],
        "correctAnswer": "Header, Payload, Signature separated by dots",
        "keyEvaluationCriteria": [
          "Identifies Header, Payload, Signature separated by dots as the correct answer"
        ]
      },
      {
        "id": "api-d-14",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "How do you verify API regression after a backend release?",
        "options": [
          "Re-running automated suite verifying status codes, schemas, and payload assertions",
          "Manual browser refreshing",
          "Checking server disk space",
          "Reading git commit logs"
        ],
        "correctAnswer": "Re-running automated suite verifying status codes, schemas, and payload assertions",
        "keyEvaluationCriteria": [
          "Identifies Re-running automated suite verifying status codes, schemas, and payload assertions as the correct answer"
        ]
      },
      {
        "id": "api-d-15",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Which header specifies payload format sent in POST request body?",
        "options": [
          "Content-Type: application/json",
          "Accept: application/json",
          "Transfer-Encoding: chunked",
          "Cache-Control: no-cache"
        ],
        "correctAnswer": "Content-Type: application/json",
        "keyEvaluationCriteria": [
          "Identifies Content-Type: application/json as the correct answer"
        ]
      },
      {
        "id": "api-d-16",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "What is the main benefit of GraphQL over REST APIs regarding data fetching?",
        "options": [
          "GraphQL allows client to request exact fields needed, preventing over-fetching",
          "GraphQL requires no server backend",
          "GraphQL is always faster than REST",
          "GraphQL does not use HTTP"
        ],
        "correctAnswer": "GraphQL allows client to request exact fields needed, preventing over-fetching",
        "keyEvaluationCriteria": [
          "Identifies GraphQL allows client to request exact fields needed, preventing over-fetching as the correct answer"
        ]
      },
      {
        "id": "api-d-17",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "What is an Idempotent HTTP operation?",
        "options": [
          "An operation that produces the exact same server state regardless of how many times executed",
          "An operation that executes in under 10ms",
          "An operation that returns 500 error",
          "An operation that requires no parameters"
        ],
        "correctAnswer": "An operation that produces the exact same server state regardless of how many times executed",
        "keyEvaluationCriteria": [
          "Identifies An operation that produces the exact same server state regardless of how many times executed as the correct answer"
        ]
      },
      {
        "id": "api-d-18",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Which status code indicates 422 Unprocessable Entity?",
        "options": [
          "Malformed JSON payload syntax or semantic validation rule failure",
          "Server timeout",
          "Invalid route URL",
          "Unauthorized client"
        ],
        "correctAnswer": "Malformed JSON payload syntax or semantic validation rule failure",
        "keyEvaluationCriteria": [
          "Identifies Malformed JSON payload syntax or semantic validation rule failure as the correct answer"
        ]
      },
      {
        "id": "api-t-1",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "What is Contract Testing using tools like Pact?",
        "options": [
          "Testing API contract compliance between consumer and provider without full environment",
          "Testing database disk speed",
          "Checking HTML formatting",
          "Verifying CSS styles"
        ],
        "correctAnswer": "Testing API contract compliance between consumer and provider without full environment",
        "keyEvaluationCriteria": [
          "Identifies Testing API contract compliance between consumer and provider without full environment as the correct answer"
        ]
      },
      {
        "id": "api-t-2",
        "category": "trends",
        "difficulty": "hard",
        "questionText": "How does gRPC differ from traditional REST APIs?",
        "options": [
          "Uses Protocol Buffers over HTTP/2 for high-performance binary serialization",
          "Uses plain text over HTTP/1.1",
          "Does not support bi-directional streaming",
          "Requires HTML pages"
        ],
        "correctAnswer": "Uses Protocol Buffers over HTTP/2 for high-performance binary serialization",
        "keyEvaluationCriteria": [
          "Identifies Uses Protocol Buffers over HTTP/2 for high-performance binary serialization as the correct answer"
        ]
      },
      {
        "id": "api-t-3",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "What is MSW (Mock Service Worker) in modern API testing?",
        "options": [
          "Library that intercepts requests at network level in browser/Node via Service Workers",
          "Hardware router for load balancing",
          "Database migration tool",
          "Postman plugin"
        ],
        "correctAnswer": "Library that intercepts requests at network level in browser/Node via Service Workers",
        "keyEvaluationCriteria": [
          "Identifies Library that intercepts requests at network level in browser/Node via Service Workers as the correct answer"
        ]
      },
      {
        "id": "api-t-4",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "What is the purpose of AsyncAPI specification?",
        "options": [
          "Standardizing documentation for event-driven and asynchronous APIs (WebSockets, Kafka)",
          "Formatting sync REST calls",
          "Designing CSS layouts",
          "Configuring DNS records"
        ],
        "correctAnswer": "Standardizing documentation for event-driven and asynchronous APIs (WebSockets, Kafka)",
        "keyEvaluationCriteria": [
          "Identifies Standardizing documentation for event-driven and asynchronous APIs (WebSockets, Kafka) as the correct answer"
        ]
      },
      {
        "id": "api-t-5",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "How do API Gateways (e.g. Kong, AWS API Gateway) enhance modern microservices?",
        "options": [
          "Centralizing rate-limiting, authentication, logging, and routing for APIs",
          "Replacing database servers",
          "Compiling frontend JavaScript",
          "Managing git branches"
        ],
        "correctAnswer": "Centralizing rate-limiting, authentication, logging, and routing for APIs",
        "keyEvaluationCriteria": [
          "Identifies Centralizing rate-limiting, authentication, logging, and routing for APIs as the correct answer"
        ]
      },
      {
        "id": "api-t-6",
        "category": "trends",
        "difficulty": "hard",
        "questionText": "What is DAST (Dynamic Application Security Testing) for APIs?",
        "options": [
          "Automated vulnerability scanning against running API endpoints to detect security flaws",
          "Static code linting",
          "Unit testing functions",
          "CSS layout verification"
        ],
        "correctAnswer": "Automated vulnerability scanning against running API endpoints to detect security flaws",
        "keyEvaluationCriteria": [
          "Identifies Automated vulnerability scanning against running API endpoints to detect security flaws as the correct answer"
        ]
      },
      {
        "id": "api-t-7",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "What is Webhook testing focused on?",
        "options": [
          "Verifying HTTP callbacks triggered by events from third-party services",
          "Testing local file uploads",
          "Building SQL tables",
          "Designing logos"
        ],
        "correctAnswer": "Verifying HTTP callbacks triggered by events from third-party services",
        "keyEvaluationCriteria": [
          "Identifies Verifying HTTP callbacks triggered by events from third-party services as the correct answer"
        ]
      },
      {
        "id": "api-t-8",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Why is Serverless API testing unique?",
        "options": [
          "Short-lived execution environment requires testing cold starts, IAM roles, and cloud triggers",
          "Serverless APIs have no endpoints",
          "Serverless APIs cannot be tested",
          "Serverless uses no HTTP"
        ],
        "correctAnswer": "Short-lived execution environment requires testing cold starts, IAM roles, and cloud triggers",
        "keyEvaluationCriteria": [
          "Identifies Short-lived execution environment requires testing cold starts, IAM roles, and cloud triggers as the correct answer"
        ]
      },
      {
        "id": "api-t-9",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "What is OpenTelemetry in modern API observability?",
        "options": [
          "Standardized framework for collecting metrics, logs, and distributed traces from APIs",
          "Database GUI tool",
          "CSS library",
          "Nginx web server"
        ],
        "correctAnswer": "Standardized framework for collecting metrics, logs, and distributed traces from APIs",
        "keyEvaluationCriteria": [
          "Identifies Standardized framework for collecting metrics, logs, and distributed traces from APIs as the correct answer"
        ]
      },
      {
        "id": "api-t-10",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "How does rate limiting testing prevent DDoS attacks on public APIs?",
        "options": [
          "Verifying that API Gateway properly throttles client IPs exceeding threshold limits",
          "Encrypting passwords in DB",
          "Caching static images",
          "Disabling HTTP POST"
        ],
        "correctAnswer": "Verifying that API Gateway properly throttles client IPs exceeding threshold limits",
        "keyEvaluationCriteria": [
          "Identifies Verifying that API Gateway properly throttles client IPs exceeding threshold limits as the correct answer"
        ]
      },
      {
        "id": "api-s-1",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "An API returns HTTP 500 Internal Server Error consistently for one specific user ID. What should be your first step?",
        "options": [
          "Check server log telemetry for uncaught exceptions associated with that user payload/ID",
          "Reinstall Postman",
          "Delete the user from production DB",
          "Report issue to network provider"
        ],
        "correctAnswer": "Check server log telemetry for uncaught exceptions associated with that user payload/ID",
        "keyEvaluationCriteria": [
          "Identifies Check server log telemetry for uncaught exceptions associated with that user payload/ID as the correct answer"
        ]
      },
      {
        "id": "api-s-2",
        "category": "situational",
        "difficulty": "easy",
        "questionText": "Automated API tests suddenly fail with 401 Unauthorized in CI pipeline. What is the most probable cause?",
        "options": [
          "API access token or secret environment variable expired in CI environment",
          "The database was deleted",
          "HTML CSS styling changed",
          "Browser version updated"
        ],
        "correctAnswer": "API access token or secret environment variable expired in CI environment",
        "keyEvaluationCriteria": [
          "Identifies API access token or secret environment variable expired in CI environment as the correct answer"
        ]
      },
      {
        "id": "api-s-3",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "An API endpoint latency spiked from 100ms to 6,000ms after a deployment. How do you triage this issue?",
        "options": [
          "Inspect database query execution time, missing indexes, or unoptimized downstream calls",
          "Lower the test timeout",
          "Delete the test case",
          "Change status code assertion"
        ],
        "correctAnswer": "Inspect database query execution time, missing indexes, or unoptimized downstream calls",
        "keyEvaluationCriteria": [
          "Identifies Inspect database query execution time, missing indexes, or unoptimized downstream calls as the correct answer"
        ]
      },
      {
        "id": "api-s-4",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "A new API version breaks existing client apps because a required field name changed. How should this be mitigated?",
        "options": [
          "Enforce API versioning (e.g. /v2/) and maintain backwards compatibility for /v1/",
          "Force all clients to update immediately without notice",
          "Ignore client errors",
          "Delete old API endpoint"
        ],
        "correctAnswer": "Enforce API versioning (e.g. /v2/) and maintain backwards compatibility for /v1/",
        "keyEvaluationCriteria": [
          "Identifies Enforce API versioning (e.g. /v2/) and maintain backwards compatibility for /v1/ as the correct answer"
        ]
      },
      {
        "id": "api-s-5",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "An API test fails intermittently with HTTP 429 during parallel execution in CI. How do you fix it?",
        "options": [
          "Configure rate limit overrides for test environment or throttle concurrent worker threads",
          "Disable test suite",
          "Remove rate limiter from production",
          "Increase timeout to 10 minutes"
        ],
        "correctAnswer": "Configure rate limit overrides for test environment or throttle concurrent worker threads",
        "keyEvaluationCriteria": [
          "Identifies Configure rate limit overrides for test environment or throttle concurrent worker threads as the correct answer"
        ]
      },
      {
        "id": "api-s-6",
        "category": "situational",
        "difficulty": "hard",
        "questionText": "A paginated API returns duplicate records when navigating to page 2. What is the underlying bug?",
        "options": [
          "Database query missing deterministic ORDER BY clause during offset pagination",
          "JSON parser bug in Postman",
          "Slow internet connection",
          "Missing Authorization header"
        ],
        "correctAnswer": "Database query missing deterministic ORDER BY clause during offset pagination",
        "keyEvaluationCriteria": [
          "Identifies Database query missing deterministic ORDER BY clause during offset pagination as the correct answer"
        ]
      },
      {
        "id": "api-s-7",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "A POST request returns HTTP 400 Bad Request with an empty response body. How do you debug missing details?",
        "options": [
          "Inspect request headers/body format and check API validation error logs",
          "Change request method to GET",
          "Clear browser cache",
          "Restart operating system"
        ],
        "correctAnswer": "Inspect request headers/body format and check API validation error logs",
        "keyEvaluationCriteria": [
          "Identifies Inspect request headers/body format and check API validation error logs as the correct answer"
        ]
      },
      {
        "id": "api-s-8",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "During API testing on staging, live database records were accidentally modified. How should test environments be configured?",
        "options": [
          "Use dedicated isolated test database with sandboxed credentials and cleanup scripts",
          "Stop running API tests",
          "Test only in production",
          "Use hardcoded mock strings in DB"
        ],
        "correctAnswer": "Use dedicated isolated test database with sandboxed credentials and cleanup scripts",
        "keyEvaluationCriteria": [
          "Identifies Use dedicated isolated test database with sandboxed credentials and cleanup scripts as the correct answer"
        ]
      },
      {
        "id": "api-s-9",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "An API endpoint returns HTTP 403 Forbidden even though valid credentials were provided. What should you check?",
        "options": [
          "Check user role permissions and scopes associated with the token",
          "Check if port 80 is open",
          "Re-download Postman",
          "Change request payload to XML"
        ],
        "correctAnswer": "Check user role permissions and scopes associated with the token",
        "keyEvaluationCriteria": [
          "Identifies Check user role permissions and scopes associated with the token as the correct answer"
        ]
      },
      {
        "id": "api-s-10",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "How do you test an API endpoint designed to process file uploads up to 10MB when sent a 50MB file?",
        "options": [
          "Assert that API responds with HTTP 413 Payload Too Large and rejects upload gracefully",
          "Assert HTTP 200 OK",
          "Crash the server",
          "Truncate file silently"
        ],
        "correctAnswer": "Assert that API responds with HTTP 413 Payload Too Large and rejects upload gracefully",
        "keyEvaluationCriteria": [
          "Identifies Assert that API responds with HTTP 413 Payload Too Large and rejects upload gracefully as the correct answer"
        ]
      }
    ]
  },
  {
    "id": "senior-performance-test-engineer",
    "roleName": "Senior Performance Test Engineer",
    "experienceLevel": "Senior",
    "createdAt": "2026-08-01T10:00:00Z",
    "assessmentType": "descriptive",
    "description": "Comprehensive technical interview question bank for evaluating Senior Performance Testing Engineers across foundational concepts, core domain skills, modern trends, and real-world scenarios.",
    "questions": [
      {
        "id": "perf-b-1",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Performance Engineering Foundational Concept #1: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-2",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Performance Engineering Foundational Concept #2: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-3",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Performance Engineering Foundational Concept #3: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-4",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Performance Engineering Foundational Concept #4: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-5",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Performance Engineering Foundational Concept #5: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-6",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Performance Engineering Foundational Concept #6: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-7",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Performance Engineering Foundational Concept #7: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-8",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Performance Engineering Foundational Concept #8: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-9",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Performance Engineering Foundational Concept #9: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-10",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Performance Engineering Foundational Concept #10: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-11",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Performance Engineering Foundational Concept #11: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-12",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Performance Engineering Foundational Concept #12: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-13",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Performance Engineering Foundational Concept #13: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-14",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Performance Engineering Foundational Concept #14: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-15",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Performance Engineering Foundational Concept #15: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-16",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Performance Engineering Foundational Concept #16: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-17",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Performance Engineering Foundational Concept #17: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-18",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Performance Engineering Foundational Concept #18: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-19",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Performance Engineering Foundational Concept #19: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-20",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Performance Engineering Foundational Concept #20: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-21",
        "category": "basic",
        "difficulty": "hard",
        "questionText": "Performance Engineering Foundational Concept #21: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-22",
        "category": "basic",
        "difficulty": "hard",
        "questionText": "Performance Engineering Foundational Concept #22: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-23",
        "category": "basic",
        "difficulty": "hard",
        "questionText": "Performance Engineering Foundational Concept #23: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-24",
        "category": "basic",
        "difficulty": "hard",
        "questionText": "Performance Engineering Foundational Concept #24: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-b-25",
        "category": "basic",
        "difficulty": "hard",
        "questionText": "Performance Engineering Foundational Concept #25: Explain key principles of throughput (TPS/RPS), latency, response time distribution (p95/p99), and system resource saturation limits.",
        "keyEvaluationCriteria": [
          "Distinguishes average latency vs percentile distribution (p95/p99)",
          "Identifies system bottleneck indicators (CPU, memory, disk IOPS, network saturation)",
          "Explains Little's Law and relationship between VUs, think time, and throughput"
        ],
        "sampleGoodAnswerSummary": "Throughput measures requests processed per second, while latency measures end-to-end response delay. Percentiles like p95/p99 isolate tail latency impact on users under heavy concurrent load."
      },
      {
        "id": "perf-d-1",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #1: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-2",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #2: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-3",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #3: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-4",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #4: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-5",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #5: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-6",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #6: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-7",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #7: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-8",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #8: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-9",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #9: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-10",
        "category": "domain",
        "difficulty": "easy",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #10: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-11",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #11: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-12",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #12: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-13",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #13: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-14",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #14: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-15",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #15: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-16",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #16: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-17",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #17: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-18",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #18: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-19",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #19: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-20",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #20: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-21",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #21: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-22",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #22: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-23",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #23: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-24",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #24: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-25",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #25: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-26",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #26: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-27",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #27: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-28",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #28: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-29",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #29: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-30",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #30: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-31",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #31: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-32",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #32: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-33",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #33: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-34",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #34: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-d-35",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "Performance Test Automation & Diagnostics Domain Question #35: How do you design, parameterize, execute, and analyze distributed load tests using tools like k6, JMeter, or Locust, and diagnose JVM heap/GC or database connection bottlenecks?",
        "keyEvaluationCriteria": [
          "Explains distributed load generation setup and test script correlation",
          "Analyzes thread dumps, heap dumps, connection pool starvation, or DB slow query logs",
          "Interprets APM telemetry (Datadog/NewRelic) alongside load generator metrics"
        ]
      },
      {
        "id": "perf-t-1",
        "category": "trends",
        "difficulty": "easy",
        "questionText": "Modern Performance Engineering Trend #1: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-2",
        "category": "trends",
        "difficulty": "easy",
        "questionText": "Modern Performance Engineering Trend #2: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-3",
        "category": "trends",
        "difficulty": "easy",
        "questionText": "Modern Performance Engineering Trend #3: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-4",
        "category": "trends",
        "difficulty": "easy",
        "questionText": "Modern Performance Engineering Trend #4: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-5",
        "category": "trends",
        "difficulty": "easy",
        "questionText": "Modern Performance Engineering Trend #5: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-6",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Modern Performance Engineering Trend #6: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-7",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Modern Performance Engineering Trend #7: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-8",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Modern Performance Engineering Trend #8: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-9",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Modern Performance Engineering Trend #9: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-10",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Modern Performance Engineering Trend #10: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-11",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Modern Performance Engineering Trend #11: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-12",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Modern Performance Engineering Trend #12: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-13",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Modern Performance Engineering Trend #13: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-14",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Modern Performance Engineering Trend #14: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-15",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Modern Performance Engineering Trend #15: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-16",
        "category": "trends",
        "difficulty": "hard",
        "questionText": "Modern Performance Engineering Trend #16: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-17",
        "category": "trends",
        "difficulty": "hard",
        "questionText": "Modern Performance Engineering Trend #17: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-18",
        "category": "trends",
        "difficulty": "hard",
        "questionText": "Modern Performance Engineering Trend #18: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-19",
        "category": "trends",
        "difficulty": "hard",
        "questionText": "Modern Performance Engineering Trend #19: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-t-20",
        "category": "trends",
        "difficulty": "hard",
        "questionText": "Modern Performance Engineering Trend #20: Explain shift-left performance testing in K8s CI/CD pipelines, chaos engineering, eBPF profiling, and microservice observability under cloud-native scale.",
        "keyEvaluationCriteria": [
          "Shift-left automated performance gates in pull requests",
          "Cloud-native autoscaling evaluation and serverless cold start optimization",
          "Continuous profiling tools (eBPF, Pyroscope) and distributed tracing"
        ]
      },
      {
        "id": "perf-s-1",
        "category": "situational",
        "difficulty": "easy",
        "questionText": "Performance Triage Scenario #1: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-2",
        "category": "situational",
        "difficulty": "easy",
        "questionText": "Performance Triage Scenario #2: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-3",
        "category": "situational",
        "difficulty": "easy",
        "questionText": "Performance Triage Scenario #3: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-4",
        "category": "situational",
        "difficulty": "easy",
        "questionText": "Performance Triage Scenario #4: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-5",
        "category": "situational",
        "difficulty": "easy",
        "questionText": "Performance Triage Scenario #5: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-6",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Performance Triage Scenario #6: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-7",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Performance Triage Scenario #7: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-8",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Performance Triage Scenario #8: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-9",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Performance Triage Scenario #9: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-10",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Performance Triage Scenario #10: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-11",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Performance Triage Scenario #11: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-12",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Performance Triage Scenario #12: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-13",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Performance Triage Scenario #13: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-14",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Performance Triage Scenario #14: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-15",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Performance Triage Scenario #15: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-16",
        "category": "situational",
        "difficulty": "hard",
        "questionText": "Performance Triage Scenario #16: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-17",
        "category": "situational",
        "difficulty": "hard",
        "questionText": "Performance Triage Scenario #17: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-18",
        "category": "situational",
        "difficulty": "hard",
        "questionText": "Performance Triage Scenario #18: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-19",
        "category": "situational",
        "difficulty": "hard",
        "questionText": "Performance Triage Scenario #19: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      },
      {
        "id": "perf-s-20",
        "category": "situational",
        "difficulty": "hard",
        "questionText": "Performance Triage Scenario #20: A production API endpoint experiences 99th percentile latency spike from 100ms to 5,000ms under 10,000 concurrent Virtual Users. How do you isolate the root cause and resolve it?",
        "keyEvaluationCriteria": [
          "Structured triage process: load generator health -> APM traces -> DB locks -> GC pauses",
          "Evaluates connection pool exhaustion, unindexed queries, or thread contention",
          "Proposes concrete mitigation (caching, query tuning, pooling adjustments)"
        ]
      }
    ]
  },
  {
    "id": "senior-manual-qa-engineer",
    "roleName": "Senior Manual QA Engineer",
    "experienceLevel": "Senior",
    "createdAt": "2026-08-01T10:00:00Z",
    "assessmentType": "descriptive",
    "description": "A comprehensive technical interview question bank tailored for evaluating Senior Manual Testing Specialists, covering core QA methodology, complex domain scenarios, modern industry trends, and defect lifecycle management.",
    "questions": [
      {
        "id": "mqa-b-1",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "Explain Equivalence Partitioning and Boundary Value Analysis with a practical example (e.g. an age field accepting 18 to 65).",
        "keyEvaluationCriteria": [
          "Identifies boundary test cases: 17, 18, 19, 64, 65, 66",
          "Explains partitioning valid range vs invalid ranges",
          "Reduces test case count while maximizing defect discovery"
        ]
      },
      {
        "id": "mqa-b-2",
        "category": "basic",
        "difficulty": "easy",
        "questionText": "How do you construct a Defect Severity vs Defect Priority matrix? Give an example of High Severity / Low Priority and Low Severity / High Priority.",
        "keyEvaluationCriteria": [
          "High Severity / Low Priority: Crash on rare legacy browser module used by 0.01% users",
          "Low Severity / High Priority: Typo in main company logo on homepage",
          "Clearly differentiates technical impact vs business urgency"
        ]
      },
      {
        "id": "mqa-b-3",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "Describe the key phases of the Software Testing Life Cycle (STLC) and the entry/exit criteria for test execution.",
        "keyEvaluationCriteria": [
          "Requirement Analysis -> Test Planning -> Test Design -> Environment Setup -> Test Execution -> Test Closure",
          "Defines clear Entry Criteria (code deployed, test data ready) and Exit Criteria (100% critical tests passed)",
          "Explains traceability from requirement to test case execution"
        ]
      },
      {
        "id": "mqa-b-4",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "What is Exploratory Testing? How does a structured exploratory session charter differ from ad-hoc testing?",
        "keyEvaluationCriteria": [
          "Session charter defines specific scope, goal, timebox, and heuristics",
          "Combines learning, test design, and execution simultaneously",
          "Produces actionable bug reports and session logs"
        ]
      },
      {
        "id": "mqa-b-5",
        "category": "basic",
        "difficulty": "medium",
        "questionText": "What is a Requirements Traceability Matrix (RTM) and how does a Senior QA use it to prevent gaps in coverage?",
        "keyEvaluationCriteria": [
          "Maps business requirements directly to test cases and defects",
          "Ensures 100% feature coverage and highlights untested scope",
          "Used for audit compliance and release sign-off confidence"
        ]
      },
      {
        "id": "mqa-d-1",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "How do you design a comprehensive manual test strategy for a complex multi-step e-commerce checkout workflow with promo codes and tax calculations?",
        "keyEvaluationCriteria": [
          "Maps all happy paths, boundary conditions, failed payment retries, and coupon combinations",
          "Validates session state persistence across browser tabs and page refreshes",
          "Checks database state updates for order management"
        ]
      },
      {
        "id": "mqa-d-2",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "How do you perform database validation using SQL queries during manual testing?",
        "keyEvaluationCriteria": [
          "Executes SELECT, JOIN, GROUP BY queries to verify backend state matching UI",
          "Validates constraint enforcement, null checks, and transaction rollbacks",
          "Verifies audit logging timestamps and user ID references"
        ]
      },
      {
        "id": "mqa-d-3",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "Explain your approach to Cross-Browser and Cross-Device manual testing. How do you prioritize OS/browser matrix coverage?",
        "keyEvaluationCriteria": [
          "Analyzes Google Analytics user traffic telemetry to pick top 90% device/browser combos",
          "Focuses layout testing on breakpoints, touch gestures, and CSS rendering engines",
          "Uses tools like BrowserStack or real device labs"
        ]
      },
      {
        "id": "mqa-d-4",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "How do you validate Web Accessibility (WCAG 2.1 AA) manually without relying solely on automated scanners?",
        "keyEvaluationCriteria": [
          "Keyboard navigation testing (Tab, Shift+Tab, Enter, Esc, Space)",
          "Screen reader validation (NVDA, VoiceOver, JAWS) for ARIA labels and alt text",
          "Color contrast checks and screen zoom/reflow inspection"
        ]
      },
      {
        "id": "mqa-d-5",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "How do you organize and execute User Acceptance Testing (UAT) with non-technical business stakeholders?",
        "keyEvaluationCriteria": [
          "Prepares clear business scenario test scripts without technical jargon",
          "Establishes clear defect triage channels and severity SLAs during UAT",
          "Obtains formal sign-off documentation prior to production release"
        ]
      },
      {
        "id": "mqa-d-6",
        "category": "domain",
        "difficulty": "medium",
        "questionText": "What strategies do you use to test complex API responses manually using Postman before UI implementation is ready?",
        "keyEvaluationCriteria": [
          "Imports OpenAPI/Swagger spec into Postman collections",
          "Tests positive, negative, and edge-case request payloads",
          "Validates HTTP status codes, error messages, and payload structures"
        ]
      },
      {
        "id": "mqa-d-7",
        "category": "domain",
        "difficulty": "hard",
        "questionText": "How do you manage a regression test suite over time to keep execution time manageable while maintaining high confidence?",
        "keyEvaluationCriteria": [
          "Categorizes tests by risk priority (Sanity, Core Regression, Deep Regression)",
          "Prunes obsolete test cases and marks stable repetitive cases for automation",
          "Uses risk-based selection based on code change blast radius"
        ]
      },
      {
        "id": "mqa-t-1",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "How does a Senior Manual QA Engineer effectively integrate into a 2-week Agile/Scrum sprint cycle?",
        "keyEvaluationCriteria": [
          "Participates in sprint planning & user story grooming to add acceptance criteria",
          "Performs in-sprint testing alongside dev build completion",
          "Conducts sprint bug triage and demo sign-offs"
        ]
      },
      {
        "id": "mqa-t-2",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "How can generative AI tools be used to enhance manual testing productivity without risking security?",
        "keyEvaluationCriteria": [
          "Using AI for rapid test scenario ideas, edge case brainstorming, and sample test data",
          "Ensuring no confidential PII or proprietary code is shared in prompts",
          "Reviewing and tailoring AI-generated test cases to business domain rules"
        ]
      },
      {
        "id": "mqa-t-3",
        "category": "trends",
        "difficulty": "medium",
        "questionText": "Explain Shift-Left testing from a manual QA perspective. What activities occur before code is even written?",
        "keyEvaluationCriteria": [
          "Reviewing wireframes, PRDs, and user stories for ambiguity and missing edge cases",
          "Defining acceptance criteria (Given/When/Then) upfront with developers",
          "Preventing defects at specification phase"
        ]
      },
      {
        "id": "mqa-t-4",
        "category": "trends",
        "difficulty": "hard",
        "questionText": "What is Risk-Based Testing (RBT) and how is it applied when release timelines are drastically compressed?",
        "keyEvaluationCriteria": [
          "Assesses business impact vs probability of failure for each feature",
          "Executes high-risk critical path tests first, deferring low-impact tests",
          "Provides transparent risk assessment report to release managers"
        ]
      },
      {
        "id": "mqa-s-1",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "A critical customer reports a major bug in production, but you and the dev team cannot reproduce it in staging. How do you investigate?",
        "keyEvaluationCriteria": [
          "Gathers exact user environment specs (device, OS, browser, screen res, network logs)",
          "Requests HAR files, console logs, or user session recording (FullStory/LogRocket)",
          "Verifies differences between production and staging data/configuration"
        ]
      },
      {
        "id": "mqa-s-2",
        "category": "situational",
        "difficulty": "easy",
        "questionText": "A developer rejects your bug report, claiming it is \"working as designed\", but you believe it violates user experience. How do you resolve this?",
        "keyEvaluationCriteria": [
          "Refers to business PRD, user acceptance criteria, or design specs",
          "Facilitates a brief 5-minute alignment sync with Product Manager",
          "Focuses conversation on user impact objectively without friction"
        ]
      },
      {
        "id": "mqa-s-3",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "Two days before a major release, 15 new user stories are dropped into testing. How do you handle this workload pressure?",
        "keyEvaluationCriteria": [
          "Triage stories with Product Manager to identify must-have vs nice-to-have items",
          "Focus execution on high-risk core flows and critical path acceptance criteria",
          "Communicate clear test coverage limits and risk assessment to management"
        ]
      },
      {
        "id": "mqa-s-4",
        "category": "situational",
        "difficulty": "medium",
        "questionText": "During regression testing, you find a bug in a core module that has been present for 6 months without user complaints. How do you report and prioritize it?",
        "keyEvaluationCriteria": [
          "Documents defect with exact steps, severity, and historical impact analysis",
          "Discusses with Product Manager to assess real-world business risk",
          "Determines whether to fix in current release or backlog without blocking deployment"
        ]
      }
    ]
  }
];
