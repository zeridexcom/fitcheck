// Voice AI Service - Speech Recognition + Text-to-Speech

class VoiceService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.onResult = null;
        this.onError = null;

        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');

                if (event.results[event.results.length - 1].isFinal) {
                    this.onResult?.(transcript, true);
                } else {
                    this.onResult?.(transcript, false);
                }
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                this.onError?.(event.error);
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };
        }
    }

    // Check if speech recognition is available
    isSupported() {
        return this.recognition !== null;
    }

    // Start listening
    startListening(onResult, onError) {
        if (!this.recognition) {
            onError?.('Speech recognition not supported');
            return false;
        }

        this.onResult = onResult;
        this.onError = onError;
        this.isListening = true;

        try {
            this.recognition.start();
            return true;
        } catch (e) {
            this.isListening = false;
            onError?.(e.message);
            return false;
        }
    }

    // Stop listening
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    // Text to speech
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }

            // Cancel any ongoing speech
            this.synthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate || 1;
            utterance.pitch = options.pitch || 1;
            utterance.volume = options.volume || 1;

            // Try to find a good voice
            const voices = this.synthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex')
            ) || voices[0];

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onend = () => resolve();
            utterance.onerror = (e) => reject(e);

            this.synthesis.speak(utterance);
        });
    }

    // Stop speaking
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    // Parse food command
    parseFoodCommand(transcript) {
        const lower = transcript.toLowerCase();

        // Patterns for food logging
        const patterns = [
            /(?:i (?:ate|had|just ate|just had)|log|add)\s+(.+)/i,
            /(?:eating|having)\s+(.+)/i,
            /^(.+)\s+for\s+(?:breakfast|lunch|dinner|snack)/i,
        ];

        for (const pattern of patterns) {
            const match = lower.match(pattern);
            if (match) {
                return { type: 'log_food', food: match[1].trim() };
            }
        }

        // Water commands
        if (/(?:drink|had|log)\s*(?:a\s+)?(?:glass|cup|bottle)?\s*(?:of\s+)?water/i.test(lower)) {
            return { type: 'log_water', amount: 250 };
        }

        if (/(?:drink|had|log)\s*(\d+)\s*(?:ml|glasses?|cups?)/i.test(lower)) {
            const match = lower.match(/(\d+)\s*(?:ml|glasses?|cups?)/i);
            const amount = parseInt(match[1]);
            return { type: 'log_water', amount: amount < 10 ? amount * 250 : amount };
        }

        // Workout commands
        if (/(?:did|completed|finished)\s+(?:a\s+)?(.+)\s+workout/i.test(lower)) {
            const match = lower.match(/(.+)\s+workout/i);
            return { type: 'log_workout', workout: match[1].trim() };
        }

        // Question commands
        if (/(?:how many|what|show me|tell me)/i.test(lower)) {
            return { type: 'question', query: transcript };
        }

        return { type: 'unknown', text: transcript };
    }
}

export const voiceService = new VoiceService();
export default voiceService;
