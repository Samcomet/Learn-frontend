// ===== DOM Elements =====
const lessonCards = document.querySelectorAll('.lesson-card');
const progressBar = document.querySelector('.progress');
const codeBlocks = document.querySelectorAll('.language-html');
const previewFrames = document.querySelectorAll('.live-preview');
const consoleOutputs = document.querySelectorAll('#console-output');
const resizeHandles = document.querySelectorAll('.resize-handle');

// ===== Progress Tracking =====
let completedLessons = JSON.parse(localStorage.getItem('completedHTML')) || [];

// Initialize progress if elements exist
if (lessonCards.length && progressBar) {
  updateProgress();
}

// Mark lesson as completed
lessonCards.forEach(card => {
  card.addEventListener('click', (e) => {
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
  const totalLessons = lessonCards.length || 1;
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
  const codeBlock = button.closest('.editor-header').nextElementSibling.querySelector('code');
  if (!codeBlock) return;
  
  const range = document.createRange();
  range.selectNode(codeBlock);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  
  try {
    document.execCommand('copy');
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
function hijackConsole(iframeWindow, consoleOutput) {
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

function updatePreview(codeBlock, previewFrame, consoleOutput) {
  if (!codeBlock || !previewFrame) return;
  
  const code = codeBlock.textContent;
  try {
    const blob = new Blob([code], { type: 'text/html' });
    previewFrame.src = URL.createObjectURL(blob);
    if (consoleOutput) consoleOutput.textContent = '';
  } catch (err) {
    console.error('Preview update failed:', err);
  }
}

// Initialize all editor instances
document.querySelectorAll('.code-editor').forEach(editor => {
  const codeBlock = editor.querySelector('.language-html');
  const previewFrame = editor.querySelector('.live-preview');
  const consoleOutput = editor.querySelector('#console-output');
  
  if (codeBlock && previewFrame) {
    // Always use the code from the HTML file
    const defaultCode = codeBlock.textContent;
    
    // Initial preview update
    updatePreview(codeBlock, previewFrame, consoleOutput);
    
    // Set up preview frame
    previewFrame.addEventListener('load', () => {
      try {
        hijackConsole(previewFrame.contentWindow, consoleOutput);
      } catch (e) {
        if (consoleOutput) {
          consoleOutput.textContent = `Error: ${e.message}`;
          const consoleTab = editor.querySelector('[data-tab="console"]');
          if (consoleTab) consoleTab.click();
        }
      }
    });
    
    // Auto-update preview when typing
    let typingTimer;
    codeBlock.addEventListener('input', () => {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        updatePreview(codeBlock, previewFrame, consoleOutput);
      }, 500);
    });
  }
});

// ===== Tab System =====
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    const editor = button.closest('.code-editor');
    
    // Update active tab
    editor.querySelectorAll('.tab-button').forEach(btn => 
      btn.classList.remove('active'));
    button.classList.add('active');
    
    // Show corresponding pane
    editor.querySelectorAll('.tab-pane').forEach(pane => 
      pane.classList.remove('active'));
    editor.querySelector(`#${tabId}-tab`).classList.add('active');
    
    // Refresh preview when switching to preview tab
    if (tabId === 'preview') {
      const codeBlock = editor.querySelector('.language-html');
      const previewFrame = editor.querySelector('.live-preview');
      const consoleOutput = editor.querySelector('#console-output');
      updatePreview(codeBlock, previewFrame, consoleOutput);
    }
  });
});

// ===== Resizable Editor =====
resizeHandles.forEach(handle => {
  const editorContent = handle.closest('.editor-content');
  if (!editorContent) return;

  let startY, startHeight;

  handle.addEventListener('mousedown', (e) => {
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
});