import { Request, Response } from "express"

type QuizQuestion = {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const baseQuestions: Record<string, QuizQuestion[]> = {
  java: [
    {
      question: "What is the correct way to declare a variable in Java?",
      options: ["var x = 10;", "int x = 10;", "x := 10;", "declare x = 10;"],
      correctAnswer: 1,
      explanation:
        "In Java, you must specify the data type when declaring a variable. 'int x = 10;' is the correct syntax for declaring an integer variable."
    },
    {
      question: "Which keyword is used to inherit a class in Java?",
      options: ["implements", "extends", "inherits", "super"],
      correctAnswer: 1,
      explanation:
        "The 'extends' keyword is used in Java to inherit from a parent class. 'implements' is used for interfaces."
    }
  ],
  python: [
    {
      question: "How do you declare a list in Python?",
      options: ["list = {}", "list = []", "list = ()", "list = <>"],
      correctAnswer: 1,
      explanation: "Square brackets [] define lists in Python."
    },
    {
      question: "What is the output of print(2 ** 3)?",
      options: ["6", "8", "9", "Error"],
      correctAnswer: 1,
      explanation: "The ** operator performs exponentiation; 2**3 = 8."
    }
  ],
  typescript: [
    {
      question: "How do you declare a typed variable in TypeScript?",
      options: ["let x: number = 5;", "var x = number(5);", "int x = 5;", "x := 5"],
      correctAnswer: 0,
      explanation: "Use type annotations like : number after the variable name."
    },
    {
      question: "Which of these enables strict type checking?",
      options: ["tsconfig: \"strict\": true", "use strict", "--types=strict", "@strict"],
      correctAnswer: 0,
      explanation: "Set \"strict\": true in tsconfig.json for strict mode."
    }
  ],
  javascript: [
    {
      question: "Which method converts a JSON string to an object?",
      options: ["JSON.toObject", "JSON.parse", "Object.fromJSON", "parseJSON"],
      correctAnswer: 1,
      explanation: "Use JSON.parse to convert a JSON string into an object."
    },
    {
      question: "What is the result of typeof null?",
      options: ["'null'", "'object'", "'undefined'", "'number'"],
      correctAnswer: 1,
      explanation: "typeof null returns 'object' due to historical reasons."
    }
  ],
  html: [
    {
      question: "Which tag defines a hyperlink?",
      options: ["<link>", "<a>", "<href>", "<url>"],
      correctAnswer: 1,
      explanation: "The <a> tag defines a hyperlink in HTML."
    },
    {
      question: "Which attribute specifies an image source?",
      options: ["href", "src", "alt", "title"],
      correctAnswer: 1,
      explanation: "Use the src attribute on <img> to specify the image source."
    }
  ],
  css: [
    {
      question: "Which property sets the flex container direction?",
      options: ["flex-direction", "direction", "flex-flow", "justify-content"],
      correctAnswer: 0,
      explanation: "flex-direction sets the direction of flex items."
    },
    {
      question: "How do you apply a class selector?",
      options: [".myClass { }", "#myClass { }", "myClass { }", "*myClass { }"],
      correctAnswer: 0,
      explanation: "Class selectors use a dot: .myClass { ... }."
    }
  ],
  csharp: [
    {
      question: "Which keyword defines a class in C#?",
      options: ["class", "struct", "type", "object"],
      correctAnswer: 0,
      explanation: "Use the class keyword to define a class."
    },
    {
      question: "Which access modifier makes a member accessible only within its class?",
      options: ["public", "private", "protected", "internal"],
      correctAnswer: 1,
      explanation: "private limits access to the containing class."
    }
  ],
  go: [
    {
      question: "Which keyword declares a function in Go?",
      options: ["func", "function", "def", "fn"],
      correctAnswer: 0,
      explanation: "Go uses func to declare functions."
    },
    {
      question: "What is the zero value of an int in Go?",
      options: ["1", "0", "nil", "undefined"],
      correctAnswer: 1,
      explanation: "int zero value in Go is 0."
    }
  ]
}

const synthesize = (seed: QuizQuestion[], total = 40): QuizQuestion[] => {
  const out: QuizQuestion[] = []
  for (let i = 0; i < total; i++) {
    const base = seed[i % seed.length]
    out.push({ ...base })
  }
  return out
}

export const generateQuestions = (req: Request, res: Response) => {
  const { language } = req.body as { language?: string }
  console.log("/ai/generate called with:", req.body)
  const key = (language || "java").toLowerCase()
  const seed = baseQuestions[key]
  if (!seed) {
    return res.status(400).json({ message: "Unsupported language" })
  }
  const questions = synthesize(seed, 40)
  res.json({ language: key, count: questions.length, questions })
}

export const scoreQuiz = (req: Request, res: Response) => {
  const { questions, answers } = req.body as {
    questions: QuizQuestion[]
    answers: number[]
  }
  if (!Array.isArray(questions) || !Array.isArray(answers)) {
    return res.status(400).json({ message: "Invalid payload" })
  }
  let score = 0
  for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
    if (answers[i] === questions[i].correctAnswer) score++
  }
  res.json({ total: questions.length, correct: score, percentage: Math.round((score / questions.length) * 100) })
}
