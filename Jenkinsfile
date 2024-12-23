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
 * Each sensitive value is stored as a separate Jenkins credential for better security
 * 
 * Application Credentials:
 * - app-api-token: Security token for API authentication
 * - app-api-port: Port number for the application API
 *   - Production: Uses the port specified in credentials
 *   - Review: Uses port + 100 (e.g., if prod is 3000, review is 3100)
 *
 * Database Credentials:
 * - mariadb-root-password: Root password for MariaDB
 * - mariadb-user: Database user for application
 * - mariadb-password: Database user's password
 * - mariadb-database: Name of the application database
 * - mariadb-port: Port number for MariaDB
 *   - Production: Uses the port specified in credentials
 *   - Review: Uses port + 100 (e.g., if prod is 3306, review is 3406)
 *
 * Note: ENVIRONMENT_ID is automatically set by the pipeline stages
 * - 'review-${BUILD_NUMBER}' for feature branch deployments
 * - 'prod' for production deployments
 *
 * Jenkins Credentials Management:
 * - Each credential is stored separately for fine-grained access control
 * - Credentials are automatically masked in logs
 * - Values are securely injected into the pipeline environment
 * - Using individual credentials follows the principle of least privilege
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
 * 
 * 3. Best Practices:
 *    - Environment separation (review vs prod)
 *    - Port isolation between environments
 *    - Automated cleanup of resources
 *    - Version tagging for traceability
 *    - Secure credential management with individual secrets
 *    - Consistent test environments using containers
 */

pipeline {
    // Use the same Jenkins agent for all stages
    // This ensures consistent environment and workspace across the pipeline
    agent any

    environment {
        // Load the environment file containing all variables
        // This file includes all application configurations
        DOCKER_COMPOSE_ENV = credentials('speedrun-app-env')
        
        // Extract all environment variables from the credentials file
        // This makes them available to the pipeline and docker-compose
        VARS = """
            set +x  # Prevent credentials from being shown in logs
            . ${DOCKER_COMPOSE_ENV}
            env > .env
            rm ${DOCKER_COMPOSE_ENV}
        """
        
        // Disable Testcontainers Ryuk container for cleanup
        // We handle cleanup ourselves in the post section
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
                
                // Load environment variables from credentials
                sh """
                    ${VARS}
                """
            }
        }
        
        // Stage 2: Development Environment Setup
        stage('Setup') {
            steps {
                // Setup Node.js package management using corepack
                // This ensures consistent package manager versions across builds
                sh '''
                    source .env
                    corepack enable
                    corepack prepare yarn@4.5.3 --activate
                    yarn install
                    yarn tsoa
                '''
            }
        }

        // Stage 3: Code Quality Checks
        stage('Lint & Format Check') {
            steps {
                // Static code analysis and style checking
                // These checks ensure code consistency and catch potential issues early
                sh '''
                    source .env
                    yarn lint
                    yarn format:check
                '''
            }
        }

        // Stage 4: Unit Testing
        stage('Unit Tests') {
            steps {
                // Run unit tests for all branches
                // '@unit' tag helps categorize and run specific test types
                sh '''
                    source .env
                    yarn test -t "@unit"
                '''
            }
            post {
                // Archive test results for Jenkins to track test history
                // This enables test trend analysis and reporting
                always {
                    junit 'test-results/junit.xml'
                }
            }
        }

        // Stage 5: Integration Testing
        stage('Integration Tests') {
            steps {
                // Run integration tests that verify component interactions
                // '@api' and '@db' tags indicate tests that check API and database functionality
                sh '''
                    source .env
                    yarn test -t "@api|@db"
                '''
            }
            post {
                always {
                    junit 'test-results/junit.xml'
                }
            }
        }

        // Stage 6: Container Image Building
        stage('Build') {
            steps {
                // Build Docker images using docker-compose
                // This creates consistent, reproducible environments
                sh '''
                    source .env
                    docker compose build
                '''
            }
        }

        // Stage 7: Review Environment Deployment
        stage('Deploy Review') {
            when {
                // Only deploy review environments for feature branches
                // This enables testing and review before merging to main
                expression { BRANCH_NAME != 'main' && BRANCH_NAME.startsWith('feature/') }
            }
            steps {
                script {
                    // Clean up any previous review environment
                    sh '''
                        source .env
                        docker compose down || true
                        
                        # Calculate review environment ports (prod ports + 100)
                        export ENVIRONMENT_ID=review-${BUILD_NUMBER}
                        export APP_API_PORT=$((APP_API_PORT + 100))
                        export MARIADB_PORT=$((MARIADB_PORT + 100))
                        docker compose up --build --wait -d
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
                    sh '''
                        source .env
                        docker compose down || true
                        
                        export ENVIRONMENT_ID=prod
                        docker compose up --build --wait -d
                    '''
                    
                    // Create a git tag for deployment traceability
                    // This helps track what code is in production
                    sh """
                        git tag -a "deploy-\$(date +%Y%m%d-%H%M%S)" -m "Production deployment"
                        git push origin --tags
                    """
                    echo "Production deployment complete"
                    echo "API available on port: ${APP_API_PORT}"
                    echo "Database available on port: ${MARIADB_PORT}"
                }
            }
        }
    }

    // Post-build actions
    post {
        // Handle pipeline failures
        failure {
            node('') {
                // Ensure cleanup of resources even if the pipeline fails
                // This prevents resource leaks and stuck environments
                sh '''
                    source .env || true
                    docker compose down || true
                '''
            }
        }
        // Always perform these actions
        always {
            node('') {
                // Clean up test artifacts to save disk space
                cleanWs(patterns: [[pattern: 'test-results/**', type: 'INCLUDE']])
            }
        }
    }
}
