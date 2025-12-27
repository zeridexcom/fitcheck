// Evo - Conversational AI Voice Assistant
// Wake word: "Evo"
// ALWAYS-ON mic - no restart, no click sounds
// Only responds to "Evo" wake word - ignores all other speech

class EvoService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isAwake = false;
        this.isSpeaking = false;
        this.awakeTimeout = null;

        // Callbacks
        this.onWakeUp = null;
        this.onCommand = null;
        this.onStatusChange = null;
        this.onResponse = null;

        // App state reference
        this.appState = null;
        this.appActions = null;
        this.navigate = null;

        // Command buffer - only stores when awake
        this.commandBuffer = '';
        this.lastCommandTime = 0;

        // Load voices early
        if (this.synthesis) {
            this.synthesis.getVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => this.synthesis.getVoices();
            }
        }

        this.initRecognition();
    }

    setAppContext(state, actions, navigate) {
        this.appState = state;
        this.appActions = actions;
        this.navigate = navigate;
    }

    initRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // CRITICAL: These settings minimize restarts
        this.recognition.continuous = true;
        this.recognition.interimResults = false; // Only final results - fewer events, less restarts
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event) => {
            // Get only the latest final result
            const lastResult = event.results[event.results.length - 1];
            if (!lastResult.isFinal) return;

            const transcript = lastResult[0].transcript.toLowerCase().trim();

            // PRIVACY: Only process if contains wake word "evo"
            // Everything else is IGNORED and NOT stored
            if (!this.isAwake) {
                // Check for wake word
                if (transcript.includes('evo') || transcript.includes('ivo') || transcript.includes('evil') || transcript.includes('eva')) {
                    this.wakeUp();

                    // Check if command came with wake word
                    const parts = transcript.split(/evo|ivo|evil|eva/i);
                    const command = parts[parts.length - 1]?.trim();
                    if (command && command.length > 2) {
                        setTimeout(() => this.processCommand(command), 800);
                    }
                }
                // If no wake word, DO NOTHING - complete privacy
                return;
            }

            // Awake - process the command
            const now = Date.now();
            if (now - this.lastCommandTime > 1500 && transcript.length > 2) {
                this.lastCommandTime = now;
                this.processCommand(transcript);
            }
        };

        this.recognition.onend = () => {
            // Only restart if still supposed to be listening and not speaking
            if (this.isListening && !this.isSpeaking) {
                // Use longer delay to minimize click sounds
                setTimeout(() => {
                    if (this.isListening && !this.isSpeaking && this.recognition) {
                        try {
                            this.recognition.start();
                        } catch (e) {
                            // Already running or error - ignore silently
                        }
                    }
                }, 2000); // 2 second delay - much less intrusive
            }
        };

        this.recognition.onerror = (event) => {
            // Silently handle errors - no restarts on error
            if (event.error === 'no-speech' || event.error === 'aborted') {
                return; // Normal, ignore
            }
        };
    }

    wakeUp() {
        if (this.isAwake) return;

        this.isAwake = true;
        this.lastCommandTime = Date.now();

        if (this.onWakeUp) this.onWakeUp();
        if (this.onStatusChange) this.onStatusChange('awake');

        this.speak("Yes?");
        this.resetAwakeTimeout();
    }

    resetAwakeTimeout() {
        if (this.awakeTimeout) clearTimeout(this.awakeTimeout);
        this.awakeTimeout = setTimeout(() => {
            this.sleep();
        }, 20000); // 20 seconds of silence = sleep
    }

    sleep() {
        this.isAwake = false;
        this.commandBuffer = '';
        if (this.onStatusChange) this.onStatusChange('listening');
    }

    async processCommand(text) {
        if (!text || text.length < 2) return;

        this.resetAwakeTimeout();
        if (this.onStatusChange) this.onStatusChange('processing');

        await this.parseAndExecute(text);

        if (this.onStatusChange) this.onStatusChange('awake');
    }

    async parseAndExecute(text) {
        const lower = text.toLowerCase().trim();

        // === PROFILE ===
        if (lower.includes('change') && lower.includes('name')) {
            const match = text.match(/(?:to|as)\s+(\w+)/i);
            if (match && this.appActions?.updateProfile) {
                this.appActions.updateProfile({ name: match[1] });
                return this.respond(`Changed name to ${match[1]}. What's next?`);
            }
        }

        if (lower.includes('weight') && lower.match(/\d+/)) {
            const match = lower.match(/(\d+)/);
            if (match && this.appActions?.updateProfile) {
                this.appActions.updateProfile({ weight: parseInt(match[1]) });
                return this.respond(`Weight set to ${match[1]} kg. What else?`);
            }
        }

        // === CALORIES ===
        if (lower.includes('add') && lower.includes('calorie')) {
            const match = lower.match(/(\d+)/);
            if (match && this.appActions?.addMeal) {
                const cal = parseInt(match[1]);
                this.appActions.addMeal({ name: 'Quick add', calories: cal, protein: 0, carbs: 0, fat: 0 });
                return this.respond(`Added ${cal} calories. What's next?`);
            }
        }

        if (lower.includes('remove') && lower.includes('calorie')) {
            const match = lower.match(/(\d+)/);
            if (match && this.appActions?.addMeal) {
                this.appActions.addMeal({ name: 'Removed', calories: -parseInt(match[1]), protein: 0, carbs: 0, fat: 0 });
                return this.respond(`Removed calories. What else?`);
            }
        }

        // === WATER ===
        if ((lower.includes('water') || lower.includes('drank')) && !lower.includes('how')) {
            let amount = 250;
            const mlMatch = lower.match(/(\d+)\s*ml/i);
            const glassMatch = lower.match(/(\d+)\s*glass/i);
            if (mlMatch) amount = parseInt(mlMatch[1]);
            else if (glassMatch) amount = parseInt(glassMatch[1]) * 250;

            if (this.appActions?.addWater) {
                this.appActions.addWater(amount);
                return this.respond(`Added ${amount}ml water. What's next?`);
            }
        }

        // === SUPPLEMENTS ===
        if (lower.includes('creatine') || lower.includes('protein') || lower.includes('vitamin')) {
            let name = 'Supplement', amount = 1, unit = 'serving';
            if (lower.includes('creatine')) { name = 'Creatine'; amount = 5; unit = 'g'; }
            else if (lower.includes('protein')) { name = 'Protein'; amount = 30; unit = 'g'; }
            else if (lower.includes('vitamin')) { name = 'Vitamin'; amount = 1; unit = 'tab'; }

            if (this.appActions?.logSupplement) {
                this.appActions.logSupplement({ name, amount, unit });
                return this.respond(`Logged ${name}. What's next?`);
            }
        }

        // === FASTING ===
        if (lower.includes('start') && lower.includes('fast')) {
            if (this.appActions?.startFast) {
                this.appActions.startFast(16, '16:8');
                return this.respond(`Started fast. What else?`);
            }
        }
        if ((lower.includes('end') || lower.includes('stop')) && lower.includes('fast')) {
            if (this.appActions?.endFast) {
                this.appActions.endFast(true);
                return this.respond(`Fast ended. What's next?`);
            }
        }

        // === NAVIGATION ===
        const navMap = {
            'settings': '/settings', 'sleep': '/sleep', 'progress': '/progress',
            'workout': '/workout', 'water': '/water', 'fasting': '/fasting',
            'coach': '/coach', 'scan': '/scanner', 'prayer': '/prayer',
            'supplement': '/supplements', 'gallery': '/gallery', 'photo': '/gallery',
            'meal': '/meal-planner', 'home': '/', 'calendar': '/calendar',
        };

        for (const [word, path] of Object.entries(navMap)) {
            if (lower.includes(word) && (lower.includes('open') || lower.includes('go') || lower.includes('show'))) {
                if (this.navigate) {
                    this.navigate(path);
                    return this.respond(`Opening ${word}. What else?`);
                }
            }
        }

        // === QUERIES ===
        if (lower.includes('calorie') && lower.includes('how')) {
            const totals = this.appState?.getTodaysTotals?.() || { calories: 0 };
            return this.respond(`${totals.calories} calories today. What else?`);
        }

        if (lower.includes('water') && lower.includes('how')) {
            const today = new Date().toISOString().split('T')[0];
            const water = this.appState?.waterIntake?.[today] || 0;
            return this.respond(`${water}ml today. What else?`);
        }

        if (lower.includes('weight') && lower.includes('my')) {
            return this.respond(`${this.appState?.profile?.weight || 0} kg. What else?`);
        }

        // === SEARCH ===
        if (lower.includes('search') || lower.includes('google')) {
            const query = text.replace(/search|google|for|about/gi, '').trim();
            if (query.length > 2) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                return this.respond(`Searching. What else?`);
            }
        }

        // === GENERAL ===
        if (lower.includes('help')) {
            return this.respond(`I can add calories, water, supplements, open pages, and answer questions. What do you need?`);
        }

        if (lower.includes('thank')) {
            return this.respond(`You're welcome!`);
        }

        if (lower.includes('bye') || lower.includes('goodbye')) {
            this.sleep();
            return this.respond(`Bye! Say Evo anytime.`);
        }

        // === AI FALLBACK ===
        return this.askAI(text);
    }

    async askAI(question) {
        if (!this.appState?.apiKey) {
            return this.respond(`Need API key in settings.`);
        }

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.appState.apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are Evo. Be very brief, under 30 words. End with "What else?"' },
                        { role: 'user', content: question }
                    ],
                    max_tokens: 80
                })
            });
            const data = await res.json();
            return this.respond(data.choices?.[0]?.message?.content || "Didn't catch that.");
        } catch (e) {
            return this.respond(`Error. What else?`);
        }
    }

    respond(message) {
        this.speak(message);
        if (this.onResponse) this.onResponse(message);
        return message;
    }

    startListening() {
        if (!this.recognition) return false;

        try {
            this.isListening = true;
            this.recognition.start();
            if (this.onStatusChange) this.onStatusChange('listening');
            return true;
        } catch (e) {
            return false;
        }
    }

    stopListening() {
        this.isListening = false;
        this.isAwake = false;
        this.isSpeaking = false;
        if (this.awakeTimeout) clearTimeout(this.awakeTimeout);
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) { }
        }
        if (this.onStatusChange) this.onStatusChange('stopped');
    }

    speak(text) {
        if (!this.synthesis) return;

        this.isSpeaking = true;
        // Stop listening while speaking to avoid picking up own voice
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) { }
        }

        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
            || voices.find(v => v.lang.startsWith('en'))
            || voices[0];
        if (voice) utterance.voice = voice;

        utterance.onend = () => {
            this.isSpeaking = false;
            // Resume listening after speaking
            setTimeout(() => {
                if (this.isListening && this.recognition) {
                    try { this.recognition.start(); } catch (e) { }
                }
            }, 500);
        };

        utterance.onerror = () => {
            this.isSpeaking = false;
            setTimeout(() => {
                if (this.isListening && this.recognition) {
                    try { this.recognition.start(); } catch (e) { }
                }
            }, 500);
        };

        this.synthesis.speak(utterance);
    }

    isSupported() {
        return !!this.recognition;
    }
}

const evo = new EvoService();
export default evo;
