// Evo - Conversational AI Voice Assistant
// Wake word: "Evo" or "Hey Evo"
// Full app control with conversational responses

class EvoService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isAwake = false;
        this.isSpeaking = false;
        this.wakeWords = ['evo', 'hey evo', 'hey ivo', 'ivo', 'evil', 'eva'];
        this.awakeTimeout = null;
        this.restartTimeout = null;
        this.conversationMode = false;
        this.lastProcessedText = '';
        this.lastProcessedTime = 0;

        // Callbacks
        this.onWakeUp = null;
        this.onCommand = null;
        this.onTranscript = null;
        this.onStatusChange = null;
        this.onResponse = null;

        // App state reference (will be set by component)
        this.appState = null;
        this.appActions = null;
        this.navigate = null;

        // Load voices
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
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event) => {
            // Don't process while speaking
            if (this.isSpeaking) return;

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

            const allText = (interimTranscript + ' ' + finalTranscript).toLowerCase();

            if (!this.isAwake) {
                // Check for wake word
                for (const wake of this.wakeWords) {
                    if (allText.includes(wake)) {
                        this.wakeUp();
                        const commandAfterWake = allText.split(wake).pop()?.trim();
                        if (commandAfterWake && commandAfterWake.length > 3) {
                            setTimeout(() => this.processCommand(commandAfterWake), 500);
                        }
                        return;
                    }
                }
                if (this.onTranscript) {
                    this.onTranscript(interimTranscript || finalTranscript, false);
                }
            } else {
                // Already awake, process as command
                const now = Date.now();
                if (finalTranscript &&
                    finalTranscript !== this.lastProcessedText &&
                    finalTranscript.length > 2 &&
                    now - this.lastProcessedTime > 1000) {
                    this.lastProcessedText = finalTranscript;
                    this.lastProcessedTime = now;
                    this.processCommand(finalTranscript);
                }
                if (this.onTranscript) {
                    this.onTranscript(interimTranscript || finalTranscript, true);
                }
            }
        };

        this.recognition.onend = () => {
            // Don't restart if speaking or not listening
            if (!this.isListening || this.isSpeaking) return;

            // Clear any pending restart
            if (this.restartTimeout) {
                clearTimeout(this.restartTimeout);
            }

            // Wait longer before restarting to avoid rapid on/off
            this.restartTimeout = setTimeout(() => {
                if (this.isListening && !this.isSpeaking) {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        // Already started or other error - ignore
                    }
                }
            }, 1000); // Wait 1 second before restart
        };

        this.recognition.onerror = (event) => {
            if (event.error === 'no-speech' || event.error === 'aborted') {
                // Normal, ignore
                return;
            }
            console.error('Speech recognition error:', event.error);
        };
    }

    wakeUp() {
        if (this.isAwake) return; // Already awake

        this.isAwake = true;
        this.conversationMode = true;
        this.lastProcessedText = '';
        this.lastProcessedTime = Date.now();

        if (this.onWakeUp) this.onWakeUp();
        if (this.onStatusChange) this.onStatusChange('awake');

        this.speak("Yes?");
        this.resetAwakeTimeout();
    }

    resetAwakeTimeout() {
        if (this.awakeTimeout) clearTimeout(this.awakeTimeout);
        this.awakeTimeout = setTimeout(() => {
            this.sleep();
        }, 30000); // 30 seconds before sleeping
    }

    sleep() {
        this.isAwake = false;
        this.conversationMode = false;
        this.lastProcessedText = '';
        if (this.onStatusChange) this.onStatusChange('listening');
    }

    async processCommand(text) {
        if (!text || text.length < 2) return;

        this.resetAwakeTimeout();

        if (this.onStatusChange) this.onStatusChange('processing');

        const result = await this.parseAndExecute(text);

        if (this.onCommand) {
            this.onCommand({ text, result });
        }

        if (this.onStatusChange) this.onStatusChange('awake');
    }

    async parseAndExecute(text) {
        const lower = text.toLowerCase().trim();

        // === PROFILE COMMANDS ===
        if (lower.includes('change') && lower.includes('name')) {
            const nameMatch = text.match(/(?:to|as)\s+(\w+)/i);
            if (nameMatch && this.appActions?.updateProfile) {
                const newName = nameMatch[1];
                this.appActions.updateProfile({ name: newName });
                return this.respond(`Done! Changed your name to ${newName}. What's next?`);
            }
        }

        if ((lower.includes('set') || lower.includes('change')) && lower.includes('weight')) {
            const weightMatch = lower.match(/(\d+\.?\d*)\s*(kg|pounds?|lbs?)?/);
            if (weightMatch && this.appActions?.updateProfile) {
                let weight = parseFloat(weightMatch[1]);
                if (weightMatch[2]?.startsWith('lb') || weightMatch[2]?.startsWith('pound')) {
                    weight = weight * 0.453592;
                }
                this.appActions.updateProfile({ weight });
                return this.respond(`Your weight is now ${weight.toFixed(1)} kg. What else?`);
            }
        }

        if (lower.includes('theme') || lower.includes('color')) {
            const themes = { blue: 'blue', ocean: 'blue', purple: 'purple', cosmos: 'purple', green: 'default', gold: 'orange', sunrise: 'orange', pink: 'pink' };
            for (const [keyword, theme] of Object.entries(themes)) {
                if (lower.includes(keyword)) {
                    localStorage.setItem('fitcheck-theme', theme);
                    document.documentElement.style.setProperty('--accent-primary', theme === 'blue' ? '#00D4FF' : theme === 'purple' ? '#A855F7' : theme === 'orange' ? '#FF9F43' : theme === 'pink' ? '#FF6B9D' : '#00FF87');
                    return this.respond(`Theme changed! What's next?`);
                }
            }
        }

        // === CALORIE COMMANDS ===
        if (lower.includes('add') && lower.includes('calorie')) {
            const calMatch = lower.match(/(\d+)\s*calorie/);
            if (calMatch && this.appActions?.addMeal) {
                const calories = parseInt(calMatch[1]);
                this.appActions.addMeal({ name: 'Quick add', calories, protein: 0, carbs: 0, fat: 0 });
                return this.respond(`Added ${calories} calories. What's next?`);
            }
        }

        if ((lower.includes('remove') || lower.includes('subtract')) && lower.includes('calorie')) {
            const calMatch = lower.match(/(\d+)\s*calorie/);
            if (calMatch && this.appActions?.addMeal) {
                const calories = -parseInt(calMatch[1]);
                this.appActions.addMeal({ name: 'Adjustment', calories, protein: 0, carbs: 0, fat: 0 });
                return this.respond(`Removed ${Math.abs(calories)} calories. What else?`);
            }
        }

        // === WATER COMMANDS ===
        if (lower.includes('water') || lower.includes('drank') || lower.includes('drink')) {
            if (!lower.includes('how') && !lower.includes('what')) {
                const mlMatch = lower.match(/(\d+)\s*(ml|milliliter)/i);
                const glassMatch = lower.match(/(\d+)?\s*(glass|glasses)/i);
                const literMatch = lower.match(/(\d+\.?\d*)?\s*(liter|litre|l\b)/i);

                let amount = 250;
                if (mlMatch) amount = parseInt(mlMatch[1]);
                else if (literMatch) amount = parseFloat(literMatch[1] || 1) * 1000;
                else if (glassMatch) amount = parseInt(glassMatch[1] || 1) * 250;

                if (this.appActions?.addWater) {
                    this.appActions.addWater(amount);
                    return this.respond(`Added ${amount} ml water. What's next?`);
                }
            }
        }

        // === SUPPLEMENT COMMANDS ===
        if (lower.includes('creatine') || lower.includes('protein shake') || lower.includes('vitamin') || lower.includes('took my')) {
            let name = 'Supplement', amount = 1, unit = 'serving';

            if (lower.includes('creatine')) { name = 'Creatine'; amount = 5; unit = 'g'; }
            else if (lower.includes('protein')) { name = 'Protein Shake'; amount = 30; unit = 'g'; }
            else if (lower.includes('vitamin')) { name = 'Multivitamin'; amount = 1; unit = 'tablet'; }

            if (this.appActions?.logSupplement) {
                this.appActions.logSupplement({ name, amount, unit });
                return this.respond(`Logged ${name}. What's next?`);
            }
        }

        // === FASTING COMMANDS ===
        if (lower.includes('start') && lower.includes('fast')) {
            if (this.appActions?.startFast) {
                this.appActions.startFast(16, '16:8');
                return this.respond(`Started your fast. Stay strong! What else?`);
            }
        }
        if ((lower.includes('end') || lower.includes('stop') || lower.includes('break')) && lower.includes('fast')) {
            if (this.appActions?.endFast) {
                this.appActions.endFast(true);
                return this.respond(`Fast completed! What's next?`);
            }
        }

        // === NAVIGATION COMMANDS ===
        const navMappings = {
            'settings': '/settings', 'sleep': '/sleep', 'progress': '/progress',
            'workout': '/workout', 'water': '/water', 'fasting': '/fasting',
            'coach': '/coach', 'scanner': '/scanner', 'prayer': '/prayer',
            'supplements': '/supplements', 'gallery': '/gallery', 'photos': '/gallery',
            'meals': '/meal-planner', 'home': '/', 'dashboard': '/', 'calendar': '/calendar',
        };

        for (const [keyword, path] of Object.entries(navMappings)) {
            if (lower.includes(keyword) && (lower.includes('open') || lower.includes('go') || lower.includes('show'))) {
                if (this.navigate) {
                    this.navigate(path);
                    return this.respond(`Opening ${keyword}. What else?`);
                }
            }
        }

        // === QUERY COMMANDS ===
        if (lower.includes('calorie') && (lower.includes('how') || lower.includes('what'))) {
            const totals = this.appState?.getTodaysTotals?.() || { calories: 0 };
            const target = this.appState?.targets?.calories || 2000;
            return this.respond(`You've had ${totals.calories} calories. ${target - totals.calories} remaining. What else?`);
        }

        if (lower.includes('water') && (lower.includes('how') || lower.includes('what'))) {
            const today = new Date().toISOString().split('T')[0];
            const water = this.appState?.waterIntake?.[today] || 0;
            return this.respond(`You've had ${water} ml water today. What else?`);
        }

        if (lower.includes('weight') && lower.includes('my')) {
            const weight = this.appState?.profile?.weight || 0;
            return this.respond(`Your weight is ${weight} kg. What else?`);
        }

        // === WEB SEARCH ===
        if (lower.includes('search') || lower.includes('google') || lower.includes('look up')) {
            const query = text.replace(/search|google|look up|for|about/gi, '').trim();
            if (query.length > 3) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                return this.respond(`Searching for ${query}. What else?`);
            }
        }

        // === HELP ===
        if (lower.includes('help') || lower.includes('what can you do')) {
            return this.respond(`I can add calories, log water, track supplements, open pages, check your stats, and answer questions. Try saying: add 500 calories, or, open settings.`);
        }

        if (lower.includes('thank')) {
            return this.respond(`You're welcome! Anything else?`);
        }

        if (lower.includes('bye') || lower.includes('goodbye') || lower.includes("that's all")) {
            this.conversationMode = false;
            this.sleep();
            return this.respond(`Goodbye! Say Evo anytime.`);
        }

        // === AI FALLBACK ===
        return this.askAI(text);
    }

    async askAI(question) {
        if (!this.appState?.apiKey) {
            return this.respond(`I need an API key for that. Set it in settings. What else?`);
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.appState.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `You are Evo, a brief fitness AI. Keep responses under 50 words. End with "What else?" or "What's next?"`
                        },
                        { role: 'user', content: question }
                    ],
                    max_tokens: 100
                })
            });

            const data = await response.json();
            const answer = data.choices?.[0]?.message?.content || "I couldn't process that.";
            return this.respond(answer);
        } catch (e) {
            return this.respond(`Sorry, I had an error. What else can I help with?`);
        }
    }

    respond(message) {
        this.speak(message);
        if (this.onResponse) this.onResponse(message);
        return message;
    }

    startListening() {
        if (!this.recognition) {
            console.warn('Speech recognition not available');
            return false;
        }
        try {
            this.isListening = true;
            this.recognition.start();
            if (this.onStatusChange) this.onStatusChange('listening');
            return true;
        } catch (e) {
            console.error('Failed to start recognition:', e);
            return false;
        }
    }

    stopListening() {
        this.isListening = false;
        this.isAwake = false;
        this.conversationMode = false;
        this.isSpeaking = false;
        if (this.awakeTimeout) clearTimeout(this.awakeTimeout);
        if (this.restartTimeout) clearTimeout(this.restartTimeout);
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) { }
        }
        if (this.onStatusChange) this.onStatusChange('stopped');
    }

    speak(text) {
        if (!this.synthesis) {
            console.log('Evo says:', text);
            return;
        }

        // Stop recognition while speaking to avoid feedback
        this.isSpeaking = true;
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) { }
        }

        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = this.synthesis.getVoices();
        // Prefer a good English voice
        const preferredVoice = voices.find(v =>
            v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
            this.isSpeaking = false;
            // Resume listening after speaking
            if (this.isListening) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) { }
                }, 300);
            }
        };

        utterance.onerror = () => {
            this.isSpeaking = false;
            if (this.isListening) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) { }
                }, 300);
            }
        };

        this.synthesis.speak(utterance);
    }

    isSupported() {
        return !!this.recognition;
    }
}

const evo = new EvoService();
export default evo;
