document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const analyzeButton = document.getElementById('analyzeButton');
    const transcript = document.getElementById('transcript');
    const analysis = document.getElementById('analysis');
    const status = document.getElementById('status');

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
        analyzeButton.disabled = true;
        status.textContent = 'Recording in progress...';
    };

    recognition.onend = () => {
        isRecording = false;
        startButton.disabled = false;
        stopButton.disabled = true;
        analyzeButton.disabled = false;
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
        analyzeButton.disabled = true;
    };

    // Button event listeners
    startButton.addEventListener('click', () => {
        transcript.textContent = '';
        analysis.innerHTML = '<p>Your text analysis will appear here after clicking "Analyze Text"</p>';
        finalTranscript = '';
        recognition.start();
    });

    stopButton.addEventListener('click', () => {
        recognition.stop();
    });

    analyzeButton.addEventListener('click', async () => {
        if (!finalTranscript.trim()) {
            status.textContent = 'No text to analyze. Please record some speech first.';
            return;
        }

        analyzeButton.disabled = true;
        status.textContent = 'Analyzing text...';
        analysis.innerHTML = '<p>Analyzing text...</p>';

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: finalTranscript }),
            });

            const data = await response.json();

            if (response.ok) {
                analysis.innerHTML = `<p>${data.analysis}</p>`;
                status.textContent = 'Analysis complete!';
            } else {
                throw new Error(data.error || 'Failed to analyze text');
            }
        } catch (error) {
            status.textContent = `Error: ${error.message}`;
            analysis.innerHTML = '<p>Error analyzing text. Please try again.</p>';
        } finally {
            analyzeButton.disabled = false;
        }
    });
}); 