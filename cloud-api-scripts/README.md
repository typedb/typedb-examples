# Cloud API Scripts

This section contains scripts for interacting with the TypeDB Cloud API,
specifically for deploying a new TypeDB cluster.

The examples are presented in three languages - bash, python, and node.js

All examples required a Cloud API token, 
which can be acquired from the [team settings](https://cloud.typedb.com/?team_action=/settings#api-tokens) page. 

## Bash

The bash script is located at `cloud-api-scripts/bash/deploy.sh`.

Example usage:
```bash
export TYPEDB_CLOUD_CLIENT_ID=...
export TYPEDB_CLOUD_CLIENT_SECRET=...

./deploy.sh my-team my-space gcp europe-west2 api-cluster
```

## Python

The python script is located at `cloud-api-scripts/python/main.py`.

It was built using `uv`, and is designed to be run with it - 
however it can also be run with a standard python installation.

Example usage:

With `uv`:
```bash
export TYPEDB_CLOUD_CLIENT_ID=...
export TYPEDB_CLOUD_CLIENT_SECRET=...

uv run my-team my-space gcp europe-west2 api-cluster
```

Without `uv`
```bash
export TYPEDB_CLOUD_CLIENT_ID=...
export TYPEDB_CLOUD_CLIENT_SECRET=...

python -m venv .venv
source .venv/bin/activate
python -m pip install . 
python main.py my-team my-space gcp europe-west2 api-cluster
```

## Node.js

The node.js script is located at `cloud-api-scripts/bash/deploy.js`.

Example usage:
```bash
export TYPEDB_CLOUD_CLIENT_ID=...
export TYPEDB_CLOUD_CLIENT_SECRET=...

node deploy.js my-team my-space gcp europe-west2 api-cluster
```
