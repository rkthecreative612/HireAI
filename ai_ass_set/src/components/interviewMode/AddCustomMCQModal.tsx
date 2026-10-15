import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';
import { HybridMCQQuestion } from '../../types';

interface AddCustomMCQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (q: HybridMCQQuestion) => void;
}

export const AddCustomMCQModal: React.FC<AddCustomMCQModalProps> = ({
  isOpen,
  onClose,
  onAddQuestion
}) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOptionChange = (index: number, val: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAddOption = () => {
    if (options.length >= 8) return;
    setOptions((prev) => [...prev, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
    if (correctAnswerIndex === index) {
      setCorrectAnswerIndex(0);
    } else if (correctAnswerIndex > index) {
      setCorrectAnswerIndex((prev) => prev - 1);
    }
  };

  const handleSave = () => {
    if (!questionText.trim()) {
      setError('Please enter the question text.');
      return;
    }

    const trimmedOptions = options.map((o) => o.trim());
    if (trimmedOptions.some((o) => !o)) {
      setError('All option fields must have text. Remove extra options if not needed.');
      return;
    }

    if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      setError('Please select which option is the correct answer.');
      return;
    }

    const newQuestion: HybridMCQQuestion = {
      id: `hmcq-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      questionText: questionText.trim(),
      options: trimmedOptions,
      correctAnswerIndex,
      difficulty: 'medium',
      category: 'domain'
    };

    onAddQuestion(newQuestion);
    // Reset form
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswerIndex(0);
    setError('');
    onClose();
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Custom MCQ</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hardcoded manual creation. Type question, 4+ options, and pick the correct radio button.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Question Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Question Prompt <span className="text-rose-500 dark:text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value);
              setError('');
            }}
            placeholder="e.g. What is the time complexity of binary search on a sorted array of size n?"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
          />
        </div>

        {/* Options List */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Answer Options & Correct Key <span className="text-rose-500 dark:text-rose-400">*</span>
            </label>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
              Mark circular radio button to select correct answer
            </span>
          </div>

          <div className="space-y-2">
            {options.map((opt, idx) => {
              const letter = optionLetters[idx] || `${idx + 1}`;
              const isCorrect = correctAnswerIndex === idx;

              return (
                <div
                  key={idx}
                  className={`flex items-center space-x-2 p-2 rounded-xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30'
                      : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {/* Radio for correct answer */}
                  <label
                    className="flex items-center space-x-2 cursor-pointer select-none pl-1 shrink-0"
                    title={`Mark option ${letter} as correct`}
                  >
                    <input
                      type="radio"
                      name="correct_option_radio"
                      checked={isCorrect}
                      onChange={() => setCorrectAnswerIndex(idx)}
                      className="w-4 h-4 text-emerald-600 bg-white dark:bg-black/60 border-slate-300 dark:border-white/20 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'
                      }`}
                    >
                      {letter}
                    </span>
                  </label>

                  {/* Option Text Input */}
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Enter Option ${letter}...`}
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />

                  {/* Remove option button (if > 2) */}
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all shrink-0 cursor-pointer"
                      title="Remove option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Option Button */}
          {options.length < 8 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Option</span>
            </button>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center space-x-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Correct Answer: Option {optionLetters[correctAnswerIndex] || correctAnswerIndex + 1}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200/70 hover:bg-slate-300 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-300 dark:border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Save Question</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
