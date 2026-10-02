// Mermaid is heavy, so it loads on demand and is configured once for every diagram on the page.
let mermaidReady: Promise<typeof import('mermaid').default> | undefined;

export const loadMermaid = () =>
  (mermaidReady ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
      er: { useMaxWidth: false },
      flowchart: { useMaxWidth: false, curve: 'basis' },
      sequence: { useMaxWidth: false },
      themeVariables: {
        darkMode: true,
        background: 'transparent',
        fontSize: '12px',
        primaryColor: '#05140f',
        primaryBorderColor: '#04f4be',
        primaryTextColor: '#e6f2ee',
        secondaryColor: '#05140f',
        tertiaryColor: '#05140f',
        lineColor: '#0bbf95',
        textColor: '#c7d6d1',
        mainBkg: '#05140f',
        nodeBorder: '#04f4be',
        clusterBkg: '#07100d',
        clusterBorder: '#0bbf95',
        edgeLabelBackground: '#05140f',
        actorBkg: '#05140f',
        actorBorder: '#04f4be',
        actorTextColor: '#e6f2ee',
        signalColor: '#0bbf95',
        signalTextColor: '#c7d6d1',
        labelBoxBkgColor: '#05140f',
        noteBkgColor: '#0a1814',
        noteBorderColor: '#0bbf95',
        noteTextColor: '#c7d6d1',
        attributeBackgroundColorOdd: '#07100d',
        attributeBackgroundColorEven: '#0a1814',
      },
    });
    return mermaid;
  }));
