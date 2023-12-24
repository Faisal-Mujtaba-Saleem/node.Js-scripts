const { error } = require('console');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function questionAsync(query, rl) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
}

function promptForChoice(question, rl) {
    return new Promise((resolve) => {
        function ask() {
            rl.question(question, (answer) => {
                const lowerCaseAnswer = answer.toLowerCase().trim();

                if (lowerCaseAnswer === 'extension' || lowerCaseAnswer === 'common text') {
                    resolve(lowerCaseAnswer);
                } else {
                    console.log('Please enter either "extension" or "common text".');
                    ask();
                }
            });
        }

        ask();
    });
}

function promptForBoolean(question, rl) {
    return new Promise((resolve) => {
        function ask() {
            rl.question(question, (answer) => {
                const lowerCaseAnswer = answer.toLowerCase().trim();

                if (lowerCaseAnswer === 'true' || lowerCaseAnswer === 'false') {
                    resolve(lowerCaseAnswer === 'true');
                } else {
                    console.log('Please enter either "true" or "false".');
                    ask();
                }
            });
        }

        ask();
    });
}

async function main() {
    try {
        const renameableFilesDirPath = await questionAsync('Enter the directory path in which you want to change the files names: ', rl);
        console.log(`Your renameable files directory path: ${renameableFilesDirPath}`);

        const renameableFilesDirectory = fs.readdirSync(renameableFilesDirPath, 'utf-8');

        const renameMethod = await promptForChoice('Enter whether you want to choose the renameable files via extension name or via any common text in filenames: ', rl);
        console.log(`You choose, rename via ${renameMethod}`);

        let extension_nameInput;
        let commonFilesNameText;
        (renameMethod === 'extension') ?
            extension_nameInput = await questionAsync('Enter the the filename extension of the files which you want to rename: ', rl) :
            commonFilesNameText = await questionAsync('Enter the the common text in the files names which you want to rename: ', rl);

        const filenameInput = await questionAsync('Enter the new filename and if you want to change the extension name too then attach it with filename: ', rl);
        console.log(`You choosed new filename as: ${filenameInput}`);

        const changeExtension_Name = path.extname(filenameInput) !== '' && await promptForBoolean('Enter true or false if you want to change the extension name too: ', rl);
        console.log(`Change Extname: ${changeExtension_Name}`);

        const directoryToPut = await questionAsync('Enter the directory path in which you want to put your renamed files: ', rl);
        console.log(`Renamed file's directory: ${directoryToPut}`);

        const renameableFiles = [];
        for (let i = 0; i < renameableFilesDirectory.length; i++) {
            const file = renameableFilesDirectory[i];

            if (renameMethod === 'extension') {
                if (path.extname(file) === extension_nameInput) {
                    renameableFiles.push(file);
                }
            } else {
                if (file.includes(commonFilesNameText)) {
                    renameableFiles.push(file);
                }
            }
        }

        if (renameableFiles.length !== 0) {
            for (let i = 0; i < renameableFiles.length; i++) {
                const file = renameableFiles[i];
                try {
                    if (path.extname(filenameInput) !== '') {
                        changeExtension_Name ?
                            fs.renameSync(path.join(renameableFilesDirPath, file), path.join(directoryToPut, `${path.parse(filenameInput).name}${i !== 0 ? i : ''}${path.parse(filenameInput).ext}`)) :
                            fs.renameSync(path.join(renameableFilesDirPath, file), path.join(directoryToPut, `${path.parse(filenameInput).name}${i !== 0 ? i : ''}${path.extname(file)}`));
                        console.log('Happy Bulk Renaming');
                        console.log(`Successfully renamed your file${(renameableFiles.length > 1) ? 's' : ''}`);
                    }
                    else {
                        fs.renameSync(path.join(renameableFilesDirPath, file), path.join(directoryToPut, `${path.parse(filenameInput).name}${i !== 0 ? i : ''}${path.extname(file)}`));
                        console.log('Happy Bulk Renaming');
                        console.log(`Successfully renamed your file${(renameableFiles.length > 1) ? 's' : ''}`);
                    }
                } catch (error) {
                    console.log(error.message);
                }
            }
        } else {
            console.log('No files to rename.');
        }
    } catch (error) {
        console.log(error.message);
    } finally {
        // Close the readline interface after the loop
        rl.close();
    }
}

main();
