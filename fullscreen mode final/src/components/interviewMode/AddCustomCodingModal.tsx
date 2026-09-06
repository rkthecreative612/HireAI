import React, { useState } from 'react';
import { Code2, Plus, Trash2 } from 'lucide-react';
import { JavaCodingQuestion, Difficulty, CodingTestCase } from '../../types';

interface AddCustomCodingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'java' | 'python';
  onAddQuestion: (q: JavaCodingQuestion) => void;
}

export const AddCustomCodingModal: React.FC<AddCustomCodingModalProps> = ({
  isOpen,
  onClose,
  language,
  onAddQuestion
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');

  const defaultStarter =
    language === 'java'
      ? `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your solution here
        
    }
}`
      : `import sys

def solve():
    # Read stdin and solve
    pass

if __name__ == '__main__':
    solve()`;

  const [starterCode, setStarterCode] = useState(defaultStarter);

  const [testCases, setTestCases] = useState<CodingTestCase[]>([
    {
      id: `tc-${Date.now()}-1`,
      input: '',
      expectedOutput: '',
      isHidden: false
    }
  ]);

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      {
        id: `tc-${Date.now()}-${prev.length + 1}`,
        input: '',
        expectedOutput: '',
        isHidden: false
      }
    ]);
  };

  const handleRemoveTestCase = (id: string) => {
    if (testCases.length <= 1) return;
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please enter a question title.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a question description.');
      return;
    }

    const hasValidTestCase = testCases.some((tc) => tc.expectedOutput.trim().length > 0);
    if (!hasValidTestCase) {
      setError('Please provide at least one test case with an expected output.');
      return;
    }

    const newQuestion: JavaCodingQuestion = {
      id: `coding-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      difficulty,
      javaStarterCode: starterCode,
      starterCode: starterCode,
      sampleInput: sampleInput.trim(),
      sampleOutput: sampleOutput.trim(),
      testCases: testCases.map((tc) => ({
        ...tc,
        input: tc.input,
        expectedOutput: tc.expectedOutput
      }))
    };

    onAddQuestion(newQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Add Custom {language === 'java' ? 'Java' : 'Python'} Problem
              </h3>
              <p className="text-[11px] text-slate-400">
                Created specifically for this hybrid set. Does not affect any global question banks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Title and Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Problem Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Subarray Sum Equals K"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">
            Problem Description & Constraints <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Describe the task, input format, output format, and constraints..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setError('');
            }}
            className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        {/* Sample Input / Output */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Sample Input</label>
              <span className="text-[10px] text-slate-500 font-mono">Multiline supported</span>
            </div>
            <textarea
              rows={2}
              placeholder={'e.g.\n8\n10 5 2 7 1 9 -5 3\n15'}
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Sample Output</label>
              <span className="text-[10px] text-slate-500 font-mono">Expected stdout</span>
            </div>
            <textarea
              rows={2}
              placeholder={'e.g.\n4'}
              value={sampleOutput}
              onChange={(e) => setSampleOutput(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>
        </div>

        {/* Starter Code */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">Starter Code</label>
          <textarea
            rows={4}
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        {/* Test Cases List */}
        <div className="space-y-3 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-bold text-white text-xs block">Test Cases</label>
              <p className="text-[11px] text-slate-400">
                Multi-line stdin input and expected output supported. Use Enter freely.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddTestCase}
              className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-medium transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Test Case</span>
            </button>
          </div>

          <div className="space-y-3">
            {testCases.map((tc, idx) => (
              <div
                key={tc.id}
                className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span className="font-semibold text-xs text-white">Test Case #{idx + 1}</span>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={tc.isHidden}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setTestCases((prev) =>
                            prev.map((t) => (t.id === tc.id ? { ...t, isHidden: val } : t))
                          );
                        }}
                        className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[11px]">Hidden from candidate</span>
                    </label>

                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(tc.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Remove Test Case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] font-mono">Input (stdin)</label>
                    <textarea
                      rows={2}
                      placeholder="Input data (line-by-line)"
                      value={tc.input}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTestCases((prev) =>
                          prev.map((t) => (t.id === tc.id ? { ...t, input: val } : t))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500 resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] font-mono">Expected Output</label>
                    <textarea
                      rows={2}
                      placeholder="Expected stdout"
                      value={tc.expectedOutput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTestCases((prev) =>
                          prev.map((t) => (t.id === tc.id ? { ...t, expectedOutput: val } : t))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500 resize-y"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            Save Coding Problem
          </button>
        </div>
      </div>
    </div>
  );
};
