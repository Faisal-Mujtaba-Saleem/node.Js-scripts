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

                if (lowerCaseAnswer === 'extname' || lowerCaseAnswer === 'common text') {
                    resolve(lowerCaseAnswer);
                } else {
                    console.log('Please enter either "extname" or "common text".');
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
        const renameableFilesDirPath = await questionAsync('\nEnter the directory path in which you want to change the files names: ');
        console.log(`Your renameable files directory path: ${renameableFilesDirPath}`);

        const renameableFilesDirectory = fs.readdirSync(renameableFilesDirPath, 'utf-8');

        const renameMethod = await promptForChoice('\nEnter whether you want to choose the renameable files via extname or via any common text in filenames: ');
        console.log(`You choose, rename via ${renameMethod}`);

        let extnameInput;
        let commonFilesNameText;
        (renameMethod === 'extension') ?
            extnameInput = await questionAsync('\nEnter the the filename extension of the files which you want to rename: ') :
            commonFilesNameText = await questionAsync('\nEnter the the common text in the files names which you want to rename: ');

        const renameableFiles = [];
        for (let i = 0; i < renameableFilesDirectory.length; i++) {
            const file = renameableFilesDirectory[i];

            if (renameMethod === 'extension') {
                if (path.extname(file) === extnameInput) {
                    renameableFiles.push(file);
                } else {
                    console.log(`File ${file}'s extname ${path.extname(file)} does'nt match the extname ${extnameInput}`);
                }
            } else {
                if (file.includes(commonFilesNameText)) {
                    renameableFiles.push(file);
                } else {
                    console.log(`File ${file}'s filename does'nt find any match with ${commonFilesNameText}`);
                }
            }
        }

        if (renameableFiles.length !== 0) {
            const filenameInput = await questionAsync('\nEnter the new filename and if you want to change the extname too then attach it along with filename: ');
            console.log(`You choosed new filename as: ${filenameInput}`);

            const changeExtname = path.extname(filenameInput) !== '' && await promptForBoolean('\nEnter true or false if you want to change the extname too: ');
            console.log(`Change Extname: ${changeExtname}`);

            const directoryToPut = await questionAsync('\nEnter the directory path in which you want to put your renamed files: ');
            console.log(`Directory to put in your renameable files : ${directoryToPut}`);

            for (let i = 0; i < renameableFiles.length; i++) {
                const file = renameableFiles[i];
                try {
                    if (path.extname(filenameInput) !== '') {
                        changeExtname ?
                            fs.renameSync(path.join(renameableFilesDirPath, file), path.join(directoryToPut, `${path.parse(filenameInput).name}${i !== 0 ? i : ''}${path.parse(filenameInput).ext}`)) :
                            fs.renameSync(path.join(renameableFilesDirPath, file), path.join(directoryToPut, `${path.parse(filenameInput).name}${i !== 0 ? i : ''}${path.extname(file)}`));

                        console.log(`\nFile ${file}'s name renamed successfully!`);
                    }
                    else {
                        fs.renameSync(path.join(renameableFilesDirPath, file), path.join(directoryToPut, `${path.parse(filenameInput).name}${i !== 0 ? i : ''}${path.extname(file)}`));

                        console.log(`\nFile ${file}'s name renamed successfully!`);
                    }
                } catch (error) {
                    console.log(error.message);
                } finally {
                    // Close the readline interface after the loop
                    rl.close();
                }
            }
        } else {
            rl.close();
            console.log('\nNo files to rename.\n');
        }
    } catch (error) {
        console.log(error.message);
    } finally {
        // Close the readline interface after the loop
        rl.close();
    }
}

main();
