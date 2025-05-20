/**
 * Utilities for documentation pages
 */

declare global {
  interface Window {
    Prism?: {
      highlightElement: (element: Element) => void;
    };
  }
}

/**
 * Adds copy buttons to all code blocks
 */
export function addCodeCopyButtons() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyButtons);
  } else {
    initCopyButtons();
  }

  // Also add the buttons when the route changes (for SPA navigation)
  window.addEventListener('popstate', () => {
    // Small delay to ensure the new content is rendered
    setTimeout(initCopyButtons, 100);
  });
}

/**
 * Initialize copy buttons on all code blocks
 */
function initCopyButtons() {
  // Clear existing buttons first to avoid duplicates
  document.querySelectorAll('.code-copy-button').forEach(button => {
    button.remove();
  });

  const codeBlocks = document.querySelectorAll('pre code');

  codeBlocks.forEach((codeBlock) => {
    const pre = codeBlock.parentElement;

    if (!pre) return;

    // Make sure the pre element has position relative
    pre.style.position = 'relative';

    // Create the copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-button';
    copyButton.textContent = 'Copy';
    copyButton.setAttribute('aria-label', 'Copy code to clipboard');

    // Add the button to the pre element
    pre.appendChild(copyButton);

    // Add click event listener
    copyButton.addEventListener('click', () => {
      // Get the code text
      const code = codeBlock.textContent || '';

      // Copy to clipboard
      copyToClipboard(code, copyButton);
    });
  });
}

/**
 * Copy text to clipboard with fallback
 */
function copyToClipboard(text: string, button: HTMLButtonElement) {
  // Try the modern clipboard API first
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => {
        updateButtonState(button, 'success');
      })
      .catch((err) => {
        console.error('Failed to copy code:', err);
        updateButtonState(button, 'error');

        // Fallback to legacy method
        legacyCopy(text, button);
      });
  } else {
    // Fallback for browsers without clipboard API
    legacyCopy(text, button);
  }
}

/**
 * Legacy method for copying to clipboard
 */
function legacyCopy(text: string, button: HTMLButtonElement) {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Make it invisible but keep it in the viewport
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.top = '0';
    textarea.style.left = '0';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    // Execute copy command
    const successful = document.execCommand('copy');

    // Remove the temporary element
    document.body.removeChild(textarea);

    if (successful) {
      updateButtonState(button, 'success');
    } else {
      updateButtonState(button, 'error');
    }
  } catch (err) {
    console.error('Legacy copy method failed:', err);
    updateButtonState(button, 'error');
  }
}

/**
 * Update the button state to provide feedback
 */
function updateButtonState(button: HTMLButtonElement, state: 'success' | 'error') {
  if (state === 'success') {
    button.textContent = 'Copied!';
    button.classList.add('copy-success');
  } else {
    button.textContent = 'Failed';
    button.classList.add('copy-error');
  }

  // Reset button state after a delay
  setTimeout(() => {
    button.textContent = 'Copy';
    button.classList.remove('copy-success', 'copy-error');
  }, 2000);
}

/**
 * Apply syntax highlighting using Prism.js
 */
export function applySyntaxHighlighting() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightCodeBlocks);
  } else {
    highlightCodeBlocks();
  }

  // Also highlight code blocks when route changes (for SPA navigation)
  window.addEventListener('popstate', () => {
    // Small delay to ensure the new content is rendered
    setTimeout(highlightCodeBlocks, 100);
  });
}

/**
 * Apply Prism.js highlighting to all code blocks
 */
function highlightCodeBlocks() {
  // Only proceed if Prism is available
  if (typeof window.Prism === 'undefined') {
    console.warn('Prism.js is not loaded, syntax highlighting is not available');
    return;
  }

  const codeBlocks = document.querySelectorAll('pre code');

  codeBlocks.forEach((codeBlock) => {
    // Get the language class
    const classMatch = Array.from(codeBlock.classList).find(cls => cls.startsWith('language-'));

    if (classMatch) {
      // Extract the language from the class
      const language = classMatch.replace('language-', '');

      // Make sure the parent <pre> also has the language class
      const pre = codeBlock.parentElement;
      if (pre && !pre.classList.contains(`language-${language}`)) {
        pre.classList.add(`language-${language}`);
      }

      // Apply highlighting if not already highlighted
      if (!codeBlock.classList.contains('prism-highlighted')) {
        try {
          window.Prism?.highlightElement(codeBlock);
          codeBlock.classList.add('prism-highlighted');
        } catch (error) {
          console.error('Error applying syntax highlighting:', error);
        }
      }
    }
  });
}

/**
 * Wait for route changes in Vue Router
 * This should be called after router is initialized
 */
export function setupRouteChangeListeners() {
  // Wait a moment after route changes to re-initialize the copy buttons and highlighting
  window.addEventListener('click', (e) => {
    if (e.target instanceof HTMLAnchorElement) {
      // Check if it's a router-link by looking for vue-router attributes
      const isRouterLink = e.target.hasAttribute('router-link') ||
                          e.target.classList.contains('router-link') ||
                          e.target.closest('[to]');

      if (isRouterLink) {
        // Wait for content to update after navigation
        setTimeout(() => {
          initCopyButtons();
          highlightCodeBlocks();
        }, 200);
      }
    }
  });
}
