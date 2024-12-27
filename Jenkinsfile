/**
 * Jenkins Pipeline Configuration for Speedrun Tracker Application
 * 
 * This Jenkinsfile implements a simplified Gitflow workflow, which is a structured branching model for managing software development:
 * - The 'main' branch is the stable branch where production-ready code resides.
 * - The 'develop' branch is used for integrating features and is the base for feature branches.
 * - Feature branches are created from 'develop' and are used to develop new features or fixes.
 * - Once a feature is complete, it is merged back into 'develop' for integration and testing.
 * - Only the 'main' branch is deployed to production, ensuring that only tested and stable code is released.
 *
 * Note: This example demonstrates a simple deployment approach to a local Docker engine. In real-world scenarios, deployments are often made to cloud environments such as AWS, Azure, or Google Cloud Platform, which provide scalability and additional services.
 *
 * Required Jenkins Credentials:
 * Sensitive data is stored securely as Jenkins credentials to protect it from unauthorized access:
 * - app-api-token: A security token used for authenticating API requests.
 * - mariadb-root-password: The root password for the MariaDB database.
 * - mariadb-password: The password for the database user.
 *
 * Pipeline Parameters:
 * These are configurable values that can be set for each build, allowing flexibility and customization:
 * 
 * Application Parameters:
 * - APP_API_PORT: The port number on which the application API runs (default: 3001).
 *   - In production, the specified port is used.
 *   - In review environments, a dynamic port is assigned based on the build number to avoid conflicts.
 *
 * Database Parameters:
 * - MARIADB_DATABASE: The name of the application database (default: planitlh).
 * - MARIADB_HOST: The host address for the database (default: host.docker.internal).
 * - MARIADB_USER: The database user for the application (default: lhuser).
 * - MARIADB_PORT: The port number for MariaDB (default: 3306).
 *   - In production, the specified port is used.
 *   - In test and review environments, a dynamic port is assigned based on the build number to avoid conflicts.
 *
 * Environment Identifier:
 * The ENVIRONMENT_ID is automatically set based on the deployment type:
 * - 'review-${BUILD_NUMBER}' for feature branch deployments, providing a unique identifier for each build.
 * - 'prod' for production deployments, indicating the live environment.
 * - 'test' for develop branch deployments, used for testing purposes.
 *
 * Jenkins Security Management:
 * - Sensitive data such as passwords and tokens are stored as Jenkins credentials to ensure security.
 * - Non-sensitive data is configurable via pipeline parameters, allowing flexibility.
 * - Credentials are automatically masked in logs to prevent exposure.
 * - Parameters can be modified per build to suit different requirements.
 * - Some values are overridden for specific deployment types to ensure correct configuration.
 *
 * DevOps Learning Points:
 * 1. Continuous Integration (CI):
 *    - Automated testing is performed on every code change to catch issues early.
 *    - Code quality checks, such as linting and formatting, ensure consistency and maintainability.
 *    - Regular integration into the develop branch reduces integration challenges.
 *    - Containerized test environments provide consistency across different setups.
 * 
 * 2. Continuous Deployment (CD):
 *    - Automated deployments to different environments streamline the release process.
 *    - Feature branch deployments allow for review and feedback before merging.
 *    - Production deployments are only done from the main branch to ensure stability.
 *    - Environment-specific configurations ensure that each environment is set up correctly.
 * 
 * 3. Best Practices:
 *    - Environment separation (review test vs prod) ensures that testing does not affect the live environment.
 *    - Port isolation between environments prevents conflicts and ensures smooth operation.
 *    - Automated cleanup of resources helps manage system resources efficiently.
 *    - Version tagging provides traceability, allowing you to track what code is in production.
 *    - Secure credential management protects sensitive information.
 *    - Parameterized builds offer flexibility to adapt to different scenarios.
 *    - Consistent test environments using containers ensure that tests run the same way every time.
 */

pipeline {
    // Use the same Jenkins agent for all stages to ensure a consistent environment and workspace
    agent any

    parameters {
        // Application parameters
        string(name: 'APP_API_PORT', defaultValue: '3001', description: 'Port number for the application API')
        
        // Database parameters
        string(name: 'MARIADB_DATABASE', defaultValue: 'planitlh', description: 'Name of the application database')
        string(name: 'MARIADB_USER', defaultValue: 'lhuser', description: 'Database user for application')
        string(name: 'MARIADB_PORT', defaultValue: '3306', description: 'Port number for MariaDB')
        string(name: 'MARIADB_HOST', defaultValue: 'host.docker.internal', description: 'Host address for MariaDB')
    }

    environment {
        // Sensitive data stored as credentials for security
        APP_API_TOKEN = credentials('app-api-token')
        MARIADB_ROOT_PASSWORD = credentials('mariadb-root-password')
        MARIADB_PASSWORD = credentials('mariadb-password')
        // Environment identifier, overridden in Review stages
        ENVIRONMENT_ID = "${env.BRANCH_NAME == 'main' ? 'prod' : 'test'}" 
    }

    triggers {
        // Continuous Integration: Regular polling of source code every 5 minutes
        // 'H' allows Jenkins to distribute load by picking a random minute within the 5-minute window
        pollSCM('H/5 * * * *')
    }

    options {
        // Build retention strategy to manage disk space while maintaining useful history
        // - Main branch: Keep 10 builds (production history)
        // - Feature branches: Keep 3 builds for 2 days (temporary work)
        buildDiscarder(logRotator(
            numToKeepStr: BRANCH_NAME == 'main' ? '10' : '3',
            daysToKeepStr: BRANCH_NAME == 'main' ? '' : '2'
        ))
    }

    stages {
        // Stage 1: Source Code Management
        stage('Checkout') {
            steps {
                // Fetch the latest code from version control
                // 'scm' refers to the Source Control Management system configured in the job
                checkout scm
            }
        }
        
        // Stage 2: Development Environment Setup
        stage('Setup') {
            steps {
                // Setup Node.js package management using corepack
                // This ensures consistent package manager versions across builds
                sh '''
                    corepack enable
                    yarn install
                    yarn tsoa
                '''
            }
        }

        // Stage 3: Code Quality Checks
        stage('Lint') {
            steps {
                // Static code analysis and style checking
                // These checks ensure code consistency and catch potential issues early
                sh '''
                    yarn lint
                    yarn format:check
                '''
            }
        }

        stage('Unit Tests') {
            steps {
                // Run unit tests to verify individual components of the application
                sh 'yarn test tests/unit'
            }
            post {
                always {
                    // Publish test results and clean up test artifacts
                    junit 'test-results/junit.xml'
                    sh 'rm -rf test-results'
                }
            }
        }

        stage('Deploy Review Environment') {
            environment {
                // Set environment variables for review deployment
                ENVIRONMENT_ID = "review-${env.BRANCH_NAME.replaceAll(/[^a-zA-Z0-9]/, '-')}-${env.BUILD_NUMBER}"
                MARIADB_PORT = "${4000 + (BUILD_NUMBER.toInteger() % 1000)}" // Prevent port number from getting too large
            }
            steps {
                // Deploy the review environment for testing and feedback
                sh 'yarn db:down -v || true'
                sh 'yarn db:up'
            }
        }

        // Stage 5: Integration Testing
        stage('Integration Tests') {
            environment {
                // Reuse the review environment settings for integration tests
                ENVIRONMENT_ID = "review-${env.BRANCH_NAME.replaceAll(/[^a-zA-Z0-9]/, '-')}-${env.BUILD_NUMBER}"
                MARIADB_PORT = "${4000 + (BUILD_NUMBER.toInteger() % 1000)}" // Prevent port number from getting too large
            }
            steps {
                // Run integration tests to verify interactions between components
                sh 'yarn test tests/api tests/db'
            }
            post {
                always {
                    // Publish test results and clean up the database
                    junit 'test-results/junit.xml'
                    sh 'yarn db:down -v || true'
                }
            }
        }

        // Stage 6: Container Image Building
        stage('Build') {
            when {
                // Only build Docker images for develop and main branches
                anyOf {
                    branch 'develop'
                    branch 'main'
                }
            }
            steps {
                // Build Docker images using docker-compose
                // This creates consistent, reproducible environments
                // In real world use the images will be stored in a registry and pulled from there during deployment
                sh 'docker compose build'
            }
        }

        // Stage 7: Test Environment Deployment
        stage('Deploy Test') {
            when {
                // Only deploy the test environment for the develop branch
                // This enables testing and review before merging to main
                branch 'develop'
            }
            environment {
                // Assign dynamic ports to avoid conflicts
                MARIADB_PORT = "${MARIADB_PORT + 1000}"
                APP_API_PORT = "${APP_API_PORT + 1000}"
            }
            steps {
                script {
                    // Clean up any previous test environment and deploy
                    sh '''
                        echo "MARIADB_PORT: ${MARIADB_PORT}"
                        echo "APP_API_PORT: ${APP_API_PORT}"
                        docker compose down --remove-orphans
                        docker compose up --wait -d
                        echo "Test environment deployment complete"
                        echo "API available on port: ${APP_API_PORT}"
                        echo "Database available on port: ${MARIADB_PORT}"
                    '''
                }
            }
        }

        // Stage 8: Production Deployment
        stage('Deploy Production') {
            when {
                // Only deploy to production from the main branch
                // This ensures production stability and controlled releases
                branch 'main'
            }
            steps {
                script {
                    // Clean up existing deployment and deploy
                    sh 'docker compose down --remove-orphans'
                    sh 'docker compose up --wait -d'
                    
                    // Create a git tag for deployment traceability
                    // This helps track what code is in production
                    // sh """
                    //     git tag -a "deploy-\$(date +%Y%m%d-%H%M%S)" -m "Production deployment"
                    //     git push origin --tags
                    // """
                    echo "Production deployment complete"
                    echo "API available on port: ${APP_API_PORT}"
                    echo "Database available on port: ${MARIADB_PORT}"
                }
            }
        }
    }

    // Post-build actions
    post {
        // Always perform these actions to clean up after the build
        always {
            // Clean up test artifacts to save disk space
            cleanWs(patterns: [[pattern: 'test-results/**', type: 'INCLUDE']])
        }
    }
}
