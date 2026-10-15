/**
 * Helper function to evaluate MCQ candidate answer against correct answer.
 */
export function isMcqAnswerCorrect(
  correctAnswerRaw: string | undefined,
  selectedAnswerRaw: string | undefined,
  options: string[] = []
): boolean {
  if (!correctAnswerRaw || !selectedAnswerRaw) return false;

  const normalize = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replace(/^(option\s+)?[a-d][\)\.\:\-]?\s*/i, '')
      .trim();

  const getOptionLetter = (str: string): string | null => {
    const trimmed = str.trim().toUpperCase();
    const match = trimmed.match(/^(OPTION\s+)?([A-D])([\)\.\:\-]|(\s+.*))?$/);
    if (match) return match[2];
    return null;
  };

  const normSelected = normalize(selectedAnswerRaw);
  const normCorrect = normalize(correctAnswerRaw);

  const selectedLetter = getOptionLetter(selectedAnswerRaw);
  const correctLetter = getOptionLetter(correctAnswerRaw);

  // 1. Direct letter match (e.g. "A" === "A")
  if (selectedLetter && correctLetter && selectedLetter === correctLetter) {
    return true;
  }

  // 2. Direct normalized text match (e.g. "real dom" === "real dom")
  if (normSelected && normCorrect && normSelected === normCorrect) {
    return true;
  }

  // 3. Match via options array index lookup
  if (options && options.length > 0) {
    let selIdx = options.findIndex((opt) => opt === selectedAnswerRaw || normalize(opt) === normSelected);
    if (selIdx === -1 && selectedLetter) {
      selIdx = ['A', 'B', 'C', 'D'].indexOf(selectedLetter);
    }

    let corrIdx = options.findIndex((opt) => opt === correctAnswerRaw || normalize(opt) === normCorrect);
    if (corrIdx === -1 && correctLetter) {
      corrIdx = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
    }

    if (selIdx !== -1 && corrIdx !== -1 && selIdx === corrIdx) {
      return true;
    }
  }

  // 4. Substring inclusion fallback
  if (
    normSelected.length > 2 &&
    normCorrect.length > 2 &&
    (normSelected.includes(normCorrect) || normCorrect.includes(normSelected))
  ) {
    return true;
  }

  return false;
}

/**
 * Accurately finds the index (0, 1, 2, 3...) of the correct answer within an MCQ options list.
 * Safely handles:
 * - Letter representations ("A", "B", "C", "D", "Option B", "b)")
 * - Numeric indices ("0", "1", "2")
 * - Prefixed options ("A) Verification", "Option 1: ...")
 * - Text equality (case-insensitive, trimmed)
 * - Substring and fuzzy matching
 */
export function findCorrectOptionIndex(
  correctAnswerRaw: string | undefined,
  options: string[] = []
): number {
  if (!options || options.length === 0) return 0;
  if (!correctAnswerRaw || typeof correctAnswerRaw !== 'string') return 0;

  const rawTrimmed = correctAnswerRaw.trim();
  if (!rawTrimmed) return 0;

  const normalize = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replace(/^(option\s+)?[a-d][\)\.\:\-]?\s*/i, '')
      .replace(/^[\d]+[\)\.\:\-]?\s*/, '')
      .trim();

  const getOptionLetter = (str: string): string | null => {
    const trimmed = str.trim().toUpperCase();
    const match = trimmed.match(/^(OPTION\s+)?([A-D])([\)\.\:\-]|(\s+.*))?$/i);
    if (match) return match[2].toUpperCase();
    return null;
  };

  const rawLower = rawTrimmed.toLowerCase();
  const correctLetter = getOptionLetter(rawTrimmed);

  // 1. Direct letter identification: e.g. "A", "B", "C", "D", "Option B", "B)"
  if (correctLetter) {
    const letterIdx = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
    if (letterIdx >= 0 && letterIdx < options.length) {
      return letterIdx;
    }
  }

  // 2. Direct index number check: "0", "1", "2", "3"
  if (/^[0-3]$/.test(rawTrimmed)) {
    const num = parseInt(rawTrimmed, 10);
    if (num >= 0 && num < options.length) return num;
  }

  // 3. Exact match (case-insensitive & trimmed)
  const exactIdx = options.findIndex((opt) => opt.trim().toLowerCase() === rawLower);
  if (exactIdx >= 0) return exactIdx;

  // 4. Normalized match (strips leading prefixes like "A) ", "Option B: ")
  const normCorrect = normalize(rawTrimmed);
  if (normCorrect) {
    const normIdx = options.findIndex((opt) => normalize(opt) === normCorrect);
    if (normIdx >= 0) return normIdx;
  }

  // 5. Check if option starts with the answer or answer starts with the option
  const startIdx = options.findIndex((opt) => {
    const optTrim = opt.trim().toLowerCase();
    return optTrim.startsWith(rawLower) || (optTrim.length > 5 && rawLower.startsWith(optTrim));
  });
  if (startIdx >= 0) return startIdx;

  // 6. Check normalized substring match (for descriptive answers)
  if (normCorrect.length > 5) {
    const subIdx = options.findIndex((opt) => {
      const nOpt = normalize(opt);
      return nOpt.includes(normCorrect) || (nOpt.length > 5 && normCorrect.includes(nOpt));
    });
    if (subIdx >= 0) return subIdx;
  }

  // 7. Full isMcqAnswerCorrect match check against each option
  for (let i = 0; i < options.length; i++) {
    if (isMcqAnswerCorrect(rawTrimmed, options[i], options)) {
      return i;
    }
  }

  return 0;
}

