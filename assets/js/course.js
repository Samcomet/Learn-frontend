// ===== DOM Elements =====
const lessonCards = document.querySelectorAll('.lesson-card');
const progressBar = document.querySelector('.progress');
const codeBlock = document.getElementById('code-block');
const previewFrame = document.querySelector('.live-preview');
const consoleOutput = document.getElementById('console-output');
const resizeHandle = document.querySelector('.resize-handle');

// ===== Progress Tracking =====
let completedLessons = JSON.parse(localStorage.getItem('completedHTML')) || [];

// Initialize progress if elements exist
if (lessonCards.length && progressBar) {
  updateProgress();
}

// Mark lesson as completed
lessonCards.forEach(card => {
  card.addEventListener('click', (e) => {
    // Prevent marking when clicking links/buttons inside card
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
    
    const lessonTitle = card.querySelector('h3').textContent;
    if (!completedLessons.includes(lessonTitle)) {
      completedLessons.push(lessonTitle);
      localStorage.setItem('completedHTML', JSON.stringify(completedLessons));
      card.setAttribute('data-completed', 'true');
      updateProgress();
    }
  });
});

function updateProgress() {
  const totalLessons = lessonCards.length || 1; // Prevent division by zero
  const completed = completedLessons.length;
  const progressPercent = Math.round((completed / totalLessons) * 100);
  
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
    progressBar.textContent = `${progressPercent}%`;
    progressBar.setAttribute('data-progress', progressPercent);
  }

  lessonCards.forEach(card => {
    const title = card.querySelector('h3').textContent;
    card.setAttribute('data-completed', completedLessons.includes(title));
  });
}

// ===== Code Copy Function =====
function copyCode(button) {
  if (!codeBlock) return;
  
  const range = document.createRange();
  range.selectNode(codeBlock);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  
  try {
    document.execCommand('copy');
    // Visual feedback
    button.textContent = 'Copied!';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = 'Copy';
      button.classList.remove('copied');
    }, 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  } finally {
    window.getSelection().removeAllRanges();
  }
}

// ===== Live Preview System =====
function hijackConsole(iframeWindow) {
  if (!iframeWindow || !consoleOutput) return;
  
  const consoleMethods = ['log', 'warn', 'error'];
  consoleMethods.forEach(method => {
    iframeWindow.console[method] = function(...args) {
      args.forEach(arg => {
        consoleOutput.textContent += typeof arg === 'object' 
          ? JSON.stringify(arg, null, 2) + '\n'
          : String(arg) + '\n';
      });
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    };
  });
}

function updatePreview() {
  if (!codeBlock || !previewFrame) return;
  
  const code = codeBlock.textContent;
  try {
    const blob = new Blob([code], { type: 'text/html' });
    previewFrame.src = URL.createObjectURL(blob);
    localStorage.setItem('lastCode', code);
    if (consoleOutput) consoleOutput.textContent = '';
  } catch (err) {
    console.error('Preview update failed:', err);
  }
}

// Initialize preview system
if (codeBlock && previewFrame) {
  window.addEventListener('DOMContentLoaded', () => {
    const savedCode = localStorage.getItem('lastCode');
    if (savedCode) {
      codeBlock.textContent = savedCode;
      updatePreview();
    }
    
    previewFrame.addEventListener('load', () => {
      try {
        hijackConsole(previewFrame.contentWindow);
      } catch (e) {
        if (consoleOutput) {
          consoleOutput.textContent = `Error: ${e.message}`;
          const consoleTab = document.querySelector('[data-tab="console"]');
          if (consoleTab) consoleTab.click();
        }
      }
    });
  });
}

// ===== Resizable Editor =====
if (resizeHandle) {
  const editorContent = document.querySelector('.editor-content');
  let startY, startHeight;

  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startY = e.clientY;
    startHeight = parseInt(getComputedStyle(editorContent).height, 10);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize, { once: true });
  });

  function resize(e) {
    editorContent.style.height = `${startHeight + startY - e.clientY}px`;
  }

  function stopResize() {
    document.removeEventListener('mousemove', resize);
  }
}