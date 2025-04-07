document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const speechTab = document.getElementById('speechTab');
    const pasteTab = document.getElementById('pasteTab');
    const speechInput = document.getElementById('speechInput');
    const pasteInput = document.getElementById('pasteInput');

    speechTab.addEventListener('click', () => {
        speechTab.classList.add('active');
        pasteTab.classList.remove('active');
        speechInput.classList.add('active');
        pasteInput.classList.remove('active');
    });

    pasteTab.addEventListener('click', () => {
        pasteTab.classList.add('active');
        speechTab.classList.remove('active');
        pasteInput.classList.add('active');
        speechInput.classList.remove('active');
    });

    // Speech recognition setup
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const transcript = document.getElementById('transcript');
    const status = document.getElementById('status');
    const analysis = document.getElementById('analysis');

    let recognition = null;
    let isRecording = false;
    let finalTranscript = '';

    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        status.textContent = 'Speech recognition is not supported in this browser.';
        startButton.disabled = true;
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
        analysis.innerHTML = '<p>Your interview analysis will appear here after clicking "Analyze"</p>';
        finalTranscript = '';
        recognition.start();
    });

    stopButton.addEventListener('click', () => {
        recognition.stop();
        analyzeTranscript(finalTranscript);
    });

    // Pasted text analysis
    const analyzePastedButton = document.getElementById('analyzePastedButton');
    const transcriptInput = document.getElementById('transcriptInput');

    analyzePastedButton.addEventListener('click', () => {
        const pastedText = transcriptInput.value.trim();
        if (!pastedText) {
            status.textContent = 'Please paste a transcript first.';
            return;
        }
        analyzeTranscript(pastedText);
    });

    // Common analysis function
    async function analyzeTranscript(text) {
        status.textContent = 'Analyzing transcript...';
        analysis.innerHTML = '<p>Analyzing transcript...</p>';

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text }),
            });

            const data = await response.json();

            if (response.ok) {
                analysis.innerHTML = `<p>${data.analysis}</p>`;
                status.textContent = 'Analysis complete!';
            } else {
                throw new Error(data.error || 'Failed to analyze transcript');
            }
        } catch (error) {
            status.textContent = `Error: ${error.message}`;
            analysis.innerHTML = '<p>Error analyzing transcript. Please try again.</p>';
        }
    }
}); 