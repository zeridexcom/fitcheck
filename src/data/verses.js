// Curated Bible verses focused on fitness, health, strength, and spiritual wellness

export const fitnessVerses = [
    {
        reference: "1 Corinthians 6:19-20",
        text: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.",
        category: "body"
    },
    {
        reference: "Philippians 4:13",
        text: "I can do all things through Christ who strengthens me.",
        category: "strength"
    },
    {
        reference: "1 Timothy 4:8",
        text: "For physical training is of some value, but godliness has value for all things, holding promise for both the present life and the life to come.",
        category: "training"
    },
    {
        reference: "3 John 1:2",
        text: "Dear friend, I pray that you may enjoy good health and that all may go well with you, even as your soul is getting along well.",
        category: "health"
    },
    {
        reference: "Isaiah 40:31",
        text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
        category: "endurance"
    },
    {
        reference: "Proverbs 3:7-8",
        text: "Do not be wise in your own eyes; fear the Lord and shun evil. This will bring health to your body and nourishment to your bones.",
        category: "health"
    },
    {
        reference: "Colossians 3:23",
        text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
        category: "motivation"
    },
    {
        reference: "Romans 12:1",
        text: "Therefore, I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship.",
        category: "body"
    },
    {
        reference: "Psalm 139:14",
        text: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.",
        category: "gratitude"
    },
    {
        reference: "Ecclesiastes 9:10",
        text: "Whatever your hand finds to do, do it with all your might.",
        category: "motivation"
    },
    {
        reference: "Proverbs 31:17",
        text: "She sets about her work vigorously; her arms are strong for her tasks.",
        category: "strength"
    },
    {
        reference: "1 Corinthians 9:27",
        text: "No, I strike a blow to my body and make it my slave so that after I have preached to others, I myself will not be disqualified for the prize.",
        category: "discipline"
    },
    {
        reference: "Galatians 5:22-23",
        text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.",
        category: "discipline"
    },
    {
        reference: "Matthew 4:4",
        text: "Jesus answered, 'It is written: Man shall not live on bread alone, but on every word that comes from the mouth of God.'",
        category: "fasting"
    },
    {
        reference: "Psalm 28:7",
        text: "The Lord is my strength and my shield; my heart trusts in him, and he helps me.",
        category: "strength"
    },
    {
        reference: "2 Timothy 1:7",
        text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.",
        category: "discipline"
    },
    {
        reference: "Deuteronomy 8:3",
        text: "He humbled you, causing you to hunger and then feeding you with manna, which neither you nor your ancestors had known, to teach you that man does not live on bread alone but on every word that comes from the mouth of the Lord.",
        category: "fasting"
    },
    {
        reference: "Nehemiah 8:10",
        text: "Do not grieve, for the joy of the Lord is your strength.",
        category: "strength"
    },
    {
        reference: "Psalm 73:26",
        text: "My flesh and my heart may fail, but God is the strength of my heart and my portion forever.",
        category: "endurance"
    },
    {
        reference: "Hebrews 12:11",
        text: "No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace for those who have been trained by it.",
        category: "discipline"
    },
    {
        reference: "Matthew 6:16-17",
        text: "When you fast, do not look somber as the hypocrites do... But when you fast, put oil on your head and wash your face.",
        category: "fasting"
    },
    {
        reference: "1 Corinthians 10:31",
        text: "So whether you eat or drink or whatever you do, do it all for the glory of God.",
        category: "nutrition"
    },
    {
        reference: "Proverbs 25:16",
        text: "If you find honey, eat just enough—too much of it, and you will vomit.",
        category: "nutrition"
    },
    {
        reference: "Daniel 1:15",
        text: "At the end of the ten days they looked healthier and better nourished than any of the young men who ate the royal food.",
        category: "nutrition"
    },
    {
        reference: "Genesis 1:29",
        text: "Then God said, 'I give you every seed-bearing plant on the face of the whole earth and every tree that has fruit with seed in it. They will be yours for food.'",
        category: "nutrition"
    },
    {
        reference: "Psalm 127:2",
        text: "In vain you rise early and stay up late, toiling for food to eat—for he grants sleep to those he loves.",
        category: "rest"
    },
    {
        reference: "Mark 6:31",
        text: "Then, because so many people were coming and going that they did not even have a chance to eat, he said to them, 'Come with me by yourselves to a quiet place and get some rest.'",
        category: "rest"
    },
    {
        reference: "Matthew 11:28",
        text: "Come to me, all you who are weary and burdened, and I will give you rest.",
        category: "rest"
    }
];

// Get a verse for today (consistent throughout the day)
export function getDailyVerse() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % fitnessVerses.length;
    return fitnessVerses[index];
}

// Get a random verse
export function getRandomVerse() {
    return fitnessVerses[Math.floor(Math.random() * fitnessVerses.length)];
}

// Get verses by category
export function getVersesByCategory(category) {
    return fitnessVerses.filter(v => v.category === category);
}

// Faith-based encouragement messages for FitBuddy
export const faithEncouragements = {
    workout: [
        "Great workout! Remember, you're honoring God with your body. 💪✝️",
        "As Colossians 3:23 says, 'Whatever you do, work at it with all your heart, as working for the Lord.'",
        "You're building the temple God gave you! Keep pushing! 🙏",
        "The Lord is your strength today. You've got this!"
    ],
    meal: [
        "1 Corinthians 10:31 - Whatever you eat, do it for the glory of God! 🙏",
        "Nourishing God's temple with good food. Well done!",
        "Be grateful for this blessing of food. Enjoy your meal!",
        "Eating mindfully honors the body God gave you."
    ],
    fasting: [
        "Jesus fasted for 40 days. Your fast honors that sacrifice. Stay strong! 🙏",
        "Matthew 6:17 - 'When you fast, put oil on your head and wash your face.' Fast with joy!",
        "Use this fasting time for prayer and reflection.",
        "Your spiritual discipline is pleasing to God."
    ],
    water: [
        "Jesus is the living water! Stay hydrated! 💧✝️",
        "John 4:14 - 'Whoever drinks the water I give them will never thirst.'",
        "Taking care of your body is an act of worship.",
        "Every glass honors the temple!"
    ],
    sleep: [
        "Psalm 127:2 - 'He grants sleep to those he loves.' Rest well! 😴✝️",
        "God designed rest for restoration. Sleep peacefully.",
        "Matthew 11:28 - 'Come to me and I will give you rest.'",
        "Your body heals as you sleep. Trust in His plan."
    ],
    general: [
        "You are fearfully and wonderfully made! (Psalm 139:14)",
        "The joy of the Lord is your strength! (Nehemiah 8:10)",
        "I can do all things through Christ! (Philippians 4:13)",
        "Your body is a temple of the Holy Spirit. Care for it! 🙏"
    ]
};

export function getRandomEncouragement(category = 'general') {
    const messages = faithEncouragements[category] || faithEncouragements.general;
    return messages[Math.floor(Math.random() * messages.length)];
}
