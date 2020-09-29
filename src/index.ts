import * as core from "@actions/core"
import { getOctokit, context } from "@actions/github"
import { resolve } from "path"
import execa from "execa"
import handlebars from "handlebars"
import { writeFile, readFile, ensureDir, pathExists, remove } from "fs-extra"
import { find } from "lodash"
import { getUrlChecksum } from "./utils"

const { GITHUB_WORKSPACE } = process.env


async function run() {
  try {
    // const { context } = github

    const workspace = GITHUB_WORKSPACE || ""

    // TODO: implement better input validation
    const packageName = core.getInput("packageName")
    const templatePath = core.getInput("templatePath")
    const authToken = core.getInput("authToken")
    const tapRepo = core.getInput("tapRepo") // format: org/repo
    const srcRepo = core.getInput("srcRepo") || `${context.repo.owner}/${context.repo.repo}`

    const tmpDir = resolve(__dirname, "tmp")

    const octokit = getOctokit(authToken)

    console.log("Pulling the homebrew repo")
    await ensureDir(tmpDir)
    const brewRepoDir = resolve(tmpDir, tapRepo.split("/")[1])
    if (await pathExists(brewRepoDir)) {
      await remove(brewRepoDir)
    }
    await execa("git", ["clone", `git@github.com:${tapRepo}.git`], { cwd: tmpDir })

    // read the existing formula
    console.log("Reading currently published formula")
    const formulaDir = resolve(brewRepoDir, "Formula")
    await ensureDir(formulaDir)

    // compile the formula handlebars template
    const fullTemplatePath = resolve(workspace, templatePath)
    const templateString = (await readFile(fullTemplatePath)).toString()
    const template = handlebars.compile(templateString)

    // get the metadata from GitHub
    console.log("Preparing formula")

    // note: this excludes pre-releases
    const latestRelease = await octokit.request(`GET /repos/${srcRepo}/releases/latest`)

    const version = latestRelease.data.tag_name
    const releaseId = latestRelease.data.id

    const assets = await octokit.request(`GET /repos/${srcRepo}/releases/${releaseId}/assets`)

    const tarballUrl = find(assets.data, a => a.name.includes("macos")).browser_download_url
    const sha256 = await getUrlChecksum(tarballUrl, "sha256")

    const formula = template({
      version,
      tarballUrl,
      sha256,
    })

    const formulaPath = resolve(formulaDir, `${packageName}.rb`)
    const existingFormula = await pathExists(formulaPath) ? (await readFile(formulaPath)).toString() : ""

    if (formula === existingFormula) {
      console.log("No changes to formula")
    } else {
      console.log("Writing new formula to " + formulaPath)
      await writeFile(formulaPath, formula)

      // check if the formula is OK
      console.log("Auditing formula")
      await execa("brew", ["audit", formulaPath])

      console.log("Pushing to git")
      for (const args of [
        ["add", formulaPath],
        ["commit", "-m", `update to ${version}`],
        ["tag", version],
        ["push"],
        ["push", "--tags"],
      ]) {
        console.log(`Running: "git ${args.join(" ")}"`)
        await execa("git", args, { cwd: brewRepoDir })
      }
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
