# Docker | Playwright
# https://playwright.dev/docs/docker
ARG IMAGE=mcr.microsoft.com/playwright:v1.22.0-focal

FROM ${IMAGE}

ARG WORK_DIR="/app"
RUN mkdir -p ${WORK_DIR}

WORKDIR ${WORK_DIR}
COPY . ${WORK_DIR}

RUN npm i -D playwright