/**
 * Robust scroll-to-top utility that handles both the overflow-y-auto dashboard <main> container
 * and the window / documentElement for standard landing pages.
 */
export const scrollToTop = (smooth = true) => {
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';

  // 1. Dashboard layout scroll container
  const main = document.querySelector('main');
  if (main) {
    try {
      main.scrollTo({ top: 0, behavior });
    } catch {
      main.scrollTop = 0;
    }
  }

  // 2. Window and document fallbacks
  try {
    window.scrollTo({ top: 0, behavior });
  } catch {
    // fallback
  }

  try {
    document.documentElement.scrollTo({ top: 0, behavior });
  } catch {
    document.documentElement.scrollTop = 0;
  }

  try {
    document.body.scrollTo({ top: 0, behavior });
  } catch {
    document.body.scrollTop = 0;
  }
};
