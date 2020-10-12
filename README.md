# Update Homebrew Action

> EXPERIMENTAL: please don't use this in production.

This action pushes a new release to a Homebrew tap.

---

## Use case

You might find this action useful if:

- You have a separate repository for your Homebrew formula and you want to update it whenever you release a new version of your tool.
- In the main repo of your tool you store a template for your Formula (see the [Formula template example](#Example-of-a-valid-formula-template) below).
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

The following is an example of how to use the action from a GitHub Workflow.

```yaml
name: Update Homebrew Formula

on:
  release:
    types: [published]

jobs:
  homebrew-release:
    runs-on: macOS-latest
    steps:
      - name: Release Homebrew Formula
          if: github.event.release.prerelease != true
          uses: garden-io/update-homebrew-action@v1
          with:
            packageName: 'garden-cli'
            templatePath: 'support/homebrew-formula.rb'
            tapRepo: 'garden-io/homebrew-garden'
            srcRepo: 'garden-io/garden'
            authToken: ${{ secrets.GITHUB_TOKEN }}
```

## Example of a valid formula template

The following is an example of the template for the formula the action expects to find in the main repo of your tool.

```ruby
# Formula-template.rb

class NameOfTool < Formula
  desc "This fields contains a description for your formula"
  homepage "http://example.com"
  url "{{{tarballUrl}}}"
  version "{{version}}"
  sha256 "{{sha256}}"

  depends_on "a_dependency"

  def install
    # some installation steps
  end

  test do
    # some test steps
  end
end

```

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md)