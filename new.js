console.log("Starting JavaScript Music Player");

let audioPlayer = new Audio();
let songList = [];
let currentFolder;

// Function to process song filenames and return just the song title
const processSongFilename = (filename) => {
    return filename.replace(".mp3", "").replaceAll("%20", " ").trim();
};

const openSidebar = () => {
    document.querySelector(".left-box").style.left = "0";
};

// Fetch songs from a specified folder
async function fetchSongs(folder) {
    currentFolder = folder;
    let response = await fetch(`/${folder}/`);
    let htmlContent = await response.text();

    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    songList = [];
    let links = tempDiv.getElementsByTagName("a");

    // Add only .mp3 files to the song list
    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songList.push(link.href.split(`${folder}/`)[1]);
        }
    }

    displaySongs(); // Call to display songs after fetching
}

// Display songs in the library
function displaySongs() {
    let songContainer = document.getElementsByClassName("lib-songs")[0];
    songContainer.innerHTML = ""; // Clear the current list

    for (let song of songList) {
        let songTitle = processSongFilename(song);

        songContainer.innerHTML += `
            <div class="song">
                <i class="fa-solid fa-music"></i>
                <div class="song-info">
                    <h3>${songTitle}</h3>
                </div>
            </div>`;
    }

    // Add click event listeners to each song
    Array.from(document.getElementsByClassName("song")).forEach(songElement => {
        songElement.addEventListener("click", () => {
            let title = songElement.querySelector(".song-info h3").textContent;
            playSong(title);
        });
    });

    // Play the first song by default (optional)
    if (songList.length > 0) {
        let firstTitle = processSongFilename(songList[0]);
        playSong(firstTitle);
    }
}

// Play the selected song
const playSong = (title) => {
    let songPath = `${currentFolder}/${title.replaceAll(" ", "%20")}.mp3`;
    console.log(`Playing: ${songPath}`);
    audioPlayer.src = songPath;
    audioPlayer.play();
    document.querySelector(".song-name").innerHTML = `<i class="fa-solid fa-music"></i>${title}`;
    document.querySelector(".song-time").textContent = "00:00/00:00";

    // Ensure the play/pause button shows pause when a song starts
    document.getElementById("play").innerHTML = `<i class="fa-solid fa-pause"></i>`;
}

async function displayAlbums(){
    let response = await fetch("/music");
    let htmlContent = await response.text();

    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    let playlists = document.querySelector(".cards");
    let array = Array.from(tempDiv.getElementsByTagName("a"));
    console.log(array);

    for (let i = 0; i < array.length; i++) {
        const e = array[i];

        
        if(e.href.includes("/music") && !e.href.includes(".htaccess")){
            let albumName = e.href.split("/").slice(-2)[0];
            console.log(e.href.split("/"));
            console.log(albumName);
            console.log(albumName);
            let a = await fetch(`/music/${albumName}/info.json`);
            let resp = await a.json();
            console.log(resp)
            playlists.innerHTML += `<div data-folder="${albumName}" class="card color">
              <div class="img-box">
                <i class="fa-solid fa-circle-play"></i>
                <img
                  src="/music/${albumName}/cover.jpg"
                  alt="${resp.title}"
                />
              </div>
              <h2>${resp.title}</h2>
              <p>
                ${resp.description}
              </p>
            </div>`;
        }
    }

    // Load songs from a different folder
    Array.from(document.getElementsByClassName("card")).forEach(folderElement => {
        folderElement.addEventListener("click", async () => {
            console.log(`music/${folderElement.dataset.folder}`)
            await fetchSongs(`music/${folderElement.dataset.folder}`);
            openSidebar();
        });
    });
}

// Initialize the player and load songs
async function initializePlayer() {
    await fetchSongs("music/English");
    await displayAlbums();

    const playButton = document.getElementById("play");

    // Play/Pause functionality
    playButton.addEventListener("click", () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        } else {
            audioPlayer.pause();
            playButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
        }
    });

    // Update the seekbar and time display
    audioPlayer.addEventListener("timeupdate", () => {
        let currentTime = Math.floor(audioPlayer.currentTime);
        let duration = Math.floor(audioPlayer.duration);

        // Check if duration is available to avoid NaN
        if (!isNaN(duration)) {
            let minutes = Math.floor(currentTime / 60);
            let seconds = currentTime % 60;
            let durationMinutes = Math.floor(duration / 60);
            let durationSeconds = duration % 60;

            document.querySelector(".song-time").textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}/${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
            
            let progressPercentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            document.querySelector(".fa-solid.fa-circle").style.left = progressPercentage + "%";
        }
    });

    // Click to seek within the song
    document.querySelector(".seekbar").addEventListener("click", (event) => {
        let progressPercentage = (event.offsetX / event.target.getBoundingClientRect().width) * 100;
        document.querySelector(".fa-solid.fa-circle").style.left = progressPercentage + "%";
        audioPlayer.currentTime = (progressPercentage * audioPlayer.duration) / 100;
    });

    // Volume control
    document.querySelector(".vol-seek").addEventListener("change", (event) => {
        audioPlayer.volume = parseInt(event.target.value) / 100;
    });

    // Toggle sidebar visibility
    document.getElementById("bars-icon").addEventListener("click", () => {
        document.querySelector(".left-box").style.left = "0";
    });

    document.getElementById("cross-icon").addEventListener("click", () => {
        document.querySelector(".left-box").style.left = "-100%";
    });

    // Previous and Next song controls
    document.getElementById("prev").addEventListener("click", () => {
        let currentIndex = songList.indexOf(audioPlayer.src.split(`${currentFolder}/`)[1]);
        if (currentIndex > 0) {
            let title = processSongFilename(songList[currentIndex - 1]);
            playSong(title);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let currentIndex = songList.indexOf(audioPlayer.src.split(`${currentFolder}/`)[1]);
        if (currentIndex + 1 < songList.length) {
            let title = processSongFilename(songList[currentIndex + 1]);
            playSong(title);
        }
    });
}

initializePlayer();
