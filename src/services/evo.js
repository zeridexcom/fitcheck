// Evo - Conversational AI Voice Assistant
// Wake word: "Evo" or "Hey Evo"
// Full app control with conversational responses

class EvoService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isAwake = false;
        this.wakeWords = ['evo', 'hey evo', 'hey ivo', 'ivo'];
        this.awakeTimeout = null;
        this.conversationMode = false;
        this.lastProcessedText = '';

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

            const allText = (interimTranscript + ' ' + finalTranscript).toLowerCase();

            if (!this.isAwake) {
                // Check for wake word
                for (const wake of this.wakeWords) {
                    if (allText.includes(wake)) {
                        this.wakeUp();
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
                if (finalTranscript && finalTranscript !== this.lastProcessedText && finalTranscript.length > 2) {
                    this.lastProcessedText = finalTranscript;
                    this.processCommand(finalTranscript);
                }
                if (this.onTranscript) {
                    this.onTranscript(interimTranscript || finalTranscript, true);
                }
            }
        };

        this.recognition.onend = () => {
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
        this.conversationMode = true;
        this.lastProcessedText = '';

        if (this.onWakeUp) this.onWakeUp();
        if (this.onStatusChange) this.onStatusChange('awake');

        this.speak("Yes? I'm listening.");
        this.resetAwakeTimeout();
    }

    resetAwakeTimeout() {
        if (this.awakeTimeout) clearTimeout(this.awakeTimeout);
        this.awakeTimeout = setTimeout(() => {
            if (this.conversationMode) {
                this.speak("I'm still here if you need me!");
                this.resetAwakeTimeout();
            } else {
                this.sleep();
            }
        }, 15000); // 15 seconds before reminder
    }

    sleep() {
        this.isAwake = false;
        this.conversationMode = false;
        this.lastProcessedText = '';
        if (this.onStatusChange) this.onStatusChange('sleeping');
    }

    async processCommand(text) {
        this.resetAwakeTimeout();
        const result = await this.parseAndExecute(text);

        if (this.onCommand) {
            this.onCommand({ text, result });
        }
    }

    async parseAndExecute(text) {
        const lower = text.toLowerCase().trim();

        // === PROFILE COMMANDS ===
        if (lower.includes('change') && lower.includes('name')) {
            const nameMatch = text.match(/(?:to|as)\s+(\w+)/i);
            if (nameMatch && this.appActions?.updateProfile) {
                const newName = nameMatch[1];
                this.appActions.updateProfile({ name: newName });
                return this.respond(`Done! I've changed your name to ${newName}. What's next?`);
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
                return this.respond(`Got it! Your weight is now ${weight.toFixed(1)} kg. What else?`);
            }
        }

        if (lower.includes('theme') || lower.includes('color')) {
            if (lower.includes('blue') || lower.includes('ocean')) {
                this.appActions?.setTheme?.('ocean');
                return this.respond(`Switched to blue ocean theme! Nice choice. What's next?`);
            }
            if (lower.includes('purple') || lower.includes('cosmos')) {
                this.appActions?.setTheme?.('cosmos');
                return this.respond(`Purple cosmos theme activated! What else?`);
            }
            if (lower.includes('green') || lower.includes('default')) {
                this.appActions?.setTheme?.('default');
                return this.respond(`Back to the classic green theme. What's next?`);
            }
            if (lower.includes('gold') || lower.includes('sunrise')) {
                this.appActions?.setTheme?.('sunrise');
                return this.respond(`Golden sunrise theme is on! What else can I do?`);
            }
        }

        // === CALORIE COMMANDS ===
        if (lower.includes('add') && lower.includes('calorie')) {
            const calMatch = lower.match(/(\d+)\s*calorie/);
            if (calMatch && this.appActions?.addMeal) {
                const calories = parseInt(calMatch[1]);
                this.appActions.addMeal({ name: 'Quick add', calories, protein: 0, carbs: 0, fat: 0 });
                const totals = this.appState?.getTodaysTotals?.() || {};
                return this.respond(`Added ${calories} calories. You're now at ${totals.calories + calories} total today. What's next?`);
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

        if ((lower.includes('log') || lower.includes('add')) && (lower.includes('meal') || lower.includes('ate') || lower.includes('had'))) {
            // Will use AI to estimate
            return this.respond(`Tell me more about what you ate and I'll log it for you.`);
        }

        // === WATER COMMANDS ===
        if (lower.includes('water') || lower.includes('drank') || lower.includes('drink')) {
            const mlMatch = lower.match(/(\d+)\s*(ml|milliliter)/i);
            const glassMatch = lower.match(/(\d+)?\s*(glass|glasses)/i);
            const literMatch = lower.match(/(\d+\.?\d*)?\s*(liter|litre|l\b)/i);

            let amount = 250;
            if (mlMatch) amount = parseInt(mlMatch[1]);
            else if (literMatch) amount = parseFloat(literMatch[1] || 1) * 1000;
            else if (glassMatch) amount = parseInt(glassMatch[1] || 1) * 250;

            if (this.appActions?.addWater) {
                this.appActions.addWater(amount);
                const today = new Date().toISOString().split('T')[0];
                const total = (this.appState?.waterIntake?.[today] || 0) + amount;
                const goal = this.appState?.waterGoal || 2500;
                const remaining = Math.max(goal - total, 0);
                return this.respond(`Added ${amount}ml water. You've had ${total}ml today. ${remaining > 0 ? `${remaining}ml to go!` : 'Goal reached! 🎉'} What else?`);
            }
        }

        // === SUPPLEMENT COMMANDS ===
        if (lower.includes('creatine') || lower.includes('protein') || lower.includes('vitamin') || lower.includes('supplement') || lower.includes('took')) {
            let name = 'Supplement', amount = 1, unit = 'serving';

            if (lower.includes('creatine')) { name = 'Creatine'; amount = 5; unit = 'g'; }
            else if (lower.includes('protein')) { name = 'Protein Shake'; amount = 30; unit = 'g'; }
            else if (lower.includes('vitamin')) { name = 'Multivitamin'; amount = 1; unit = 'tablet'; }
            else if (lower.includes('omega')) { name = 'Omega-3'; amount = 1000; unit = 'mg'; }

            if (this.appActions?.logSupplement) {
                this.appActions.logSupplement({ name, amount, unit });
                return this.respond(`Logged ${amount}${unit} of ${name}. Great discipline! What's next?`);
            }
        }

        // === FASTING COMMANDS ===
        if (lower.includes('start') && lower.includes('fast')) {
            if (this.appActions?.startFast) {
                this.appActions.startFast(16, '16:8');
                return this.respond(`Started your 16:8 fast. Stay strong! I'll track your progress. What else?`);
            }
        }
        if ((lower.includes('end') || lower.includes('stop') || lower.includes('break')) && lower.includes('fast')) {
            if (this.appActions?.endFast) {
                this.appActions.endFast(true);
                return this.respond(`Fast completed! Great job on your discipline. What's next?`);
            }
        }

        // === NAVIGATION COMMANDS ===
        const navMappings = {
            'settings': '/settings', 'setting': '/settings',
            'sleep': '/sleep', 'sleep tracker': '/sleep',
            'progress': '/progress', 'stats': '/progress',
            'workout': '/workout', 'exercise': '/workout',
            'water': '/water', 'hydration': '/water',
            'fasting': '/fasting', 'fast': '/fasting',
            'coach': '/coach', 'ai coach': '/coach',
            'scanner': '/scanner', 'scan': '/scanner',
            'prayer': '/prayer', 'journal': '/prayer',
            'supplements': '/supplements', 'supps': '/supplements',
            'gallery': '/gallery', 'photos': '/gallery',
            'meals': '/meal-planner', 'meal planner': '/meal-planner',
            'home': '/', 'dashboard': '/',
            'calendar': '/calendar',
        };

        for (const [keyword, path] of Object.entries(navMappings)) {
            if (lower.includes(keyword) && (lower.includes('open') || lower.includes('go to') || lower.includes('show') || lower.includes('navigate'))) {
                if (this.navigate) {
                    this.navigate(path);
                    return this.respond(`Opening ${keyword}. What would you like to know or do there?`);
                }
            }
        }

        // === QUERY COMMANDS ===

        // Sleep queries
        if (lower.includes('sleep') && (lower.includes('how') || lower.includes('what') || lower.includes('quality') || lower.includes('last night'))) {
            const lastSleep = this.appState?.getLastNightsSleep?.();
            if (lastSleep) {
                const qualityWords = ['', 'terrible', 'poor', 'okay', 'good', 'excellent'];
                return this.respond(`Last night you slept ${lastSleep.duration} hours, from ${lastSleep.bedtime} to ${lastSleep.wakeTime}. Quality was ${qualityWords[lastSleep.quality] || 'not rated'}. What else would you like to know?`);
            } else {
                return this.respond(`I don't have sleep data for last night. Would you like to log it?`);
            }
        }

        // Calorie queries
        if (lower.includes('calorie') && (lower.includes('how many') || lower.includes('what') || lower.includes('today') || lower.includes('left') || lower.includes('remaining'))) {
            const totals = this.appState?.getTodaysTotals?.() || {};
            const target = this.appState?.targets?.calories || 2000;
            const remaining = Math.max(target - totals.calories, 0);
            return this.respond(`You've eaten ${totals.calories} calories today. ${remaining} calories remaining out of your ${target} goal. What else?`);
        }

        // Protein queries
        if (lower.includes('protein') && (lower.includes('how') || lower.includes('what') || lower.includes('tell'))) {
            const totals = this.appState?.getTodaysTotals?.() || {};
            const target = this.appState?.targets?.protein || 150;
            return this.respond(`You've had ${totals.protein}g of protein today. Target is ${target}g. What's next?`);
        }

        // Water queries
        if (lower.includes('water') && (lower.includes('how much') || lower.includes('what'))) {
            const today = new Date().toISOString().split('T')[0];
            const water = this.appState?.waterIntake?.[today] || 0;
            const goal = this.appState?.waterGoal || 2500;
            return this.respond(`You've had ${water}ml of water today. Goal is ${goal}ml. What else?`);
        }

        // Weight queries
        if (lower.includes('weight') && (lower.includes('what') || lower.includes('my'))) {
            const weight = this.appState?.profile?.weight || 'not set';
            return this.respond(`Your current weight is ${weight} kg. Would you like to update it?`);
        }

        // Profile queries
        if (lower.includes('my name') || (lower.includes('who') && lower.includes('am i'))) {
            const name = this.appState?.profile?.name || 'friend';
            return this.respond(`Your name is ${name}. What would you like me to do?`);
        }

        // === WEB SEARCH ===
        if (lower.includes('search') || lower.includes('google') || lower.includes('look up') || lower.includes('find out')) {
            const query = text.replace(/search|google|look up|find out|for|about/gi, '').trim();
            if (query.length > 3) {
                // Open web search
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                return this.respond(`I've opened a search for "${query}". What else can I help with?`);
            }
        }

        // === HELP & GENERAL ===
        if (lower.includes('what can you do') || lower.includes('help')) {
            return this.respond(`I'm Evo, your fitness AI! I can: add calories, log water, track supplements, check your stats, change settings, open any page, search the web, and answer questions. Just ask! What would you like?`);
        }

        if (lower.includes('thank') || lower.includes('thanks')) {
            return this.respond(`You're welcome! Anything else I can help with?`);
        }

        if (lower.includes('goodbye') || lower.includes('bye') || lower.includes('that\'s all')) {
            this.conversationMode = false;
            return this.respond(`Goodbye! Say "Evo" anytime you need me.`);
        }

        // === AI FALLBACK - Ask GPT ===
        return this.askAI(text);
    }

    async askAI(question) {
        if (!this.appState?.apiKey) {
            return this.respond(`I need an API key to answer that. Please set it up in settings. What else can I help with?`);
        }

        try {
            // Build context about app state
            const totals = this.appState?.getTodaysTotals?.() || {};
            const profile = this.appState?.profile || {};
            const context = `User: ${profile.name}, Weight: ${profile.weight}kg, Goal: ${profile.goal}. Today's intake: ${totals.calories} cal, ${totals.protein}g protein.`;

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
                            content: `You are Evo, a Christian faith-integrated fitness AI assistant. Be conversational, brief (under 80 words), and always end with "What else?" or "What's next?" to keep the conversation going. Include scripture when relevant. User context: ${context}`
                        },
                        { role: 'user', content: question }
                    ],
                    max_tokens: 200
                })
            });

            const data = await response.json();
            const answer = data.choices?.[0]?.message?.content || "I couldn't process that.";
            return this.respond(answer);
        } catch (e) {
            return this.respond(`I had trouble answering that. What else can I help with?`);
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
        if (this.awakeTimeout) clearTimeout(this.awakeTimeout);
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) { }
        }
        if (this.onStatusChange) this.onStatusChange('stopped');
    }

    speak(text) {
        if (!this.synthesis) return;
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = this.synthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft')
        ) || voices[0];

        if (preferredVoice) utterance.voice = preferredVoice;
        this.synthesis.speak(utterance);
    }

    isSupported() {
        return !!this.recognition;
    }
}

const evo = new EvoService();
export default evo;
