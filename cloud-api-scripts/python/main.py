import requests
import os
import sys
import time

def main():
    client_id = os.getenv("TYPEDB_CLOUD_CLIENT_ID")
    client_secret = os.getenv("TYPEDB_CLOUD_CLIENT_SECRET")

    team_id = sys.argv[1]
    space_id = sys.argv[2]
    region = sys.argv[3]
    cluster_id = sys.argv[4]

    access_token = get_access_token(client_id, client_secret)

    cluster_config = {
        "id": cluster_id,
        "serverCount": 1,
        "storageSizeGB": 10,
        "provider": "gcp",
        "region": region,
        "isFree": True,
        "machineType": "c2d-highcpu-2",
        "storageType": "standard-rwo",
        "version": "3.5.5"
    }

    response = deploy_cluster(access_token, team_id, space_id, cluster_config)

    while response["status"] != "RUNNING":
        print("\nSleeping...\n")
        time.sleep(15)
        response = get_cluster(access_token, team_id, space_id, cluster_id)

def get_access_token(client_id, client_secret):
    url = "https://cloud.typedb.com/api/auth"

    headers = {
        "Authorization": f"Basic {client_id}:{client_secret}"
    }

    response = requests.post(url, headers=headers)
    response.raise_for_status()
    return response.text

def deploy_cluster(access_token, team_id, space_id, cluster_config):
    url = f"https://cloud.typedb.com/api/team/{team_id}/spaces/{space_id}/clusters/deploy"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.post(url, headers=headers, json=cluster_config)
    response.raise_for_status()

    return response.json()

def get_cluster(access_token, team_id, space_id, cluster_id):
    url = f"https://cloud.typedb.com/api/team/{team_id}/spaces/{space_id}/clusters/{cluster_id}"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    return response.json()

if __name__ == "__main__":
    main()
