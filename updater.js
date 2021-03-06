const {autoUpdater} = require("electron-updater");
const {dialog, BrowserWindow, ipcMain} = require("electron");

// loggin
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";

autoUpdater.autoDownload = false; 

exports.check = () => {

    console.log("checking for updaters");
    autoUpdater.checkForUpdates();


    autoUpdater.on("update-available", () => {

        let downloadProgress = 0;

        dialog.showMessageBox({
            type:"info",
            title:"Update Availale",
            message:"A New Version Of This App Is Available, Do you want to update now?",
            buttons: ["Update", "No"]
        }, (buttonIndex) => {

            if (buttonIndex !== 0) {

                return;
            }

            autoUpdater.downloadUpdate();

            let progressWin = new BrowserWindow({
                width: 350,
                height: 35, 
                useContentSize: true, 
                autoHideMenuBar: true,
                maximizable: false,
                fullscreen: false,
                fullscreenable: false, 
                resizable: false,
            })

            progressWin.loadURL(`file://${__dirname}/renderer/progress.html`)

            progressWin.on("close", () => {

                progressWin = null;
            })

            ipcMain.on("download-progress-request", (e) => {

                e.returnValue = downloadProgress;
            })

            // Track Process
            autoUpdater.on("download-process", (d) => {

                downloadProgress = d.percent;
                autoUpdater.logger.info(downloadProgress);
            })

            // Listening for completion
            autoUpdater.on("update-downloaded", () => {

                if (progressWin) {progressWin.close()}

                dialog.showMessageBox({
                    type:"info",
                    title:"Update Ready",
                    message:"Update is ready, would you like to install it now",
                    buttons: ["Yes", "Later"]
                }, (buttonIndex) => {

                    if (buttonIndex === 0) {autoUpdater.quitAndInstall()}
                })
            })

        })
    })
}