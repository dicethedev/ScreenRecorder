let stream = null,
     audio = null,
     //mixedStream is combining the two ( stream and audio)
     mixedStream = null,
     chunks = [],
     recorder = null,
     startButton = null,
     stopButton = null,
     downloadButton = null,
     recordedVideo = null;


//Creating an async function below

async function setupStream() {
     try {
          stream = await navigator.mediaDevices.getDisplayMedia({
               video: true
          });
          //this code is allowing you to allow the Microphone in your browser to enabled or disabled
          audio = await navigator.mediaDevices.getUserMedia({
               audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
               }
          });

          setupVideoFeedback();
     } catch (err) {
          console.error(err);
     }
}

function setupVideoFeedback() {
     if (stream) {
          const video = document.querySelector('.video-feedback');
          video.srcObject = stream;
          video.play();
     } else {
          console.warn('No stream available');
     }
}

async function startRecording() {
     await setupStream();

     //The condition here is performing this - to get music while recording 
     if (stream && audio) {
          mixedStream = new MediaStream([
               ...stream.getTracks(),
               ...audio.getTracks()
          ]);
          recorder = new MediaRecorder(mixedStream);
          recorder.ondataavailable = handleDataAvailable;
          recorder.onstop = handleStop;
          //every 200s it will create new chunks and pass it to ondataavailable
          recorder.start(200);

          startButton.disabled = true;
          stopButton.disabled = false;

          console.log("Recording has started...");
     } else {
          console.warn('No streaming available');
     }
}
// if no stream available then i created a new function handleDataAvailable

function handleDataAvailable(e) {
     chunks.push(e.data);
}

function stopRecording() {
     recorder.stop();

     startButton.disabled = false;
     stopButton.disabled = true;

     console.log("Recording has stopped..");
}

// This will combine all our chunks below code
function handleStop(e) {
     const blob = new Blob(chunks, {
          type: 'video/mp4'
     })
     chunks = [];

     downloadButton.href = URL.createObjectURL(blob);
     downloadButton.download = 'video/mp4';
     downloadButton.disabled = false;

     recordedVideo.src = URL.createObjectURL(blob);
     recordedVideo.load();
     recordedVideo.onloadeddata = () => {
          recordedVideo.play();

          const rc = document.querySelector('.recorded-video-wrap');
          rc.classList.remove("hidden");
          rc.scrollIntoView({ behavior: "smooth", block: "start" });
     }

     //Playing tracks

     stream.getTracks().forEach(track => track.stop());
     audio.getTracks().forEach(track => track.stop());

     console.log("Your recording has been prepared!");
}


//If you don't get the actual video display what you are going to do is (The code is below)

window.addEventListener('load', () => {
     startButton = document.querySelector('.start-recording');
     stopButton = document.querySelector('.stop-recording');
     downloadButton = document.querySelector('.download-video');
     recordedVideo = document.querySelector('.recorded-video');

     startButton.addEventListener('click', startRecording);
     stopButton.addEventListener('click', stopRecording);
     //downloadButton.addEventListener('click', downlaodButton);

})
