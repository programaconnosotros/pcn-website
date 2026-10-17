export interface ProgrammingLanguage {
  id: string;
  name: string;
  /** File extension shown in the token, e.g. `ts`. */
  ext: string;
  /** Accent color, bright enough to read on the dark theme. */
  color: string;
}

export interface UserProgrammingLanguage {
  languageId: string;
  color: string;
  logo: string;
  experienceLevel?: number;
}

// Lenguajes que un usuario puede marcar en su perfil. Se muestran como tokens de terminal:
// la extensión de archivo en el color del lenguaje, sin logos de imagen.
export const programmingLanguages: ProgrammingLanguage[] = [
  { id: 'javascript', name: 'JavaScript', ext: 'js', color: '#f7df1e' },
  { id: 'typescript', name: 'TypeScript', ext: 'ts', color: '#4aa3ff' },
  { id: 'python', name: 'Python', ext: 'py', color: '#ffd43b' },
  { id: 'java', name: 'Java', ext: 'java', color: '#f89820' },
  { id: 'csharp', name: 'C#', ext: 'cs', color: '#b48cf2' },
  { id: 'cpp', name: 'C++', ext: 'cpp', color: '#6fb1ff' },
  { id: 'c', name: 'C', ext: 'c', color: '#a8b9cc' },
  { id: 'go', name: 'Go', ext: 'go', color: '#00c8e8' },
  { id: 'rust', name: 'Rust', ext: 'rs', color: '#f2a477' },
  { id: 'kotlin', name: 'Kotlin', ext: 'kt', color: '#a97bff' },
  { id: 'swift', name: 'Swift', ext: 'swift', color: '#ff6b45' },
  { id: 'php', name: 'PHP', ext: 'php', color: '#9aa5e0' },
  { id: 'ruby', name: 'Ruby', ext: 'rb', color: '#ff4f7b' },
  { id: 'dart', name: 'Dart', ext: 'dart', color: '#2dd4c4' },
  { id: 'elixir', name: 'Elixir', ext: 'ex', color: '#c49cf0' },
  { id: 'scala', name: 'Scala', ext: 'scala', color: '#ff6161' },
  { id: 'haskell', name: 'Haskell', ext: 'hs', color: '#b49be6' },
  { id: 'smalltalk', name: 'Smalltalk', ext: 'st', color: '#4ec9b0' },
  { id: 'prolog', name: 'Prolog', ext: 'pl', color: '#ff7a6b' },
  { id: 'lua', name: 'Lua', ext: 'lua', color: '#7d96ff' },
  { id: 'zig', name: 'Zig', ext: 'zig', color: '#f7a41d' },
  { id: 'r', name: 'R', ext: 'r', color: '#5aa9f0' },
  { id: 'sql', name: 'SQL', ext: 'sql', color: '#f0a030' },
  { id: 'bash', name: 'Bash', ext: 'sh', color: '#5fd35a' },
];

export const findProgrammingLanguage = (id: string) =>
  programmingLanguages.find((language) => language.id === id);
