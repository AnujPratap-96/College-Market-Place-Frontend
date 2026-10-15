import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrollToTop } from './scroll';

describe('scrollToTop Navigation Utility', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('scrolls the dashboard main container if present in document', () => {
    const mainEl = document.createElement('main');
    mainEl.scrollTo = vi.fn();
    document.body.appendChild(mainEl);

    scrollToTop(true);

    expect(mainEl.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('scrolls with auto behavior when smooth is false', () => {
    const mainEl = document.createElement('main');
    mainEl.scrollTo = vi.fn();
    document.body.appendChild(mainEl);

    scrollToTop(false);

    expect(mainEl.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('falls back to setting scrollTop if scrollTo throws or is not implemented', () => {
    const mainEl = document.createElement('main');
    mainEl.scrollTo = vi.fn().mockImplementation(() => {
      throw new Error('Not supported');
    });
    mainEl.scrollTop = 500;
    document.body.appendChild(mainEl);

    scrollToTop();

    expect(mainEl.scrollTop).toBe(0);
  });

  it('calls window.scrollTo when main element is not present (standard public pages)', () => {
    window.scrollTo = vi.fn();

    scrollToTop(true);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
