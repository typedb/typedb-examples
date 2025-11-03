#!/usr/bin/env bash

set -e

# Check if the required environment variables are set
if [ -z "$TYPEDB_CLOUD_CLIENT_ID" ] || [ -z "$TYPEDB_CLOUD_CLIENT_SECRET" ]; then
    echo "Error: TYPEDB_CLOUD_CLIENT_ID and TYPEDB_CLOUD_CLIENT_SECRET environment variables must be set"
    exit 1
fi

# Check if the required arguments are provided
if [[ "$#" -ne 4 ]]; then
    echo "Usage: $0 <team_id> <space_id> <region> <cluster_id>"
    exit 1
fi

TEAM_ID=$1
SPACE_ID=$2
REGION=$3
CLUSTER_ID=$4

# Get a short-lived access token
TYPEDB_CLOUD_ACCESS_TOKEN=$(
  curl --request POST \
    --url https://cloud.typedb.com/api/auth \
    --header "Authorization: Basic $TYPEDB_CLOUD_CLIENT_ID:$TYPEDB_CLOUD_CLIENT_SECRET"
)
  
CLUSTER_CONFIG="{
  \"id\":\"$CLUSTER_ID\",
  \"serverCount\":1,
  \"storageSizeGB\":10,
  \"provider\":\"gcp\",
  \"region\":\"$REGION\",
  \"isFree\":true,
  \"machineType\":\"c2d-highcpu-2\",
  \"storageType\":\"standard-rwo\",
  \"version\":\"3.5.5\"
}"

# Deploy the cluster
CLUSTER_RES=$(
  curl --request POST \
    --url "https://cloud.typedb.com/api/team/$TEAM_ID/spaces/$SPACE_ID/clusters/deploy" \
    --header "Authorization: Bearer $TYPEDB_CLOUD_ACCESS_TOKEN" \
    --json "$CLUSTER_CONFIG"
)

# Wait for the cluster to be up and running
while [[ $(echo $CLUSTER_RES | jq -r '.status') != 'running' ]]; do
  if [[ $(echo $CLUSTER_RES | jq -r '.message') != null ]]; then
    echo "Error: $(echo $CLUSTER_RES | jq -r '.message')"
    exit 1
  fi
  echo
  echo "Sleeping..."
  echo
  sleep 15
  CLUSTER_RES=$(curl --request GET \
    --url https://cloud.typedb.com/api/team/$TEAM_ID/spaces/$SPACE_ID/clusters/$CLUSTER_ID \
    --header "Authorization: Bearer $TYPEDB_CLOUD_ACCESS_TOKEN")
done
