console.log("Spotify Web Player - 10 Complete Songs Loaded & Show Password Feature Active");

// -------------------------------------------------------------
// 1. Data: The 10 Songs Uploaded by User (Complete Full Songs)
// -------------------------------------------------------------
const songs = [
    {
        id: 0,
        title: "Shape of You",
        artist: "Ed Sheeran",
        filePath: "/songs/1.mp3",
        coverPath: "/covers/1.jpg",
        duration: "03:37",
        durationSec: 217
    },
    {
        id: 1,
        title: "Ranjha",
        artist: "B Praak & Jasleen Royal (Shershaah)",
        filePath: "/songs/2.mp3",
        coverPath: "/covers/2.jpg",
        duration: "03:48",
        durationSec: 228
    },
    {
        id: 2,
        title: "Kaatrukulle",
        artist: "Yuvan Shankar Raja (Sarvam)",
        filePath: "/songs/3.mp3",
        coverPath: "/covers/3.jpg",
        duration: "04:22",
        durationSec: 262
    },
    {
        id: 3,
        title: "Malare",
        artist: "Vijay Yesudas (Premam)",
        filePath: "/songs/4.mp3",
        coverPath: "/covers/4.jpg",
        duration: "05:16",
        durationSec: 316
    },
    {
        id: 4,
        title: "New York Nagaram",
        artist: "A.R. Rahman (Sillunu Oru Kaadhal)",
        filePath: "/songs/5.mp3",
        coverPath: "/covers/5.jpg",
        duration: "06:19",
        durationSec: 379
    },
    {
        id: 5,
        title: "Illuminati",
        artist: "Sushin Shyam & Dabzee (Aavesham)",
        filePath: "/songs/6.mp3",
        coverPath: "/covers/6.jpg",
        duration: "02:28",
        durationSec: 148
    },
    {
        id: 6,
        title: "Blinding Lights",
        artist: "The Weeknd",
        filePath: "/songs/7.mp3",
        coverPath: "/covers/7.jpg",
        duration: "03:22",
        durationSec: 202
    },
    {
        id: 7,
        title: "Srivalli",
        artist: "Javed Ali & Sid Sriram (Pushpa)",
        filePath: "/songs/8.mp3",
        coverPath: "/covers/8.jpg",
        duration: "03:44",
        durationSec: 224
    },
    {
        id: 8,
        title: "Sanam Re",
        artist: "Arijit Singh & Mithoon",
        filePath: "/songs/9.mp3",
        coverPath: "/covers/9.jpg",
        duration: "05:07",
        durationSec: 307
    },
    {
        id: 9,
        title: "Maate Vinadhuga",
        artist: "Sid Sriram (Taxiwaala)",
        filePath: "/songs/10.mp3",
        coverPath: "/covers/10.jpg",
        duration: "05:07",
        durationSec: 307
    }
];

// -------------------------------------------------------------
// 2. Playback State & Global Audio Element
// -------------------------------------------------------------
let songIndex = 0;
let audioElement = new Audio();
audioElement.preload = "auto";

// Repeat Modes: 'all' | 'one' | 'off'
let repeatMode = 'all';
let isShuffle = false;
let isFilterLiked = false;

// DOM Elements
const masterPlay = document.getElementById('masterPlay');
const myProgressBar = document.getElementById('myProgressBar');
const gif = document.getElementById('gif');
const masterSongName = document.getElementById('masterSongName');
const masterArtistName = document.getElementById('masterArtistName');
const masterCover = document.getElementById('masterCover');
const masterLikeBtn = document.getElementById('masterLikeBtn');
const currentTimeDisplay = document.getElementById('currentTime');
const totalDurationDisplay = document.getElementById('totalDuration');
const volumeBar = document.getElementById('volumeBar');
const volumeIcon = document.getElementById('volumeIcon');
const songContainer = document.getElementById('songContainer');
const playAllBtn = document.getElementById('playAllBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const headerShuffleBtn = document.getElementById('headerShuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const headerRepeatBtn = document.getElementById('headerRepeatBtn');
const toastNotification = document.getElementById('toastNotification');
const toastMsg = document.getElementById('toastMsg');

// Toast Feedback Helper
function showToast(message, icon = "fa-circle-check") {
    if (!toastNotification || !toastMsg) return;
    toastMsg.innerText = message;
    const iconEl = toastNotification.querySelector('i');
    if (iconEl) iconEl.className = `fa-solid ${icon}`;
    toastNotification.classList.add('show');
    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 2600);
}

// Format seconds into mm:ss
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// -------------------------------------------------------------
// 3. User Likes & Saved Favorites
// -------------------------------------------------------------
function getUserLikedSongs() {
    const currentUser = getCurrentUser();
    if (!currentUser) return JSON.parse(localStorage.getItem('spotify_guest_likes') || '[]');
    return currentUser.likedSongs || [];
}

function toggleLikeSong(id) {
    const currentUser = getCurrentUser();
    let likes = getUserLikedSongs();
    const index = likes.indexOf(id);
    let isNowLiked = false;

    if (index > -1) {
        likes.splice(index, 1);
        showToast("Removed from Liked Songs", "fa-heart");
        isNowLiked = false;
    } else {
        likes.push(id);
        showToast("Added to Liked Songs", "fa-heart");
        isNowLiked = true;
    }

    if (currentUser) {
        currentUser.likedSongs = likes;
        updateUserRecord(currentUser);
    } else {
        localStorage.setItem('spotify_guest_likes', JSON.stringify(likes));
    }

    renderSongList();
    updateMasterLikeBtn();
}

function updateMasterLikeBtn() {
    if (!masterLikeBtn) return;
    const likes = getUserLikedSongs();
    const isLiked = likes.includes(songIndex);
    if (isLiked) {
        masterLikeBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #1db954;"></i>';
    } else {
        masterLikeBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
}

// -------------------------------------------------------------
// 4. Render Songs (Only the 10 Uploaded Songs)
// -------------------------------------------------------------
function renderSongList() {
    if (!songContainer) return;
    const likes = getUserLikedSongs();
    songContainer.innerHTML = '';

    const listToRender = isFilterLiked 
        ? songs.filter(s => likes.includes(s.id))
        : songs;

    if (listToRender.length === 0) {
        songContainer.innerHTML = `
            <div style="text-align: center; padding: 48px; color: #888;">
                <i class="fa-regular fa-heart fa-3x" style="margin-bottom: 12px; color: #555;"></i>
                <p>No liked songs yet! Click the heart icon on any of the 10 tracks to save it.</p>
            </div>
        `;
        return;
    }

    listToRender.forEach((song) => {
        const isCurrent = song.id === songIndex;
        const isPlaying = isCurrent && !audioElement.paused;
        const isLiked = likes.includes(song.id);

        const item = document.createElement('div');
        item.className = `songItem ${isCurrent ? 'active-song' : ''}`;
        item.setAttribute('data-id', song.id);

        item.innerHTML = `
            <div class="songItem-left">
                <span class="song-number">${isCurrent && isPlaying ? '<i class="fa-solid fa-volume-high" style="color:#1db954;"></i>' : (song.id + 1)}</span>
                <img alt="${song.title}" src="${song.coverPath}">
                <div class="song-details">
                    <span class="songName">${song.title}</span>
                    <span class="songArtist">${song.artist}</span>
                </div>
            </div>
            <div class="songItem-right">
                <button class="btn-like-song ${isLiked ? 'liked' : ''}" data-like-id="${song.id}" title="Like">
                    <i class="${isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
                </button>
                <div class="timestamp">
                    <span>${song.duration}</span>
                    <i class="songItemPlay far ${isPlaying ? 'fa-pause-circle' : 'fa-play-circle'}" id="itemPlay-${song.id}"></i>
                </div>
            </div>
        `;

        // Row click to play full song
        item.addEventListener('click', (e) => {
            if (e.target.closest('.btn-like-song')) {
                toggleLikeSong(song.id);
                return;
            }
            if (songIndex === song.id) {
                togglePlay();
            } else {
                playTrack(song.id);
            }
        });

        songContainer.appendChild(item);
    });
}

// -------------------------------------------------------------
// 5. Complete Song Playback (Plays 100% of the Audio File)
// -------------------------------------------------------------
function playTrack(index) {
    songIndex = index;
    const song = songs[songIndex];
    if (!song) return;

    // Update bottom player UI
    if (masterSongName) masterSongName.innerText = song.title;
    if (masterArtistName) masterArtistName.innerText = song.artist;
    if (masterCover) masterCover.src = song.coverPath;
    if (totalDurationDisplay) totalDurationDisplay.innerText = song.duration;
    updateMasterLikeBtn();

    // Direct HTTP Range streaming ensures the complete full song plays
    if (audioElement.src !== window.location.origin + song.filePath && !audioElement.src.endsWith(song.filePath)) {
        audioElement.src = song.filePath;
    }
    audioElement.currentTime = 0;

    // Enable native loop if repeatMode is 'one'
    audioElement.loop = (repeatMode === 'one');

    audioElement.play().then(() => {
        if (masterPlay) {
            masterPlay.classList.remove('fa-play-circle');
            masterPlay.classList.add('fa-pause-circle');
        }
        if (gif) gif.style.opacity = '1';
        renderSongList();
    }).catch(err => {
        console.log("Playback interaction required:", err);
    });
}

function togglePlay() {
    if (audioElement.paused || audioElement.currentTime <= 0) {
        if (!audioElement.src || audioElement.src === window.location.href) {
            playTrack(songIndex);
            return;
        }
        audioElement.play().then(() => {
            if (masterPlay) {
                masterPlay.classList.remove('fa-play-circle');
                masterPlay.classList.add('fa-pause-circle');
            }
            if (gif) gif.style.opacity = '1';
            renderSongList();
        }).catch(err => console.log(err));
    } else {
        audioElement.pause();
        if (masterPlay) {
            masterPlay.classList.remove('fa-pause-circle');
            masterPlay.classList.add('fa-play-circle');
        }
        if (gif) gif.style.opacity = '0';
        renderSongList();
    }
}

function nextTrack() {
    if (isShuffle) {
        let randIdx = Math.floor(Math.random() * songs.length);
        if (randIdx === songIndex) randIdx = (randIdx + 1) % songs.length;
        playTrack(randIdx);
        return;
    }

    if (songIndex >= songs.length - 1) {
        if (repeatMode === 'all') {
            playTrack(0);
        } else if (repeatMode === 'off') {
            // Stop at end of list
            audioElement.pause();
            audioElement.currentTime = 0;
            if (masterPlay) {
                masterPlay.classList.remove('fa-pause-circle');
                masterPlay.classList.add('fa-play-circle');
            }
            if (gif) gif.style.opacity = '0';
            renderSongList();
        }
    } else {
        playTrack(songIndex + 1);
    }
}

function prevTrack() {
    // If more than 3 seconds in, restart current track
    if (audioElement.currentTime > 3) {
        audioElement.currentTime = 0;
        return;
    }
    if (songIndex <= 0) {
        playTrack(songs.length - 1);
    } else {
        playTrack(songIndex - 1);
    }
}

// Repeat Modes: 'all' -> 'one' -> 'off'
function toggleRepeatMode() {
    if (repeatMode === 'all') {
        repeatMode = 'one';
        audioElement.loop = true;
        showToast("Repeat One: Playing current song on repeat", "fa-repeat");
    } else if (repeatMode === 'one') {
        repeatMode = 'off';
        audioElement.loop = false;
        showToast("Repeat: Off", "fa-repeat");
    } else {
        repeatMode = 'all';
        audioElement.loop = false;
        showToast("Repeat All: Enabled for all 10 songs", "fa-repeat");
    }
    updateRepeatUI();
}

function updateRepeatUI() {
    [repeatBtn, headerRepeatBtn].forEach(btn => {
        if (!btn) return;
        btn.classList.remove('active', 'repeat-one');
        if (repeatMode === 'all') {
            btn.classList.add('active');
            btn.title = "Repeat: All (Click for Repeat One)";
        } else if (repeatMode === 'one') {
            btn.classList.add('active', 'repeat-one');
            btn.title = "Repeat: One Track Loop (Click to turn off)";
        } else {
            btn.title = "Repeat: Off (Click to repeat all)";
        }
    });
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    [shuffleBtn, headerShuffleBtn].forEach(btn => {
        if (!btn) return;
        btn.classList.toggle('active', isShuffle);
    });
    showToast(isShuffle ? "Shuffle Playback: On" : "Shuffle: Off", "fa-shuffle");
}

// -------------------------------------------------------------
// 6. Playback Event Listeners & Progress Scrubbing
// -------------------------------------------------------------
if (masterPlay) masterPlay.addEventListener('click', togglePlay);
document.getElementById('next')?.addEventListener('click', nextTrack);
document.getElementById('previous')?.addEventListener('click', prevTrack);
if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeatMode);
if (headerRepeatBtn) headerRepeatBtn.addEventListener('click', toggleRepeatMode);
if (shuffleBtn) shuffleBtn.addEventListener('click', toggleShuffle);
if (headerShuffleBtn) headerShuffleBtn.addEventListener('click', toggleShuffle);

if (playAllBtn) {
    playAllBtn.addEventListener('click', () => {
        playTrack(0);
        showToast("Playing all 10 tracks", "fa-play");
    });
}

if (masterLikeBtn) {
    masterLikeBtn.addEventListener('click', () => toggleLikeSong(songIndex));
}

// Complete Song End Handler
audioElement.addEventListener('ended', () => {
    if (repeatMode === 'one') {
        audioElement.currentTime = 0;
        audioElement.play().catch(() => {});
    } else {
        nextTrack();
    }
});

// Update Progress Bar & Current Time Display
audioElement.addEventListener('timeupdate', () => {
    if (audioElement.duration) {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        if (myProgressBar) myProgressBar.value = isNaN(progress) ? '0' : progress.toString();
        if (currentTimeDisplay) currentTimeDisplay.innerText = formatTime(audioElement.currentTime);
        if (totalDurationDisplay) totalDurationDisplay.innerText = formatTime(audioElement.duration);
    }
});

// Seeking (Scrubbing across the complete track)
if (myProgressBar) {
    myProgressBar.addEventListener('input', () => {
        if (audioElement.duration) {
            audioElement.currentTime = (Number(myProgressBar.value) * audioElement.duration) / 100;
        }
    });
}

// Volume Controls
if (volumeBar) {
    audioElement.volume = Number(volumeBar.value) / 100;
    volumeBar.addEventListener('input', () => {
        const vol = Number(volumeBar.value) / 100;
        audioElement.volume = vol;
        if (volumeIcon) {
            if (vol === 0) {
                volumeIcon.className = "fa-solid fa-volume-xmark";
            } else if (vol < 0.5) {
                volumeIcon.className = "fa-solid fa-volume-low";
            } else {
                volumeIcon.className = "fa-solid fa-volume-high";
            }
        }
    });
}

if (volumeIcon) {
    let prevVolume = 0.85;
    volumeIcon.addEventListener('click', () => {
        if (audioElement.volume > 0) {
            prevVolume = audioElement.volume;
            audioElement.volume = 0;
            if (volumeBar) volumeBar.value = '0';
            volumeIcon.className = "fa-solid fa-volume-xmark";
        } else {
            audioElement.volume = prevVolume;
            if (volumeBar) volumeBar.value = String(prevVolume * 100);
            volumeIcon.className = "fa-solid fa-volume-high";
        }
    });
}

// -------------------------------------------------------------
// 7. Show Password Feature & Authentication
// -------------------------------------------------------------
let authMode = 'signup'; // 'signup' | 'login'
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authPasswordLabel = document.getElementById('authPasswordLabel');
const authSwitchPrompt = document.getElementById('authSwitchPrompt');
const authSwitchLink = document.getElementById('authSwitchLink');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const nameGroup = document.getElementById('nameGroup');
const authNameInput = document.getElementById('authNameInput');
const authEmailInput = document.getElementById('authEmailInput');
const authPasswordInput = document.getElementById('authPasswordInput');
const authErrorMsg = document.getElementById('authErrorMsg');
const guestContinueBtn = document.getElementById('guestContinueBtn');
const authNavGuest = document.getElementById('authNavGuest');
const userProfileMenu = document.getElementById('userProfileMenu');
const userAvatarBtn = document.getElementById('userAvatarBtn');
const userInitial = document.getElementById('userInitial');
const navUsername = document.getElementById('navUsername');
const userEmailItem = document.getElementById('userEmailItem');
const userDropdown = document.getElementById('userDropdown');
const logoutBtn = document.getElementById('logoutBtn');
const filterLikedSongs = document.getElementById('filterLikedSongs');

// Show Password Toggle Feature
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const togglePasswordIcon = document.getElementById('togglePasswordIcon');

if (togglePasswordBtn && authPasswordInput && togglePasswordIcon) {
    togglePasswordBtn.addEventListener('click', () => {
        if (authPasswordInput.type === 'password') {
            authPasswordInput.type = 'text';
            togglePasswordIcon.className = 'fa-regular fa-eye-slash';
            togglePasswordBtn.title = 'Hide password';
        } else {
            authPasswordInput.type = 'password';
            togglePasswordIcon.className = 'fa-regular fa-eye';
            togglePasswordBtn.title = 'Show password';
        }
    });
}

function resetPasswordVisibility() {
    if (authPasswordInput) authPasswordInput.type = 'password';
    if (togglePasswordIcon) togglePasswordIcon.className = 'fa-regular fa-eye';
    if (togglePasswordBtn) togglePasswordBtn.title = 'Show password';
}

function getUsers() {
    return JSON.parse(localStorage.getItem('spotify_users') || '[]');
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('spotify_current_user') || 'null');
}

function updateUserRecord(user) {
    localStorage.setItem('spotify_current_user', JSON.stringify(user));
    const users = getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx > -1) {
        users[idx] = user;
        localStorage.setItem('spotify_users', JSON.stringify(users));
    }
}

function setAuthMode(mode) {
    authMode = mode;
    resetPasswordVisibility();
    if (authErrorMsg) authErrorMsg.style.display = 'none';

    if (mode === 'signup') {
        if (authTitle) authTitle.innerText = "Sign up to start listening";
        if (authSubtitle) authSubtitle.innerText = "Create your free account to access your personal music library";
        if (authPasswordLabel) authPasswordLabel.innerText = "Create a password";
        if (nameGroup) nameGroup.style.display = 'flex';
        if (authSubmitBtn) authSubmitBtn.innerText = "Sign Up";
        if (authSwitchPrompt) authSwitchPrompt.innerText = "Already have an account?";
        if (authSwitchLink) authSwitchLink.innerText = "Log in here";
    } else {
        if (authTitle) authTitle.innerText = "Log in to Spotify";
        if (authSubtitle) authSubtitle.innerText = "Welcome back! Enter your details to continue listening";
        if (authPasswordLabel) authPasswordLabel.innerText = "Password";
        if (nameGroup) nameGroup.style.display = 'none';
        if (authSubmitBtn) authSubmitBtn.innerText = "Log In";
        if (authSwitchPrompt) authSwitchPrompt.innerText = "Don't have an account?";
        if (authSwitchLink) authSwitchLink.innerText = "Sign up here";
    }
}

function updateNavAuthUI() {
    const user = getCurrentUser();
    if (user) {
        if (authNavGuest) authNavGuest.style.display = 'none';
        if (userProfileMenu) userProfileMenu.style.display = 'block';
        if (navUsername) navUsername.innerText = user.name || "User";
        if (userInitial) userInitial.innerText = (user.name || "U")[0].toUpperCase();
        if (userEmailItem) userEmailItem.innerText = user.email;
    } else {
        if (authNavGuest) authNavGuest.style.display = 'flex';
        if (userProfileMenu) userProfileMenu.style.display = 'none';
    }
}

function openAuth(mode = 'signup') {
    setAuthMode(mode);
    if (authModal) authModal.classList.add('active');
}

function closeAuth() {
    resetPasswordVisibility();
    if (authModal) authModal.classList.remove('active');
}

document.getElementById('openSignupBtn')?.addEventListener('click', () => openAuth('signup'));
document.getElementById('openLoginBtn')?.addEventListener('click', () => openAuth('login'));
document.getElementById('closeAuthModal')?.addEventListener('click', closeAuth);
authSwitchLink?.addEventListener('click', () => setAuthMode(authMode === 'signup' ? 'login' : 'signup'));

guestContinueBtn?.addEventListener('click', () => {
    localStorage.setItem('spotify_guest_acknowledged', 'true');
    closeAuth();
    showToast("Continuing as Guest. Enjoy the full songs!", "fa-user");
});

// Auth Form Submission
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = authEmailInput.value.trim().toLowerCase();
        const password = authPasswordInput.value;
        const users = getUsers();

        if (authMode === 'signup') {
            const name = authNameInput.value.trim();
            if (!name) {
                showAuthError("Please enter your name.");
                return;
            }

            try {
                // Register via Database API
                const resp = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: name,
                        username: name.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 900 + 100),
                        email,
                        password
                    })
                });
                const resData = await resp.json();

                if (!resp.ok) {
                    showAuthError(resData.message || "Registration failed.");
                    return;
                }

                const newUser = {
                    id: resData.user?.id || Date.now(),
                    name: resData.user?.fullName || name,
                    username: resData.user?.username || name,
                    email,
                    password,
                    likedSongs: JSON.parse(localStorage.getItem('spotify_guest_likes') || '[]'),
                    createdAt: new Date().toISOString()
                };

                users.push(newUser);
                localStorage.setItem('spotify_users', JSON.stringify(users));
                localStorage.setItem('spotify_current_user', JSON.stringify(newUser));
                closeAuth();
                updateNavAuthUI();
                renderSongList();
                showToast(`Welcome, ${name}! Registered successfully.`, "fa-circle-check");
            } catch (err) {
                // Offline fallback
                if (users.some(u => u.email === email)) {
                    showAuthError("An account with this email already exists.");
                    return;
                }
                const fallbackUser = {
                    id: Date.now(),
                    name,
                    email,
                    password,
                    likedSongs: JSON.parse(localStorage.getItem('spotify_guest_likes') || '[]'),
                    createdAt: new Date().toISOString()
                };
                users.push(fallbackUser);
                localStorage.setItem('spotify_users', JSON.stringify(users));
                localStorage.setItem('spotify_current_user', JSON.stringify(fallbackUser));
                closeAuth();
                updateNavAuthUI();
                renderSongList();
                showToast(`Welcome, ${name}! Saved.`, "fa-circle-check");
            }
        } else {
            // Login via Database API
            try {
                const resp = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usernameOrEmail: email,
                        password
                    })
                });
                const resData = await resp.json();

                if (!resp.ok) {
                    showAuthError(resData.message || "Invalid email or password.");
                    return;
                }

                const loggedUser = {
                    id: resData.user.id,
                    name: resData.user.fullName || resData.user.username,
                    username: resData.user.username,
                    email: resData.user.email,
                    likedSongs: JSON.parse(localStorage.getItem('spotify_guest_likes') || '[]')
                };

                localStorage.setItem('spotify_current_user', JSON.stringify(loggedUser));
                closeAuth();
                updateNavAuthUI();
                renderSongList();
                showToast(`Welcome back, ${loggedUser.name}!`, "fa-circle-check");
            } catch (err) {
                // Offline fallback
                const existingUser = users.find(u => u.email === email && u.password === password);
                if (!existingUser) {
                    showAuthError("Invalid email or password. Please try again.");
                    return;
                }
                localStorage.setItem('spotify_current_user', JSON.stringify(existingUser));
                closeAuth();
                updateNavAuthUI();
                renderSongList();
                showToast(`Welcome back, ${existingUser.name}!`, "fa-circle-check");
            }
        }
    });
}

function showAuthError(msg) {
    if (!authErrorMsg) return;
    authErrorMsg.innerText = msg;
    authErrorMsg.style.display = 'block';
}

// User Profile Menu Dropdown
userAvatarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown?.classList.toggle('show');
});

window.addEventListener('click', () => {
    userDropdown?.classList.remove('show');
});

logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('spotify_current_user');
    updateNavAuthUI();
    isFilterLiked = false;
    renderSongList();
    showToast("Logged out successfully.", "fa-right-from-bracket");
});

filterLikedSongs?.addEventListener('click', () => {
    isFilterLiked = !isFilterLiked;
    const title = document.getElementById('playlistTitle');
    if (title) {
        title.innerText = isFilterLiked ? "Your Liked Songs" : "My Downloaded Songs";
    }
    renderSongList();
    showToast(isFilterLiked ? "Showing Liked Songs" : "Showing All 10 Songs", "fa-heart");
});

// First-Time User Prompt Check
function checkFirstTimeUser() {
    const currentUser = getCurrentUser();
    const guestAcknowledged = localStorage.getItem('spotify_guest_acknowledged');
    if (!currentUser && !guestAcknowledged) {
        setTimeout(() => {
            openAuth('signup');
        }, 500);
    }
}

// -------------------------------------------------------------
// 8. Modals (GitHub Repo & About)
// -------------------------------------------------------------
const repoModal = document.getElementById('repoModal');
const aboutModal = document.getElementById('aboutModal');

document.getElementById('repoBtn')?.addEventListener('click', () => repoModal?.classList.add('active'));
document.getElementById('closeRepoModal')?.addEventListener('click', () => repoModal?.classList.remove('active'));
document.getElementById('closeRepoBtn')?.addEventListener('click', () => repoModal?.classList.remove('active'));

document.getElementById('navAbout')?.addEventListener('click', () => aboutModal?.classList.add('active'));
document.getElementById('closeAboutModal')?.addEventListener('click', () => aboutModal?.classList.remove('active'));
document.getElementById('closeAboutBtn')?.addEventListener('click', () => aboutModal?.classList.remove('active'));

document.getElementById('brandBtn')?.addEventListener('click', () => {
    isFilterLiked = false;
    const title = document.getElementById('playlistTitle');
    if (title) title.innerText = "My Downloaded Songs";
    renderSongList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('navLibrary')?.addEventListener('click', () => {
    isFilterLiked = false;
    const title = document.getElementById('playlistTitle');
    if (title) title.innerText = "My Downloaded Songs";
    renderSongList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('click', (e) => {
    if (e.target === repoModal) repoModal.classList.remove('active');
    if (e.target === aboutModal) aboutModal.classList.remove('active');
    if (e.target === authModal) closeAuth();
});

// -------------------------------------------------------------
// 9. Initial Load & Setup
// -------------------------------------------------------------
updateNavAuthUI();
updateRepeatUI();
renderSongList();
checkFirstTimeUser();

// Initial bottom player preview
if (songs[0]) {
    if (masterSongName) masterSongName.innerText = songs[0].title;
    if (masterArtistName) masterArtistName.innerText = songs[0].artist;
    if (masterCover) masterCover.src = songs[0].coverPath;
    if (totalDurationDisplay) totalDurationDisplay.innerText = songs[0].duration;
    audioElement.src = songs[0].filePath;
    updateMasterLikeBtn();
}
