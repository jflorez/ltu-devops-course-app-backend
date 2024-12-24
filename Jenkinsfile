/**
 * Jenkins Pipeline Configuration for Speedrun Tracker Application
 * 
 * This Jenkinsfile implements a trunk-based development workflow where:
 * - 'main' branch is the trunk (source of truth)
 * - Feature branches are short-lived (usually less than 2 days)
 * - Feature branches are prefixed with 'feature/'
 * - All changes are integrated frequently into the trunk
 * - Only trunk (main) gets deployed to production
 *
 * Required Jenkins Credentials:
 * Sensitive data is stored as Jenkins credentials:
 * - app-api-token: Security token for API authentication
 * - mariadb-root-password: Root password for MariaDB
 * - mariadb-password: Database user's password
 *
 * Pipeline Parameters:
 * Configurable values that can be set per build:
 * 
 * Application Parameters:
 * - APP_API_PORT: Port number for the application API (default: 3001)
 *   - Production: Uses the specified port
 *   - Review: Uses port + 100 (e.g., if prod is 3000, review is 3100)
 *
 * Database Parameters:
 * - MARIADB_DATABASE: Name of the application database (default: planitlh)
 * - MARIADB_HOST: Database host (default: speedrun-db)
 * - MARIADB_USER: Database user for application (default: lhuser)
 * - MARIADB_PORT: Port number for MariaDB (default: 3306)
 *   - Production: Uses the specified port
 *   - Review: Uses port + 100 (e.g., if prod is 3306, review is 3406)
 *
 * Environment Identifier:
 * ENVIRONMENT_ID is set automatically based on deployment type:
 * - 'review-${BUILD_NUMBER}' for feature branch deployments
 * - 'prod' for production deployments
 *
 * Jenkins Security Management:
 * - Sensitive data (passwords, tokens) stored as Jenkins credentials
 * - Non-sensitive data configurable via pipeline parameters
 * - Credentials are automatically masked in logs
 * - Parameters can be modified per build
 * - Some values are overridden for specific deployment types
 *
 * DevOps Learning Points:
 * 1. Continuous Integration (CI):
 *    - Automated testing on every code change
 *    - Code quality checks (linting and formatting)
 *    - Regular integration into the main branch
 *    - Containerized test environments for consistency
 * 
 * 2. Continuous Deployment (CD):
 *    - Automated deployments to different environments
 *    - Feature branch deployments for review
 *    - Production deployments from main branch
 *    - Environment-specific configurations
 * 
 * 3. Best Practices:
 *    - Environment separation (review vs prod)
 *    - Port isolation between environments
 *    - Automated cleanup of resources
 *    - Version tagging for traceability
 *    - Secure credential management
 *    - Parameterized builds for flexibility
 *    - Consistent test environments using containers
 */

pipeline {
    // Use the same Jenkins agent for all stages
    // This ensures consistent environment and workspace across the pipeline
    agent any

    parameters {
        // Application parameters
        string(name: 'APP_API_PORT', defaultValue: '3001', description: 'Port number for the application API')
        
        // Database parameters
        string(name: 'MARIADB_DATABASE', defaultValue: 'planitlh', description: 'Name of the application database')
        string(name: 'MARIADB_USER', defaultValue: 'lhuser', description: 'Database user for application')
        string(name: 'MARIADB_PORT', defaultValue: '3306', description: 'Port number for MariaDB')
    }

    environment {
        // Sensitive data stored as credentials
        APP_API_TOKEN = credentials('app-api-token')
        MARIADB_ROOT_PASSWORD = credentials('mariadb-root-password')
        MARIADB_PASSWORD = credentials('mariadb-password')
        MARIADB_HOST = 'host.docker.internal'
        // Environment identifier
        // Will be overridden in Review and Production stages
        ENVIRONMENT_ID = "${env.BRANCH_NAME == 'main' ? 'prod' : env.BRANCH_NAME == 'develop' ? 'test' : 'review-${env.BUILD_NUMBER}'}"
        
        TESTCONTAINERS_RYUK_DISABLED = true  
    }

    triggers {
        // Continuous Integration: Regular polling of source code
        // 'H' allows Jenkins to distribute load by picking a random minute within the 5-minute window
        pollSCM('H/5 * * * *')
    }

    options {
        // Build retention strategy:
        // - Main branch: Keep 10 builds (production history)
        // - Feature branches: Keep 3 builds for 2 days (temporary work)
        // This helps manage disk space while maintaining useful history
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
                    corepack prepare yarn@4.5.3 --activate
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
                sh 'yarn test -t @unit'
            }
            post {
                always {
                    // Remove test suites that don't contain @unit tests from junit.xml before publishing
                    sh '''
                        # Create temp file
                        cp test-results/junit.xml test-results/junit.tmp.xml
                        
                        # Remove testsuite elements not containing @unit
                        xmlstarlet ed -d "//testsuite[not(contains(@name,'@unit'))]" test-results/junit.tmp.xml > test-results/junit.xml
                        
                        # Clean up temp file
                        rm test-results/junit.tmp.xml
                    '''
                    junit 'test-results/junit.xml'
                    sh 'rm -rf test-results'
                }
            }
        }

        stage('Deploy Review Environment') {
            environment {
                ENVIRONMENT_ID = "review-${env.BUILD_NUMBER}"
                MARIADB_PORT = "${4000 + (BUILD_NUMBER.toInteger() % 1000)}" // Prevent port number from getting too large
            }
            steps {
                sh 'yarn db:down -v || true'
                sh 'yarn db:up'
            }
        }

        // Stage 5: Integration Testing
        stage('Integration Tests') {
            environment {
                ENVIRONMENT_ID = "review-${env.BUILD_NUMBER}"
                MARIADB_PORT = "${4000 + (BUILD_NUMBER.toInteger() % 1000)}" // Prevent port number from getting too large
            }
            steps {
                sh 'yarn test -t "@api|@db"'
            }
            post {
                always {
                    // Remove test suites that don't contain @api or @db tests from junit.xml before publishing
                    sh '''
                        # Create temp file
                        cp test-results/junit.xml test-results/junit.tmp.xml
                        
                        # Remove testsuite elements not containing @api or @db
                        xmlstarlet ed -d "//testsuite[not(contains(@name,'@api') or contains(@name,'@db'))]" test-results/junit.tmp.xml > test-results/junit.xml
                        
                        # Clean up temp file
                        rm test-results/junit.tmp.xml
                    '''
                    junit 'test-results/junit.xml'
                    sh 'yarn db:down -v || true'
                }
            }
        }

        // Stage 6: Container Image Building
        stage('Build') {
            steps {
                // Build Docker images using docker-compose
                // This creates consistent, reproducible environments
                sh 'docker compose build'
            }
        }

        // Stage 7: Review Environment Deployment
        stage('Deploy Test Environment') {
            when {
                // Only deploy the test environment for feature the develop branch
                // This enables testing and review before merging to main
                branch 'develop'
            }
            steps {
                script {
                    // Clean up any previous test environment
                    sh '''
                        docker compose down --remove-orphans
                        docker compose up --wait -d
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
                    // Clean up existing deployment
                    sh 'docker compose down --remove-orphans'
                    sh 'docker compose up --wait -d'
                    
                    // Create a git tag for deployment traceability
                    // This helps track what code is in production
                    // sh """
                    //     git tag -a "deploy-\$(date +%Y%m%d-%H%M%S)" -m "Production deployment"
                    //     git push origin --tags
                    // """
                    echo "Production deployment complete"
                    echo "API available on port: ${params.APP_API_PORT}"
                    echo "Database available on port: ${params.MARIADB_PORT}"
                }
            }
        }
    }

    // Post-build actions
    post {
        // Always perform these actions
        always {
            // Clean up test artifacts to save disk space
            cleanWs(patterns: [[pattern: 'test-results/**', type: 'INCLUDE']])
        }
    }
}
