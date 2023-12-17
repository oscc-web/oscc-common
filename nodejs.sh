#!/usr/bin/env bash

set -e

displayHelp() {
    echo "Commands: [help | build-local | build-deploy-pre | build-deploy-aft | build-deploy | dev | deploy | clean | update]"
    echo ""
    echo "help                 Help"
    echo "build-local          Build website for local"
    echo "build-deploy-pre     Build website for deployment (pretreatment)"
    echo "build-deploy-aft     Build website for deployment (aftertreatment)"
    echo "build-deploy         Build website for deployment"
    echo "dev                  Run website in development mode"
    echo "deploy               Deploy website to remote server"
    echo "clean-dev            Clean cache and run website in development mode "
    echo "update               Update vuepress version"
}

runBuildLocal() {
    rm -rf src/.vuepress/.temp && vuepress build src
}

runBuildDeployPre() {
    mkdir -p var
}

runBuildDeployAft() {
    rm -rf var/dist && cp -rv src/.vuepress/dist/ var/ &&
    rm -rf var/dist/res/.git
}

runDev() {
    vuepress dev src
}

runDeploy() {
    node ./common/deploy/index.mjs
}

runClean() {
    vuepress dev src --clean-cache
}

runUpdate() {
    npx vp-update
}

if [ "$1" = "--debug" ]; then
    export LTC_DEBUG=1
    shift
fi

[ -n "${LTC_DEBUG}" ] && set -x

case "$1" in
    "help")
        displayHelp
        ;;
    "build-local")
        runBuildLocal
        ;;
    "build-deploy-pre")
        runBuildDeployPre
        exit 0
        ;;
    "build-deploy-aft")
        runBuildDeployAft
        ;;
    "build-deploy")
        runBuildDeployPre
        runBuildLocal
        runBuildDeployAft
        ;;
    "dev")
        runDev
        ;;
    "deploy")
        runDeploy
        ;;
    "clean")
        runClean
        ;;
    "update")
        runUpdate
        ;;
    *)
        echo "Unknown commands: "$1"" >&2
        echo ""
        displayHelp >&2
        exit 1
        ;;
esac

unset LTC_DEBUG
