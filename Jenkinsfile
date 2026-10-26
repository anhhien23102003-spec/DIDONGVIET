pipeline {
  agent {
    label 'linux-docker'
  }

  environment {
    IMAGE_NAME = 'didong'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build image') {
      steps {
        sh 'docker build --platform linux/amd64 --tag "$IMAGE_NAME:$BUILD_NUMBER" .'
      }
    }

    stage('Smoke test') {
      steps {
        sh '''
          set -eu
          container="didong-ci-${BUILD_NUMBER}"
          cleanup() {
            docker rm -f "$container" >/dev/null 2>&1 || true
          }
          trap cleanup EXIT

          docker run --detach --name "$container" \
            --env PORT=5000 \
            --env DATA_DIR=/tmp/didong-data \
            "$IMAGE_NAME:$BUILD_NUMBER"

          for attempt in $(seq 1 30); do
            if docker exec "$container" node -e 'fetch("http://127.0.0.1:5000/").then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))'; then
              exit 0
            fi
            sleep 2
          done

          docker logs "$container"
          echo 'Application did not become ready within 60 seconds.' >&2
          exit 1
        '''
      }
    }

    stage('Deploy to EC2') {
      steps {
        withCredentials([string(credentialsId: 'shopphone-admin-password', variable: 'ADMIN_PASSWORD')]) {
          sh '''
            set -eu
            set +x
            umask 077

            env_file="$WORKSPACE/.didong-deploy-${BUILD_NUMBER}.env"
            cleanup() {
              rm -f "$env_file"
            }
            trap cleanup EXIT

            printf 'PORT=5000\\nNODE_ENV=production\\nDATA_DIR=/app/data\\nADMIN_EMAIL=admin@didongviet.vn\\nADMIN_PASSWORD=%s\\n' \
              "$ADMIN_PASSWORD" > "$env_file"

            wait_for_app() {
              container=$1
              for attempt in $(seq 1 30); do
                if docker exec "$container" node -e 'fetch("http://127.0.0.1:5000/").then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))'; then
                  return 0
                fi
                sleep 2
              done
              docker logs "$container" >&2 || true
              return 1
            }

            previous_image=$(docker inspect --format '{{.Config.Image}}' didong 2>/dev/null || true)
            docker rm --force didong >/dev/null 2>&1 || true

            if ! docker run --detach \
              --name didong \
              --restart unless-stopped \
              --publish 5000:5000 \
              --env-file "$env_file" \
              --volume didong-data:/app/data \
              "$IMAGE_NAME:$BUILD_NUMBER"; then
              if [ -n "$previous_image" ]; then
                docker run --detach \
                  --name didong \
                  --restart unless-stopped \
                  --publish 5000:5000 \
                  --env-file "$env_file" \
                  --volume didong-data:/app/data \
                  "$previous_image"
              fi
              exit 1
            fi

            if ! wait_for_app didong; then
              docker rm --force didong >/dev/null 2>&1 || true
              if [ -n "$previous_image" ]; then
                docker run --detach \
                  --name didong \
                  --restart unless-stopped \
                  --publish 5000:5000 \
                  --env-file "$env_file" \
                  --volume didong-data:/app/data \
                  "$previous_image"
              fi
              echo 'Application failed its health check; previous image was restored if available.' >&2
              exit 1
            fi
          '''
        }
      }
    }
  }
}
