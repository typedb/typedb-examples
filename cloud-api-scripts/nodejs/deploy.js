main();

async function main() {
    const clientId = process.env.TYPEDB_CLOUD_CLIENT_ID;
    const clientSecret = process.env.TYPEDB_CLOUD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("TYPEDB_CLOUD_CLIENT_ID or TYPEDB_CLOUD_CLIENT_SECRET not found");
        process.exit(1);
    }

    if (process.argv.length != 6) {
        console.error("Usage: node deploy.ts <team_id> <space_id> <region> <cluster_id>");
        process.exit(1);
    }

    const teamId = process.argv[2];
    const spaceId = process.argv[3];
    const region = process.argv[4];
    const clusterId = process.argv[5];

    const accessToken = await getAccessToken(clientId, clientSecret);

    const clusterConfig = {
        id: clusterId,
        serverCount: 1,
        storageSizeGB: 10,
        provider: "gcp",
        region: region,
        isFree: true,
        machineType: "c2d-highcpu-2",
        storageType: "standard-rwo",
        version: "latest"
    };

    let response = await deployCluster(accessToken, teamId, spaceId, clusterConfig);

    while (response.status != "running") {
        console.log("\nSleeping...\n");
        await new Promise((resolve) => { setTimeout(resolve, 15_000); });
        response = await getCluster(accessToken, teamId, spaceId, clusterId);
    }
}

async function getAccessToken(clientId, clientSecret) {
    const url = "https://cloud.typedb.com/api/v1/auth";
    const request = new Request(
        url, {
            method: "POST",
            headers: {Authorization: `Basic ${clientId}:${clientSecret}`}
        }
    );

    return fetch(request).then(async res => {
        if (!res.ok) throw Error(await res.text());
        return res.text();
    });
}

async function deployCluster(accessToken, teamId, spaceId, clusterConfig) {
    const url = `https://cloud.typedb.com/api/v1/team/${teamId}/spaces/${spaceId}/clusters/deploy`;
    const request = new Request(
        url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clusterConfig),
        },
    );

    return fetch(request).then(async res => {
        if (!res.ok) throw Error(await res.text());
        return res.json();
    });
}

async function getCluster(accessToken, teamId, spaceId, clusterId) {
    const url = `https://cloud.typedb.com/api/v1/team/${teamId}/spaces/${spaceId}/clusters/${clusterId}`;
    const request = new Request(
        url, {
            method: "GET",
            headers: {Authorization: `Bearer ${accessToken}`},
        },
    );

    return fetch(request).then(async res => {
        if (!res.ok) throw Error(await res.text());
        return res.json();
    });
}
