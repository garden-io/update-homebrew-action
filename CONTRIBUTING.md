# CONTRIBUTING

## Install dependencies

We require node `v12.x`. Please make sure you are running the right version.

```sh
npm install
```

## Develop

We use Typescript. The entry file is `src/main.ts`.

## Build

```sh
npm run build
```

The command above will create a `lib` folder with the compiled javascript output.

## Release a new version

A GitHub action will need to bundle all its dependencies. To avoid cluttering the main branch, the `node_modules` folder is ignored on `master` and included in the `release/v1` branch.

To create a new release please follow these steps:

- Implement your changes and open a PR against the `master` branch.
- Once your changes are on `master`, open a new PR from `master` to `release/v1`.
- Once `release/v1` contains your changes, check out the branch on your machine and update the `node_modules`, if necessary.
- Create a new release from the top of `release/v1`.

This process needs to be updated to avoid versioning the `node_modules`, the [GitHub docs](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github) suggest to use `@vercel/ncc` to package output files and their dependencies into one file.

The full process could also be scripted.

## Todo

- [ ] Install `ncc` to bundle everything in one file and remove `release/v1` branches.
- [ ] Write a release script.
