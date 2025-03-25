export interface ProgrammingLanguage {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export interface UserProgrammingLanguage {
  languageId: string;
  color: string;
  logo: string;
  experienceLevel?: number;
}

export const programmingLanguages: ProgrammingLanguage[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    logo: '/language-logo/javascript-svgrepo-com.webp',
    color: '#F7DF1E',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    logo: '/language-logo/typescript-icon-svgrepo-com.webp',
    color: '#0D1B2A',
  },
  {
    id: 'python',
    name: 'Python',
    logo: '/language-logo/python-svgrepo-com.webp',
    color: '#1C3D6B',
  },
  { id: 'java', name: 'Java', logo: '/language-logo/java-logo-svgrepo-com.webp', color: '#003D5B' },
  { id: 'csharp', name: 'C#', logo: '/language-logo/php-svgrepo-com.webp', color: '#1A2E1A' },
  { id: 'cpp', name: 'C++', logo: '/language-logo/cplusplus.webp', color: '#003F73' },
  { id: 'php', name: 'PHP', logo: '/language-logo/php-svgrepo-com.webp', color: '#3A3A3A' },
  { id: 'ruby', name: 'Ruby', logo: '/language-logo/ruby-svgrepo-com.webp', color: '#2A1E1D' },
  { id: 'swift', name: 'Swift', logo: '/language-logo/swift-svgrepo-com.webp', color: '#5C3D2E' },
  { id: 'go', name: 'Go', logo: '/language-logo/go-svgrepo-com.webp', color: '#003F5C' },
  { id: 'rust', name: 'Rust', logo: '/language-logo/rust-svgrepo-com.webp', color: '#222222' },
  { id: 'kotlin', name: 'Kotlin', logo: '/language-logo/kotlin.webp', color: '#2D1B4F' },
];
