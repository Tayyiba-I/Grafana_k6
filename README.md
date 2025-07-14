# K6 Performance and API Test Suite

This repository contains a collection of k6 scripts for performance and API testing of various services. It's structured to promote reusability, maintainability, and clear separation of concerns.

## Project Structure

The project follows a modular structure to organize test scripts, utilities, and configurations:

* **`scripts/`**: Contains the main k6 test scripts.
    * **`scripts/api_specific/`**: Contains tests tailored to specific APIs.
    * **`scripts/auth/`**: Holds scripts related to authentication flows and API endpoints. 
    * **`scripts/general_http/`**: Contains general HTTP request tests (GET, POST, PUT, DELETE) that might be applicable across different APIs or for learning purposes.

* **`utils/`**: Houses reusable JavaScript modules and helper functions. 
    * `auth_helpers.js`: Utility functions for authentication tasks (e.g., token management, login flows). 
    * `data_helpers.js`: Helpers for test data generation, manipulation, or loading. 
    * `http_helpers.js`: Common HTTP-related utility functions, possibly wrappers for k6's `http` module. 
    * `logger.js`: Custom logging utility for structured and consistent output.

* **`config/`**: Stores configuration files, often separated by environment.
    * **`config/environments/`**: Contains environment-specific configuration files.

## Getting Started

### Prerequisites

* [k6](https://k6.io/docs/getting-started/installation/) installed on your system.

### Installation

1.  Clone this repository to your local machine:
    ```bash
    git clone [repository-url]
    cd k6-tests
    ```

### Running Tests

To run a k6 test, navigate to the project's root directory (`k6-tests`) in your terminal.

**1. Set Environment Variables**

Many scripts in this project (especially authentication-related ones) rely on environment variables for sensitive data like API keys, usernames, and passwords.

**Example (Windows Command Prompt/PowerShell):**

```bash
set K6_AUTH_TOKEN=your_auth_token_here
# set K6_AUTH_USERNAME=your_username
# set K6_AUTH_PASSWORD=your_password
