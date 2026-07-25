import { IdiomItem, PersonaDetails } from '../types';

export const PERSONAS: Record<'indian' | 'uk', PersonaDetails> = {
  indian: {
    id: 'indian',
    name: 'Raj & Ananya',
    tagline: 'Authentic Indian English Persona',
    description: 'Converses using vibrant Indian English vocabulary, local phrasal verbs, polite expressions, and culturally rich idioms like "do one thing", "prepone", and "doing the needful".',
    flag: '🇮🇳',
    accentTitle: 'Indian English Accent & Dialect',
    defaultVoice: 'Kore',
    avatarBg: 'from-amber-500/20 via-orange-500/10 to-emerald-500/20 border-orange-500/30',
    samplePhrases: [
      'Do one thing, let us discuss your weekend plans first!',
      'What is your good name, if I may kindly ask?',
      'Can we prepone our conversation by ten minutes?',
      'No issue at all, I will do the needful right away!'
    ],
    keyIdioms: [
      { phrase: 'Do one thing', meaning: 'A friendly way to suggest an idea or next step' },
      { phrase: 'Prepone', meaning: 'To reschedule an event earlier than planned' },
      { phrase: 'Doing the needful', meaning: 'Carrying out whatever action is required' },
      { phrase: 'Kindly revert', meaning: 'Please reply or get back to me' }
    ],
    culturalNotes: [
      'Uses warm honorifics and respectful phrasal phrasing.',
      'Reflects everyday conversational Indian English used across corporate and casual settings.',
      'Includes Indian English vocabulary like batchmate, godown, and time-pass.'
    ]
  },
  uk: {
    id: 'uk',
    name: 'Oliver & Charlotte',
    tagline: 'Genuinely Authentic British Persona',
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
  // Indian English Idioms
  {
    id: 'ind-1',
    phrase: 'Do one thing',
    meaning: 'A common suggestion opener meaning "here is a proposal" or "try this first".',
    example: 'Do one thing, call him directly on the mobile number.',
    dialect: 'indian',
    category: 'Phrasal Suggestions'
  },
  {
    id: 'ind-2',
    phrase: 'Prepone',
    meaning: 'To move an event or meeting to an earlier time (opposite of postpone).',
    example: 'We had to prepone the meeting from 4 PM to 2 PM.',
    dialect: 'indian',
    category: 'Business & Scheduling'
  },
  {
    id: 'ind-3',
    phrase: 'What is your good name?',
    meaning: 'Polite, traditional phrasing asking for someone\'s full name.',
    example: 'Welcome to the office! What is your good name?',
    dialect: 'indian',
    category: 'Greetings & Politeness'
  },
  {
    id: 'ind-4',
    phrase: 'Doing the needful',
    meaning: 'Taking all necessary steps or completing required actions.',
    example: 'I have forwarded your application and am doing the needful.',
    dialect: 'indian',
    category: 'Workplace Phrases'
  },
  {
    id: 'ind-5',
    phrase: 'Kindly revert back',
    meaning: 'Polite request asking someone to reply or respond.',
    example: 'Kindly revert back at your earliest convenience.',
    dialect: 'indian',
    category: 'Email & Messages'
  },
  {
    id: 'ind-6',
    phrase: 'Out of station',
    meaning: 'Being away from one\'s home town or city.',
    example: 'Rahul will be out of station till next Monday.',
    dialect: 'indian',
    category: 'Travel & Location'
  },
  {
    id: 'ind-7',
    phrase: 'Pass out from college',
    meaning: 'Graduating from an educational institution.',
    example: 'She passed out from Delhi University in 2022.',
    dialect: 'indian',
    category: 'Education'
  },
  {
    id: 'ind-8',
    phrase: 'Too good only',
    meaning: 'Emphatic expression indicating something is outstanding.',
    example: 'The food at this restaurant is too good only!',
    dialect: 'indian',
    category: 'Expressive Slang'
  },
  {
    id: 'ind-9',
    phrase: 'Time-pass',
    meaning: 'An enjoyable, informal activity used to pass spare time.',
    example: 'Watching reels on Sunday is just good time-pass.',
    dialect: 'indian',
    category: 'Leisure'
  },
  {
    id: 'ind-10',
    phrase: 'Batchmate',
    meaning: 'A classmate or peer from the same graduation year.',
    example: 'We were batchmates during engineering.',
    dialect: 'indian',
    category: 'Relationships'
  },

  // UK English Idioms
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
