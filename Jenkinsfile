// ============================================================
//  Nova Store E2E — Jenkins Declarative Pipeline
//  Runs Playwright tests on a Windows Local Jenkins Agent
// ============================================================

pipeline {

    agent {
        label 'local'
    }

    parameters {
        choice(name: 'ENV',
               choices: ['local', 'dev', 'qa', 'prod'],
               description: 'Target environment')

        choice(name: 'SUITE',
               choices: ['all', 'smoke', 'regression'],
               description: 'Which suite to run')

        choice(name: 'BROWSER',
               choices: ['chromium', 'firefox', 'webkit', 'all'],
               description: 'Browser project')
    }
    environment {
        ENV = "${params.ENV}"
        CI  = "true"
        // Deployed target: skip the local webServer block entirely.
        NO_WEBSERVER = "${params.ENV == 'prod' ? '1' : ''}"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'npm ci'
                bat 'npm run app:install'
            }
        }

        stage('Install Browsers') {
            steps {
                bat 'npx playwright install --with-deps chromium'
            }
        }

        stage('Lint') {
            steps {
                // Do not fail the build if no lint script is defined.
                bat 'npm run lint --if-present'
            }
        }

        stage('Wake API') {
            when { expression { params.ENV == 'prod' } }
            steps {
                // Render free tier sleeps after 15 min idle; the first
                // request can take ~30s. Absorb that here, not in a test.
                bat '''
                    curl -s -m 90 https://novastore-fk1k.onrender.com/api/health
                    exit /b 0
                '''
            }
        }

        stage('Run Playwright Tests') {
            steps {
                script {

                    def suiteFlag = ''

                    if (params.SUITE == 'smoke') {
                        suiteFlag = '--grep @smoke'
                    } else if (params.SUITE == 'regression') {
                        suiteFlag = '--grep @regression'
                    }

                    def browserFlag = ''

                    if (params.BROWSER != 'all') {
                        browserFlag = "--project=${params.BROWSER}"
                    }

                    // Prod shares one live dataset across tests, so run
                    // serially to avoid cross-test interference.
                    def workerFlag = (params.ENV == 'prod') ? '--workers=1' : ''

                    bat "npx playwright test ${suiteFlag} ${browserFlag} ${workerFlag}"
                }
            }
        }
    }

    post {

        always {

            junit allowEmptyResults: true,
                  testResults: 'results/junit.xml'

            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])

            archiveArtifacts(
                artifacts: 'playwright-report/**,results/**,test-results/**',
                allowEmptyArchive: true,
                fingerprint: true
            )
        }

        failure {
            echo "Tests failed on ENV=${params.ENV} — see the Playwright Report."
        }

        cleanup {
            cleanWs()
        }
    }
}