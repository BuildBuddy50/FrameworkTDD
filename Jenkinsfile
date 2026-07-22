// ============================================================
//  Nova Store E2E — Jenkins Declarative Pipeline
//  Runs Playwright POM tests inside the official Playwright
//  Docker image (browsers + deps preinstalled).
// ============================================================
pipeline {
  agent {
    label 'local'
  }

  parameters {
    choice(name: 'ENV', choices: ['local', 'dev', 'qa'], description: 'Target environment')
    choice(name: 'SUITE', choices: ['all', 'smoke', 'regression'], description: 'Which suite to run')
    choice(name: 'BROWSER', choices: ['chromium', 'firefox', 'webkit', 'all'], description: 'Browser project')
  }
  environment {
    ENV = "${params.ENV}"
    CI  = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'node --version && npm --version'
        sh 'npm ci'
        // Install the app-under-test's runtime deps.
        sh 'npm run app:install'
      }
    }

    stage('Type check') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Run tests') {
      steps {
        script {
          def suiteFlag = ''
          if (params.SUITE == 'smoke')      { suiteFlag = '--grep @smoke' }
          else if (params.SUITE == 'regression') { suiteFlag = '--grep @regression' }

          def browserFlag = ''
          if (params.BROWSER != 'all') { browserFlag = "--project=${params.BROWSER}" }

          sh "npx playwright test ${suiteFlag} ${browserFlag}"
        }
      }
    }
  }

  post {
    always {
      // JUnit results for the Jenkins test-trend graph.
      junit allowEmptyResults: true, testResults: 'results/junit.xml'

      // Publish the Playwright HTML report (needs HTML Publisher plugin).
      publishHTML(target: [
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'Playwright Report'
      ])

      // Archive traces/screenshots/videos for debugging failures.
      archiveArtifacts artifacts: 'playwright-report/**, results/**, test-results/**',
                       allowEmptyArchive: true, fingerprint: true
    }
    failure {
      echo 'Tests failed — see the Playwright Report and archived traces.'
    }
    cleanup {
      cleanWs()
    }
  }
}
