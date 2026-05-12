const fileNameInputHeader = document.getElementById('fileNameInputHeader');
const fileNameInput = document.getElementById('fileNameInput');
const fileNameArtist = document.getElementById('fileNameArtist');
const fileCurrentlyEditing = document.getElementById('fileCurrentlyEditing');

const appSongWrapper = document.getElementById('appSongWrapper');
const appSongDetails = document.getElementById('appSongDetails');
const appSongUpload = document.getElementById('appSongUpload');

const songPlayback = document.getElementById('songPlayback');
const appAudioFile = document.getElementById('appAudioFile');

const appSongTitle = document.getElementById('appSongTitle');
const appSongArtist = document.getElementById('appSongArtist');

const appSongTimeElapsed = document.getElementById('appSongTimeElapsed');
const appSongTimeRemaining = document.getElementById('appSongTimeRemaining');

const appWriteContent = document.getElementById('appWriteContent');
const appWriteNewLine = document.getElementById('appWriteNewLine');

const appSyncContent = document.getElementById('appSyncContent');

var isAudioPlaying = false;

// FILE / PROJECT NAME EDITING

fileNameInput.style.display = 'none';

fileNameInputHeader.addEventListener('click', () => {
    fileCurrentlyEditing.style.display = 'block';
    fileNameInputHeader.style.display = 'none';
    fileNameArtist.style.display = 'none';
    fileNameInput.style.display = 'block';
    fileNameInput.focus();
    fileNameInput.setSelectionRange(0, fileNameInput.value.length); // Select all but the .INSYNC part
});

fileNameInput.addEventListener('blur', () => {
    if (fileNameInput.value.trim() === '') {
        fileNameInput.value = 'Untitled .INSYNC';
    }

    // Split the filename and artist if there's a hyphen, en dash, em dash, or "by"
    const separators = [' - ', ' – ', ' — ', ' by ', ' BY ', ' By ', ' bY '];
    let namePart = fileNameInput.value;
    let artistPart = '';

    for (const sep of separators) {
        if (fileNameInput.value.includes(sep)) {
            const parts = fileNameInput.value.split(sep);
            if (sep.toLowerCase() == ' by ') {
                artistPart = parts.slice(1).join(sep).trim(); // Force right side to be artist
                namePart = parts[0].trim();
            } else {
                artistPart = parts[0].trim(); // Force left side to be artist
                namePart = parts.slice(1).join(sep).trim(); // Join back in case there are multiple separators
            }
            break;
        }
    }

    fileNameInputHeader.textContent = namePart;
    if (artistPart) {
        fileCurrentlyEditing.style.display = 'none';
        fileNameArtist.textContent = `by ${artistPart}`;
        fileNameArtist.style.display = 'block';
    } else {
        fileCurrentlyEditing.style.display = 'block';
        fileNameArtist.style.display = 'none';
    }

    document.title = namePart + ' — inSync';

    fileNameInput.style.display = 'none';
    fileNameInputHeader.style.display = 'block';
});

fileNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        fileNameInput.blur();
    }
});

// AUDIO UPLOADING

appSongWrapper.addEventListener('click', () => {
    appSongUpload.click();

    appSongUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            appAudioFile.src = URL.createObjectURL(file);

            // Format file name the same as project name
            let formattedName = file.name;
            const lastDotIndex = formattedName.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                formattedName = formattedName.substring(0, lastDotIndex); // Remove file extension
            }

            const separators = [' - ', ' – ', ' — ', ' by ', ' BY ', ' By ', ' bY '];
            let namePart = formattedName;
            let artistPart = '';

            for (const sep of separators) {
                if (formattedName.includes(sep)) {
                    const parts = formattedName.split(sep);

                    if (sep.toLowerCase() == ' by ') {
                        artistPart = parts.slice(1).join(sep).trim(); // Force right side to be artist
                        namePart = parts[0].trim();
                    } else {
                        artistPart = parts[0].trim(); // Force left side to be artist
                        namePart = parts.slice(1).join(sep).trim();
                    }
                    break;
                }
            }

            appSongTitle.textContent = namePart;
            if (artistPart) {
                appSongArtist.textContent = 'by ' + artistPart;
            } else {
                appSongArtist.textContent = 'UPLOADED';
            }

            songPlayback.disabled = false;
            songPlayback.classList.remove('button-disabled');

            appSongTimeElapsed.textContent = '0:00';

            setTimeout(() => {
                console.log(appAudioFile.duration);
                appSongTimeRemaining.innerHTML = '&ndash;' + formatTime(appAudioFile.duration);
            }, 250);

            // Reset playback button
            songPlayback.textContent = 'Play';
            isAudioPlaying = false;
            appAudioFile.currentTime = 0; // Reset to start
            
            // Clear the file input value to allow re-uploading the same file if needed
            appSongUpload.value = '';

            // appSongDetails.querySelector('#appSongTitle').textContent = file.name;
            // appSongDetails.querySelector('#appSongArtists').textContent = 'Uploaded';
        }
    });
});

// RIGHT-CLICK TO RENAME SONG
// appSongDetails.addEventListener('contextmenu', (event) => {
//     event.preventDefault();

//     const currentTitle = appSongTitle.textContent;
//     const currentArtist = appSongArtist.textContent === 'RIGHT-CLICK TO RENAME' ? '' : appSongArtist.textContent;

//     let newName = prompt('Enter new song title:', currentTitle);
//     if (newName !== null) {
//         newName = newName.trim();
//         if (newName === '') {
//             newName = 'Untitled';
//         }
//         appSongTitle.textContent = newName;
//     }

//     let newArtist = prompt('Enter artist name (optional):', currentArtist);
//     if (newArtist !== null) {
//         newArtist = newArtist.trim();
//         if (newArtist === '') {
//             appSongArtist.textContent = 'RIGHT-CLICK TO RENAME';
//         } else {
//             appSongArtist.textContent = newArtist;
//         }
//     }
// });

// AUDIO PLAYBACK

songPlayback.addEventListener('click', () => {
    if (!songPlayback.disabled) {
        if (!isAudioPlaying) {
            // Start playing audio
            appAudioFile.play();
            songPlayback.textContent = 'Pause'; // Change icon to pause
            isAudioPlaying = true;
        } else {
            // Pause audio
            appAudioFile.pause();
            songPlayback.textContent = 'Play'; // Change icon to play
            isAudioPlaying = false;
        }
    }
});

appAudioFile.addEventListener('ended', () => {
    songPlayback.textContent = 'Play'; // Reset icon to play
    isAudioPlaying = false;
    appAudioFile.currentTime = 0; // Reset to start
});

// Update time elapsed and remaining
appAudioFile.addEventListener('timeupdate', () => {
    const currentTime = appAudioFile.currentTime;
    const duration = appAudioFile.duration;

    appSongTimeElapsed.textContent = formatTime(currentTime);
    appSongTimeRemaining.innerHTML = '&ndash;' + formatTime(duration - currentTime);
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// WRITE SECTION

// on enter pressed while in textarea, add new <p> line before textarea and clear textarea

// STRUCTURE cause i get lost making so many elements in JS bye :
// div containing another <div> and a <button>
// <button> appears on hover ("+ Add background vocals")
// inside <div>, there are two <p> elements
// primary <p> is main vocal , required
// secondary <p> is background vocal , optional

appWriteNewLine.addEventListener('keydown', (event) => {
    if (event.key === 'Enter'/* && !event.shiftKey */) {
        event.preventDefault(); // Prevent default newline behavior

        const text = appWriteNewLine.value.trim();
        if (text !== '') {
            // IF LINE IS ENCLOSED IN BRACKETS , MAKE IT A HEADER LINE
            if (text.startsWith('[') && text.endsWith(']')) {
                const newHeader = document.createElement('div');

                // ID = appWriteHeader-001, appWriteHeader-002, etc.
                const headerCount = appWriteContent.querySelectorAll('.app-write-line .app-write-headerLine').length + 1;
                const headerNumber = String(headerCount).padStart(3, '0');
                newHeader.id = 'appWriteHeader-' + headerNumber;

                newHeader.classList.add('app-write-line');
                newHeader.classList.add('app-write-headerLine');

                const headerText = document.createElement('h3');
                headerText.classList.add('app-write-header');
                headerText.classList.add('opaque');
                headerText.textContent = text.slice(1, -1); // Remove brackets and make uppercase

                newHeader.appendChild(headerText);
                appWriteContent.insertBefore(newHeader, appWriteNewLine);
            } else {
                const newLine = document.createElement('div');

                // ID = appWriteLine-001, appWriteLine-002, etc.
                const lineCount = appWriteContent.querySelectorAll('.app-write-line .app-write-vocalsLine').length + 1;
                const lineNumber = String(lineCount).padStart(3, '0');
                newLine.id = 'appWriteLine-' + lineNumber;

                newLine.classList.add('app-write-line');
                newLine.classList.add('app-write-vocalsLine');

                const mainVocals = document.createElement('p');
                mainVocals.classList.add('app-write-mainVocals');
                mainVocals.textContent = text;

                const backgroundVocals = document.createElement('h3');
                backgroundVocals.classList.add('app-write-backgroundVocals');
                backgroundVocals.textContent = ''; // Empty by default
                
                newLine.appendChild(mainVocals);
                newLine.appendChild(backgroundVocals);
                appWriteContent.insertBefore(newLine, appWriteNewLine);

                // lyrics from write section are automatically copied to sync section
                const syncLine = document.createElement('div');
                
                const syncLineCount = appSyncContent.querySelectorAll('.app-sync-line').length + 1;
                const syncLineNumber = String(syncLineCount).padStart(3, '0');
                syncLine.id = 'appSyncLine-' + lineNumber;
                
                syncLine.classList.add('app-sync-line');

                const syncMainVocals = document.createElement('h1');
                syncMainVocals.classList.add('app-sync-mainVocals');
                syncMainVocals.textContent = text;

                const syncBackgroundVocals = document.createElement('h3');
                syncBackgroundVocals.classList.add('app-sync-backgroundVocals');
                syncBackgroundVocals.textContent = ''; // Empty by default

                const syncTimestamp = document.createElement('span');
                syncTimestamp.classList.add('app-sync-timestamp');
                syncTimestamp.textContent = '0:00'; // Default timestamp

                syncLine.appendChild(syncTimestamp);
                syncLine.appendChild(syncMainVocals);
                syncLine.appendChild(syncBackgroundVocals);
                appSyncContent.appendChild(syncLine);

                // rough implementation of auto-scrolling to bottom when new line is added
                // appWriteContent.scrollTop = appWriteContent.scrollHeight;
                // appSyncContent.scrollTop = appSyncContent.scrollHeight;

                // const newParagraph = document.createElement('p');
                // newParagraph.textContent = text;
                // appWriteContent.insertBefore(newParagraph, appWriteNewLine);
                // appWriteNewLine.value = ''; // Clear textarea
            }
            appWriteNewLine.value = ''; // Clear textarea
        } else {
            const newBreakLine = document.createElement('div');

            const breakCount = appWriteContent.querySelectorAll('.app-write-line .app-write-breakLine').length + 1;
            const breakNumber = String(breakCount).padStart(3, '0');
            newBreakLine.id = 'appWriteBreak-' + breakNumber;

            newBreakLine.classList.add('app-write-line');
            newBreakLine.classList.add('app-write-breakLine');

            const breakText = document.createElement('p');
            breakText.classList.add('opaque-30');
            breakText.textContent = 'BREAK';

            newBreakLine.appendChild(breakText);
            appWriteContent.insertBefore(newBreakLine, appWriteNewLine);
            appWriteNewLine.value = ''; // Clear textarea
        }
    }
});

// click existing lyrics to edit them ( ROUGH IMPLEMENTATION USING PROMPT() )

appWriteContent.addEventListener('click', (event) => {
    if (event.target.classList.contains('app-write-mainVocals') || event.target.classList.contains('app-write-backgroundVocals')) {
        const currentText = event.target.textContent;
        const isMain = event.target.classList.contains('app-write-mainVocals');

        let newText = prompt(`Edit ${isMain ? 'main' : 'background'} vocals:`, currentText);
        if (newText !== null) {
            newText = newText.trim();
            if (newText === '') {
                if (isMain) {
                    alert('Main vocals cannot be empty. To remove this line, please delete it manually.');
                } else {
                    event.target.textContent = ''; // Clear background vocals
                }
            } else {
                event.target.textContent = newText;
            }
        }
    }
});

// SYNC SECTION

// description for me
// lyrics from write section are automatically copied to sync section
// each line is given a timestamp when clicked in sync section
// timestamp appears to the left of the line


// SAVE FILE
// this is just a JSON file pls

// appSyncContent.addEventListener('click', () => {
//     // Gather all data into a single object
//     const projectData = {
//         fileName: fileNameInput.value,
//         songTitle: appSongTitle.textContent,
//         songArtist: appSongArtist.textContent,
//         lyrics: [],
//         audioFile: appAudioFile.src // This will be a blob URL; handling actual file saving requires more complex logic
//     };

//     // Gather lyrics and structure
//     const lines = appWriteContent.querySelectorAll('.app-write-line');
//     lines.forEach(line => {
//         if (line.classList.contains('app-write-headerLine')) {
//             const headerText = line.querySelector('.app-write-header').textContent;
//             projectData.lyrics.push({
//                 type: 'header',
//                 text: headerText
//             });
//         } else if (line.classList.contains('app-write-vocalsLine')) {
//             const mainVocals = line.querySelector('.app-write-mainVocals').textContent;
//             const backgroundVocals = line.querySelector('.app-write-backgroundVocals').textContent;
//             projectData.lyrics.push({
//                 type: 'vocals',
//                 main: mainVocals,
//                 background: backgroundVocals
//             });
//         } else if (line.classList.contains('app-write-breakLine')) {
//             projectData.lyrics.push({
//                 type: 'break'
//             });
//         }
//     });

//     // Convert project data to JSON string
//     const projectJson = JSON.stringify(projectData, null, 2);

//     // Create a blob from the JSON string
//     const blob = new Blob([projectJson], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);

//     // Create a temporary link to trigger the download
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = fileNameInput.value || 'Untitled.insync';
//     document.body.appendChild(a);
//     a.click();

//     // Clean up
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
// });