import * as fs from "fs";
import * as JSZip from "jszip";

const Utilities = {
    createProject,
    createFile
}

async function createProject(message: any, workspacePath: string) {
    const fileContent = message.fileContent;
    const filePath = message.filePath;
    const buffer = Buffer.from(fileContent);
    fs.writeFile(workspacePath + "/" + filePath, buffer, (err) => {
        if (err) {
            console.error('Error saving file:', err);
        } else {
            console.log('File saved successfully.');
        }
    });
    const zip = new JSZip();
    zip.loadAsync(fileContent)
        .then(zip => {
            zip.forEach((relativePath, zipEntry) => {
                zipEntry.async('uint8array')
                    .then(fileData => {
                        try {
                            fs.mkdirSync(workspacePath + "/" + relativePath.split('/').slice(0, -1).join('/'), {recursive: true})
                            fs.writeFileSync(workspacePath + "/" + relativePath, fileData);
                        } catch (error) {
                        }
                    })
                    .catch(error => console.error('Error extracting file:', error));
            });
        })
        .catch(error => console.error('Error loading zip:', error));
}

function createFile(message: any, workspacePath: string) {
    const fileContent = message.fileContent;
    const filePath = message.filePath;
    fs.writeFileSync(workspacePath + "/" + filePath, fileContent);
    console.log('File saved successfully!');
}

export {Utilities}
