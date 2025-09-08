# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("@typedb_bazel_distribution//common:rules.bzl", "assemble_versioned", "assemble_zip", "assemble_targz")
load("@typedb_bazel_distribution//common/tgz2zip:rules.bzl", "tgz2zip")

load("@typedb_bazel_distribution//github:rules.bzl", "deploy_github")

load("//:deployment.bzl", deployment = "deployment")

pkg_tar(
    name = "typedb-examples-usecase-datasets-tar",
    srcs = [
        "//use-cases/bookstore:bookstore-dataset",
        "//use-cases/social-network:social-network-dataset",
        "//use-cases/identity-and-access-management:iam-dataset",
    ],
)

assemble_targz(
    name = "typedb-example-usecase-datasets-targz",
    targets = [
        "typedb-examples-usecase-datasets-tar",
    ],
)

tgz2zip(
    name = "typedb-example-usecase-datasets-zip",
    tgz = ":typedb-example-usecase-datasets-targz",
    output_filename = "typedb-example-usecase-datasets"
)

deploy_github(
    name = "deploy-github",
    release_description = "//:RELEASE_NOTES_LATEST.md",
    title = "TypeDB Example Datasets",
    title_append_version = True,
    organisation = deployment['github.organisation'],
    repository = deployment['github.repository'],
    draft = False,
    archive = ":typedb-example-usecase-datasets-zip"
)
