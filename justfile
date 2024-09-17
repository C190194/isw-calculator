lint:
    cargo fmt --all
    cargo clippy --workspace --all-targets -- -D warnings
    cargo doc --no-deps --workspace --document-private-items

changelog:
    git cliff -o CHANGELOG.md

# should make sure the workspace is clean
tag tag:
    git cliff --tag {{tag}} -o CHANGELOG.md
    # replace the version in Cargo.toml
    sed -i "s/^version = .*/version = \"{{tag}}\"/" ./src-tauri/Cargo.toml
    sed -i "s/\"version\": \".*\"/\"version\": \"{{tag}}\"/" ./src-tauri/tauri.conf.json
    sed -i "s/\"version\": \".*\"/\"version\": \"{{tag}}\"/" ./package.json
    cd src-tauri && cargo check
    git add CHANGELOG.md src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json package.json
    git commit -m "chore(release): prepare for {{tag}}"
    git tag -a {{tag}} -m "release v{{tag}}"

push:
    git push
    git push --tags