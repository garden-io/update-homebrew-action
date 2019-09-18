"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const path_1 = require("path");
const execa_1 = __importDefault(require("execa"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_extra_1 = require("fs-extra");
const lodash_1 = require("lodash");
const util_1 = require("./util");
const { GITHUB_WORKSPACE } = process.env;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { context } = github;
            const workspace = GITHUB_WORKSPACE || "";
            // TODO: implement better input validation
            const packageName = core.getInput("packageName");
            const templatePath = core.getInput("templatePath");
            const authToken = core.getInput("authToken");
            const tapRepo = core.getInput("tapRepo"); // format: org/repo
            const srcRepo = core.getInput("srcRepo") || `${context.repo.owner}/${context.repo.repo}`;
            const tmpDir = path_1.resolve(__dirname, "tmp");
            const octokit = new github.GitHub(authToken || "");
            console.log("Pulling the homebrew repo");
            yield fs_extra_1.ensureDir(tmpDir);
            const brewRepoDir = path_1.resolve(tmpDir, tapRepo.split("/")[1]);
            if (yield fs_extra_1.pathExists(brewRepoDir)) {
                yield fs_extra_1.remove(brewRepoDir);
            }
            yield execa_1.default("git", ["clone", `git@github.com:${tapRepo}.git`], { cwd: tmpDir });
            // read the existing formula
            console.log("Reading currently published formula");
            const formulaDir = path_1.resolve(brewRepoDir, "Formula");
            yield fs_extra_1.ensureDir(formulaDir);
            // compile the formula handlebars template
            const fullTemplatePath = path_1.resolve(workspace, templatePath);
            const templateString = (yield fs_extra_1.readFile(fullTemplatePath)).toString();
            const template = handlebars_1.default.compile(templateString);
            // get the metadata from GitHub
            console.log("Preparing formula");
            // note: this excludes pre-releases
            const latestRelease = yield octokit.request(`GET /repos/${srcRepo}/releases/latest`);
            const version = latestRelease.data.tag_name.slice(1);
            const releaseId = latestRelease.data.id;
            const assets = yield octokit.request(`GET /repos/${srcRepo}/releases/${releaseId}/assets`);
            const tarballUrl = lodash_1.find(assets.data, a => a.name.includes("macos")).browser_download_url;
            const sha256 = yield util_1.getUrlChecksum(tarballUrl, "sha256");
            const formula = template({
                version,
                tarballUrl,
                sha256,
            });
            const formulaPath = path_1.resolve(formulaDir, `${packageName}.rb`);
            const existingFormula = (yield fs_extra_1.pathExists(formulaPath)) ? (yield fs_extra_1.readFile(formulaPath)).toString() : "";
            if (formula === existingFormula) {
                console.log("No changes to formula");
            }
            else {
                console.log("Writing new formula to " + formulaPath);
                yield fs_extra_1.writeFile(formulaPath, formula);
                // check if the formula is OK
                console.log("Auditing formula");
                yield execa_1.default("brew", ["audit", formulaPath]);
                console.log("Pushing to git");
                for (const args of [
                    ["add", formulaPath],
                    ["commit", "-m", `update to ${version}`],
                    ["tag", version],
                    ["push"],
                    ["push", "--tags"],
                ]) {
                    yield execa_1.default("git", args, { cwd: brewRepoDir });
                }
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
