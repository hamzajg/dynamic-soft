#!/bin/bash

# Function to display help message
display_help() {
    echo "Usage: cli-tool.sh [OPTIONS]"
    echo "Supported commands:"
    echo "  create-solution      : Create a new solution"
    echo "  create-project       : Create a new project"
    echo "  framework-migration  : Migrate framework version"
    echo "  add-domain           : Add a new domain"
    echo "  add-application-service : Add a new application service"
    echo "  add-domain-service   : Add a new domain service"
    echo "  add-controller       : Add a new controller"
    echo "  add-endpoint         : Add a new endpoint"
    echo "  add-event-publisher  : Add a new event publisher"
    echo "  add-event-consumer   : Add a new event consumer"
    echo "  add-command          : Add a new command"
    echo "  add-query            : Add a new query"
    echo "  add-acceptance-test  : Add a new acceptance test"
    echo "  add-unit-test        : Add a new unit test"
    echo "  add-integration-test : Add a new integration test"
    echo
    echo "Options:"
    echo "  -h, --help           : Display this help message"
}

# Check if the help option is provided
if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    display_help
    exit 0
fi