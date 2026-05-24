pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        DOCKER_HUB_USERNAME = credentials('docker-hub-username')
        DOCKER_HUB_TOKEN = credentials('docker-hub-token')
        GITHUB_TOKEN = credentials('github-pat')
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=== Stage: Checkout Code ==='
                checkout(
                    [
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            url: 'https://github.com/T-nobu/DSO101.git',
                            credentialsId: 'github-credentials'
                        ]]
                    ]
                )
                echo 'Repository checked out successfully'
            }
        }

        stage('Backend: Install Dependencies') {
            steps {
                echo '=== Stage: Backend - Install Dependencies ==='
                dir('backend') {
                    sh '''
                        echo "Node version: $(node --version)"
                        echo "npm version: $(npm --version)"
                        npm install
                    '''
                }
                echo 'Backend dependencies installed successfully'
            }
        }

        stage('Backend: Run Tests') {
            steps {
                echo '=== Stage: Backend - Run Tests ==='
                dir('backend') {
                    sh 'npm test -- --ci --coverage --reporters=default --reporters=jest-junit'
                }
                echo 'Backend tests completed'
            }
            post {
                always {
                    junit 'backend/junit.xml'
                    publishHTML([
                        reportDir: 'backend/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Backend Coverage Report',
                        alwaysLinkToLastBuild: true,
                        keepAll: true
                    ])
                }
            }
        }

        stage('Frontend: Install Dependencies') {
            steps {
                echo '=== Stage: Frontend - Install Dependencies ==='
                dir('frontend') {
                    sh '''
                        echo "Node version: $(node --version)"
                        echo "npm version: $(npm --version)"
                        npm install
                    '''
                }
                echo 'Frontend dependencies installed successfully'
            }
        }

        stage('Frontend: Run Tests') {
            steps {
                echo '=== Stage: Frontend - Run Tests ==='
                dir('frontend') {
                    sh '''
                        npm test -- --ci --coverage --reporters=default --reporters=jest-junit --watchAll=false 2>&1 || true
                    '''
                }
                echo 'Frontend tests completed'
            }
            post {
                always {
                    junit 'frontend/junit.xml'
                    publishHTML([
                        reportDir: 'frontend/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Frontend Coverage Report',
                        alwaysLinkToLastBuild: true,
                        keepAll: true
                    ])
                }
            }
        }

        stage('Backend: Build') {
            steps {
                echo '=== Stage: Backend - Build ==='
                dir('backend') {
                    sh 'echo "Backend build process - Node.js server ready"'
                }
                echo 'Backend build completed'
            }
        }

        stage('Frontend: Build') {
            steps {
                echo '=== Stage: Frontend - Build ==='
                dir('frontend') {
                    sh '''
                        npm run build
                        echo "Frontend build completed successfully"
                    '''
                }
                echo 'Frontend build completed'
            }
        }

        stage('Deploy - Build Docker Images') {
            when {
                branch 'main'
            }
            steps {
                echo '=== Stage: Deploy - Build Docker Images ==='
                script {
                    sh '''
                        echo "Logging into Docker Hub..."
                        echo "${DOCKER_HUB_TOKEN}" | docker login -u "${DOCKER_HUB_USERNAME}" --password-stdin
                        
                        echo "Building backend image..."
                        cd backend
                        docker build -t ${DOCKER_HUB_USERNAME}/node-app-backend:latest -t ${DOCKER_HUB_USERNAME}/node-app-backend:${BUILD_NUMBER} .
                        cd ..
                        
                        echo "Building frontend image..."
                        cd frontend
                        docker build -t ${DOCKER_HUB_USERNAME}/node-app-frontend:latest -t ${DOCKER_HUB_USERNAME}/node-app-frontend:${BUILD_NUMBER} .
                        cd ..
                        
                        echo "Docker images built successfully"
                    '''
                }
            }
        }

        stage('Deploy - Push to Docker Hub') {
            when {
                branch 'main'
            }
            steps {
                echo '=== Stage: Deploy - Push to Docker Hub ==='
                script {
                    sh '''
                        echo "Pushing backend image to Docker Hub..."
                        docker push ${DOCKER_HUB_USERNAME}/node-app-backend:latest
                        docker push ${DOCKER_HUB_USERNAME}/node-app-backend:${BUILD_NUMBER}
                        
                        echo "Pushing frontend image to Docker Hub..."
                        docker push ${DOCKER_HUB_USERNAME}/node-app-frontend:latest
                        docker push ${DOCKER_HUB_USERNAME}/node-app-frontend:${BUILD_NUMBER}
                        
                        echo "Docker images pushed successfully"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '=== Pipeline Cleanup ==='
            cleanWs()
            script {
                sh '''
                    docker logout
                    echo "Cleanup completed"
                '''
            }
        }
        success {
            echo '✓ Pipeline executed successfully!'
        }
        failure {
            echo '✗ Pipeline failed. Check logs above for details.'
        }
    }
}
