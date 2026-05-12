<script>
  import { tick } from 'svelte';

  const separators = [' - ', ' – ', ' — ', ' by ', ' BY ', ' By ', ' bY '];

  let fileNameInput = 'Untitled.INSYNC';
  let projectName = 'Untitled.INSYNC';
  let projectArtist = '';
  let isEditingFileName = false;
  let fileNameField;

  let songTitle = 'No Audio Yet';
  let songArtist = 'Click to upload';
  let audioUrl = '';
  let audioFile;
  let songUpload;
  let isAudioPlaying = false;
  let elapsedTime = '0:00';
  let remainingTime = '-0:00';

  let draftLine = '';
  let lyrics = [];

  $: document.title = `${projectName} — inSync`;

  function splitTitle(value) {
    let namePart = value.trim() || 'Untitled.INSYNC';
    let artistPart = '';

    for (const sep of separators) {
      if (namePart.includes(sep)) {
        const parts = namePart.split(sep);

        if (sep.toLowerCase() === ' by ') {
          artistPart = parts.slice(1).join(sep).trim();
          namePart = parts[0].trim();
        } else {
          artistPart = parts[0].trim();
          namePart = parts.slice(1).join(sep).trim();
        }
        break;
      }
    }

    return {
      name: namePart || 'Untitled.INSYNC',
      artist: artistPart
    };
  }

  async function editFileName() {
    isEditingFileName = true;
    await tick();
    fileNameField.focus();
    fileNameField.setSelectionRange(0, fileNameInput.length);
  }

  function commitFileName() {
    if (!fileNameInput.trim()) {
      fileNameInput = 'Untitled.INSYNC';
    }

    const parsed = splitTitle(fileNameInput);
    projectName = parsed.name;
    projectArtist = parsed.artist;
    isEditingFileName = false;
  }

  function chooseAudio() {
    songUpload.click();
  }

  function handleAudioUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    audioUrl = URL.createObjectURL(file);

    const extensionIndex = file.name.lastIndexOf('.');
    const formattedName = extensionIndex === -1 ? file.name : file.name.slice(0, extensionIndex);
    const parsed = splitTitle(formattedName);

    songTitle = parsed.name;
    songArtist = parsed.artist ? `by ${parsed.artist}` : 'UPLOADED';
    elapsedTime = '0:00';
    remainingTime = '-0:00';
    isAudioPlaying = false;

    if (audioFile) {
      audioFile.pause();
      audioFile.currentTime = 0;
    }

    event.target.value = '';
  }

  function togglePlayback() {
    if (!audioUrl) return;

    if (isAudioPlaying) {
      audioFile.pause();
      isAudioPlaying = false;
    } else {
      audioFile.play();
      isAudioPlaying = true;
    }
  }

  function handleAudioEnded() {
    isAudioPlaying = false;
    audioFile.currentTime = 0;
  }

  function updateAudioDuration() {
    remainingTime = `-${formatTime(audioFile.duration)}`;
  }

  function updateAudioTime() {
    const currentTime = audioFile.currentTime;
    const duration = Number.isFinite(audioFile.duration) ? audioFile.duration : 0;

    elapsedTime = formatTime(currentTime);
    remainingTime = `-${formatTime(Math.max(duration - currentTime, 0))}`;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function addDraftLine(event) {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    const text = draftLine.trim();
    if (!text) {
      lyrics = [...lyrics, { id: crypto.randomUUID(), type: 'break' }];
      draftLine = '';
      return;
    }

    if (text.startsWith('[') && text.endsWith(']')) {
      lyrics = [...lyrics, { id: crypto.randomUUID(), type: 'header', text: text.slice(1, -1) }];
    } else {
      lyrics = [...lyrics, { id: crypto.randomUUID(), type: 'vocals', main: text, background: '', timestamp: '0:00' }];
    }

    draftLine = '';
  }

  function editLyric(line, field) {
    if (line.type !== 'vocals') return;

    const isMain = field === 'main';
    let newText = prompt(`Edit ${isMain ? 'main' : 'background'} vocals:`, line[field]);
    if (newText === null) return;

    newText = newText.trim();
    if (!newText && isMain) {
      alert('Main vocals cannot be empty. To remove this line, please delete it manually.');
      return;
    }

    lyrics = lyrics.map((item) => item.id === line.id ? { ...item, [field]: newText } : item);
  }
</script>

<div id="app" class="app">
  <div id="appHeader" class="app-header">
    <div class="app-header-group group-leading">
      <div id="appTitle" class="app-title">
        <h1 class="hide-below-768px">inSync</h1>
      </div>
      <div id="appMenuBar" class="app-menuBar hide-below-768px">
        <button id="menuBarFile" class="app-menuBar-button"><p>File</p></button>
        <button id="menuBarEdit" class="app-menuBar-button"><p>Edit</p></button>
        <button id="menuBarView" class="app-menuBar-button"><p>View</p></button>
        <button id="menuBarHelp" class="app-menuBar-button"><p>Help</p></button>
      </div>
    </div>
    <div class="app-header-spacer hide-below-768px"></div>
    <div class="app-header-group group-trailing">
      <div id="menuBarSave" class="app-menuBar-button">
        <p>Save Now</p>
      </div>
      <div id="appFileName" class="app-fileName">
        {#if isEditingFileName}
          <h3 id="fileCurrentlyEditing" class="opaque">Currently editing</h3>
          <input
            bind:this={fileNameField}
            bind:value={fileNameInput}
            type="text"
            id="fileNameInput"
            class="file-name-input"
            on:blur={commitFileName}
            on:keydown={(event) => event.key === 'Enter' && fileNameField.blur()}
          />
        {:else}
          {#if !projectArtist}
            <h3 id="fileCurrentlyEditing" class="opaque">Currently editing</h3>
          {/if}
          <button class="file-name-heading" on:click={editFileName}>
            <h1 id="fileNameInputHeader">{projectName}</h1>
          </button>
          {#if projectArtist}
            <h3 id="fileNameArtist" class="opaque">by {projectArtist}</h3>
          {/if}
        {/if}
      </div>
    </div>
  </div>

  <div id="appContent" class="app-content">
    <div id="contentWrite" class="content-section content-write">
      <div class="section-header">
        <h2>Write</h2>
        <button id="appDoneWriting" class="app-section-button"><p>Done Writing</p></button>
      </div>
      <div id="appWriteContent" class="section-content">
        {#each lyrics as line, index (line.id)}
          {#if line.type === 'header'}
            <div id={`appWriteHeader-${String(index + 1).padStart(3, '0')}`} class="app-write-line app-write-headerLine">
              <h3 class="app-write-header opaque">{line.text}</h3>
            </div>
          {:else if line.type === 'break'}
            <div id={`appWriteBreak-${String(index + 1).padStart(3, '0')}`} class="app-write-line app-write-breakLine">
              <p class="opaque-30">BREAK</p>
            </div>
          {:else}
            <div id={`appWriteLine-${String(index + 1).padStart(3, '0')}`} class="app-write-line app-write-vocalsLine">
              <button class="lyric-edit-button" on:click={() => editLyric(line, 'main')}>
                <p class="app-write-mainVocals">{line.main}</p>
              </button>
              <button class="lyric-edit-button" on:click={() => editLyric(line, 'background')}>
                <h3 class="app-write-backgroundVocals">{line.background}</h3>
              </button>
            </div>
          {/if}
        {/each}
        <textarea
          id="appWriteNewLine"
          class="app-write-newLine"
          rows="3"
          placeholder="Type here..."
          bind:value={draftLine}
          on:keydown={addDraftLine}
        ></textarea>
      </div>
    </div>

    <div id="contentSync" class="content-section content-sync">
      <div class="section-header">
        <h2>Sync</h2>
      </div>
      <div id="appSyncContent" class="section-content">
        {#each lyrics.filter((line) => line.type === 'vocals') as line, index (line.id)}
          <div id={`appSyncLine-${String(index + 1).padStart(3, '0')}`} class="app-sync-line">
            <span class="app-sync-timestamp">{line.timestamp}</span>
            <h1 class="app-sync-mainVocals">{line.main}</h1>
            <h3 class="app-sync-backgroundVocals">{line.background}</h3>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div id="appFooter" class="app-footer">
    <div class="app-footer-group group-leading">
      <button id="appSongWrapper" class="app-songWrapper" on:click={chooseAudio}>
        <div class="app-song">
          <div id="appAlbumArt" class="app-albumArt"></div>
          <div id="appSongDetails" class="app-songDetails hide-below-768px">
            <h1 id="appSongTitle">{songTitle}</h1>
            <h3 id="appSongArtist" class="opaque">{songArtist}</h3>
            <input bind:this={songUpload} type="file" id="appSongUpload" class="app-song-input" accept="audio/*" on:change={handleAudioUpload} />
            <audio
              bind:this={audioFile}
              id="appAudioFile"
              class="app-audio-file"
              src={audioUrl}
              on:loadedmetadata={updateAudioDuration}
              on:timeupdate={updateAudioTime}
              on:ended={handleAudioEnded}
            ></audio>
          </div>
        </div>
      </button>
      <button id="songPlayback" class:button-disabled={!audioUrl} class="app-footer-button" disabled={!audioUrl} on:click={togglePlayback}>
        <p>{isAudioPlaying ? 'Pause' : 'Play'}</p>
      </button>
    </div>
    <div class="app-footer-spacer"></div>
    <div class="app-footer-group group-center">
      <button class="app-songInfo">
        <p id="appSongTimeElapsed" class="tabular-nums">{elapsedTime}</p>
        <p class="opaque">/</p>
        <p id="appSongTimeRemaining" class="tabular-nums">{remainingTime}</p>
      </button>
    </div>
  </div>
</div>
