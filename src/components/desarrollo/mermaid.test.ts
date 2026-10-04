const initialize = jest.fn();
jest.mock('mermaid', () => ({ __esModule: true, default: { initialize } }));

describe('loadMermaid', () => {
  it('configures mermaid once and reuses the same instance', async () => {
    const { loadMermaid } = await import('./mermaid');

    const first = await loadMermaid();
    const second = await loadMermaid();

    expect(first).toBe(second);
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ startOnLoad: false, securityLevel: 'strict' }),
    );
  });
});
