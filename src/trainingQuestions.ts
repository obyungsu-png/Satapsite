// Placeholder training questions for each SAT question type
// 나중에 실제 문제 데이터로 교체할 예정

export interface TrainingQuestion {
  id: number;
  question: string;
  passage?: string;
  choices: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  category: string;
  trainingType: string;
  difficulty: string;
  type: string;
}

// ── 독해 (Reading) ──

const readingCentralIdeals: TrainingQuestion[] = [
  {
    id: 101, question: "The main purpose of the passage is to",
    passage: "The discovery of penicillin by Alexander Fleming in 1928 revolutionized medicine. Before this breakthrough, even minor infections could be life-threatening. Fleming's accidental observation that mold inhibited bacterial growth led to the development of antibiotics, which have saved millions of lives worldwide.",
    choices: [{ id: "a", text: "describe the impact of a medical breakthrough" }, { id: "b", text: "criticize modern medical practices" }, { id: "c", text: "compare different antibiotic treatments" }, { id: "d", text: "argue against the use of antibiotics" }],
    correctAnswer: "a", explanation: "The passage focuses on describing how penicillin's discovery changed medicine and saved lives, making option A correct.",
    category: "Central Ideas and Details", trainingType: "central-ideas", difficulty: "Easy", type: "독해"
  },
  {
    id: 102, question: "Based on the passage, which statement about Fleming's discovery is most accurate?",
    passage: "Fleming noticed that a mold called Penicillium notatum had destroyed bacteria in a petri dish he had left uncovered. Though initially skeptical, he pursued his observation and found that the mold produced a substance that killed various bacteria without harming human cells.",
    choices: [{ id: "a", text: "It was the result of deliberate experimentation" }, { id: "b", text: "It was an unexpected finding from an unguarded sample" }, { id: "c", text: "It was confirmed by other scientists immediately" }, { id: "d", text: "It was rejected by the medical community" }],
    correctAnswer: "b", explanation: "The passage states Fleming left a petri dish uncovered and 'accidentally observed' the mold's effect, making B correct.",
    category: "Central Ideas and Details", trainingType: "central-ideas", difficulty: "Medium", type: "독해"
  },
  {
    id: 103, question: "The passage suggests that before penicillin, infections were",
    passage: "Before penicillin, bacterial infections were a leading cause of death. Pneumonia, tuberculosis, and wound infections routinely claimed lives. The introduction of antibiotics transformed these once-fatal conditions into treatable illnesses.",
    choices: [{ id: "a", text: "rarely fatal" }, { id: "b", text: "easily treatable" }, { id: "c", text: "potentially deadly" }, { id: "d", text: "limited to wound injuries" }],
    correctAnswer: "c", explanation: "The passage says infections were 'a leading cause of death' and 'routinely claimed lives,' making C correct.",
    category: "Central Ideas and Details", trainingType: "central-ideas", difficulty: "Easy", type: "독해"
  },
  {
    id: 104, question: "Which detail from the passage best supports the claim that penicillin had a global impact?",
    passage: "Penicillin's mass production during World War II saved countless soldiers from wound infections. After the war, antibiotics became widely available, transforming healthcare systems across the world. Diseases that had plagued humanity for centuries were suddenly manageable.",
    choices: [{ id: "a", text: "Fleming discovered penicillin by accident" }, { id: "b", text: "Antibiotics became widely available after WWII" }, { id: "c", text: "Penicillium notatum grows on bread" }, { id: "d", text: "Bacteria can develop resistance" }],
    correctAnswer: "b", explanation: "Option B directly supports the global impact claim by showing antibiotics reached worldwide healthcare systems.",
    category: "Central Ideas and Details", trainingType: "central-ideas", difficulty: "Hard", type: "독해"
  },
  {
    id: 105, question: "What is the relationship between the first and second sentences of the passage?",
    passage: "The discovery of penicillin transformed medicine. Before this breakthrough, even minor infections could prove fatal, but antibiotics made previously deadly conditions treatable.",
    choices: [{ id: "a", text: "The second sentence provides context for the first" }, { id: "b", text: "The second sentence contradicts the first" }, { id: "c", text: "The second sentence offers an alternative theory" }, { id: "d", text: "The two sentences describe unrelated events" }],
    correctAnswer: "a", explanation: "The second sentence explains the situation before penicillin, providing context for why the discovery was transformative.",
    category: "Central Ideas and Details", trainingType: "central-ideas", difficulty: "Medium", type: "독해"
  },
];

const readingInferences: TrainingQuestion[] = [
  {
    id: 111, question: "It can reasonably be inferred from the passage that the author believes",
    passage: "While some critics argue that social media has diminished meaningful communication, research suggests otherwise. Studies show that online interactions often complement face-to-face relationships, providing additional channels for maintaining social bonds.",
    choices: [{ id: "a", text: "social media entirely replaces face-to-face communication" }, { id: "b", text: "social media can enhance interpersonal connections" }, { id: "c", text: "all social media use is beneficial" }, { id: "d", text: "critics are correct about social media's harm" }],
    correctAnswer: "b", explanation: "The passage states online interactions 'complement' relationships and provide 'additional channels,' supporting inference B.",
    category: "Inferences", trainingType: "inferences", difficulty: "Medium", type: "독해"
  },
  {
    id: 112, question: "Based on the passage, which inference about the relationship between urban and rural areas is most supported?",
    passage: "As cities expanded throughout the 20th century, rural communities experienced declining populations. However, recent data shows a reversal: young professionals are relocating to smaller towns, drawn by lower costs and digital connectivity that enables remote work.",
    choices: [{ id: "a", text: "Rural areas will eventually become larger than cities" }, { id: "b", text: "Technology has reduced the necessity of urban living for work" }, { id: "c", text: "Cities no longer offer any advantages" }, { id: "d", text: "All young people prefer rural lifestyles" }],
    correctAnswer: "b", explanation: "Digital connectivity enabling remote work suggests technology has reduced the need to live in cities for employment, supporting B.",
    category: "Inferences", trainingType: "inferences", difficulty: "Easy", type: "독해"
  },
  {
    id: 113, question: "The passage implies that traditional agriculture in the region",
    passage: "Generations of farmers in the valley relied on seasonal rainfall to sustain their crops. When irrigation technology was introduced in the 1960s, crop yields doubled within a decade, though some elders expressed concern about depleting groundwater reserves.",
    choices: [{ id: "a", text: "was highly efficient before modern technology" }, { id: "b", text: "was vulnerable to weather variability" }, { id: "c", text: "caused significant environmental damage" }, { id: "d", text: "was abandoned immediately after irrigation arrived" }],
    correctAnswer: "b", explanation: "Relying on seasonal rainfall implies vulnerability to weather changes, making B the best inference.",
    category: "Inferences", trainingType: "inferences", difficulty: "Hard", type: "독해"
  },
];

const readingWordsContext: TrainingQuestion[] = [
  {
    id: 121, question: "As used in the passage, the word 'readily' most nearly means",
    passage: "The new polymer readily bonds with metals, creating a durable coating that resists corrosion. Engineers have adopted this material for bridge construction, where environmental exposure is a persistent challenge.",
    choices: [{ id: "a", text: "hesitantly" }, { id: "b", text: "easily" }, { id: "c", text: "rarely" }, { id: "d", text: "carefully" }],
    correctAnswer: "b", explanation: "'Readily' in this context means the polymer bonds with metals easily or without difficulty.",
    category: "Words in Context", trainingType: "words-context", difficulty: "Easy", type: "독해"
  },
  {
    id: 122, question: "In the passage, 'fosters' most nearly means",
    passage: "The university's mentorship program fosters collaboration between experienced researchers and incoming students, creating an environment where innovation thrives.",
    choices: [{ id: "a", text: "prevents" }, { id: "b", text: "encourages" }, { id: "c", text: "ignores" }, { id: "d", text: "observes" }],
    correctAnswer: "b", explanation: "'Fosters' means to encourage or promote the development of something, so 'encourages' is the best synonym.",
    category: "Words in Context", trainingType: "words-context", difficulty: "Medium", type: "독해"
  },
  {
    id: 123, question: "As used in the passage, 'concentration' most nearly means",
    passage: "The concentration of carbon dioxide in the atmosphere has risen steadily since industrialization began. Scientists measure this concentration in parts per million to track environmental changes.",
    choices: [{ id: "a", text: "focused attention" }, { id: "b", text: "proportion of a substance" }, { id: "c", text: "mental effort" }, { id: "d", text: "grouping of people" }],
    correctAnswer: "b", explanation: "In this scientific context, 'concentration' refers to the proportion/amount of CO2 in the atmosphere.",
    category: "Words in Context", trainingType: "words-context", difficulty: "Medium", type: "독해"
  },
];

const readingEvidence: TrainingQuestion[] = [
  {
    id: 131, question: "Which choice provides the best evidence for the claim that the author values scientific methodology?",
    passage: "Dr. Chen insisted that every hypothesis must be tested rigorously before acceptance. 'We cannot rely on intuition alone,' she stated. Her laboratory protocols became the standard for research institutions across three continents.",
    choices: [{ id: "a", text: "\"We cannot rely on intuition alone\"" }, { id: "b", text: "Dr. Chen insisted that every hypothesis must be tested" }, { id: "c", text: "Her laboratory protocols became the standard" }, { id: "d", text: "research institutions across three continents" }],
    correctAnswer: "b", explanation: "The insistence that every hypothesis must be tested directly reflects valuing scientific methodology.",
    category: "Command of Evidence (Textual)", trainingType: "evidence-textual", difficulty: "Medium", type: "독해"
  },
  {
    id: 132, question: "Which finding, if true, would most weaken the passage's argument about renewable energy?",
    passage: "Renewable energy sources like solar and wind power can fully replace fossil fuels within two decades. Current technology has made these sources cost-competitive, and storage solutions continue to improve rapidly.",
    choices: [{ id: "a", text: "Solar panel costs have decreased by 80%" }, { id: "b", text: "Energy storage technology has not advanced significantly in 5 years" }, { id: "c", text: "Wind turbines produce more energy per unit than coal plants" }, { id: "d", text: "Several nations have achieved 50% renewable energy" }],
    correctAnswer: "b", explanation: "If storage technology hasn't advanced, this undermines the passage's claim that storage solutions are 'improving rapidly,' weakening the argument.",
    category: "Command of Evidence (Textual)", trainingType: "evidence-textual", difficulty: "Hard", type: "독해"
  },
];

const readingTextStructure: TrainingQuestion[] = [
  {
    id: 141, question: "The overall structure of the passage is best described as",
    passage: "Ancient Greek philosophers debated the nature of knowledge. Plato argued that true understanding came from abstract reasoning, while Aristotle believed empirical observation was essential. This philosophical tension persisted for centuries and continues to influence modern epistemology.",
    choices: [{ id: "a", text: "a chronological narrative of events" }, { id: "b", text: "a comparison of contrasting viewpoints" }, { id: "c", text: "a personal anecdote with a moral" }, { id: "d", text: "a step-by-step instructional guide" }],
    correctAnswer: "b", explanation: "The passage contrasts Plato's and Aristotle's viewpoints on knowledge, making B the best description.",
    category: "Text Structure and Purpose", trainingType: "text-structure", difficulty: "Easy", type: "독해"
  },
  {
    id: 142, question: "The primary purpose of the first paragraph is to",
    passage: "The Arctic ice cap has shrunk by 40% since 1979. Satellite measurements confirm this dramatic reduction, which scientists attribute primarily to rising global temperatures. The consequences extend far beyond the polar region.",
    choices: [{ id: "a", text: "present a surprising fact to engage the reader" }, { id: "b", text: "provide a technical explanation of measurement methods" }, { id: "c", text: "argue against climate change theories" }, { id: "d", text: "describe the geography of the Arctic" }],
    correctAnswer: "a", explanation: "The opening presents the striking statistic of 40% shrinkage to grab attention and set up the discussion.",
    category: "Text Structure and Purpose", trainingType: "text-structure", difficulty: "Medium", type: "독해"
  },
];

const readingEvidenceQuantitative: TrainingQuestion[] = [
  {
    id: 151, question: "Which data point from the table best supports the claim that reading speed decreases with age?",
    passage: "A study measured reading speeds across age groups:\n| Age Group | Avg. Words/Min |\n| 18-25 | 280 |\n| 26-40 | 250 |\n| 41-60 | 210 |\n| 61+ | 170 |",
    choices: [{ id: "a", text: "The 18-25 group reads 280 words/min" }, { id: "b", text: "Each successive age group shows a lower reading speed" }, { id: "c", text: "The 61+ group reads 170 words/min" }, { id: "d", text: "The difference between 18-25 and 41-60 is 70 words/min" }],
    correctAnswer: "b", explanation: "The consistent decrease across all age groups (280→250→210→170) best supports the claim that reading speed decreases with age.",
    category: "Command of Evidence (Quantitative)", trainingType: "evidence-quantitative", difficulty: "Medium", type: "독해"
  },
  {
    id: 152, question: "Based on the graph, which conclusion about renewable energy adoption is most supported?",
    passage: "A bar chart shows renewable energy percentages by country: Germany 45%, Sweden 52%, France 23%, US 20%, Japan 18%.",
    choices: [{ id: "a", text: "All European countries exceed 40% renewable energy" }, { id: "b", text: "Northern European countries lead in renewable energy adoption" }, { id: "c", text: "The US uses more renewable energy than Japan" }, { id: "d", text: "France and Germany have similar renewable energy percentages" }],
    correctAnswer: "b", explanation: "Sweden (52%) and Germany (45%) — both Northern European — have the highest percentages, supporting B.",
    category: "Command of Evidence (Quantitative)", trainingType: "evidence-quantitative", difficulty: "Hard", type: "독해"
  },
  {
    id: 153, question: "Which statement is best supported by the data?",
    passage: "Temperature data over 5 decades:\n| Decade | Avg Temp (°C) |\n| 1970s | 14.0 |\n| 1980s | 14.2 |\n| 1990s | 14.5 |\n| 2000s | 14.8 |\n| 2010s | 15.1 |",
    choices: [{ id: "a", text: "Temperature increased by exactly 0.3°C each decade" }, { id: "b", text: "Average temperature has risen consistently over the period" }, { id: "c", text: "The 2010s were cooler than the 1990s" }, { id: "d", text: "Temperature remained constant until the 2000s" }],
    correctAnswer: "b", explanation: "The data shows a consistent upward trend: 14.0→14.2→14.5→14.8→15.1, supporting B.",
    category: "Command of Evidence (Quantitative)", trainingType: "evidence-quantitative", difficulty: "Easy", type: "독해"
  },
];

const readingCrossText: TrainingQuestion[] = [
  {
    id: 161, question: "Both passages discuss the role of technology in education. How do the authors' perspectives differ?",
    passage: "Passage 1: 'Technology has democratized access to knowledge, allowing students worldwide to learn from top instructors regardless of location.'\nPassage 2: 'While digital tools expand access, they often sacrifice depth of engagement. Screen-based learning can fragment attention and reduce critical thinking skills.'",
    choices: [{ id: "a", text: "Passage 1 is optimistic while Passage 2 is cautious" }, { id: "b", text: "Both passages oppose technology in education" }, { id: "c", text: "Passage 2 is more optimistic than Passage 1" }, { id: "d", text: "The passages agree on technology's impact" }],
    correctAnswer: "a", explanation: "Passage 1 highlights positive democratization, while Passage 2 warns about reduced engagement — they differ in optimism.",
    category: "Cross-Text Connections", trainingType: "cross-text", difficulty: "Medium", type: "독해"
  },
  {
    id: 162, question: "Based on both passages, which statement about urban development would both authors likely agree with?",
    passage: "Passage 1: 'Urban parks provide essential green spaces that improve residents' mental health and reduce stress.'\nPassage 2: 'Well-designed public spaces foster community interaction and reduce social isolation in dense neighborhoods.'",
    choices: [{ id: "a", text: "Urban public spaces benefit city residents' well-being" }, { id: "b", text: "All urban development should prioritize commercial spaces" }, { id: "c", text: "Parks are unnecessary in modern cities" }, { id: "d", text: "Mental health is unaffected by city design" }],
    correctAnswer: "a", explanation: "Both passages support that public spaces (parks, well-designed areas) improve residents' well-being — mental health and social connection.",
    category: "Cross-Text Connections", trainingType: "cross-text", difficulty: "Easy", type: "독해"
  },
  {
    id: 163, question: "The two passages present different views on artificial intelligence. Which claim would the author of Passage 2 most likely challenge?",
    passage: "Passage 1: 'AI systems can process vast amounts of data faster than humans, making them superior decision-makers in complex scenarios.'\nPassage 2: 'Human judgment incorporates ethical considerations and contextual understanding that algorithmic systems cannot replicate.'",
    choices: [{ id: "a", text: "AI should be used to supplement human decision-making" }, { id: "b", text: "AI systems are superior decision-makers in all scenarios" }, { id: "c", text: "Human judgment has limitations" }, { id: "d", text: "Ethics play a role in decision-making" }],
    correctAnswer: "b", explanation: "Passage 2 emphasizes human judgment's unique ethical and contextual abilities, directly challenging Passage 1's claim of AI superiority in all scenarios.",
    category: "Cross-Text Connections", trainingType: "cross-text", difficulty: "Hard", type: "독해"
  },
];

// ── 문법 (Grammar/Writing) ──

const grammarPunctuation: TrainingQuestion[] = [
  {
    id: 201, question: "Which choice completes the text so that it conforms to the conventions of Standard English?\n\nThe scientist published her findings __ the journal rejected them.",
    choices: [{ id: "a", text: "; however," }, { id: "b", text: ", however" }, { id: "c", text: "however," }, { id: "d", text: ". however," }],
    correctAnswer: "a", explanation: "A semicolon properly connects two independent clauses, and 'however' as a conjunctive adverb is followed by a comma.",
    category: "Punctuation Marks", trainingType: "punctuation", difficulty: "Medium", type: "문법"
  },
  {
    id: 202, question: "Which choice uses the correct punctuation?\n\nThe team consisted of three members __ Dr. Kim, Dr. Patel, and Dr. Okafor.",
    choices: [{ id: "a", text: ":" }, { id: "b", text: ";" }, { id: "c", text: "—" }, { id: "d", text: "," }],
    correctAnswer: "a", explanation: "A colon is used to introduce a list that directly follows and explains the preceding statement.",
    category: "Punctuation Marks", trainingType: "punctuation", difficulty: "Easy", type: "문법"
  },
  {
    id: 203, question: "Which choice completes the text with correct punctuation?\n\nMaria __ who had studied abroad for two years __ returned with a new perspective.",
    choices: [{ id: "a", text: ", who had studied abroad for two years," }, { id: "b", text: "—who had studied abroad for two years—" }, { id: "c", text: " (who had studied abroad for two years)" }, { id: "d", text: ",who had studied abroad for two years," }],
    correctAnswer: "b", explanation: "Em dashes are commonly used to set off non-essential information with emphasis, making B correct.",
    category: "Punctuation Marks", trainingType: "punctuation", difficulty: "Hard", type: "문법"
  },
];

const grammarSentenceConnection: TrainingQuestion[] = [
  {
    id: 241, question: "Which choice most effectively connects the two sentences?\n\nThe museum closed for renovations. __ it will reopen with an expanded collection in 2026.",
    choices: [{ id: "a", text: "After that," }, { id: "b", text: "In contrast," }, { id: "c", text: "Meanwhile," }, { id: "d", text: "Even so," }],
    correctAnswer: "a", explanation: "'After that' logically connects the closing with the future reopening, showing temporal sequence.",
    category: "Sentence Connection", trainingType: "sentence-connection", difficulty: "Easy", type: "문법"
  },
  {
    id: 242, question: "Which choice creates the most logical connection?\n\nSolar panels reduce electricity costs. __ their production process generates some environmental waste.",
    choices: [{ id: "a", text: "Moreover," }, { id: "b", text: "However," }, { id: "c", text: "Likewise," }, { id: "d", text: "As a result," }],
    correctAnswer: "b", explanation: "'However' introduces a contrasting point — solar panels are beneficial but have a drawback.",
    category: "Sentence Connection", trainingType: "sentence-connection", difficulty: "Medium", type: "문법"
  },
  {
    id: 243, question: "Which choice creates the most coherent paragraph?\n\nMany insects pollinate crops. __ bees alone contribute over $15 billion annually to US agriculture.",
    choices: [{ id: "a", text: "For example," }, { id: "b", text: "On the other hand," }, { id: "c", text: "Nevertheless," }, { id: "d", text: "In summary," }],
    correctAnswer: "a", explanation: "'For example' introduces a specific illustration of the general claim about insect pollination.",
    category: "Sentence Connection", trainingType: "sentence-connection", difficulty: "Hard", type: "문법"
  },
];

const grammarNounsPronouns: TrainingQuestion[] = [
  {
    id: 251, question: "Which choice completes the text to conform to Standard English?\n\nThe committee __ reached a unanimous decision after three hours of debate.",
    choices: [{ id: "a", text: "members" }, { id: "b", text: "member" }, { id: "c", text: "membership" }, { id: "d", text: "committees" }],
    correctAnswer: "a", explanation: "'Members' is the plural noun that correctly agrees with the plural verb 'reached.'",
    category: "Nouns, Pronouns", trainingType: "nouns-pronouns", difficulty: "Easy", type: "문법"
  },
  {
    id: 252, question: "Which choice uses the correct pronoun?\n\nNeither the director nor the actors __ responsible for the delay.",
    choices: [{ id: "a", text: "was" }, { id: "b", text: "were" }, { id: "c", text: "is" }, { id: "d", text: "has been" }],
    correctAnswer: "b", explanation: "With 'neither...nor,' the verb agrees with the nearer subject 'actors' (plural), so 'were' is correct.",
    category: "Nouns, Pronouns", trainingType: "nouns-pronouns", difficulty: "Medium", type: "문법"
  },
  {
    id: 253, question: "Which pronoun correctly completes the sentence?\n\nEach of the students __ completed the assignment on time.",
    choices: [{ id: "a", text: "has" }, { id: "b", text: "have" }, { id: "c", text: "had" }, { id: "d", text: "are" }],
    correctAnswer: "a", explanation: "'Each' is a singular pronoun requiring a singular verb. 'Has' is the correct singular form.",
    category: "Nouns, Pronouns", trainingType: "nouns-pronouns", difficulty: "Hard", type: "문법"
  },
];

const grammarAdjectives: TrainingQuestion[] = [
  {
    id: 261, question: "Which choice uses adjectives correctly?\n\nThe __ sunset painted the sky in shades of orange and red.",
    choices: [{ id: "a", text: "beautiful, breathtaking" }, { id: "b", text: "beautiful breathtaking" }, { id: "c", text: "beautifully breathtaking" }, { id: "d", text: "beautifully, breathtaking" }],
    correctAnswer: "a", explanation: "Coordinate adjectives (both modifying 'sunset' independently) should be separated by a comma.",
    category: "Adjectives", trainingType: "adjectives", difficulty: "Easy", type: "문법"
  },
  {
    id: 262, question: "Which choice completes the sentence correctly?\n\nShe felt __ about the upcoming exam than her classmates.",
    choices: [{ id: "a", text: "more anxious" }, { id: "b", text: "most anxious" }, { id: "c", text: "anxiouser" }, { id: "d", text: "anxiousmore" }],
    correctAnswer: "a", explanation: "'More anxious' is the correct comparative form of 'anxious' (a multisyllabic adjective).",
    category: "Adjectives", trainingType: "adjectives", difficulty: "Medium", type: "문법"
  },
  {
    id: 263, question: "Which choice is correct?\n\nThis is the __ movie I have ever watched.",
    choices: [{ id: "a", text: "worst" }, { id: "b", text: "worse" }, { id: "c", text: "baddest" }, { id: "d", text: "more bad" }],
    correctAnswer: "a", explanation: "'Worst' is the superlative form of 'bad,' needed when comparing to all others ('ever watched').",
    category: "Adjectives", trainingType: "adjectives", difficulty: "Hard", type: "문법"
  },
];

const grammarAttributiveAdverbial: TrainingQuestion[] = [
  {
    id: 271, question: "Which choice correctly places the adverb?\n\nShe __ finished the project before the deadline.",
    choices: [{ id: "a", text: "almost" }, { id: "b", text: "nearly almost" }, { id: "c", text: "almost nearly" }, { id: "d", text: "hardly almost" }],
    correctAnswer: "a", explanation: "'Almost' correctly modifies 'finished,' placed directly before the verb it modifies.",
    category: "Attributive, Adverbial", trainingType: "attributive-adverbial", difficulty: "Easy", type: "문법"
  },
  {
    id: 272, question: "Which choice uses the adverbial phrase correctly?\n\nThe team worked __ to complete the assignment.",
    choices: [{ id: "a", text: "diligently and efficiently" }, { id: "b", text: "diligently efficiently" }, { id: "c", text: "diligently, efficiently, and" }, { id: "d", text: "diligent and efficient" }],
    correctAnswer: "a", explanation: "Coordinate adverbs should be connected with 'and,' and 'diligently and efficiently' properly modifies 'worked.'",
    category: "Attributive, Adverbial", trainingType: "attributive-adverbial", difficulty: "Medium", type: "문법"
  },
  {
    id: 273, question: "Which choice is grammatically correct?\n\nThe report was written __ by the senior analyst.",
    choices: [{ id: "a", text: "exclusively" }, { id: "b", text: "exclusive" }, { id: "c", text: "exclusiveness" }, { id: "d", text: "exclusived" }],
    correctAnswer: "a", explanation: "Adverbs (not adjectives) modify verbs. 'Exclusively' is the adverb form that correctly modifies 'was written.'",
    category: "Attributive, Adverbial", trainingType: "attributive-adverbial", difficulty: "Hard", type: "문법"
  },
];

const grammarAppositive: TrainingQuestion[] = [
  {
    id: 281, question: "Which choice correctly uses an appositive?\n\nDr. Park __ gave an inspiring lecture on climate change.",
    choices: [{ id: "a", text: ", a renowned environmental scientist," }, { id: "b", text: "a renowned environmental scientist" }, { id: "c", text: ", renowned environmental scientist," }, { id: "d", text: "; a renowned environmental scientist;" }],
    correctAnswer: "a", explanation: "An appositive phrase identifying Dr. Park should be set off by commas on both sides.",
    category: "Appositive", trainingType: "appositive", difficulty: "Easy", type: "문법"
  },
  {
    id: 282, question: "Which choice correctly punctuates the appositive?\n\nThe novel __ became an instant bestseller.",
    choices: [{ id: "a", text: ", The Great Gatsby," }, { id: "b", text: "The Great Gatsby" }, { id: "c", text: "; The Great Gatsby" }, { id: "d", text: "— The Great Gatsby —" }],
    correctAnswer: "a", explanation: "A non-restrictive appositive that identifies the novel should be enclosed in commas.",
    category: "Appositive", trainingType: "appositive", difficulty: "Medium", type: "문법"
  },
  {
    id: 283, question: "Which sentence correctly uses a restrictive appositive?\n\nMy friend __ is studying abroad this semester.",
    choices: [{ id: "a", text: "Sarah" }, { id: "b", text: ", Sarah," }, { id: "c", text: "— Sarah —" }, { id: "d", text: ", Sarah" }],
    correctAnswer: "a", explanation: "A restrictive appositive (essential for identification) should NOT be set off by commas. 'My friend Sarah' — no commas.",
    category: "Appositive", trainingType: "appositive", difficulty: "Hard", type: "문법"
  },
];

const grammarTransition: TrainingQuestion[] = [
  {
    id: 211, question: "Which choice provides the most appropriate transition?\n\nThe initial experiment failed. __ the researchers modified their approach and succeeded.",
    choices: [{ id: "a", text: "Consequently" }, { id: "b", text: "Nevertheless" }, { id: "c", text: "Similarly" }, { id: "d", text: "Furthermore" }],
    correctAnswer: "b", explanation: "'Nevertheless' indicates that despite the failure, they continued—a contrast transition.",
    category: "Transition", trainingType: "transition", difficulty: "Easy", type: "문법"
  },
  {
    id: 212, question: "Which transition word best connects the sentences?\n\nDeforestation reduces biodiversity. __ it contributes to climate change by releasing stored carbon.",
    choices: [{ id: "a", text: "However" }, { id: "b", text: "Additionally" }, { id: "c", text: "Instead" }, { id: "d", text: "Conversely" }],
    correctAnswer: "b", explanation: "'Additionally' adds another negative effect of deforestation, showing it causes both problems.",
    category: "Transition", trainingType: "transition", difficulty: "Medium", type: "문법"
  },
];

const grammarRhetoricalSynthesis: TrainingQuestion[] = [
  {
    id: 221, question: "Which choice most effectively combines the two sentences?\n\nThe volcano erupted in 1980. It destroyed over 200 square miles of forest.",
    choices: [{ id: "a", text: "The volcano that erupted in 1980 destroyed over 200 square miles of forest." }, { id: "b", text: "The volcano erupted in 1980, and it destroyed over 200 square miles of forest." }, { id: "c", text: "In 1980, the volcano erupted, destroying over 200 square miles of forest." }, { id: "d", text: "When the volcano erupted in 1980, over 200 square miles of forest were destroyed by it." }],
    correctAnswer: "c", explanation: "Option C uses a participial phrase ('destroying') to efficiently combine cause and effect in one sentence.",
    category: "Rhetorical Synthesis", trainingType: "rhetorical-synthesis", difficulty: "Medium", type: "문법"
  },
  {
    id: 222, question: "Which choice most effectively combines the sentences while maintaining clarity?\n\nDr. Rivera studies marine ecosystems. Her research focuses on coral reef preservation.",
    choices: [{ id: "a", text: "Dr. Rivera studies marine ecosystems, and her research focuses on coral reef preservation." }, { id: "b", text: "Dr. Rivera studies marine ecosystems, focusing her research on coral reef preservation." }, { id: "c", text: "Dr. Rivera, who studies marine ecosystems, focuses her research on coral reef preservation." }, { id: "d", text: "Studying marine ecosystems, Dr. Rivera's research focuses on coral reef preservation." }],
    correctAnswer: "b", explanation: "Option B uses a participial phrase to smoothly connect the two ideas without redundancy or ambiguity.",
    category: "Rhetorical Synthesis", trainingType: "rhetorical-synthesis", difficulty: "Hard", type: "문법"
  },
];

const grammarVerb: TrainingQuestion[] = [
  {
    id: 231, question: "Which choice completes the text so that it conforms to the conventions of Standard English?\n\nBy the time the committee __ its decision, three weeks had passed.",
    choices: [{ id: "a", text: "reaches" }, { id: "b", text: "reached" }, { id: "c", text: "has reached" }, { id: "d", text: "will reach" }],
    correctAnswer: "b", explanation: "'Had passed' is past perfect, so the committee's action should be simple past: 'reached.'",
    category: "Verb Practice", trainingType: "verb-practice", difficulty: "Medium", type: "문법"
  },
  {
    id: 232, question: "Which verb form correctly completes the sentence?\n\nThe data __ that temperatures have been rising consistently.",
    choices: [{ id: "a", text: "shows" }, { id: "b", text: "show" }, { id: "c", text: "showing" }, { id: "d", text: "has shown" }],
    correctAnswer: "a", explanation: "'Data' can be treated as a singular collective noun in academic writing, so 'shows' is correct.",
    category: "Verb Practice", trainingType: "verb-practice", difficulty: "Easy", type: "문법"
  },
];

// ── 수학 (Math) ──

const mathBasicOperations: TrainingQuestion[] = [
  {
    id: 391, question: "What is the value of (12 × 5) - (8 + 17)?",
    choices: [{ id: "a", text: "35" }, { id: "b", text: "60" }, { id: "c", text: "25" }, { id: "d", text: "43" }],
    correctAnswer: "a", explanation: "12 × 5 = 60, 8 + 17 = 25, so 60 - 25 = 35.",
    category: "Basic Operations", trainingType: "basic-operations", difficulty: "Easy", type: "수학"
  },
  {
    id: 392, question: "If 48 ÷ 6 + 3 × 4 = ?, what is the result?",
    choices: [{ id: "a", text: "20" }, { id: "b", text: "12" }, { id: "c", text: "32" }, { id: "d", text: "8" }],
    correctAnswer: "a", explanation: "Following order of operations: 48 ÷ 6 = 8, 3 × 4 = 12, then 8 + 12 = 20.",
    category: "Basic Operations", trainingType: "basic-operations", difficulty: "Medium", type: "수학"
  },
  {
    id: 393, question: "What is the value of 2³ + √49?",
    choices: [{ id: "a", text: "15" }, { id: "b", text: "8" }, { id: "c", text: "57" }, { id: "d", text: "13" }],
    correctAnswer: "a", explanation: "2³ = 8, √49 = 7, so 8 + 7 = 15.",
    category: "Basic Operations", trainingType: "basic-operations", difficulty: "Hard", type: "수학"
  },
];

const mathBasicFunctions: TrainingQuestion[] = [
  {
    id: 401, question: "If f(x) = 3x - 1, what is f(4)?",
    choices: [{ id: "a", text: "11" }, { id: "b", text: "12" }, { id: "c", text: "7" }, { id: "d", text: "13" }],
    correctAnswer: "a", explanation: "f(4) = 3(4) - 1 = 12 - 1 = 11.",
    category: "Basic Functions", trainingType: "basic-functions", difficulty: "Easy", type: "수학"
  },
  {
    id: 402, question: "If g(x) = x² + 2x, what is g(-3)?",
    choices: [{ id: "a", text: "3" }, { id: "b", text: "-3" }, { id: "c", text: "9" }, { id: "d", text: "15" }],
    correctAnswer: "a", explanation: "g(-3) = (-3)² + 2(-3) = 9 - 6 = 3.",
    category: "Basic Functions", trainingType: "basic-functions", difficulty: "Medium", type: "수학"
  },
  {
    id: 403, question: "If h(x) = |x - 5|, what is the value of h(-2)?",
    choices: [{ id: "a", text: "7" }, { id: "b", text: "3" }, { id: "c", text: "-7" }, { id: "d", text: "2" }],
    correctAnswer: "a", explanation: "h(-2) = |-2 - 5| = |-7| = 7. Absolute value always returns a positive result.",
    category: "Basic Functions", trainingType: "basic-functions", difficulty: "Hard", type: "수학"
  },
];

const mathLinearFunctions: TrainingQuestion[] = [
  {
    id: 301, question: "If 3x + 7 = 22, what is the value of x?",
    choices: [{ id: "a", text: "5" }, { id: "b", text: "7" }, { id: "c", text: "15" }, { id: "d", text: "3" }],
    correctAnswer: "a", explanation: "3x + 7 = 22 → 3x = 15 → x = 5",
    category: "Linear Functions", trainingType: "linear-functions", difficulty: "Easy", type: "수학"
  },
  {
    id: 302, question: "A line passes through points (2, 5) and (4, 11). What is the slope of this line?",
    choices: [{ id: "a", text: "2" }, { id: "b", text: "3" }, { id: "c", text: "6" }, { id: "d", text: "1" }],
    correctAnswer: "b", explanation: "Slope = (11 - 5)/(4 - 2) = 6/2 = 3",
    category: "Linear Functions", trainingType: "linear-functions", difficulty: "Medium", type: "수학"
  },
  {
    id: 303, question: "The equation y = 2x - 3 represents a line. At what point does this line intersect the y-axis?",
    choices: [{ id: "a", text: "(0, -3)" }, { id: "b", text: "(0, 2)" }, { id: "c", text: "(-3, 0)" }, { id: "d", text: "(2, 0)" }],
    correctAnswer: "a", explanation: "The y-intercept occurs when x=0: y = 2(0) - 3 = -3, so the point is (0, -3).",
    category: "Linear Functions", trainingType: "linear-functions", difficulty: "Easy", type: "수학"
  },
  {
    id: 304, question: "If the system of equations 2x + y = 10 and x - y = 2 has a solution (x, y), what is x?",
    choices: [{ id: "a", text: "4" }, { id: "b", text: "3" }, { id: "c", text: "6" }, { id: "d", text: "2" }],
    correctAnswer: "a", explanation: "Adding equations: 3x = 12 → x = 4. Check: 2(4)+y=10 → y=2; 4-2=2 ✓",
    category: "Linear Functions", trainingType: "linear-functions", difficulty: "Medium", type: "수학"
  },
  {
    id: 305, question: "A store sells notebooks for $3 each and pens for $2 each. If Maria buys n notebooks and p pens and spends exactly $20, which equation represents this relationship?",
    choices: [{ id: "a", text: "3n + 2p = 20" }, { id: "b", text: "2n + 3p = 20" }, { id: "c", text: "n + p = 20" }, { id: "d", text: "3n - 2p = 20" }],
    correctAnswer: "a", explanation: "Total cost = (price of notebooks × quantity) + (price of pens × quantity) = 3n + 2p = 20.",
    category: "Linear Functions", trainingType: "linear-functions", difficulty: "Easy", type: "수학"
  },
];

const mathQuadratic: TrainingQuestion[] = [
  {
    id: 311, question: "What are the solutions to the equation x² - 5x + 6 = 0?",
    choices: [{ id: "a", text: "2 and 3" }, { id: "b", text: "-2 and -3" }, { id: "c", text: "1 and 6" }, { id: "d", text: "-1 and 6" }],
    correctAnswer: "a", explanation: "x² - 5x + 6 = (x-2)(x-3) = 0, so x = 2 or x = 3.",
    category: "Quadratic Functions", trainingType: "quadratic-functions", difficulty: "Easy", type: "수학"
  },
  {
    id: 312, question: "The function f(x) = x² - 4x + 7 has its minimum value at what x-coordinate?",
    choices: [{ id: "a", text: "2" }, { id: "b", text: "4" }, { id: "c", text: "-2" }, { id: "d", text: "7" }],
    correctAnswer: "a", explanation: "The vertex x-coordinate is -b/(2a) = 4/(2×1) = 2.",
    category: "Quadratic Functions", trainingType: "quadratic-functions", difficulty: "Medium", type: "수학"
  },
  {
    id: 313, question: "If the graph of y = ax² + bx + c intersects the x-axis at exactly one point, which must be true?",
    choices: [{ id: "a", text: "b² - 4ac = 0" }, { id: "b", text: "b² - 4ac > 0" }, { id: "c", text: "a = 0" }, { id: "d", text: "c = 0" }],
    correctAnswer: "a", explanation: "One intersection point means the discriminant b² - 4ac equals zero (a perfect square trinomial).",
    category: "Quadratic Functions", trainingType: "quadratic-functions", difficulty: "Hard", type: "수학"
  },
];

const mathGeometry: TrainingQuestion[] = [
  {
    id: 321, question: "A right triangle has legs of length 5 and 12. What is the length of the hypotenuse?",
    choices: [{ id: "a", text: "13" }, { id: "b", text: "17" }, { id: "c", text: "7" }, { id: "d", text: "8.5" }],
    correctAnswer: "a", explanation: "By Pythagorean theorem: 5² + 12² = 25 + 144 = 169 = 13²",
    category: "Geometry", trainingType: "geometry", difficulty: "Easy", type: "수학"
  },
  {
    id: 322, question: "A circle has an area of 49π square units. What is its circumference?",
    choices: [{ id: "a", text: "14π" }, { id: "b", text: "7π" }, { id: "c", text: "98π" }, { id: "d", text: "28π" }],
    correctAnswer: "a", explanation: "Area = πr² = 49π → r = 7. Circumference = 2πr = 14π.",
    category: "Geometry", trainingType: "geometry", difficulty: "Medium", type: "수학"
  },
  {
    id: 323, question: "Two similar triangles have areas of 9 and 36. If a side of the smaller triangle is 3, what is the corresponding side of the larger triangle?",
    choices: [{ id: "a", text: "6" }, { id: "b", text: "12" }, { id: "c", text: "9" }, { id: "d", text: "4" }],
    correctAnswer: "a", explanation: "Area ratio = 36/9 = 4, so side ratio = √4 = 2. Corresponding side = 3 × 2 = 6.",
    category: "Geometry", trainingType: "geometry", difficulty: "Hard", type: "수학"
  },
];

const mathExponential: TrainingQuestion[] = [
  {
    id: 331, question: "A population of bacteria doubles every hour. If there are 100 bacteria at noon, how many will there be at 3 PM?",
    choices: [{ id: "a", text: "800" }, { id: "b", text: "400" }, { id: "c", text: "300" }, { id: "d", text: "200" }],
    correctAnswer: "a", explanation: "After 3 hours: 100 × 2³ = 100 × 8 = 800.",
    category: "Exponential Functions", trainingType: "exponential-functions", difficulty: "Easy", type: "수학"
  },
  {
    id: 332, question: "The function f(t) = 500(0.8)ᵗ models the value of a car after t years. What is the annual percent decrease?",
    choices: [{ id: "a", text: "20%" }, { id: "b", text: "80%" }, { id: "c", text: "8%" }, { id: "d", text: "50%" }],
    correctAnswer: "a", explanation: "The base 0.8 means 80% remains each year, so 20% decreases annually.",
    category: "Exponential Functions", trainingType: "exponential-functions", difficulty: "Medium", type: "수학"
  },
];

const mathWordProblems: TrainingQuestion[] = [
  {
    id: 341, question: "A train travels 240 miles in 4 hours. At the same rate, how far would it travel in 7 hours?",
    choices: [{ id: "a", text: "420 miles" }, { id: "b", text: "350 miles" }, { id: "c", text: "280 miles" }, { id: "d", text: "480 miles" }],
    correctAnswer: "a", explanation: "Rate = 240/4 = 60 mph. Distance in 7 hours = 60 × 7 = 420 miles.",
    category: "Word Problems", trainingType: "word-problems", difficulty: "Easy", type: "수학"
  },
  {
    id: 342, question: "A shirt originally costs $45. It is first discounted by 20%, then an additional 10% discount is applied to the reduced price. What is the final price?",
    choices: [{ id: "a", text: "$32.40" }, { id: "b", text: "$31.50" }, { id: "c", text: "$36.00" }, { id: "d", text: "$33.00" }],
    correctAnswer: "a", explanation: "First discount: 45 × 0.80 = $36. Second discount: 36 × 0.90 = $32.40.",
    category: "Word Problems", trainingType: "word-problems", difficulty: "Medium", type: "수학"
  },
];

const mathStatistics: TrainingQuestion[] = [
  {
    id: 351, question: "The mean of 5, 8, 12, 15, and 20 is",
    choices: [{ id: "a", text: "12" }, { id: "b", text: "10" }, { id: "c", text: "15" }, { id: "d", text: "8" }],
    correctAnswer: "a", explanation: "Mean = (5+8+12+15+20)/5 = 60/5 = 12.",
    category: "Statistics", trainingType: "statistics", difficulty: "Easy", type: "수학"
  },
  {
    id: 352, question: "In a data set {2, 4, 4, 6, 8, 10}, what is the median?",
    choices: [{ id: "a", text: "5" }, { id: "b", text: "4" }, { id: "c", text: "6" }, { id: "d", text: "4.5" }],
    correctAnswer: "a", explanation: "With 6 values, median = average of 3rd and 4th values = (4+6)/2 = 5.",
    category: "Statistics", trainingType: "statistics", difficulty: "Medium", type: "수학"
  },
];

const mathCircles: TrainingQuestion[] = [
  {
    id: 361, question: "The equation (x-3)² + (y+2)² = 25 represents a circle. What is its radius?",
    choices: [{ id: "a", text: "5" }, { id: "b", text: "25" }, { id: "c", text: "3" }, { id: "d", text: "2" }],
    correctAnswer: "a", explanation: "The radius is √25 = 5.",
    category: "Circles", trainingType: "circles", difficulty: "Easy", type: "수학"
  },
  {
    id: 362, question: "In the equation x² + y² - 6x + 4y = 12, what is the center of the circle?",
    choices: [{ id: "a", text: "(3, -2)" }, { id: "b", text: "(-3, 2)" }, { id: "c", text: "(6, -4)" }, { id: "d", text: "(-6, 4)" }],
    correctAnswer: "a", explanation: "Complete the square: (x²-6x+9) + (y²+4y+4) = 12+9+4=25 → center (3,-2).",
    category: "Circles", trainingType: "circles", difficulty: "Hard", type: "수학"
  },
];

const mathTrig: TrainingQuestion[] = [
  {
    id: 371, question: "In a right triangle with angle θ, if sin(θ) = 3/5, what is cos(θ)?",
    choices: [{ id: "a", text: "4/5" }, { id: "b", text: "5/3" }, { id: "c", text: "3/4" }, { id: "d", text: "5/4" }],
    correctAnswer: "a", explanation: "sin²θ + cos²θ = 1 → cos²θ = 1 - 9/25 = 16/25 → cosθ = 4/5.",
    category: "Trigonometric Functions", trainingType: "trigonometric-functions", difficulty: "Medium", type: "수학"
  },
];

const mathDataAnalysis: TrainingQuestion[] = [
  {
    id: 381, question: "A survey shows that 60% of 200 students prefer online learning. How many students prefer online learning?",
    choices: [{ id: "a", text: "120" }, { id: "b", text: "60" }, { id: "c", text: "80" }, { id: "d", text: "140" }],
    correctAnswer: "a", explanation: "60% of 200 = 0.60 × 200 = 120.",
    category: "Data Analysis", trainingType: "data-analysis", difficulty: "Easy", type: "수학"
  },
];

// ── All training questions indexed by trainingType ──

export const trainingQuestionsByType: Record<string, TrainingQuestion[]> = {
  // Reading
  'central-ideas': readingCentralIdeals,
  'inferences': readingInferences,
  'words-context': readingWordsContext,
  'evidence-textual': readingEvidence,
  'evidence-quantitative': readingEvidenceQuantitative,
  'text-structure': readingTextStructure,
  'cross-text': readingCrossText,
  // Grammar
  'punctuation': grammarPunctuation,
  'sentence-connection': grammarSentenceConnection,
  'transition': grammarTransition,
  'rhetorical-synthesis': grammarRhetoricalSynthesis,
  'verb-practice': grammarVerb,
  'nouns-pronouns': grammarNounsPronouns,
  'adjectives': grammarAdjectives,
  'attributive-adverbial': grammarAttributiveAdverbial,
  'appositive': grammarAppositive,
  // Math
  'basic-operations': mathBasicOperations,
  'basic-functions': mathBasicFunctions,
  'linear-functions': mathLinearFunctions,
  'quadratic-functions': mathQuadratic,
  'geometry': mathGeometry,
  'exponential-functions': mathExponential,
  'word-problems': mathWordProblems,
  'statistics': mathStatistics,
  'circles': mathCircles,
  'trigonometric-functions': mathTrig,
  'data-analysis': mathDataAnalysis,
};

// ── Helper: get questions for a training session ──

export function getTrainingQuestions(
  trainingType: string,
  difficulty: string,
  count: number
): TrainingQuestion[] {
  // Get questions for this type
  const typeQuestions = trainingQuestionsByType[trainingType] || [];

  // Filter by difficulty if specified
  let filtered = typeQuestions;
  if (difficulty && difficulty !== '랜덤') {
    const diffMap: Record<string, string> = { 'Hard': 'Hard', 'Medium': 'Medium', 'Easy': 'Easy' };
    const targetDiff = diffMap[difficulty];
    if (targetDiff) {
      const diffFiltered = typeQuestions.filter(q => q.difficulty === targetDiff);
      if (diffFiltered.length > 0) filtered = diffFiltered;
    }
  }

  // If we have enough questions, return them (capped at count)
  if (filtered.length >= count) {
    return filtered.slice(0, count);
  }

  // If not enough, supplement with questions from same subject area
  const subjectType = trainingType.includes('linear') || trainingType.includes('quadratic') || 
    trainingType.includes('geometry') || trainingType.includes('exponential') || 
    trainingType.includes('word-problems') || trainingType.includes('statistics') ||
    trainingType.includes('circles') || trainingType.includes('trigonometric') || 
    trainingType.includes('data-analysis') ? '수학' : 
    trainingType.includes('punctuation') || trainingType.includes('transition') || 
    trainingType.includes('rhetorical') || trainingType.includes('verb') ? '문법' : '독해';

  // Get all questions from the same subject
  const allSubjectQuestions: TrainingQuestion[] = [];
  for (const [typeKey, typeQs] of Object.entries(trainingQuestionsByType)) {
    for (const q of typeQs) {
      if (q.type === subjectType && !filtered.find(f => f.id === q.id)) {
        allSubjectQuestions.push(q);
      }
    }
  }

  // Combine and return
  return [...filtered, ...allSubjectQuestions.slice(0, count - filtered.length)].slice(0, count);
}
