// FitBuddy Voice Service - Enhanced with Wake Word Detection
// Wake word: "Hey FitBuddy" or "Hey Buddy" or "FitBuddy"

class FitBuddyService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isAwake = false;
        this.wakeWords = ['hey fitbuddy', 'hey buddy', 'fitbuddy', 'hey fit buddy', 'fit buddy'];
        this.awakeTimeout = null;
        this.onWakeUp = null;
        this.onCommand = null;
        this.onTranscript = null;
        this.onStatusChange = null;
        this.lastProcessedText = '';

        this.initRecognition();
    }

    initRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript.toLowerCase().trim();

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Check for wake word
            const allText = (interimTranscript + ' ' + finalTranscript).toLowerCase();

            if (!this.isAwake) {
                for (const wake of this.wakeWords) {
                    if (allText.includes(wake)) {
                        this.wakeUp();
                        // Remove wake word from command
                        const commandAfterWake = allText.split(wake).pop()?.trim();
                        if (commandAfterWake && commandAfterWake.length > 3) {
                            this.processCommand(commandAfterWake);
                        }
                        return;
                    }
                }

                if (this.onTranscript) {
                    this.onTranscript(interimTranscript || finalTranscript, false);
                }
            } else {
                // Already awake, process as command
                if (finalTranscript && finalTranscript !== this.lastProcessedText) {
                    this.lastProcessedText = finalTranscript;
                    this.processCommand(finalTranscript);
                }

                if (this.onTranscript) {
                    this.onTranscript(interimTranscript || finalTranscript, true);
                }
            }
        };

        this.recognition.onend = () => {
            // Auto-restart if still listening
            if (this.isListening) {
                setTimeout(() => {
                    if (this.isListening) {
                        try {
                            this.recognition.start();
                        } catch (e) {
                            console.log('Recognition restart failed:', e);
                        }
                    }
                }, 100);
            }
        };

        this.recognition.onerror = (event) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.error('Speech recognition error:', event.error);
            }
        };
    }

    wakeUp() {
        this.isAwake = true;
        this.lastProcessedText = '';

        if (this.onWakeUp) {
            this.onWakeUp();
        }

        if (this.onStatusChange) {
            this.onStatusChange('awake');
        }

        // Play wake sound
        this.speak("Yes?");

        // Stay awake for 10 seconds of inactivity
        this.resetAwakeTimeout();
    }

    resetAwakeTimeout() {
        if (this.awakeTimeout) {
            clearTimeout(this.awakeTimeout);
        }

        this.awakeTimeout = setTimeout(() => {
            this.sleep();
        }, 10000); // 10 seconds
    }

    sleep() {
        this.isAwake = false;
        this.lastProcessedText = '';

        if (this.onStatusChange) {
            this.onStatusChange('sleeping');
        }
    }

    processCommand(text) {
        this.resetAwakeTimeout();

        if (this.onCommand) {
            const parsed = this.parseCommand(text);
            this.onCommand(parsed);
        }
    }

    parseCommand(text) {
        const lower = text.toLowerCase().trim();

        // Water commands
        if (lower.includes('water') || lower.includes('drank') || lower.includes('drink')) {
            const mlMatch = lower.match(/(\d+)\s*(ml|milliliters?)/i);
            const glassMatch = lower.match(/(\d+)?\s*(glass|glasses)/i);
            const cupMatch = lower.match(/(\d+)?\s*(cup|cups)/i);
            const literMatch = lower.match(/(\d+\.?\d*)?\s*(liter|litre|l)/i);

            let amount = 250; // default glass

            if (mlMatch) {
                amount = parseInt(mlMatch[1]);
            } else if (literMatch) {
                amount = parseFloat(literMatch[1] || 1) * 1000;
            } else if (glassMatch) {
                amount = parseInt(glassMatch[1] || 1) * 250;
            } else if (cupMatch) {
                amount = parseInt(cupMatch[1] || 1) * 250;
            }

            return { type: 'water', amount, text };
        }

        // Supplement commands
        if (lower.includes('creatine') || lower.includes('protein') || lower.includes('bcaa') ||
            lower.includes('vitamin') || lower.includes('supplement') || lower.includes('took')) {

            if (lower.includes('creatine')) {
                return { type: 'supplement', name: 'Creatine', amount: 5, unit: 'g', text };
            }
            if (lower.includes('protein')) {
                return { type: 'supplement', name: 'Protein Shake', amount: 30, unit: 'g', text };
            }
            if (lower.includes('bcaa')) {
                return { type: 'supplement', name: 'BCAA', amount: 5, unit: 'g', text };
            }
            if (lower.includes('vitamin')) {
                return { type: 'supplement', name: 'Multivitamin', amount: 1, unit: 'tablet', text };
            }

            return { type: 'supplement', name: 'Supplement', amount: 1, unit: 'serving', text };
        }

        // Exercise completion commands
        if (lower.includes('completed') || lower.includes('finished') || lower.includes('done with') || lower.includes('did')) {
            // Extract exercise name or set number
            const setMatch = lower.match(/(\d+)\s*(set|sets)/i);
            const exerciseKeywords = ['push ups', 'pushups', 'pull ups', 'pullups', 'squats', 'lunges',
                'bench press', 'curls', 'deadlift', 'rows', 'plank'];

            let exercise = null;
            for (const ex of exerciseKeywords) {
                if (lower.includes(ex)) {
                    exercise = ex;
                    break;
                }
            }

            return {
                type: 'exercise_complete',
                exercise,
                sets: setMatch ? parseInt(setMatch[1]) : 1,
                text
            };
        }

        // Meal logging
        if (lower.includes('ate') || lower.includes('eating') || lower.includes('had for') ||
            lower.includes('breakfast') || lower.includes('lunch') || lower.includes('dinner')) {
            return { type: 'meal_log', text };
        }

        // Weight logging
        if (lower.includes('weight') && (lower.includes('kg') || lower.includes('pounds') || lower.includes('lbs'))) {
            const weightMatch = lower.match(/(\d+\.?\d*)\s*(kg|kilos?|pounds?|lbs?)/i);
            if (weightMatch) {
                let weight = parseFloat(weightMatch[1]);
                if (weightMatch[2]?.startsWith('pound') || weightMatch[2]?.startsWith('lb')) {
                    weight = weight * 0.453592; // Convert to kg
                }
                return { type: 'weight', weight, text };
            }
        }

        // Fasting commands
        if (lower.includes('start') && lower.includes('fast')) {
            return { type: 'start_fast', text };
        }
        if (lower.includes('stop') && lower.includes('fast')) {
            return { type: 'end_fast', text };
        }

        // Status queries
        if (lower.includes('how many') || lower.includes('how much') || lower.includes('what is') ||
            lower.includes('tell me') || lower.includes('show me')) {

            if (lower.includes('calories')) {
                return { type: 'query', query: 'calories', text };
            }
            if (lower.includes('water')) {
                return { type: 'query', query: 'water', text };
            }
            if (lower.includes('protein')) {
                return { type: 'query', query: 'protein', text };
            }
            if (lower.includes('workout') || lower.includes('exercise')) {
                return { type: 'query', query: 'workout', text };
            }
        }

        // General AI question
        return { type: 'ai_question', text };
    }

    startListening() {
        if (!this.recognition) {
            console.warn('Speech recognition not available');
            return false;
        }

        try {
            this.isListening = true;
            this.recognition.start();

            if (this.onStatusChange) {
                this.onStatusChange('listening');
            }

            return true;
        } catch (e) {
            console.error('Failed to start recognition:', e);
            return false;
        }
    }

    stopListening() {
        this.isListening = false;
        this.isAwake = false;

        if (this.awakeTimeout) {
            clearTimeout(this.awakeTimeout);
        }

        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignore
            }
        }

        if (this.onStatusChange) {
            this.onStatusChange('stopped');
        }
    }

    speak(text) {
        if (!this.synthesis) return;

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to get a good voice
        const voices = this.synthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Microsoft')
        ) || voices[0];

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        this.synthesis.speak(utterance);
    }

    isSupported() {
        return !!this.recognition;
    }
}

// Create singleton instance
const fitBuddy = new FitBuddyService();

export default fitBuddy;
