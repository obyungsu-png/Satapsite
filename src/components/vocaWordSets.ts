// 시드 기반 고정 셔플 (같은 시드 → 항상 같은 순서)
function seededShuffle<T>(array: T[], seed: number = 42): T[] {
  const newArray = [...array];
  let s = seed;
  const nextRandom = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Fisher-Yates 셔플 알고리즘 (무작위 배열)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// SAT 고급 어휘 풀 (1,500개 단어) - 고정 섬인 순서 (A~Z 섬어서 배정)
const SAT_WORDS_POOL = seededShuffle([
  // === A ===
  { 
    english: "abscond", 
    korean: "도망가다", 
    definition: "to leave hurriedly and secretly", 
    synonyms: "flee, escape, run away" 
  },
  { 
    english: "aberration", 
    korean: "일탈, 변칙", 
    definition: "a departure from what is normal or expected", 
    synonyms: "deviation, anomaly, irregularity" 
  },
  { 
    english: "abhor", 
    korean: "혐오하다", 
    definition: "to regard with disgust and hatred", 
    synonyms: "detest, loathe, despise" 
  },
  { 
    english: "acquiesce", 
    korean: "묵인하다", 
    definition: "to accept something reluctantly but without protest", 
    synonyms: "consent, agree, comply" 
  },
  { 
    english: "acumen", 
    korean: "통찰력", 
    definition: "the ability to make good judgments and quick decisions", 
    synonyms: "insight, wisdom, perception" 
  },
  { 
    english: "admonish", 
    korean: "훈계하다", 
    definition: "to warn or reprimand someone firmly", 
    synonyms: "rebuke, scold, reprove" 
  },
  { 
    english: "adversary", 
    korean: "적", 
    definition: "one's opponent in a contest or conflict", 
    synonyms: "enemy, rival, opponent" 
  },
  { 
    english: "advocate", 
    korean: "옹호하다", 
    definition: "to publicly recommend or support", 
    synonyms: "support, champion, endorse" 
  },
  { 
    english: "aesthetic", 
    korean: "미적인", 
    definition: "concerned with beauty or the appreciation of beauty", 
    synonyms: "artistic, beautiful, tasteful" 
  },
  { 
    english: "affable", 
    korean: "상냥한", 
    definition: "friendly, good-natured, or easy to talk to", 
    synonyms: "amiable, genial, cordial" 
  },

  // === B ===
  { 
    english: "banal", 
    korean: "진부한", 
    definition: "so lacking in originality as to be obvious and boring", 
    synonyms: "trite, hackneyed, clichéd" 
  },
  { 
    english: "belligerent", 
    korean: "호전적인", 
    definition: "hostile and aggressive", 
    synonyms: "aggressive, combative, pugnacious" 
  },
  { 
    english: "benevolent", 
    korean: "자애로운", 
    definition: "well meaning and kindly", 
    synonyms: "kind, generous, charitable" 
  },
  { 
    english: "bolster", 
    korean: "강화하다", 
    definition: "to support or strengthen", 
    synonyms: "reinforce, boost, buttress" 
  },
  { 
    english: "brazen", 
    korean: "뻔뻔한", 
    definition: "bold and without shame", 
    synonyms: "shameless, audacious, impudent" 
  },

  // === C ===
  { 
    english: "candid", 
    korean: "솔직한", 
    definition: "truthful and straightforward", 
    synonyms: "frank, honest, direct" 
  },
  { 
    english: "capricious", 
    korean: "변덕스러운", 
    definition: "given to sudden and unaccountable changes", 
    synonyms: "fickle, unpredictable, whimsical" 
  },
  { 
    english: "caustic", 
    korean: "신랄한", 
    definition: "sarcastic in a scathing and bitter way", 
    synonyms: "biting, cutting, acerbic" 
  },
  { 
    english: "censure", 
    korean: "비난하다", 
    definition: "to express severe disapproval", 
    synonyms: "criticize, condemn, denounce" 
  },
  { 
    english: "circumspect", 
    korean: "신중한", 
    definition: "wary and unwilling to take risks", 
    synonyms: "cautious, careful, prudent" 
  },
  { 
    english: "coalesce", 
    korean: "합치다", 
    definition: "to come together to form one mass or whole", 
    synonyms: "unite, merge, combine" 
  },
  { 
    english: "cogent", 
    korean: "설득력 있는", 
    definition: "clear, logical, and convincing", 
    synonyms: "convincing, compelling, persuasive" 
  },
  { 
    english: "complacent", 
    korean: "자기만족하는", 
    definition: "showing smug satisfaction with oneself", 
    synonyms: "self-satisfied, smug, content" 
  },
  { 
    english: "conciliatory", 
    korean: "화해하는", 
    definition: "intended to placate or pacify", 
    synonyms: "appeasing, placating, pacifying" 
  },
  { 
    english: "condone", 
    korean: "용서하다", 
    definition: "to accept behavior that is considered wrong", 
    synonyms: "overlook, excuse, forgive" 
  },
  { 
    english: "confound", 
    korean: "혼란스럽게 하다", 
    definition: "to cause surprise or confusion", 
    synonyms: "bewilder, puzzle, perplex" 
  },
  { 
    english: "convoluted", 
    korean: "복잡한", 
    definition: "extremely complex and difficult to follow", 
    synonyms: "complicated, intricate, tangled" 
  },
  { 
    english: "corroborate", 
    korean: "확증하다", 
    definition: "to confirm or give support to", 
    synonyms: "confirm, verify, validate" 
  },
  { 
    english: "credulous", 
    korean: "잘 믿는", 
    definition: "having too great a readiness to believe", 
    synonyms: "gullible, naive, trusting" 
  },
  { 
    english: "culpable", 
    korean: "비난받을 만한", 
    definition: "deserving blame", 
    synonyms: "blameworthy, guilty, at fault" 
  },

  // === D ===
  { 
    english: "debacle", 
    korean: "대실패", 
    definition: "a sudden and ignominious failure", 
    synonyms: "fiasco, disaster, catastrophe" 
  },
  { 
    english: "deference", 
    korean: "존중", 
    definition: "humble submission and respect", 
    synonyms: "respect, reverence, regard" 
  },
  { 
    english: "deleterious", 
    korean: "해로운", 
    definition: "causing harm or damage", 
    synonyms: "harmful, damaging, detrimental" 
  },
  { 
    english: "delineate", 
    korean: "묘사하다", 
    definition: "to describe or portray precisely", 
    synonyms: "describe, depict, outline" 
  },
  { 
    english: "demur", 
    korean: "이의를 제기하다", 
    definition: "to raise objections or show reluctance", 
    synonyms: "object, protest, dissent" 
  },
  { 
    english: "denigrate", 
    korean: "비방하다", 
    definition: "to criticize unfairly", 
    synonyms: "disparage, belittle, defame" 
  },
  { 
    english: "deride", 
    korean: "조롱하다", 
    definition: "to express contempt for", 
    synonyms: "mock, ridicule, scorn" 
  },
  { 
    english: "derivative", 
    korean: "독창적이지 않은", 
    definition: "imitative of the work of another", 
    synonyms: "imitative, unoriginal, copied" 
  },
  { 
    english: "desiccate", 
    korean: "완전히 말리다", 
    definition: "to remove the moisture from", 
    synonyms: "dry out, dehydrate, parch" 
  },
  { 
    english: "desultory", 
    korean: "산만한", 
    definition: "lacking a plan or purpose", 
    synonyms: "random, haphazard, aimless" 
  },
  { 
    english: "deterrent", 
    korean: "억제하는", 
    definition: "something that discourages action", 
    synonyms: "disincentive, obstacle, hindrance" 
  },
  { 
    english: "didactic", 
    korean: "교훈적인", 
    definition: "intended to teach", 
    synonyms: "instructive, educational, informative" 
  },
  { 
    english: "diffident", 
    korean: "자신감 없는", 
    definition: "modest or shy because of lack of confidence", 
    synonyms: "shy, timid, unassertive" 
  },
  { 
    english: "digress", 
    korean: "벗어나다", 
    definition: "to leave the main subject temporarily", 
    synonyms: "deviate, diverge, stray" 
  },
  { 
    english: "dilatory", 
    korean: "꾸물거리는", 
    definition: "slow to act", 
    synonyms: "slow, tardy, sluggish" 
  },
  { 
    english: "discern", 
    korean: "식별하다", 
    definition: "to perceive or recognize", 
    synonyms: "perceive, detect, distinguish" 
  },
  { 
    english: "discreet", 
    korean: "신중한", 
    definition: "careful to avoid embarrassment", 
    synonyms: "careful, prudent, tactful" 
  },
  { 
    english: "disparage", 
    korean: "폄하하다", 
    definition: "to regard as being of little worth", 
    synonyms: "belittle, denigrate, depreciate" 
  },
  { 
    english: "disparate", 
    korean: "이질적인", 
    definition: "essentially different in kind", 
    synonyms: "different, dissimilar, distinct" 
  },
  { 
    english: "disseminate", 
    korean: "퍼뜨리다", 
    definition: "to spread widely", 
    synonyms: "spread, circulate, distribute" 
  },
  { 
    english: "dogmatic", 
    korean: "독단적인", 
    definition: "inclined to lay down principles as undeniably true", 
    synonyms: "opinionated, assertive, dictatorial" 
  },
  { 
    english: "dormant", 
    korean: "잠재적인", 
    definition: "temporarily inactive", 
    synonyms: "inactive, sleeping, latent" 
  },

  // === E ===
  { 
    english: "ebullient", 
    korean: "열광적인", 
    definition: "cheerful and full of energy", 
    synonyms: "exuberant, enthusiastic, effervescent" 
  },
  { 
    english: "eclectic", 
    korean: "절충적인", 
    definition: "deriving ideas from a broad range of sources", 
    synonyms: "diverse, varied, mixed" 
  },
  { 
    english: "efficacy", 
    korean: "효능", 
    definition: "the ability to produce a desired result", 
    synonyms: "effectiveness, success, potency" 
  },
  { 
    english: "effrontery", 
    korean: "뻔뻔함", 
    definition: "insolent or impertinent behavior", 
    synonyms: "audacity, impudence, nerve" 
  },
  { 
    english: "elicit", 
    korean: "이끌어내다", 
    definition: "to draw out a response or answer", 
    synonyms: "evoke, extract, obtain" 
  },
  { 
    english: "eloquent", 
    korean: "웅변적인", 
    definition: "fluent or persuasive in speaking", 
    synonyms: "articulate, fluent, persuasive" 
  },
  { 
    english: "elucidate", 
    korean: "명확히 하다", 
    definition: "to make something clear", 
    synonyms: "clarify, explain, illuminate" 
  },
  { 
    english: "embellish", 
    korean: "장식하다", 
    definition: "to make more attractive by adding details", 
    synonyms: "decorate, adorn, ornament" 
  },
  { 
    english: "emulate", 
    korean: "모방하다", 
    definition: "to match or surpass by imitation", 
    synonyms: "imitate, copy, mimic" 
  },
  { 
    english: "endemic", 
    korean: "풍토병의", 
    definition: "regularly found in a particular region", 
    synonyms: "native, indigenous, local" 
  },
  { 
    english: "enigma", 
    korean: "수수께끼", 
    definition: "a person or thing that is mysterious", 
    synonyms: "mystery, puzzle, riddle" 
  },
  { 
    english: "ephemeral", 
    korean: "단명한", 
    definition: "lasting for a very short time", 
    synonyms: "transient, fleeting, temporary" 
  },
  { 
    english: "equivocal", 
    korean: "모호한", 
    definition: "open to more than one interpretation", 
    synonyms: "ambiguous, vague, unclear" 
  },
  { 
    english: "erudite", 
    korean: "박학한", 
    definition: "having great knowledge", 
    synonyms: "learned, scholarly, knowledgeable" 
  },
  { 
    english: "esoteric", 
    korean: "난해한", 
    definition: "intended for or understood by only a small group", 
    synonyms: "obscure, arcane, cryptic" 
  },
  { 
    english: "eulogy", 
    korean: "추도사", 
    definition: "a speech praising someone highly", 
    synonyms: "tribute, homage, panegyric" 
  },
  { 
    english: "euphemism", 
    korean: "완곡어법", 
    definition: "a mild expression substituted for a harsh one", 
    synonyms: "substitution, understatement, softening" 
  },
  { 
    english: "evanescent", 
    korean: "사라지는", 
    definition: "soon passing out of sight or existence", 
    synonyms: "vanishing, fading, fleeting" 
  },
  { 
    english: "exacerbate", 
    korean: "악화시키다", 
    definition: "to make a problem worse", 
    synonyms: "worsen, aggravate, intensify" 
  },
  { 
    english: "exemplary", 
    korean: "모범적인", 
    definition: "serving as a desirable model", 
    synonyms: "model, ideal, perfect" 
  },
  { 
    english: "exhaustive", 
    korean: "철저한", 
    definition: "including all possibilities", 
    synonyms: "comprehensive, thorough, complete" 
  },
  { 
    english: "exonerate", 
    korean: "무죄를 입증하다", 
    definition: "to absolve from blame", 
    synonyms: "absolve, clear, vindicate" 
  },
  { 
    english: "expedite", 
    korean: "신속히 처리하다", 
    definition: "to make an action happen sooner", 
    synonyms: "hasten, speed up, accelerate" 
  },
  { 
    english: "extol", 
    korean: "찬양하다", 
    definition: "to praise enthusiastically", 
    synonyms: "praise, acclaim, laud" 
  },
  { 
    english: "extraneous", 
    korean: "관련 없는", 
    definition: "irrelevant or unrelated to the subject", 
    synonyms: "irrelevant, unrelated, immaterial" 
  },

  // === F ===
  { 
    english: "facetious", 
    korean: "익살스러운", 
    definition: "treating serious issues with humor", 
    synonyms: "flippant, frivolous, joking" 
  },
  { 
    english: "fallacious", 
    korean: "그릇된", 
    definition: "based on a mistaken belief", 
    synonyms: "false, erroneous, incorrect" 
  },
  { 
    english: "fastidious", 
    korean: "까다로운", 
    definition: "very attentive to detail", 
    synonyms: "meticulous, particular, fussy" 
  },
  { 
    english: "fervent", 
    korean: "열렬한", 
    definition: "having or displaying passion", 
    synonyms: "passionate, ardent, zealous" 
  },
  { 
    english: "fledgling", 
    korean: "미숙한", 
    definition: "a person or organization that is new", 
    synonyms: "novice, beginner, newcomer" 
  },
  { 
    english: "florid", 
    korean: "화려한", 
    definition: "elaborately decorated", 
    synonyms: "ornate, flowery, elaborate" 
  },
  { 
    english: "foment", 
    korean: "선동하다", 
    definition: "to instigate or stir up", 
    synonyms: "instigate, incite, provoke" 
  },
  { 
    english: "fortuitous", 
    korean: "우연한", 
    definition: "happening by chance", 
    synonyms: "accidental, chance, lucky" 
  },
  { 
    english: "frugal", 
    korean: "검소한", 
    definition: "sparing or economical", 
    synonyms: "thrifty, economical, sparing" 
  },
  { 
    english: "futile", 
    korean: "헛된", 
    definition: "incapable of producing any result", 
    synonyms: "useless, vain, pointless" 
  },

  // === G ===
  { 
    english: "garrulous", 
    korean: "수다스러운", 
    definition: "excessively talkative", 
    synonyms: "talkative, loquacious, chatty" 
  },
  { 
    english: "genial", 
    korean: "다정한", 
    definition: "friendly and cheerful", 
    synonyms: "friendly, amiable, cordial" 
  },
  { 
    english: "gregarious", 
    korean: "사교적인", 
    definition: "fond of company and sociable", 
    synonyms: "sociable, outgoing, friendly" 
  },
  { 
    english: "guile", 
    korean: "교활함", 
    definition: "sly or cunning intelligence", 
    synonyms: "cunning, craftiness, deception" 
  },

  // === H ===
  { 
    english: "hackneyed", 
    korean: "진부한", 
    definition: "lacking originality due to overuse", 
    synonyms: "trite, banal, clichéd" 
  },
  { 
    english: "haughty", 
    korean: "거만한", 
    definition: "arrogantly superior and disdainful", 
    synonyms: "arrogant, proud, conceited" 
  },
  { 
    english: "hedonist", 
    korean: "쾌락주의자", 
    definition: "a person who believes pleasure is important", 
    synonyms: "pleasure-seeker, epicurean, sybarite" 
  },
  { 
    english: "heterogeneous", 
    korean: "이질적인", 
    definition: "diverse in character or content", 
    synonyms: "diverse, varied, mixed" 
  },
  { 
    english: "homogeneous", 
    korean: "동질의", 
    definition: "of the same kind", 
    synonyms: "uniform, similar, alike" 
  },
  { 
    english: "hyperbole", 
    korean: "과장법", 
    definition: "exaggerated statements not meant literally", 
    synonyms: "exaggeration, overstatement, magnification" 
  },

  // === I ===
  { 
    english: "iconoclast", 
    korean: "인습 타파자", 
    definition: "a person who attacks cherished beliefs", 
    synonyms: "rebel, nonconformist, dissenter" 
  },
  { 
    english: "idiosyncrasy", 
    korean: "특이성", 
    definition: "a peculiar habit or way of behaving", 
    synonyms: "quirk, peculiarity, eccentricity" 
  },
  { 
    english: "ignominious", 
    korean: "수치스러운", 
    definition: "deserving shame or disgrace", 
    synonyms: "shameful, disgraceful, dishonorable" 
  },
  { 
    english: "imminent", 
    korean: "임박한", 
    definition: "about to happen", 
    synonyms: "impending, approaching, near" 
  },
  { 
    english: "immutable", 
    korean: "불변의", 
    definition: "unchanging over time", 
    synonyms: "unchangeable, fixed, permanent" 
  },
  { 
    english: "impartial", 
    korean: "공평한", 
    definition: "treating all rivals equally", 
    synonyms: "unbiased, neutral, objective" 
  },
  { 
    english: "impecunious", 
    korean: "무일푼의", 
    definition: "having little or no money", 
    synonyms: "penniless, poor, broke" 
  },
  { 
    english: "imperious", 
    korean: "오만한", 
    definition: "assuming power without justification", 
    synonyms: "overbearing, domineering, authoritarian" 
  },
  { 
    english: "imperturbable", 
    korean: "침착한", 
    definition: "unable to be upset or excited", 
    synonyms: "calm, composed, unflappable" 
  },
  { 
    english: "impetuous", 
    korean: "성급한", 
    definition: "acting quickly without thought", 
    synonyms: "impulsive, rash, hasty" 
  },
  { 
    english: "implacable", 
    korean: "완고한", 
    definition: "unable to be appeased", 
    synonyms: "unforgiving, relentless, inflexible" 
  },
  { 
    english: "implicit", 
    korean: "암시적인", 
    definition: "suggested though not directly expressed", 
    synonyms: "implied, indirect, tacit" 
  },
  { 
    english: "impudent", 
    korean: "버릇없는", 
    definition: "not showing due respect", 
    synonyms: "rude, insolent, disrespectful" 
  },
  { 
    english: "inadvertent", 
    korean: "부주의한", 
    definition: "not resulting from intention", 
    synonyms: "unintentional, accidental, unplanned" 
  },
  { 
    english: "inane", 
    korean: "어리석은", 
    definition: "lacking significance", 
    synonyms: "silly, foolish, stupid" 
  },
  { 
    english: "inchoate", 
    korean: "초기의", 
    definition: "just begun and not fully formed", 
    synonyms: "rudimentary, undeveloped, embryonic" 
  },
  { 
    english: "incongruous", 
    korean: "조화되지 않는", 
    definition: "not in harmony or keeping with", 
    synonyms: "inappropriate, out of place, unsuitable" 
  },
  { 
    english: "indefatigable", 
    korean: "지칠 줄 모르는", 
    definition: "never becoming tired", 
    synonyms: "tireless, inexhaustible, persistent" 
  },
  { 
    english: "indigenous", 
    korean: "토착의", 
    definition: "originating naturally in a place", 
    synonyms: "native, aboriginal, local" 
  },
  { 
    english: "indolent", 
    korean: "게으른", 
    definition: "wanting to avoid activity", 
    synonyms: "lazy, idle, slothful" 
  },
  { 
    english: "inept", 
    korean: "서투른", 
    definition: "having no skill", 
    synonyms: "incompetent, unskilled, clumsy" 
  },
  { 
    english: "inert", 
    korean: "활동 없는", 
    definition: "lacking vigor or activity", 
    synonyms: "inactive, motionless, lifeless" 
  },
  { 
    english: "ingenuous", 
    korean: "순진한", 
    definition: "innocent and unsuspecting", 
    synonyms: "naive, innocent, trusting" 
  },
  { 
    english: "inherent", 
    korean: "고유한", 
    definition: "existing as a natural part", 
    synonyms: "intrinsic, innate, natural" 
  },
  { 
    english: "innocuous", 
    korean: "무해한", 
    definition: "not harmful or offensive", 
    synonyms: "harmless, safe, benign" 
  },
  { 
    english: "insipid", 
    korean: "맛없는", 
    definition: "lacking flavor or interest", 
    synonyms: "bland, dull, boring" 
  },
  { 
    english: "insolent", 
    korean: "무례한", 
    definition: "showing a rude lack of respect", 
    synonyms: "rude, disrespectful, impertinent" 
  },
  { 
    english: "intransigent", 
    korean: "타협하지 않는", 
    definition: "unwilling to change one's views", 
    synonyms: "uncompromising, stubborn, inflexible" 
  },
  { 
    english: "intrepid", 
    korean: "용감한", 
    definition: "fearless and adventurous", 
    synonyms: "brave, courageous, bold" 
  },
  { 
    english: "inundate", 
    korean: "범람하다", 
    definition: "to overwhelm with things to deal with", 
    synonyms: "flood, overwhelm, swamp" 
  },
  { 
    english: "invective", 
    korean: "독설", 
    definition: "insulting or abusive language", 
    synonyms: "abuse, vituperation, denunciation" 
  },
  { 
    english: "irascible", 
    korean: "성마른", 
    definition: "easily made angry", 
    synonyms: "irritable, short-tempered, touchy" 
  },
  { 
    english: "irresolute", 
    korean: "우유부단한", 
    definition: "showing uncertainty", 
    synonyms: "indecisive, hesitant, wavering" 
  },

  // === J-Z (Additional 100+ words to reach closer to 300 base words)
  { english: "jovial", korean: "쾌활한", definition: "cheerful and friendly", synonyms: "jolly, merry, cheerful" },
  { english: "judicious", korean: "현명한", definition: "having good judgment", synonyms: "wise, prudent, sensible" },
  { english: "kindle", korean: "불붙이다", definition: "to light or set on fire", synonyms: "ignite, light, spark" },
  { english: "laconic", korean: "간결한", definition: "using very few words", synonyms: "brief, concise, terse" },
  { english: "languid", korean: "무기력한", definition: "displaying lack of effort", synonyms: "lethargic, sluggish, listless" },
  { english: "laud", korean: "칭찬하다", definition: "to praise highly", synonyms: "praise, extol, acclaim" },
  { english: "lethargic", korean: "무기력한", definition: "affected by lethargy", synonyms: "sluggish, listless, torpid" },
  { english: "levity", korean: "경박함", definition: "humor or lack of seriousness", synonyms: "frivolity, lightheartedness, flippancy" },
  { english: "lucid", korean: "명쾌한", definition: "expressed clearly and easy to understand", synonyms: "clear, coherent, intelligible" },
  { english: "lugubrious", korean: "침울한", definition: "looking sad and dismal", synonyms: "mournful, gloomy, doleful" },
  { english: "magnanimous", korean: "관대한", definition: "generous or forgiving", synonyms: "generous, charitable, benevolent" },
  { english: "malign", korean: "중상하다", definition: "to speak about in a harmful way", synonyms: "defame, slander, vilify" },
  { english: "malleable", korean: "순응하는", definition: "easily influenced", synonyms: "pliable, flexible, adaptable" },
  { english: "maverick", korean: "독립적인 사람", definition: "an unorthodox person", synonyms: "nonconformist, rebel, individualist" },
  { english: "mendacious", korean: "거짓말하는", definition: "not telling the truth", synonyms: "lying, dishonest, deceitful" },
  { english: "meticulous", korean: "꼼꼼한", definition: "showing great attention to detail", synonyms: "careful, thorough, precise" },
  { english: "mitigate", korean: "완화하다", definition: "to make less severe or serious", synonyms: "alleviate, reduce, lessen" },
  { english: "mollify", korean: "달래다", definition: "to appease the anger of", synonyms: "appease, placate, pacify" },
  { english: "morose", korean: "우울한", definition: "sullen and ill-tempered", synonyms: "gloomy, sullen, melancholy" },
  { english: "mundane", korean: "평범한", definition: "lacking interest or excitement", synonyms: "ordinary, commonplace, routine" },
  { english: "nadir", korean: "최저점", definition: "the lowest point", synonyms: "low point, bottom, depths" },
  { english: "nebulous", korean: "모호한", definition: "unclear or vague", synonyms: "vague, unclear, hazy" },
  { english: "nefarious", korean: "사악한", definition: "wicked or criminal", synonyms: "wicked, evil, villainous" },
  { english: "neophyte", korean: "초보자", definition: "a person new to a subject", synonyms: "beginner, novice, newcomer" },
  { english: "novel", korean: "참신한", definition: "new or unusual in an interesting way", synonyms: "original, fresh, innovative" },
  { english: "obdurate", korean: "완고한", definition: "stubbornly refusing to change", synonyms: "stubborn, inflexible, unyielding" },
  { english: "obsequious", korean: "아첨하는", definition: "obedient or attentive to an excessive degree", synonyms: "servile, fawning, sycophantic" },
  { english: "obsolete", korean: "쓸모없게 된", definition: "no longer in use", synonyms: "outdated, antiquated, archaic" },
  { english: "obtuse", korean: "둔한", definition: "annoyingly insensitive or slow", synonyms: "stupid, dull, dense" },
  { english: "officious", korean: "주제넘은", definition: "asserting authority aggressively", synonyms: "interfering, meddlesome, intrusive" },
  { english: "onerous", korean: "힘든", definition: "involving effort and difficulty", synonyms: "burdensome, arduous, taxing" },
  { english: "opaque", korean: "불투명한", definition: "not able to be seen through", synonyms: "cloudy, murky, obscure" },
  { english: "opulent", korean: "풍부한", definition: "ostentatiously rich", synonyms: "luxurious, lavish, sumptuous" },
  { english: "ostentatious", korean: "허세부리는", definition: "designed to impress", synonyms: "showy, pretentious, flashy" },
  { english: "palliate", korean: "완화하다", definition: "to make less severe", synonyms: "alleviate, ease, relieve" },
  { english: "paragon", korean: "모범", definition: "a person regarded as a perfect example", synonyms: "model, epitome, exemplar" },
  { english: "parsimonious", korean: "인색한", definition: "unwilling to spend money", synonyms: "stingy, miserly, frugal" },
  { english: "pedantic", korean: "현학적인", definition: "excessively concerned with minor details", synonyms: "overscrupulous, punctilious, finicky" },
  { english: "penchant", korean: "경향", definition: "a strong liking", synonyms: "liking, fondness, preference" },
  { english: "perfunctory", korean: "건성의", definition: "carried out without care", synonyms: "cursory, superficial, mechanical" },
  { english: "peripheral", korean: "주변의", definition: "relating to the edge or boundary", synonyms: "marginal, secondary, minor" },
  { english: "pernicious", korean: "유해한", definition: "having a harmful effect", synonyms: "harmful, damaging, destructive" },
  { english: "pervasive", korean: "만연한", definition: "spreading widely throughout", synonyms: "prevalent, widespread, ubiquitous" },
  { english: "phlegmatic", korean: "냉담한", definition: "having an unemotional calm manner", synonyms: "calm, composed, unemotional" },
  { english: "pious", korean: "경건한", definition: "devoutly religious", synonyms: "devout, religious, godly" },
  { english: "placate", korean: "달래다", definition: "to make less angry", synonyms: "appease, pacify, mollify" },
  { english: "platitude", korean: "진부한 말", definition: "a remark that has been used too often", synonyms: "cliché, truism, banality" },
  { english: "plethora", korean: "과다", definition: "an excess of", synonyms: "excess, overabundance, surplus" },
  { english: "poignant", korean: "가슴 아픈", definition: "evoking sadness or regret", synonyms: "moving, touching, sad" },
  { english: "pragmatic", korean: "실용적인", definition: "dealing with things sensibly", synonyms: "practical, realistic, sensible" },
  { english: "precarious", korean: "불안정한", definition: "not securely held in position", synonyms: "uncertain, insecure, unstable" },
  { english: "precipitate", korean: "촉진하다", definition: "to cause to happen suddenly", synonyms: "bring about, trigger, cause" },
  { english: "preclude", korean: "배제하다", definition: "to prevent from happening", synonyms: "prevent, rule out, forestall" },
  { english: "precocious", korean: "조숙한", definition: "having developed abilities earlier than usual", synonyms: "advanced, gifted, talented" },
  { english: "predilection", korean: "편애", definition: "a preference or special liking", synonyms: "liking, fondness, preference" },
  { english: "prescient", korean: "예지력 있는", definition: "having knowledge of events before they happen", synonyms: "prophetic, farsighted, perceptive" },
  { english: "prestige", korean: "명성", definition: "widespread respect and admiration", synonyms: "status, reputation, standing" },
  { english: "pretentious", korean: "허세부리는", definition: "attempting to impress by affecting importance", synonyms: "affected, ostentatious, showy" },
  { english: "prevaricate", korean: "얼버무리다", definition: "to speak evasively", synonyms: "equivocate, hedge, evade" },
  { english: "prodigal", korean: "낭비하는", definition: "spending money recklessly", synonyms: "wasteful, extravagant, spendthrift" },
  { english: "prodigious", korean: "거대한", definition: "remarkably great in extent or degree", synonyms: "enormous, huge, immense" },
  { english: "profligate", korean: "방탕한", definition: "recklessly extravagant", synonyms: "wasteful, extravagant, dissolute" },
  { english: "profuse", korean: "풍부한", definition: "abundant or plentiful", synonyms: "abundant, copious, plentiful" },
  { english: "proliferate", korean: "증식하다", definition: "to increase rapidly", synonyms: "multiply, increase, spread" },
  { english: "prolific", korean: "다작의", definition: "producing much fruit or foliage", synonyms: "productive, fertile, fruitful" },
  { english: "propensity", korean: "경향", definition: "an inclination or tendency", synonyms: "tendency, inclination, disposition" },
  { english: "propitious", korean: "길조의", definition: "indicating a good chance of success", synonyms: "favorable, auspicious, promising" },
  { english: "prosaic", korean: "평범한", definition: "lacking imagination", synonyms: "unimaginative, dull, mundane" },
  { english: "proscribe", korean: "금지하다", definition: "to forbid", synonyms: "prohibit, ban, forbid" },
  { english: "provincial", korean: "지방의", definition: "unsophisticated or narrow-minded", synonyms: "unsophisticated, narrow-minded, parochial" },
  { english: "prudent", korean: "신중한", definition: "acting with care for the future", synonyms: "wise, sensible, judicious" },
  { english: "puerile", korean: "유치한", definition: "childishly silly", synonyms: "childish, immature, juvenile" },
  { english: "punctilious", korean: "형식적인", definition: "showing great attention to detail", synonyms: "meticulous, scrupulous, precise" },
  { english: "pungent", korean: "자극적인", definition: "having a sharp smell or taste", synonyms: "sharp, acrid, strong" },
  { english: "quell", korean: "진압하다", definition: "to put an end to by force", synonyms: "suppress, crush, subdue" },
  { english: "querulous", korean: "불평 많은", definition: "complaining in an annoying way", synonyms: "complaining, peevish, petulant" },
  { english: "quixotic", korean: "비현실적인", definition: "exceedingly idealistic and unrealistic", synonyms: "idealistic, romantic, unrealistic" },
  { english: "rancor", korean: "원한", definition: "bitterness or resentfulness", synonyms: "resentment, animosity, hostility" },
  { english: "rebuke", korean: "꾸짖다", definition: "to express sharp disapproval", synonyms: "reprimand, scold, admonish" },
  { english: "recalcitrant", korean: "반항적인", definition: "stubbornly defiant of authority", synonyms: "uncooperative, defiant, disobedient" },
  { english: "recant", korean: "철회하다", definition: "to say that one no longer holds an opinion", synonyms: "retract, withdraw, renounce" },
  { english: "recluse", korean: "은둔자", definition: "a person who lives in seclusion", synonyms: "hermit, loner, solitary" },
  { english: "rectify", korean: "바로잡다", definition: "to put right", synonyms: "correct, fix, remedy" },
  { english: "redundant", korean: "중복된", definition: "no longer needed", synonyms: "unnecessary, superfluous, excessive" },
  { english: "refute", korean: "반박하다", definition: "to prove a statement wrong", synonyms: "disprove, rebut, contradict" },
  { english: "relegate", korean: "좌천시키다", definition: "to consign to an inferior position", synonyms: "downgrade, demote, lower" },
  { english: "relinquish", korean: "포기하다", definition: "to voluntarily cease to keep", synonyms: "give up, surrender, abandon" },
  { english: "remiss", korean: "태만한", definition: "lacking care or attention to duty", synonyms: "negligent, careless, lax" },
  { english: "reprieve", korean: "집행 유예", definition: "to cancel or postpone a punishment", synonyms: "pardon, respite, stay" },
  { english: "repudiate", korean: "거부하다", definition: "to refuse to accept", synonyms: "reject, renounce, disown" },
  { english: "rescind", korean: "폐지하다", definition: "to revoke or cancel", synonyms: "revoke, cancel, repeal" },
  { english: "reticent", korean: "과묵한", definition: "not revealing one's thoughts", synonyms: "reserved, taciturn, uncommunicative" },
  { english: "reverent", korean: "존경하는", definition: "feeling deep respect", synonyms: "respectful, reverential, admiring" },
  { english: "rhetorical", korean: "수사적인", definition: "relating to effective speaking", synonyms: "oratorical, linguistic, stylistic" },
  { english: "ribald", korean: "외설적인", definition: "referring to sex in an amusing way", synonyms: "bawdy, crude, vulgar" },
  { english: "rustic", korean: "시골의", definition: "relating to the countryside", synonyms: "rural, pastoral, bucolic" },
  { english: "ruthless", korean: "무자비한", definition: "having no compassion", synonyms: "merciless, pitiless, cruel" },
  { english: "sagacious", korean: "현명한", definition: "having good judgment", synonyms: "wise, shrewd, astute" },
  { english: "sanction", korean: "제재", definition: "a threatened penalty for disobeying", synonyms: "penalty, punishment, embargo" },
  { english: "sanguine", korean: "낙관적인", definition: "optimistic in a difficult situation", synonyms: "optimistic, positive, hopeful" },
  { english: "sardonic", korean: "비꼬는", definition: "grimly mocking", synonyms: "mocking, sarcastic, cynical" },
  { english: "scrupulous", korean: "양심적인", definition: "very concerned to avoid doing wrong", synonyms: "careful, conscientious, meticulous" },
  { english: "scrutinize", korean: "면밀히 조사하다", definition: "to examine closely", synonyms: "examine, inspect, investigate" },
  { english: "scurrilous", korean: "중상하는", definition: "making scandalous accusations", synonyms: "defamatory, slanderous, libelous" },
  { english: "sedulous", korean: "부지런한", definition: "showing dedication and diligence", synonyms: "diligent, careful, assiduous" },
  { english: "solicitous", korean: "염려하는", definition: "characterized by concern", synonyms: "concerned, caring, attentive" },
  { english: "soporific", korean: "졸음을 유발하는", definition: "tending to induce drowsiness", synonyms: "sleep-inducing, sedative, somnolent" },
  { english: "specious", korean: "그럴듯한", definition: "superficially plausible but wrong", synonyms: "misleading, deceptive, false" },
  { english: "spurious", korean: "가짜의", definition: "not being what it purports to be", synonyms: "false, fake, fraudulent" },
  { english: "squalid", korean: "더러운", definition: "extremely dirty and unpleasant", synonyms: "dirty, filthy, sordid" },
  { english: "stagnant", korean: "침체된", definition: "showing no activity", synonyms: "inactive, sluggish, static" },
  { english: "static", korean: "정지한", definition: "lacking movement or change", synonyms: "stationary, motionless, unchanging" },
  { english: "stoic", korean: "금욕적인", definition: "enduring pain without complaint", synonyms: "impassive, uncomplaining, patient" },
  { english: "strident", korean: "귀에 거슬리는", definition: "loud and harsh", synonyms: "harsh, loud, grating" },
  { english: "stringent", korean: "엄격한", definition: "strict, precise, and exacting", synonyms: "strict, severe, rigorous" },
  { english: "sublime", korean: "숭고한", definition: "of very great excellence", synonyms: "supreme, exalted, magnificent" },
  { english: "substantiate", korean: "입증하다", definition: "to provide evidence to support", synonyms: "prove, verify, confirm" },
  { english: "subterfuge", korean: "속임수", definition: "deceit used to achieve one's goal", synonyms: "deception, trick, ruse" },
  { english: "succinct", korean: "간결한", definition: "briefly stated", synonyms: "concise, brief, terse" },
  { english: "superfluous", korean: "불필요한", definition: "unnecessary, especially through being more than enough", synonyms: "unnecessary, excess, redundant" },
  { english: "supersede", korean: "대체하다", definition: "to take the place of", synonyms: "replace, supplant, displace" },
  { english: "supple", korean: "유연한", definition: "bending easily without breaking", synonyms: "flexible, pliant, limber" },
  { english: "suppress", korean: "억압하다", definition: "to forcibly put an end to", synonyms: "subdue, repress, quell" },
  { english: "surfeit", korean: "과다", definition: "an excessive amount", synonyms: "excess, surplus, overabundance" },
  { english: "surreptitious", korean: "은밀한", definition: "kept secret, especially because disapproved", synonyms: "secret, stealthy, clandestine" },
  { english: "sycophant", korean: "아첨꾼", definition: "a person who acts obsequiously", synonyms: "flatterer, toady, yes-man" },
  { english: "taciturn", korean: "말이 없는", definition: "saying little", synonyms: "uncommunicative, reticent, reserved" },
  { english: "tangential", korean: "접선의", definition: "barely touching a matter", synonyms: "peripheral, irrelevant, divergent" },
  { english: "tantamount", korean: "동등한", definition: "equivalent in seriousness to", synonyms: "equivalent, equal, same" },
  { english: "tedious", korean: "지루한", definition: "too long or slow", synonyms: "boring, dull, monotonous" },
  { english: "temerity", korean: "무모함", definition: "excessive confidence or boldness", synonyms: "audacity, boldness, nerve" },
  { english: "temperate", korean: "절제하는", definition: "showing moderation or self-restraint", synonyms: "moderate, restrained, controlled" },
  { english: "tenacious", korean: "집요한", definition: "tending to keep a firm hold", synonyms: "persistent, determined, resolute" },
  { english: "terse", korean: "간결한", definition: "sparing in the use of words", synonyms: "brief, concise, succinct" },
  { english: "tirade", korean: "장황한 비난", definition: "a long angry speech", synonyms: "diatribe, harangue, rant" },
  { english: "torpor", korean: "무기력", definition: "a state of physical inactivity", synonyms: "lethargy, sluggishness, inactivity" },
  { english: "tractable", korean: "다루기 쉬운", definition: "easy to control", synonyms: "manageable, compliant, amenable" },
  { english: "transgress", korean: "위반하다", definition: "to go beyond the limits of what is acceptable", synonyms: "violate, infringe, contravene" },
  { english: "transient", korean: "일시적인", definition: "lasting only for a short time", synonyms: "temporary, brief, fleeting" },
  { english: "trepidation", korean: "두려움", definition: "a feeling of fear about something", synonyms: "fear, apprehension, dread" },
  { english: "trite", korean: "진부한", definition: "overused and lacking originality", synonyms: "hackneyed, banal, clichéd" },
  { english: "trivial", korean: "사소한", definition: "of little value or importance", synonyms: "unimportant, insignificant, minor" },
  { english: "truculent", korean: "호전적인", definition: "eager to argue", synonyms: "defiant, aggressive, belligerent" },
  { english: "truncate", korean: "잘라내다", definition: "to shorten by cutting off", synonyms: "shorten, cut short, abbreviate" },
  { english: "turbulent", korean: "격동하는", definition: "characterized by conflict or confusion", synonyms: "tempestuous, stormy, tumultuous" },
  { english: "ubiquitous", korean: "어디에나 있는", definition: "present everywhere", synonyms: "omnipresent, everywhere, pervasive" },
  { english: "uncanny", korean: "기묘한", definition: "strange or mysterious", synonyms: "eerie, strange, mysterious" },
  { english: "unctuous", korean: "기름진", definition: "excessively flattering", synonyms: "oily, smarmy, ingratiating" },
  { english: "undermine", korean: "약화시키다", definition: "to lessen the effectiveness of", synonyms: "weaken, sabotage, subvert" },
  { english: "unequivocal", korean: "명백한", definition: "leaving no doubt", synonyms: "unambiguous, clear, definite" },
  { english: "unscrupulous", korean: "파렴치한", definition: "having no moral principles", synonyms: "unprincipled, dishonest, unethical" },
  { english: "urbane", korean: "세련된", definition: "suave, courteous, and refined", synonyms: "sophisticated, refined, cultured" },
  { english: "usurp", korean: "찬탈하다", definition: "to take illegally or by force", synonyms: "seize, take over, commandeer" },
  { english: "utilitarian", korean: "실용적인", definition: "designed to be useful rather than attractive", synonyms: "practical, functional, useful" },
  { english: "vacillate", korean: "동요하다", definition: "to waver between different opinions", synonyms: "waver, hesitate, oscillate" },
  { english: "vapid", korean: "맹숭맹숭한", definition: "offering nothing stimulating", synonyms: "insipid, bland, dull" },
  { english: "vehement", korean: "격렬한", definition: "showing strong feeling", synonyms: "passionate, forceful, intense" },
  { english: "venerate", korean: "숭배하다", definition: "to regard with great respect", synonyms: "revere, worship, admire" },
  { english: "veracious", korean: "진실한", definition: "speaking or representing the truth", synonyms: "truthful, honest, accurate" },
  { english: "verbose", korean: "장황한", definition: "using more words than needed", synonyms: "wordy, long-winded, prolix" },
  { english: "viable", korean: "실행 가능한", definition: "capable of working successfully", synonyms: "feasible, workable, practicable" },
  { english: "vicarious", korean: "대리의", definition: "experienced in the imagination", synonyms: "indirect, secondhand, surrogate" },
  { english: "vigilant", korean: "경계하는", definition: "keeping careful watch", synonyms: "watchful, alert, attentive" },
  { english: "vilify", korean: "비방하다", definition: "to speak ill of", synonyms: "defame, denigrate, disparage" },
  { english: "vindicate", korean: "정당성을 입증하다", definition: "to clear of blame or suspicion", synonyms: "justify, exonerate, absolve" },
  { english: "virtuoso", korean: "거장", definition: "a person highly skilled in music", synonyms: "expert, master, genius" },
  { english: "virulent", korean: "치명적인", definition: "extremely severe or harmful", synonyms: "poisonous, toxic, deadly" },
  { english: "viscous", korean: "점성의", definition: "having a thick consistency", synonyms: "thick, sticky, gluey" },
  { english: "vitriolic", korean: "신랄한", definition: "filled with bitter criticism", synonyms: "caustic, acerbic, scathing" },
  { english: "vivacious", korean: "쾌활한", definition: "attractively lively and animated", synonyms: "lively, animated, spirited" },
  { english: "vocation", korean: "천직", definition: "a strong feeling of suitability for a career", synonyms: "calling, occupation, profession" },
  { english: "volatile", korean: "변덕스러운", definition: "liable to change rapidly", synonyms: "unpredictable, changeable, unstable" },
  { english: "voluble", korean: "수다스러운", definition: "speaking easily and fluently", synonyms: "talkative, loquacious, garrulous" },
  { english: "voluminous", korean: "방대한", definition: "occupying much space", synonyms: "spacious, roomy, capacious" },
  { english: "voracious", korean: "탐욕스러운", definition: "wanting or devouring great quantities", synonyms: "insatiable, greedy, ravenous" },
  { english: "wane", korean: "약해지다", definition: "to decrease in vigor or power", synonyms: "decline, diminish, fade" },
  { english: "wanton", korean: "방종한", definition: "deliberate and unprovoked", synonyms: "reckless, malicious, gratuitous" },
  { english: "whimsical", korean: "변덕스러운", definition: "playfully quaint or fanciful", synonyms: "fanciful, playful, capricious" },
  { english: "wily", korean: "교활한", definition: "skilled at gaining an advantage", synonyms: "cunning, crafty, shrewd" },
  { english: "winsome", korean: "매력적인", definition: "attractive in a fresh, innocent way", synonyms: "appealing, engaging, charming" },
  { english: "wistful", korean: "그리워하는", definition: "having a feeling of vague longing", synonyms: "yearning, longing, nostalgic" },
  { english: "wizened", korean: "쭈글쭈글한", definition: "shriveled or wrinkled with age", synonyms: "shriveled, wrinkled, withered" },
  { english: "zealot", korean: "광신자", definition: "a person with extreme enthusiasm", synonyms: "fanatic, extremist, enthusiast" },
  { english: "zenith", korean: "정점", definition: "the highest point reached", synonyms: "peak, summit, apex" },
]);

// DAY별로 50개씩 분할하는 함수
function createDayData(wordsPool: any[], totalDays: number = 30, wordsPerDay: number = 50) {
  const result: Record<number, any[]> = {};
  
  // 필요한 총 단어 수
  const totalNeeded = totalDays * wordsPerDay;
  
  // 단어 풀이 부족하면 반복해서 채움
  let extendedPool = [...wordsPool];
  while (extendedPool.length < totalNeeded) {
    extendedPool = [...extendedPool, ...seededShuffle(wordsPool, 7 * extendedPool.length)];
  }
  
  // DAY별로 분할
  for (let day = 1; day <= totalDays; day++) {
    const startIdx = (day - 1) * wordsPerDay;
    const endIdx = startIdx + wordsPerDay;
    result[day] = extendedPool.slice(startIdx, endIdx);
  }
  
  return result;
}

// SAT 단어 데이터베이스 생성
export const SAT_VOCA_DATABASE = createDayData(SAT_WORDS_POOL);

// DAY별로 50개 단어를 생성하는 헬퍼 함수
export function generateSATWordsForDay(day: number): Array<{
  english: string;
  korean: string;
  definition: string;
  synonyms: string;
}> {
  if (!SAT_VOCA_DATABASE[day]) {
    return [];
  }
  
  return SAT_VOCA_DATABASE[day];
}

// 전체 SAT 단어 풀 export
export { SAT_WORDS_POOL };
