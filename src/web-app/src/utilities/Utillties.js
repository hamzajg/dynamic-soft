const Utilities = {
    showSaveFilePickerFor
}

async function showSaveFilePickerFor(defaultPath, metadataContent) {
    try {
        const opts = {
            suggestedName: defaultPath
        };
        const handle = await window.showSaveFilePicker(opts);
        const writableStream = await handle.createWritable();
        await writableStream.write(metadataContent);
        await writableStream.close();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('File save operation aborted by the user.');
        } else {
            console.error('Error saving file:', error);
        }
    }
}
export {Utilities}