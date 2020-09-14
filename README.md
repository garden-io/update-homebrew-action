# Update Homebrew Action

> EXPERIMENTAL: please don't use this in production.

This action pushes a new release to a Homebrew tap.

---

## Use case

You might find this action useful if:

- You have a separate repository for your Homebrew formula and you want to update it whenever you release a new version of your tool
- In the main repo of your tool you store a template your Formula (see `examples/homebrew-formula.rb`)
- You need to automate the update of the version, hash and url to executables in your formula.

## Inputs

### `packageName`

**Required** Your homebrew package name.

### `templatePath`

**Required** The path for the homebrew formula handlebar template. Default `"support/homebrew-formula.rb"`.

### `tapRepo`

**Required** The Homebrew Tap repo (`org/repo_name`).

### `srcRepo`

**Required** The repo of the source. Default: to current context repo

### `authToken`

**Required** The auto-generate `GITHUB_TOKEN` from the secrets.

## Example usage

```yaml
uses: garden-io/update-homebrew-action@v1
with:
  packageName: 'garden-cli'
  templatePath: 'support/homebrew-formula.rb'
  tapRepo: 'garden-io/homebrew-garden'
  srcRepo: 'garden-io/garden'
  authToken: ${{ secrets.GITHUB_TOKEN }}
```

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md)