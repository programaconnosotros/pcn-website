import {
  Heading1,
  Heading2,
  Heading3,
  Paragraph,
  List,
  Blockquote,
  InlineCode,
} from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { CodeBlock } from '@/components/ui/code-block';
import React from 'react';

// Procesa inline code, negrita y cursiva en el texto
function processInlineElements(text: string): React.ReactNode[] {
  // Primero, procesar inline code
  const codeParts = text.split(/(`[^`]+`)/g);
  return codeParts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <InlineCode key={`code-${idx}`}> {part.slice(1, -1)} </InlineCode>;
    } else {
      return processText(part);
    }
  });
}

// Función auxiliar para procesar texto en negrita y cursiva
function processText(text: string): React.ReactNode[] {
  // // Primero procesamos los enlaces
  // let parts: (string | React.ReactElement)[] = text.split(/(\[.*?\]\(.*?\))/g);
  // parts = parts.map((part) => {
  //   if (typeof part === 'string') {
  //     const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
  //     if (linkMatch) {
  //       return (
  //         <a
  //           key={`link-${part}`}
  //           href={linkMatch[2]}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           className="font-bold text-blue-600 hover:underline"
  //         >
  //           {linkMatch[1]}
  //         </a>
  //       );
  //     }
  //   }
  //   return part;
  // });

  // Procesamos el texto en negrita y cursiva de manera recursiva
  const processFormatting = (text: string): React.ReactNode[] => {
    // Primero procesamos negrita
    let parts: (string | React.ReactElement)[] = text.split(/(\*\*.*?\*\*|__.*?__)/g);
    parts = parts.map((part) => {
      if (typeof part === 'string') {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`bold-${part}`}> {processFormatting(part.slice(2, -2))}</strong>;
        }
        if (part.startsWith('__') && part.endsWith('__')) {
          return <strong key={`bold-${part}`}> {processFormatting(part.slice(2, -2))} </strong>;
        }
      }
      return part;
    });

    // Luego procesamos cursiva
    const result: React.ReactNode[] = [];
    parts.forEach((part) => {
      if (typeof part === 'string') {
        let italicParts: (string | React.ReactElement)[] = part.split(/(\*.*?\*|_.*?_)/g);
        italicParts = italicParts.map((italicPart) => {
          if (typeof italicPart === 'string') {
            if (italicPart.startsWith('*') && italicPart.endsWith('*')) {
              return (
                <em key={`italic-${italicPart}`}> {processFormatting(italicPart.slice(1, -1))} </em>
              );
            }
            if (italicPart.startsWith('_') && italicPart.endsWith('_')) {
              return (
                <em key={`italic-${italicPart}`}> {processFormatting(italicPart.slice(1, -1))} </em>
              );
            }
          }
          return italicPart;
        });
        result.push(...italicParts);
      } else {
        result.push(part);
      }
    });

    return result;
  };

  return processFormatting(text);
}

// Función auxiliar para detectar si una línea es una lista numerada
function isNumberedListItem(line: string): boolean {
  return /^\d+\.\s/.test(line.trim());
}

// Función auxiliar para procesar listas anidadas
function processListItems(
  lines: string[],
  startIndex: number,
  indentLevel: number = 0,
): { items: React.ReactNode[]; endIndex: number } {
  const items: React.ReactNode[] = [];
  let i = startIndex;
  const isNumbered = isNumberedListItem(lines[startIndex]);

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const currentIndent = line.search(/\S|$/);

    // Si la línea está vacía, la saltamos
    if (!trimmedLine) {
      i++;
      continue;
    }

    // Si la indentación es menor que el nivel actual y no es el primer elemento, terminamos esta lista
    if (currentIndent < indentLevel && i !== startIndex) {
      break;
    }

    // Si la línea es un heading, separador, blockquote o bloque de código, terminamos la lista
    if (
      trimmedLine.startsWith('#') ||
      trimmedLine.startsWith('---') ||
      trimmedLine.startsWith('>') ||
      trimmedLine.startsWith('```')
    ) {
      break;
    }

    // Si la línea comienza con un guión o es una lista numerada, la procesamos
    if (trimmedLine.startsWith('- ') || isNumberedListItem(trimmedLine)) {
      // Para el primer elemento, establecemos el nivel de indentación
      if (i === startIndex) {
        indentLevel = currentIndent;
      }

      // Si la indentación no coincide con el nivel actual, terminamos la lista
      if (currentIndent !== indentLevel) {
        break;
      }

      const content = isNumbered ? trimmedLine.replace(/^\d+\.\s/, '') : trimmedLine.slice(2);
      let children: React.ReactNode = null;

      // Verificamos si hay elementos anidados
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextTrimmed = nextLine.trim();
        const nextIndent = nextLine.search(/\S|$/);

        if (
          nextTrimmed &&
          nextIndent > indentLevel &&
          (nextTrimmed.startsWith('- ') || isNumberedListItem(nextTrimmed))
        ) {
          const { items: nestedItems, endIndex } = processListItems(lines, i + 1, nextIndent);
          if (nestedItems.length > 0) {
            children = (
              <List className="ml-6 mt-2" ordered={isNumberedListItem(nextTrimmed)}>
                {nestedItems}
              </List>
            );
          }
          i = endIndex - 1; // -1 porque el bucle hará i++ al final
        }
      }

      // Procesamos el contenido con negritas e itálicas
      const processedContent = processInlineElements(content);

      items.push(
        <li key={i}>
          {processedContent}
          {children}
        </li>,
      );
    } else {
      // Si no es un elemento de lista, terminamos
      break;
    }

    i++;
  }

  return { items, endIndex: i };
}

export function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Headings
    if (trimmedLine.startsWith('# ')) {
      elements.push(
        <Heading1 key={i}> {processInlineElements(trimmedLine.slice(2).trim())} </Heading1>,
      );
      i++;
      continue;
    } else if (trimmedLine.startsWith('## ')) {
      elements.push(
        <Heading2 key={i}> {processInlineElements(trimmedLine.slice(3).trim())} </Heading2>,
      );
      i++;
      continue;
    } else if (trimmedLine.startsWith('### ')) {
      elements.push(
        <Heading3 key={i}> {processInlineElements(trimmedLine.slice(4).trim())} </Heading3>,
      );
      i++;
      continue;
    }
    // Separator
    if (trimmedLine === '---') {
      elements.push(<Separator key={i} className="my-4" />);
      i++;
      continue;
    } // Lists
    if (trimmedLine.startsWith('- ') || isNumberedListItem(trimmedLine)) {
      const currentIndent = line.search(/\S|$/);
      const { items, endIndex } = processListItems(lines, i, currentIndent);
      elements.push(
        <List key={i} ordered={isNumberedListItem(trimmedLine)}>
          {items}
        </List>,
      );
      i = endIndex;
      continue;
    }
    // Blockquotes
    if (trimmedLine.startsWith('> ')) {
      elements.push(
        <Blockquote key={i}> {processInlineElements(trimmedLine.slice(2))} </Blockquote>,
      );
      i++;
      continue;
    }
    // Code blocks
    if (trimmedLine.startsWith('```')) {
      // Extraer el lenguaje si está presente
      const languageMatch = trimmedLine.match(/^```(\w+)?/);
      const language = languageMatch && languageMatch[1] ? languageMatch[1] : undefined;
      const codeBlock = [];
      while (i + 1 < lines.length && !lines[i + 1].trim().startsWith('```')) {
        codeBlock.push(lines[i + 1]);
        i++;
      }
      elements.push(<CodeBlock key={i} code={codeBlock.join('\n')} language={language} />);
      i += 2; // Saltar la línea de cierre ```
      continue;
    }
    // Inline code
    if (trimmedLine.includes('`')) {
      elements.push(<Paragraph key={i}> {processInlineElements(trimmedLine)} </Paragraph>);
      i++;
      continue;
    }
    // Regular paragraphs
    if (trimmedLine) {
      elements.push(<Paragraph key={i}> {processInlineElements(trimmedLine)} </Paragraph>);
    }
    i++;
  }

  return elements;
}
