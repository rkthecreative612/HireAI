import { JavaCodingQuestion } from '../types';

export const DEFAULT_PYTHON_QUESTIONS: JavaCodingQuestion[] = [
  {
    id: 'python-q1-reverse-string',
    title: '1. Reverse a String',
    description: 'Write a Python program that reads a string from standard input and prints the reversed string to standard output.',
    difficulty: 'easy',
    javaStarterCode: `import sys

def main():
    line = sys.stdin.read().strip()
    # TODO: Reverse str and print the result
    

if __name__ == '__main__':
    main()`,
    sampleInput: 'hello',
    sampleOutput: 'olleh',
    testCases: [
      {
        id: 'py-tc1-1',
        input: 'hello',
        expectedOutput: 'olleh',
        isHidden: false,
      },
      {
        id: 'py-tc1-2',
        input: 'HireAI',
        expectedOutput: 'IAeriH',
        isHidden: false,
      },
      {
        id: 'py-tc1-3',
        input: 'python programming',
        expectedOutput: 'gnimmargorp nohtyp',
        isHidden: true,
      },
    ],
  },
  {
    id: 'python-q2-check-palindrome',
    title: '2. Check Palindrome',
    description: 'Write a Python program that reads a string from standard input and checks if it is a palindrome (reads same forward and backward). Print "true" or "false".',
    difficulty: 'easy',
    javaStarterCode: `import sys

def main():
    s = sys.stdin.read().strip()
    # TODO: Check if s is palindrome and print true or false
    

if __name__ == '__main__':
    main()`,
    sampleInput: 'racecar',
    sampleOutput: 'true',
    testCases: [
      {
        id: 'py-tc2-1',
        input: 'racecar',
        expectedOutput: 'true',
        isHidden: false,
      },
      {
        id: 'py-tc2-2',
        input: 'hello',
        expectedOutput: 'false',
        isHidden: false,
      },
      {
        id: 'py-tc2-3',
        input: 'madam',
        expectedOutput: 'true',
        isHidden: true,
      },
    ],
  },
  {
    id: 'python-q3-largest-two-numbers',
    title: '3. Find Largest of Two Numbers',
    description: 'Write a Python program that reads two space-separated integers from standard input and prints the larger number.',
    difficulty: 'easy',
    javaStarterCode: `import sys

def main():
    nums = sys.stdin.read().split()
    if len(nums) >= 2:
        num1 = int(nums[0])
        num2 = int(nums[1])
        # TODO: Find and print the larger of num1 and num2
        

if __name__ == '__main__':
    main()`,
    sampleInput: '15 42',
    sampleOutput: '42',
    testCases: [
      {
        id: 'py-tc3-1',
        input: '15 42',
        expectedOutput: '42',
        isHidden: false,
      },
      {
        id: 'py-tc3-2',
        input: '100 25',
        expectedOutput: '100',
        isHidden: false,
      },
      {
        id: 'py-tc3-3',
        input: '-5 -12',
        expectedOutput: '-5',
        isHidden: true,
      },
    ],
  },
  {
    id: 'python-q4-even-or-odd',
    title: '4. Check Even or Odd',
    description: 'Write a Python program that reads an integer from standard input and prints "Even" if the number is even, or "Odd" if odd.',
    difficulty: 'easy',
    javaStarterCode: `import sys

def main():
    raw = sys.stdin.read().strip()
    if raw:
        num = int(raw)
        # TODO: Print "Even" or "Odd"
        

if __name__ == '__main__':
    main()`,
    sampleInput: '7',
    sampleOutput: 'Odd',
    testCases: [
      {
        id: 'py-tc4-1',
        input: '7',
        expectedOutput: 'Odd',
        isHidden: false,
      },
      {
        id: 'py-tc4-2',
        input: '18',
        expectedOutput: 'Even',
        isHidden: false,
      },
      {
        id: 'py-tc4-3',
        input: '0',
        expectedOutput: 'Even',
        isHidden: true,
      },
    ],
  },
  {
    id: 'python-q5-sum-two-numbers',
    title: '5. Find Sum of Two Numbers',
    description: 'Write a Python program that reads two space-separated integers from standard input and prints their sum.',
    difficulty: 'easy',
    javaStarterCode: `import sys

def main():
    nums = sys.stdin.read().split()
    if len(nums) >= 2:
        a = int(nums[0])
        b = int(nums[1])
        # TODO: Calculate sum and print it
        

if __name__ == '__main__':
    main()`,
    sampleInput: '25 35',
    sampleOutput: '60',
    testCases: [
      {
        id: 'py-tc5-1',
        input: '25 35',
        expectedOutput: '60',
        isHidden: false,
      },
      {
        id: 'py-tc5-2',
        input: '-10 15',
        expectedOutput: '5',
        isHidden: false,
      },
      {
        id: 'py-tc5-3',
        input: '100 200',
        expectedOutput: '300',
        isHidden: true,
      },
    ],
  },
];
