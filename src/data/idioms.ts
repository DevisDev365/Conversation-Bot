import { IdiomItem, PersonaDetails } from '../types';

export const PERSONAS: Record<'indian' | 'uk', PersonaDetails> = {
  indian: {
    id: 'indian',
    name: 'Indian English Voice',
    tagline: 'Charismatic & Articulate Urban Indian Voice',
    description: 'Converses in warm, articulate, and charismatic urban Indian English with a deep, resonant tone — using natural English expressions like "See, my friend...", "At the end of the day", "Hats off", "100% sorted", and "No stress at all".',
    flag: '🇮🇳',
    accentTitle: 'Urban Indian English Accent & Cadence',
    defaultVoice: 'Charon',
    avatarBg: 'from-amber-500/20 via-orange-500/10 to-emerald-500/20 border-orange-500/30',
    samplePhrases: [
      'See, my friend, what’s the scene today? Everything sorted on your side?',
      'Hats off to that idea! At the end of the day, clear thinking solves everything.',
      'No stress at all! Relax, grab a tea and let’s talk properly.',
      'That sounds like a solid plan... 100% let’s do it!'
    ],
    keyIdioms: [
      { phrase: 'See, my friend...', meaning: 'Warm, charismatic conversational opener' },
      { phrase: 'At the end of the day', meaning: 'Summing up the core truth or reality' },
      { phrase: 'Hats off!', meaning: 'Expressing high admiration and respect' },
      { phrase: "What's the scene?", meaning: "How are things going? / What's up?" }
    ],
    culturalNotes: [
      'Speaks with charismatic, polite, and articulate urban Indian English rhythm using Charon (Deep & resonant voice).',
      'Reflects how urban professionals and creators communicate with warmth, clarity, and wit.',
      'Free from TV caricatures, Hindi slang, or outdated administrative tropes.'
    ]
  },
  uk: {
    id: 'uk',
    name: 'UK British Voice',
    tagline: 'Genuinely Authentic British Voice',
    description: 'Converses using genuine UK English idioms, British spelling, witty humor, and classic vocabulary like "chuffed to bits", "proper good", "spot of tea", and "cheerio".',
    flag: '🇬🇧',
    accentTitle: 'UK British Accent & Dialect',
    defaultVoice: 'Zephyr',
    avatarBg: 'from-blue-600/20 via-sky-500/10 to-red-500/20 border-blue-500/30',
    samplePhrases: [
      'Right then, fancy a quick spot of tea before we dive in?',
      'I must say, I am proper chuffed to meet you today!',
      'Brilliant, everything is completely sorted on my end.',
      'Cheerio mate, hope you have a smashing afternoon!'
    ],
    keyIdioms: [
      { phrase: 'Chuffed to bits', meaning: 'Extremely delighted and satisfied' },
      { phrase: 'Proper good', meaning: 'Really high quality or genuinely excellent' },
      { phrase: 'Spot of tea', meaning: 'A cup of tea and a brief relaxed chat' },
      { phrase: 'Sorted', meaning: 'Fully resolved or arranged perfectly' }
    ],
    culturalNotes: [
      'Employs authentic British spelling (colour, organise, centre).',
      'Uses UK vocabulary like lift, boot, flat, queue, and lorry.',
      'Infuses mild British wit, polite understated warmth, and classic slang.'
    ]
  }
};

export const IDIOMS_LIST: IdiomItem[] = [
  // Indian English Idioms & Charismatic Expressions (20 items)
  {
    id: 'ind-1',
    phrase: "See, my friend...",
    meaning: "A warm, engaging conversational opener that builds instant rapport and personal connection.",
    example: "See, my friend, success isn't about avoiding mistakes, it's about learning fast.",
    dialect: 'indian',
    category: 'Charismatic Openers'
  },
  {
    id: 'ind-2',
    phrase: "At the end of the day",
    meaning: "Reflective philosophical phrase summarizing the core bottom-line truth.",
    example: "At the end of the day, hard work and belief always win.",
    dialect: 'indian',
    category: 'Reflective Wit'
  },
  {
    id: 'ind-3',
    phrase: "Hats off!",
    meaning: "An enthusiastic expression of praise, respect, or high admiration.",
    example: "You solved that complex issue in ten minutes? Hats off to you!",
    dialect: 'indian',
    category: 'Praise & Admiration'
  },
  {
    id: 'ind-4',
    phrase: "The best is yet to come",
    meaning: "Optimistic phrase indicating that the journey or project has much more excitement ahead.",
    example: "We finished Phase 1, but the best is yet to come, my friend!",
    dialect: 'indian',
    category: 'Optimism & Drive'
  },
  {
    id: 'ind-5',
    phrase: "What's the scene?",
    meaning: "Popular urban opener asking what's happening or what the current plans are.",
    example: "Hey! What's the scene for the weekend? Any plans?",
    dialect: 'indian',
    category: 'Greetings & Openers'
  },
  {
    id: 'ind-6',
    phrase: 'Sorted',
    meaning: 'Describes a situation, problem, or arrangement that is completely resolved and clear.',
    example: "Don't worry about the venue booking, everything is totally sorted.",
    dialect: 'indian',
    category: 'Problem Solving'
  },
  {
    id: 'ind-7',
    phrase: 'Smart workaround',
    meaning: 'A creative, resourceful solution to solve a challenge efficiently.',
    example: "We didn't have the right connector, so we found a smart workaround.",
    dialect: 'indian',
    category: 'Innovations & Hacks'
  },
  {
    id: 'ind-8',
    phrase: '100% sorted',
    meaning: 'Expressing absolute certainty, total clarity, or solid commitment.',
    example: '100% sorted, I will join you guys for dinner tomorrow night!',
    dialect: 'indian',
    category: 'Agreement & Assurance'
  },
  {
    id: 'ind-9',
    phrase: 'Core logic',
    meaning: 'The fundamental principles or logic behind a subject.',
    example: 'Once your core logic is clear, solving these complex problems is super easy.',
    dialect: 'indian',
    category: 'Learning & Work'
  },
  {
    id: 'ind-10',
    phrase: 'No stress / Chill scene',
    meaning: 'Encouraging someone to relax, indicating everything is easygoing.',
    example: 'No stress at all, take your time and finish whenever you can.',
    dialect: 'indian',
    category: 'Reassurance'
  },
  {
    id: 'ind-11',
    phrase: 'Take a call',
    meaning: 'To make a final decision or judgment on a topic.',
    example: "Let's review the budget first and then take a call on the launch date.",
    dialect: 'indian',
    category: 'Decision Making'
  },
  {
    id: 'ind-12',
    phrase: 'Tea & catch-up',
    meaning: 'An invitation to take a quick break, enjoy tea, and chat casually.',
    example: "Let's take a 10-minute break for a quick tea & catch-up.",
    dialect: 'indian',
    category: 'Social Breaks'
  },
  {
    id: 'ind-13',
    phrase: 'Solid plan',
    meaning: 'An excellent idea or well-thought-out proposal.',
    example: 'Meeting at 6 PM for dinner sounds like a solid plan.',
    dialect: 'indian',
    category: 'Planning'
  },
  {
    id: 'ind-14',
    phrase: 'Full power',
    meaning: 'Doing something with maximum energy, passion, and enthusiasm.',
    example: 'We went full power on this design and delivered it ahead of schedule.',
    dialect: 'indian',
    category: 'Enthusiasm'
  },
  {
    id: 'ind-15',
    phrase: 'Zero tension',
    meaning: 'A state of absolute peace of mind and complete confidence.',
    example: 'Once the backup was restored, we were in zero tension mode.',
    dialect: 'indian',
    category: 'Mindset'
  },
  {
    id: 'ind-16',
    phrase: 'Straight from the heart',
    meaning: 'Speaking with genuine sincerity, honesty, and warmth.',
    example: 'Thank you for those kind words, that came straight from the heart.',
    dialect: 'indian',
    category: 'Sincerity'
  },
  {
    id: 'ind-17',
    phrase: 'Touch wood',
    meaning: 'Wishing for continued good luck and smooth outcomes.',
    example: 'Touch wood, our launch has gone smoothly without a single hitch.',
    dialect: 'indian',
    category: 'Good Fortune'
  },
  {
    id: 'ind-18',
    phrase: 'Mindblowing',
    meaning: 'Extremely impressive, extraordinary, or remarkable.',
    example: 'The performance of this new voice synthesis engine is mindblowing!',
    dialect: 'indian',
    category: 'Praise'
  },
  {
    id: 'ind-19',
    phrase: 'Time-pass',
    meaning: 'Casual, relaxed activity done purely for enjoyment during free time.',
    example: 'Watching a funny podcast on Friday evening is great time-pass.',
    dialect: 'indian',
    category: 'Leisure'
  },
  {
    id: 'ind-20',
    phrase: 'From the bottom of my heart',
    meaning: 'Doing or expressing something deeply and genuinely with warmth.',
    example: 'Welcome to our voice space, welcome from the bottom of my heart!',
    dialect: 'indian',
    category: 'Warmth'
  },

  // UK English Idioms (20 items)
  {
    id: 'uk-1',
    phrase: 'Chuffed to bits',
    meaning: 'Thrilled, delighted, or extremely happy about an outcome.',
    example: 'I got the job offer today, I\'m proper chuffed to bits!',
    dialect: 'uk',
    category: 'Emotions'
  },
  {
    id: 'uk-2',
    phrase: 'Spot of tea',
    meaning: 'Having a comforting cup of tea and a light conversation.',
    example: 'Come inside, let\'s have a spot of tea and a chat.',
    dialect: 'uk',
    category: 'Culture & Leisure'
  },
  {
    id: 'uk-3',
    phrase: 'Gobsmacked',
    meaning: 'Utterly astonished, shocked, or speechless.',
    example: 'I was completely gobsmacked when they announced the news.',
    dialect: 'uk',
    category: 'Surprise'
  },
  {
    id: 'uk-4',
    phrase: 'Sorted',
    meaning: 'Completely arranged, organized, or resolved.',
    example: 'Don\'t worry about the tickets, that\'s all sorted now.',
    dialect: 'uk',
    category: 'Organization'
  },
  {
    id: 'uk-5',
    phrase: 'Taking the biscuit',
    meaning: 'Doing something remarkably unexpected, cheeky, or annoying.',
    example: 'Charging five quid for coffee really takes the biscuit!',
    dialect: 'uk',
    category: 'Witty Remarks'
  },
  {
    id: 'uk-6',
    phrase: 'Knackered',
    meaning: 'Extremely tired or worn out.',
    example: 'After that long commute, I\'m absolutely knackered.',
    dialect: 'uk',
    category: 'States of Being'
  },
  {
    id: 'uk-7',
    phrase: 'Proper good',
    meaning: 'Genuinely excellent or of high quality.',
    example: 'That fish and chips place by the pier is proper good.',
    dialect: 'uk',
    category: 'Praise'
  },
  {
    id: 'uk-8',
    phrase: 'Bob\'s your uncle',
    meaning: 'And there you have it; it\'s as simple as that.',
    example: 'Just press the green button and Bob\'s your uncle!',
    dialect: 'uk',
    category: 'Explanations'
  },
  {
    id: 'uk-9',
    phrase: 'Cheerio',
    meaning: 'A friendly traditional British farewell.',
    example: 'Cheerio for now, see you at the weekend!',
    dialect: 'uk',
    category: 'Greetings'
  },
  {
    id: 'uk-10',
    phrase: 'Quid',
    meaning: 'Slang for one British pound sterling (£1).',
    example: 'Could you lend me ten quid for lunch?',
    dialect: 'uk',
    category: 'Currency & Shopping'
  },
  {
    id: 'uk-11',
    phrase: 'Blimey!',
    meaning: 'An exclamation of surprise, amazement, or wonder.',
    example: 'Blimey! Look at the view from the top of the hill!',
    dialect: 'uk',
    category: 'Exclamations'
  },
  {
    id: 'uk-12',
    phrase: 'In a pickle',
    meaning: 'Facing a tricky, difficult, or confusing situation.',
    example: 'We forgot the password and now we\'re in a proper pickle.',
    dialect: 'uk',
    category: 'Dilemmas'
  },
  {
    id: 'uk-13',
    phrase: 'Fancy a chat?',
    meaning: 'A polite invitation asking if someone would like to talk.',
    example: 'If you have five minutes to spare, fancy a quick chat?',
    dialect: 'uk',
    category: 'Invitations'
  },
  {
    id: 'uk-14',
    phrase: 'Full of beans',
    meaning: 'Energetic, lively, and in high spirits.',
    example: 'The team was full of beans after winning the project bid.',
    dialect: 'uk',
    category: 'Energy'
  },
  {
    id: 'uk-15',
    phrase: 'Spill the beans',
    meaning: 'Revealing a secret or disclosing surprise information.',
    example: 'Come on, spill the beans! What did they say in the meeting?',
    dialect: 'uk',
    category: 'Secrets'
  },
  {
    id: 'uk-16',
    phrase: 'Not my cup of tea',
    meaning: 'Something that is not to one\'s personal preference or taste.',
    example: 'Heavy metal music is okay, but it\'s not really my cup of tea.',
    dialect: 'uk',
    category: 'Preferences'
  },
  {
    id: 'uk-17',
    phrase: 'Cost an arm and a leg',
    meaning: 'Exceedingly expensive or costly.',
    example: 'Buying front-row concert tickets cost an arm and a leg.',
    dialect: 'uk',
    category: 'Value'
  },
  {
    id: 'uk-18',
    phrase: 'Over the moon',
    meaning: 'Ecstatic, elated, or extraordinarily happy.',
    example: 'She was over the moon when she passed her exams with top honors.',
    dialect: 'uk',
    category: 'Joy'
  },
  {
    id: 'uk-19',
    phrase: 'Bite the bullet',
    meaning: 'Facing a tough or unpleasant task with brave determination.',
    example: 'I decided to bite the bullet and finish writing the report tonight.',
    dialect: 'uk',
    category: 'Determination'
  },
  {
    id: 'uk-20',
    phrase: 'Throw a spanner in the works',
    meaning: 'Unexpectedly disrupting or complicating a plan.',
    example: 'The rain threw a spanner in the works for our picnic plans.',
    dialect: 'uk',
    category: 'Complications'
  }
];

export function detectIdiomsInText(text: string, dialect: 'indian' | 'uk') {
  const idioms = IDIOMS_LIST.filter(item => item.dialect === dialect);
  const found: { idiom: string; meaning: string; dialect: 'indian' | 'uk' }[] = [];

  const lowerText = text.toLowerCase();
  for (const item of idioms) {
    if (lowerText.includes(item.phrase.toLowerCase())) {
      found.push({
        idiom: item.phrase,
        meaning: item.meaning,
        dialect: item.dialect
      });
    }
  }

  return found;
}
