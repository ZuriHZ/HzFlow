const { ipcMain, shell } = require("electron");
const { execFile } = require("child_process");
const projectsStore = require("../projects/projectsStore");

function setupProjectsHandlers() {
    ipcMain.handle("projects:get-all", () => {
        return projectsStore.getAll();
    });

    ipcMain.handle("projects:add", (event, projectPath) => {
        return projectsStore.add(projectPath);
    });

    ipcMain.handle("projects:remove", (event, id) => {
        return projectsStore.remove(id);
    });

    ipcMain.handle("projects:open-in-vscode", (event, projectPath) => {
        shell.openExternal("vscode://file/" + projectPath);
    });

    ipcMain.handle("projects:open-in-terminal", (event, projectPath) => {
        shell.openExternal(projectPath);
    });

    ipcMain.handle("projects:open-in-explorer", (event, projectPath) => {
        shell.showItemInFolder(projectPath);
    });

    ipcMain.handle("projects:get-git-info", (event, projectPath) => {
        return new Promise((resolve) => {
            try {
                execFile("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: projectPath }, (err, branch) => {
                    if (err) return resolve({ gitBranch: null, gitAhead: 0, gitBehind: 0 });
                    const gitBranch = branch.trim();
                    execFile(
                        "git",
                        ["rev-list", "--left-right", "--count", `HEAD...@{upstream}`],
                        { cwd: projectPath },
                        (err2, output) => {
                            if (err2) return resolve({ gitBranch, gitAhead: 0, gitBehind: 0 });
                            const [ahead, behind] = output.trim().split("\t").map(Number);
                            resolve({ gitBranch, gitAhead: ahead || 0, gitBehind: behind || 0 });
                        }
                    );
                });
            } catch {
                resolve({ gitBranch: null, gitAhead: 0, gitBehind: 0 });
            }
        });
    });
}

module.exports = { setupProjectsHandlers };
