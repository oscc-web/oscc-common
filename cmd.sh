#!/usr/bin/env bash

set -e

displayHelp() {
    echo "Commands:"
    echo "help                 Help"
    echo "build-local          Build website for local"
    echo "build-deploy         Build website for deployment"
    echo "dev                  Run website in development mode"
    echo "deploy               Deploy website to remote server"
    echo "clean-dev            Clean cache and run website in development mode "
    echo "update-vp            Update vuepress version"
}

runSetup() {
    ./setup.sh
}

runBuildLocal() {
    if [ -e mkdocs.yml ]; then
        rm -rf site && make build
    else
        rm -rf src/.vuepress/.temp && vuepress build src
    fi
}

runBuildDeployPre() {
    mkdir -p var
}

runBuildDeployAft() {
    if [ -e mkdocs.yml ]; then
        rm -rf var/dist && mkdir var/dist && cp -rv site/* var/dist
    else
        rm -rf var/dist && cp -rv src/.vuepress/dist/ var/ &&
        rm -rf var/dist/res/.git
    fi

    if grep -q "imagemin" package.json; then
        echo -e "\nOptimizing images..."
        node ./common/opt/imagemin.js
    else
        echo -e ""
    fi
}

runDev() {
    if [ -e mkdocs.yml ]; then
        make serve
    else
        vuepress dev src
    fi
}

runDeploy() {
    node ./common/deploy/index.mjs
}

runClean() {
    vuepress dev src --clean-cache
}

runUpdateVP() {
    npx vp-update
}

runUpdateRepo() {
    git pull
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
    "update-vp")
        runUpdateVP
        ;;
    *)
        echo "Unknown commands: "$1"" >&2
        echo ""
        displayHelp >&2
        exit 1
        ;;
esac

unset LTC_DEBUG
