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
