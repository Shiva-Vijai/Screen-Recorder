let statusBox;
let streamVideo;
let startBtn;
let stopBtn;
let pausePlayBtn
let downloadMP4;
let downloadWebM;
let downloadBtn1
let downloadBtn2 
let stream;
let streamVid;
let streamAud;
let userAudio;
let combinedStream;
let recorder;
let toggler;
let downloadName;
let togglerVal
let chunks = [];



function defineStartStop () {
    val = startBtn.innerHTML;

    if (val == 'Start recording') {
        startRecording()
    };

    if (val == 'Stop recording') {
        stopRecording()
};
};

async function sourceSetup () {
    try {
        //Get system screen + system audio
        stream = await navigator.mediaDevices.getDisplayMedia({ 
            video: {mediaSource: 'screen', }, audio: true, });

        streamVid = stream.getVideoTracks()
        streamAud = stream.getAudioTracks()
        
        if (togglerVal == 'true') {

            userAudio = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });
        } else {
            userAudio = null;
        }
        


        displayStream();
} catch (err) {
    console.error(err);
}};

function displayStream () {
    if (stream) {
        streamVideo.srcObject = stream;
        streamVideo.play();
        streamVideo.muted = true;
        streamVideo.controls = false;
        startBtn.innerHTML = 'Stop recording';
    } else {
        console.warn('No stream available')
    }
}

async function startRecording() {
    await sourceSetup();
    if (stream) {
        console.log("stream found");
        if (userAudio) {
            console.log('User Audio found');
            if (streamAud.length == '0') {
                console.log('No stream audio');
                combinedStream = new MediaStream([...streamVid, ...userAudio.getTracks()]);
    
            } else {
                console.log('ALL streams present');
                let MediaStream_1 = new MediaStream();
                MediaStream_1.addTrack(streamAud[0]);
        
                let MediaStream_2 = new MediaStream();
                MediaStream_2.addTrack(userAudio.getTracks()[0]);
        
                const audioContext = new AudioContext();
        
                audio_1 = audioContext.createMediaStreamSource(MediaStream_1);
                audio_2 = audioContext.createMediaStreamSource(MediaStream_2);
        
                dest = audioContext.createMediaStreamDestination();
        
                audio_1.connect(dest);
                audio_2.connect(dest);
        
                let FinalStream = dest.stream;
        
                combinedStream = new MediaStream([...streamVid, ...FinalStream.getTracks()]);
                
            }

        } else {
            console.log('No user audio');
            if (streamAud.length == 0) {
                console.log('No stream audio');
                combinedStream = new MediaStream([...streamVid]);

            } else {
                console.log("Stream audio present");
                combinedStream = new MediaStream([...streamVid, ...streamAud]);
             };
        }

        
        recorder = new MediaRecorder(combinedStream);

        recorder.ondataavailable = onDataAvailable;
        recorder.onstop = onStop;
        recorder.onerror = onError;
        recorder.onpause = onPause;
        recorder.onresume = onResume;

        recorder.start(1000);
        
        statusBox.innerHTML = 'Status: RECORDING<i class="bi bi-record2"></i>';
        pausePlayBtn.classList.remove("disabled");
        downloadBtn1.classList.add('disabled');
        downloadBtn2.classList.add('disabled');
        downloadName.setAttribute('disabled', '');
        toggler.setAttribute('disabled', '');
        
    
        console.log('Recording started');
        
        combinedStream.getVideoTracks()[0].onended = () => {
            stopRecording();
        };
        
	} else {
		console.warn('No stream available.');
	};
    

    
    };

function onDataAvailable(e) {
    chunks.push(e.data);
};


function stopRecording() {
    recorder.stop();
    console.log('Recording stopped');

    stream.getTracks().forEach((track) => track.stop());
    if (userAudio) {userAudio.getTracks().forEach((track) => track.stop());};
    startBtn.innerHTML = 'Start recording';
    statusBox.innerHTML = 'Status: Ready for next recording';
};
function onStop () {
    let blobDataMP4 = new Blob(chunks, { type: 'video/mp4' });
    let blobDataWEBM = new Blob(chunks, { type: 'video/webm' }); 
    chunks= [];
    let url = URL.createObjectURL(blobDataMP4);
    let urlWEBM = URL.createObjectURL(blobDataWEBM);
    if (!downloadName.value== '') {
        downloadMP4.download = `${downloadName.value}.mp4`
        downloadWebM.download = `${downloadName.value}.webm`
    } 
    downloadMP4.href = url;
    downloadWebM.href = urlWEBM;
    streamVideo.srcObject = null;
    streamVideo.src = url;
    streamVideo.controls = true;
    streamVideo.muted = false;
    streamVideo.play();
    pausePlayBtn.classList.add("disabled");
    downloadBtn1.classList.remove('disabled');
    downloadBtn2.classList.remove('disabled');
    downloadName.removeAttribute('disabled', '');
    toggler.removeAttribute('disabled', '');
};

function pauseRecording() {
    recorder.pause();
};
function onPause() {
    statusBox.innerHTML = 'Status: Paused<i class="bi bi-pause-fill"></i>';
};

function resumeRecording() {
    recorder.resume();
};
function onResume() {
    statusBox.innerHTML = 'Status: Resumed<i class="bi bi-play-fill"></i>';
};



function onError(e) {
    console.log(`error while recording: ${e}`);
};
window.addEventListener('load', () => {
    statusBox = document.querySelector('.statusBox');
    streamVideo = document.querySelector('.streamVideo');
    startBtn = document.querySelector('.startBtn');
    pausePlayBtn = document.querySelector('.pausePlay');
    downloadName = document.querySelector('.downloadName');
    downloadMP4 = document.querySelector('.downloadMP4');
    downloadWebM = document.querySelector('.downloadWebM');
    downloadBtn1 = document.querySelector('.downloadBtn1');
    downloadBtn2 = document.querySelector('.downloadBtn2');
    toggler = document.querySelector('.toggler');

    startBtn.addEventListener('click', defineStartStop);

    toggler.addEventListener('click', () => {
            togglerVal = toggler.value;
            
            if (togglerVal == 'false') {
                toggler.value = true;
            } else {
                toggler.value = false;
            }
            togglerVal = toggler.value;

            
    });

    pausePlayBtn.addEventListener('click', () =>{
        if (pausePlayBtn.innerHTML == 'Pause recording <i class="bi bi-pause-circle"></i>') {
            pausePlayBtn.innerHTML = 'Resume recording <i class="bi bi-play-circle"></i>';
            pauseRecording();
        } else {
            pausePlayBtn.innerHTML = 'Pause recording <i class="bi bi-pause-circle"></i>'
            resumeRecording();
        }
    });
    console.log("================================================================");
    console.log("  ___  ___ ___ ___ ___ _  _   ___ ___ ___ ___  ___ ___  ___ ___ \r\n \/ __|\/ __| _ \\ __| __| \\| | | _ \\ __\/ __\/ _ \\| _ \\   \\| __| _ \\\r\n \\__ \\ (__|   \/ _|| _|| .` | |   \/ _| (_| (_) |   \/ |) | _||   \/\r\n |___\/\\___|_|_\\___|___|_|\\_| |_|_\\___\\___\\___\/|_|_\\___\/|___|_|_\\\r\n                                                                ");
    console.log("================================================================");
    console.log("This screen recorder is made by Shiva Vijai. Check out my Github Repository given at the end of this website for more information");

})


if (localStorage.getItem('theme') == 'dark-mode') {
    setDarkMode();
} 

function setDarkMode() {
    let isDark = document.body.classList.toggle('dark-mode');

    if (isDark) {
        
        localStorage.setItem('theme', 'dark-mode');
        document.getElementById('checkbox').setAttribute('checked', 'checked');
    } else {
        localStorage.removeItem('theme', 'dark-mode');
    }
}



