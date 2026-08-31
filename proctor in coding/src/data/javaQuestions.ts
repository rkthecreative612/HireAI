import { JavaCodingQuestion } from '../types';

export const DEFAULT_JAVA_QUESTIONS: JavaCodingQuestion[] = [
  {
    id: 'java-q1-reverse-string',
    title: '1. Reverse a String',
    description: 'Write a Java program that reads a string from standard input and prints the reversed string to standard output.',
    difficulty: 'easy',
    javaStarterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            String str = scanner.nextLine();
            // TODO: Reverse str and print the result
            
        }
    }
}`,
    sampleInput: 'hello',
    sampleOutput: 'olleh',
    testCases: [
      {
        id: 'tc1-1',
        input: 'hello',
        expectedOutput: 'olleh',
        isHidden: false,
      },
      {
        id: 'tc1-2',
        input: 'HireAI',
        expectedOutput: 'IAeriH',
        isHidden: false,
      },
      {
        id: 'tc1-3',
        input: 'java programming',
        expectedOutput: 'gnimmargorp avaj',
        isHidden: true,
      },
    ],
  },
  {
    id: 'java-q2-check-palindrome',
    title: '2. Check Palindrome',
    description: 'Write a Java program that reads a string from standard input and checks if it is a palindrome (reads the same forward and backward). Print "true" if it is a palindrome, or "false" otherwise.',
    difficulty: 'easy',
    javaStarterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            String str = scanner.nextLine();
            // TODO: Check if str is palindrome and print true or false
            
        }
    }
}`,
    sampleInput: 'racecar',
    sampleOutput: 'true',
    testCases: [
      {
        id: 'tc2-1',
        input: 'racecar',
        expectedOutput: 'true',
        isHidden: false,
      },
      {
        id: 'tc2-2',
        input: 'hello',
        expectedOutput: 'false',
        isHidden: false,
      },
      {
        id: 'tc2-3',
        input: 'madam',
        expectedOutput: 'true',
        isHidden: true,
      },
    ],
  },
  {
    id: 'java-q3-largest-two-numbers',
    title: '3. Find Largest of Two Numbers',
    description: 'Write a Java program that reads two space-separated integers from standard input and prints the larger number. If both numbers are equal, print either number.',
    difficulty: 'easy',
    javaStarterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int num1 = scanner.nextInt();
            int num2 = scanner.nextInt();
            // TODO: Find and print the larger of num1 and num2
            
        }
    }
}`,
    sampleInput: '15 42',
    sampleOutput: '42',
    testCases: [
      {
        id: 'tc3-1',
        input: '15 42',
        expectedOutput: '42',
        isHidden: false,
      },
      {
        id: 'tc3-2',
        input: '100 25',
        expectedOutput: '100',
        isHidden: false,
      },
      {
        id: 'tc3-3',
        input: '-5 -12',
        expectedOutput: '-5',
        isHidden: true,
      },
    ],
  },
  {
    id: 'java-q4-even-or-odd',
    title: '4. Check Even or Odd',
    description: 'Write a Java program that reads an integer from standard input and prints "Even" if the number is even, or "Odd" if the number is odd.',
    difficulty: 'easy',
    javaStarterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int num = scanner.nextInt();
            // TODO: Print "Even" or "Odd"
            
        }
    }
}`,
    sampleInput: '7',
    sampleOutput: 'Odd',
    testCases: [
      {
        id: 'tc4-1',
        input: '7',
        expectedOutput: 'Odd',
        isHidden: false,
      },
      {
        id: 'tc4-2',
        input: '18',
        expectedOutput: 'Even',
        isHidden: false,
      },
      {
        id: 'tc4-3',
        input: '0',
        expectedOutput: 'Even',
        isHidden: true,
      },
    ],
  },
  {
    id: 'java-q5-sum-two-numbers',
    title: '5. Find Sum of Two Numbers',
    description: 'Write a Java program that reads two space-separated integers from standard input and prints their sum.',
    difficulty: 'easy',
    javaStarterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int a = scanner.nextInt();
            int b = scanner.nextInt();
            // TODO: Calculate sum and print it
            
        }
    }
}`,
    sampleInput: '25 35',
    sampleOutput: '60',
    testCases: [
      {
        id: 'tc5-1',
        input: '25 35',
        expectedOutput: '60',
        isHidden: false,
      },
      {
        id: 'tc5-2',
        input: '-10 15',
        expectedOutput: '5',
        isHidden: false,
      },
      {
        id: 'tc5-3',
        input: '100 200',
        expectedOutput: '300',
        isHidden: true,
      },
    ],
  },
];
