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
