# TJMC Electron-Builder Action
This action helps you to build cross-platform electron apps with [`electron-builder`](https://github.com/electron-userland/electron-builder) package

## Inputs
### `gh_token`
**Required** GitHub authentication token.
### `mac_cert`
Base64-encoded code signing certificate for macOS.
### `mac_cert_password`
Password for decrypting `mac_cert`.
### `windows_cert`
Base64-encoded code signing certificate for Windows.
### `windows_cert_password`
Password for decrypting `windows_cert`.
### `release`
Whether the app should be released after a successful build.
### `args`
Other arguments to pass to the `electron-builder` command, e.g. configuration overrides

## Example usage
```yaml
name: Build
on: push
jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    steps:
      - name: Check out Git repository
        uses: actions/checkout@v3
      - name: Use Node.js Setup
        uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Build Electron App
        uses: tjmcraft/action-electron-builder@main
        with:
          # GitHub token, automatically provided to the action
          # (No need to define this secret in the repo settings)
          gh_token: ${{ secrets.github_token }}
          # If the commit is tagged with a version (e.g. "v1.0.0"),
          # release the app after building
          release: ${{ startsWith(github.ref, 'refs/tags/v') }}
```
