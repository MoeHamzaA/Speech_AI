document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const transcript = document.getElementById('transcript');
    const status = document.getElementById('status');

    let recognition = null;
    let isRecording = false;

    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        status.textContent = 'Speech recognition is not supported in this browser.';
        startButton.disabled = true;
        return;
    }

    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Event handlers
    recognition.onstart = () => {
        isRecording = true;
        startButton.disabled = true;
        stopButton.disabled = false;
        status.textContent = 'Recording in progress...';
    };

    recognition.onend = () => {
        isRecording = false;
        startButton.disabled = false;
        stopButton.disabled = true;
        status.textContent = 'Recording stopped.';
    };

    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        transcript.innerHTML = finalTranscript + '<span style="color: #999;">' + interimTranscript + '</span>';
    };

    recognition.onerror = (event) => {
        status.textContent = 'Error occurred: ' + event.error;
        isRecording = false;
        startButton.disabled = false;
        stopButton.disabled = true;
    };

    // Button event listeners
    startButton.addEventListener('click', () => {
        transcript.textContent = '';
        recognition.start();
    });

    stopButton.addEventListener('click', () => {
        recognition.stop();
    });
}); 