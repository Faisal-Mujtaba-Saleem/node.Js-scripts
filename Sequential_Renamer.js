const { error } = require('console');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function questionAsync(query) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
}

function promptForChoice(query) {
    return new Promise((resolve) => {
        function ask() {
            rl.question(query, (answer) => {
                const lowerCaseAnswer = answer.toLowerCase().trim();

                if (lowerCaseAnswer === 'extname' || lowerCaseAnswer === 'filename') {
                    resolve(lowerCaseAnswer);
                } else {
                    console.log('Please enter either "extname" or "filename".');
                    ask();
                }
            });
        }

        ask();
    });
}

function promptForBoolean(query) {
    return new Promise((resolve) => {
        function ask() {
            rl.question(query, (answer) => {
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
        const changeableFilesDirectory = await questionAsync('\nEnter the renameable files directory path in which you want to change the files names: ');

        const filesToChange = fs.readdirSync(changeableFilesDirectory, 'utf-8');

        console.log(`Your renameable files dirname: ${changeableFilesDirectory}`);

        for (let i = 0; i < filesToChange.length; i++) {
            const file = filesToChange[i];

            const isChange = await promptForBoolean(`\nDo you want to rename the file "${file}", true or false : `);

            if (isChange) {
                const renameMethod = await promptForChoice('\nEnter whether you want to rename the whole filename or only extname: ');

                if (renameMethod === 'extension') {
                    const extnameInput = await questionAsync('\nEnter the new extname: ');
                    const dirToPut = await questionAsync('\nEnter the directory path in which you want to put your file: ');

                    const changeExtensionName = await promptForBoolean(`\nDo you really want to change your file ${file}'s extname, true or false: `);

                    if (changeExtensionName) {
                        fs.renameSync(path.join(changeableFilesDirectory, file), path.join(dirToPut, `${path.parse(file).name + extnameInput}`))
                    }
                    console.log(`\nFilename ${file} renamed successfully!`);
                } else {
                    const filenameInput = await questionAsync('\nEnter the new filename and if you want to change extname too then attach it along with filename : ');
                    const dirToPut = await questionAsync('\nEnter the dir path in which you want to put your files: ');

                    if (path.extname(filenameInput) !== '') {
                        const changeExtensionName = await promptForBoolean('\nEnter true or false if you want to change the extname too: ');

                        changeExtensionName ?
                            fs.renameSync(path.join(changeableFilesDirectory, file), path.join(dirToPut, `${filenameInput}`)) :
                            fs.renameSync(path.join(changeableFilesDirectory, file), path.join(dirToPut, `${path.parse(filenameInput).name}${path.extname(file)}`));
                        console.log(`\nFilename ${file} renamed successfully!`);
                    }
                    else {
                        fs.renameSync(path.join(changeableFilesDirectory, file), path.join(dirToPut, `${path.parse(filenameInput).name}${path.extname(file)}`));
                        console.log(`\nFilename ${file} renamed successfully!`);
                    }
                }
            } else {
                console.log(`\nYou refused to rename the file ${file}`);
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
