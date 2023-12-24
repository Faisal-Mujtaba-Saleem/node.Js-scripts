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

                if (lowerCaseAnswer === 'extension' || lowerCaseAnswer === 'filename') {
                    resolve(lowerCaseAnswer);
                } else {
                    console.log('Please enter either "extension" or "filename".');
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
        const changeableFilesDirectory = await questionAsync('Enter the renameable files directory path in which you want to change the files names: ', rl);

        const filesToChange = fs.readdirSync(changeableFilesDirectory, 'utf-8');

        console.log(`Your renameable files dirname: ${changeableFilesDirectory}`);

        for (let i = 0; i < filesToChange.length; i++) {
            const file = filesToChange[i];

            const isChange = await promptForBoolean(`Do you want to rename the file "${file}", true or false : `, rl);

            if (isChange) {
                const renameMethod = await promptForChoice('Enter whether you want to rename the whole filename or only extname: ', rl);

                if (renameMethod === 'extension') {
                    const extnameInput = await questionAsync('Enter the new extname: ', rl);
                    const dirToPut = await questionAsync('Enter the directory path in which you want to put your file: ', rl);

                    const changeExtensionName = await promptForBoolean('Enter true or false if you really want to change the extname too: ');

                    if (changeExtensionName) {
                        fs.renameSync(path.join(changeableFilesDirectory, file), path.join(dirToPut, `${path.parse(file).name + extnameInput}`))
                    }
                } else {
                    const filenameInput = await questionAsync('Enter the new filename and if you want to change extname too along with filename then attach it with filename: ', rl);
                    const dirToPut = await questionAsync('Enter the dir path in which you want to put your files: ', rl);
                    if (path.extname(filenameInput) !== '') {
                        const changeExtensionName = await promptForBoolean('Enter true or false if you want to change the extname too: ');

                        changeExtensionName ?
                            fs.renameSync(path.join(changeableFilesDirectory, file), path.join(dirToPut, `${filenameInput}`)) :
                            fs.renameSync(path.join(changeableFilesDirectory, file), path.join(dirToPut, `${path.parse(filenameInput).name}${path.extname(file)}`));
                    }
                    else {
                        fs.renameSync(path.join(changeableFilesDirectory, file), path.join(dirToPut, `${path.parse(filenameInput).name}${path.extname(file)}`));
                    }
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    } finally {
        // Close the readline interface after the loop
        rl.close();
    }
}

main();
