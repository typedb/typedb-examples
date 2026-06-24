
package(default_visibility = ["//visibility:public"])

load("@rules_pkg//:mappings.bzl", "pkg_files")

pkg_files(
    name = "agentic-healthcare-dataset",
    srcs = [
        ":schema.tql",
        ":data.tql",
    ],
    renames = {
        ":schema.tql": "agentic-healthcare-schema.tql",
        ":data.tql": "agentic-healthcare-data.tql",
    },
)
