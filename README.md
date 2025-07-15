# Grafana k6 Test Framework

This repository contains a structured k6 test framework designed for API testing, including configurable functional tests and performance testing scripts. The project is organized to promote reusability, maintainability, and clear separation of concerns.

## Project Structure

The project follows a modular structure to organize test scripts, utilities, and configurations:
* **`scripts/`**: Contains the main k6 test scripts, organized by function.
    * `executor/`: Contains the central test runner (`executor.js`) that reads and executes test cases from a configuration file.
    * `api_specific/`: For tests related to the specific business logic of a particular API.
    * `auth/`: Holds scripts related to authentication flows.
    * `general_http/`: Contains general HTTP request tests that can be applied across different APIs.
    * `load_tests/`: For performance-focused tests that simulate heavy traffic.
* **`config/`**: This directory holds all configuration files for the tests.
    * `tests.json`: The core configuration file containing all the details for the configurable test cases. This is where you add new tests without modifying the code.
* **`utils/`**: Houses reusable JavaScript modules and helper functions.
    * `logger.js`: A custom logging utility for structured and consistent output.

## Test Case Schema in `config/tests.json`

The `tests.json` file contains a flexible schema designed to support various test types and run configurations for reporting and classification purposes.

### Example Test Case

```json
{
    "name": "Get all posts",
    "type": "api",
    "domain": "jsonplaceholder",
    "description": "Fetches a list of all posts to verify data retrieval from the posts endpoint.",
    "tags": ["get", "posts", "public-api"],
    "method": "GET",
    "url": "https://jsonplaceholder.typicode.com/posts",
    "checks": [
      { "type": "status", "value": 200 },
      { "type": "body-length", "min": 100 }
    ],
    "headers": {
      "Accept": "application/json"
    },
    "options": {
      "iterations": 1,
      "thresholds": {
        "fail_rate": 0.1,
        "avg_response_time": 1000
      }
    }
  }
````

### Schema Attributes

  * **`type` (string)**: The category or type of test. Currently, "http" is supported. This attribute allows for future expansion to other types like "graphql" or "grpc."
  * **`domain` (string)**: The domain, category, or service being tested. This is useful for reporting and grouping test results.
  * **`name` (string)**: A short, human-readable name for the test case.
  * **`description` (string, optional)**: A more detailed explanation of the test case's purpose.
  * **`method` (string)**: The HTTP method (e.g., "GET", "POST", "PUT", "DELETE").
  * **`url` (string)**: The URL of the endpoint being tested.
  * **`checks` (array)**: An array of checks to be performed on the test's response.
      * `type`: The type of check (e.g., "status", "body-includes", "body-length").
      * `value`: The expected value for the check.
  * **`headers` (object, optional)**: An object of HTTP headers to be sent with the request.
  * **`payload` (object, optional)**: The request body for methods like POST or PUT.
  * **`options` (object, optional)**: Configuration for test execution, crucial for stress testing.
      * `iterations` (number): Defines how many times this specific test case should run.
      * `thresholds` (object): A set of success criteria for the test, allowing you to define pass/fail conditions.
          * `fail_rate` (number): The maximum acceptable failure rate (e.g., 0.1 for 10% failure). A higher rate will cause the test to fail.
          * `avg_response_time` (number): The maximum acceptable average response time in milliseconds. A higher value will cause the test to fail.

## Environment Setup

### Prerequisites

  * **k6**: The open-source load testing tool.

### Installation

1.  **Install k6**: Follow the official k6 documentation to install k6 on your system.

2.  **Clone the Repository**: Clone this repository to your local machine:

    ```bash
    git clone [https://github.com/Tayyiba-I/Grafana_k6.git](https://github.com/Tayyiba-I/Grafana_k6.git)
    cd Grafana_k6
    ```

## Running Tests

The test framework is designed to be run from the project's root directory (`k6-tests`).

### Run Configurable Tests

To run the tests defined in `config/tests.json`, use the central executor script:

```bash
k6 run scripts/executor/executor.js
```

The executor will read the `tests.json` file, apply the configured `iterations` and `thresholds`, and report the results based on these criteria.

```
```
