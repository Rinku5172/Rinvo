// header-footer.js - Complete Fixed Version with Robot Chat Integration

document.addEventListener('DOMContentLoaded', () => {
  injectHeader();
  injectFooter();
  setupThemeToggle();
  setupLanguageToggle();
  setupRobotChat(); // नया फंक्शन - रोबोट चैट को सेटअप करता है
});

// ==================== HEADER INJECTION ====================
function injectHeader() {
  if (document.getElementById('mainHeader')) return;

  const headerHTML = `
    <div class="container">
      <div class="header-content">
        <a href="/" class="logo" aria-label="RocketPDF Home">
          <i class="fas fa-rocket"></i> RocketPDF
        </a>
        <div class="nav-links">
          <div class="nav-item-dropdown">
            <a href="#" class="nav-link-dropdown" data-en="All PDF Tools" data-hi="सभी PDF टूल्स">
              All PDF Tools <i class="fas fa-chevron-down"></i>
            </a>
            <div class="mega-menu">
              <div class="mega-menu-grid">
                <!-- Organize PDF -->
                <div class="mega-menu-column">
                  <h3><i class="fas fa-sort-amount-down"></i> <span data-en="Organize PDF" data-hi="PDF व्यवस्थित करें">Organize PDF</span></h3>
                  <ul>
                    <li><a href="/tools/merge-pdf.html"><i class="fas fa-object-group"></i> <span data-en="Merge PDF" data-hi="PDF मर्ज करें">Merge PDF</span></a></li>
                    <li><a href="/tools/split-pdf.html"><i class="fas fa-cut"></i> <span data-en="Split PDF" data-hi="PDF विभाजित करें">Split PDF</span></a></li>
                    <li><a href="/tools/image-resizer.html"><i class="fas fa-crop-simple"></i> <span data-en="Image Resizer" data-hi="इमेज रीसाइज़र">Image Resizer</span></a></li>
                  </ul>
                </div>

                <!-- Optimize PDF -->
                <div class="mega-menu-column">
                  <h3><i class="fas fa-compress-arrows-alt"></i> <span data-en="Optimize PDF" data-hi="PDF ऑप्टिमाइज़ करें">Optimize PDF</span></h3>
                  <ul>
                    <li><a href="/tools/compress-pdf.html"><i class="fas fa-file-invoice"></i> <span data-en="Compress PDF" data-hi="PDF कंप्रेस करें">Compress PDF</span></a></li>
                    <li><a href="/tools/pdf-repair.html"><i class="fas fa-wrench"></i> <span data-en="Repair PDF" data-hi="PDF रिपेयर करें">Repair PDF</span></a></li>
                    <li><a href="/tools/qr-generator.html"><i class="fas fa-qrcode"></i> <span data-en="QR Generator" data-hi="QR जनरेटर">QR Generator</span></a></li>
                  </ul>
                </div>

                <!-- Convert to PDF -->
                <div class="mega-menu-column">
                  <h3><i class="fas fa-file-export"></i> <span data-en="Convert to PDF" data-hi="PDF में बदलें">Convert to PDF</span></h3>
                  <ul>
                    <li><a href="/tools/jpg-to-pdf.html"><i class="fas fa-image"></i> <span data-en="JPG to PDF" data-hi="JPG से PDF">JPG to PDF</span></a></li>
                    <li><a href="/tools/word-to-pdf.html"><i class="fas fa-file-word"></i> <span data-en="Word to PDF" data-hi="Word से PDF">Word to PDF</span></a></li>
                    <li><a href="/tools/excel-to-pdf.html"><i class="fas fa-file-excel"></i> <span data-en="Excel to PDF" data-hi="Excel से PDF">Excel to PDF</span></a></li>
                    <li><a href="/tools/html-to-pdf.html"><i class="fas fa-code"></i> <span data-en="HTML to PDF" data-hi="HTML से PDF">HTML to PDF</span></a></li>
                  </ul>
                </div>

                <!-- Convert from PDF -->
                <div class="mega-menu-column">
                  <h3><i class="fas fa-file-import"></i> <span data-en="Convert from PDF" data-hi="PDF से बदलें">Convert from PDF</span></h3>
                  <ul>
                    <li><a href="/tools/pdf-to-jpg.html"><i class="fas fa-file-image"></i> <span data-en="PDF to JPG" data-hi="PDF से JPG">PDF to JPG</span></a></li>
                    <li><a href="/tools/pdf-to-word.html"><i class="fas fa-file-word"></i> <span data-en="PDF to Word" data-hi="PDF से Word">PDF to Word</span></a></li>
                    <li><a href="/tools/pdf-to-html.html"><i class="fas fa-file-code"></i> <span data-en="PDF to HTML" data-hi="PDF से HTML">PDF to HTML</span></a></li>
                  </ul>
                </div>

                <!-- Edit & Security -->
                <div class="mega-menu-column">
                  <h3><i class="fas fa-shield-alt"></i> <span data-en="Edit & Security" data-hi="एडिट और सुरक्षा">Edit & Security</span></h3>
                  <ul>
                    <li><a href="/tools/rotate-pdf.html"><i class="fas fa-sync-alt"></i> <span data-en="Rotate PDF" data-hi="PDF घुमाएँ">Rotate PDF</span></a></li>
                    <li><a href="/tools/pdf-editor.html"><i class="fas fa-edit"></i> <span data-en="PDF Editor" data-hi="PDF एडिटर">PDF Editor</span></a></li>
                    <li><a href="/tools/lock-pdf.html"><i class="fas fa-lock"></i> <span data-en="Protect PDF" data-hi="PDF सुरक्षित करें">Protect PDF</span></a></li>
                    <li><a href="/tools/unlock-pdf.html"><i class="fas fa-unlock"></i> <span data-en="Unlock PDF" data-hi="PDF अनलॉक करें">Unlock PDF</span></a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <a href="/tools/compress-pdf.html" data-en="Compress" data-hi="कम्प्रेस">Compress</a>
          <a href="/tools/pdf-to-word.html" data-en="Convert" data-hi="कन्वर्ट">Convert</a>
          <a href="/tools/merge-pdf.html" data-en="Merge" data-hi="मर्ज">Merge</a>
        </div>
        <div class="header-actions">
          <div class="lang-switch">
            <button class="lang-btn active" id="langEn">EN</button>
            <button class="lang-btn" id="langHi">हिंदी</button>
          </div>
          <button class="dark-mode-toggle" id="darkToggle" aria-label="Toggle Dark Mode"><i class="fas fa-moon"></i></button>
          <button class="btn-login" data-en="Log in" data-hi="लॉगिन">Log in</button>
          <button class="btn-signup" data-en="Sign up →" data-hi="मुफ्त करें →">Sign up →</button>
        </div>
      </div>
    </div>
  `;

  const placeholder = document.getElementById('rocket-header');
  if (placeholder) {
    const header = document.createElement('header');
    header.id = 'mainHeader';
    header.innerHTML = headerHTML;
    placeholder.replaceWith(header);
  } else {
    if (!document.getElementById('mainHeader')) {
      const header = document.createElement('header');
      header.id = 'mainHeader';
      header.innerHTML = headerHTML;
      document.body.prepend(header);
    }
  }
}

// ==================== FOOTER INJECTION ====================
function injectFooter() {
  if (document.getElementById('mainFooter')) return;

  const footerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-section">
          <a href="/" class="logo" style="margin-bottom: 1rem; display: inline-flex; align-items: center;">
            <i class="fas fa-rocket" style="margin-right: 10px;"></i> RocketPDF
          </a>
          <p class="footer-tagline" data-en="We make PDF easy, fast, and secure. 100% Free forever." data-hi="हम PDF को आसान, तेज़ और सुरक्षित बनाते हैं। 100% हमेशा मुफ़्त।">
            We make PDF easy, fast, and secure. 100% Free forever.
          </p>
          <div class="social-icons">
            <a href="https://x.com/RinkuYadav10218" class="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="https://www.facebook.com/share/1bKfgue8es/" class="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
            <a href="https://www.instagram.com/rinku__yadav160?igsh=MTlib245Yjc2cXB6aw==" class="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="https://www.linkedin.com/in/rinku-yadav-6ba755330" class="social-icon" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="https://github.com/Rinkuyadav1600" class="social-icon" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fab fa-github"></i></a>
          </div>
        </div>
        
        <div class="footer-section">
          <h3 data-en="Convert" data-hi="कन्वर्ट">Convert</h3>
          <ul>
            <li><a href="/tools/pdf-to-word.html" data-en="PDF to Word" data-hi="PDF से Word">PDF to Word</a></li>
            <li><a href="/tools/word-to-pdf.html" data-en="Word to PDF" data-hi="Word से PDF">Word to PDF</a></li>
            <li><a href="/tools/pdf-to-jpg.html" data-en="PDF to JPG" data-hi="PDF से JPG">PDF to JPG</a></li>
            <li><a href="/tools/jpg-to-pdf.html" data-en="JPG to PDF" data-hi="JPG से PDF">JPG to PDF</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3 data-en="Organize" data-hi="ऑर्गनाइज">Organize</h3>
          <ul>
            <li><a href="/tools/merge-pdf.html" data-en="Merge PDF" data-hi="PDF मर्ज करें">Merge PDF</a></li>
            <li><a href="/tools/split-pdf.html" data-en="Split PDF" data-hi="PDF विभाजित करें">Split PDF</a></li>
            <li><a href="/tools/compress-pdf.html" data-en="Compress PDF" data-hi="PDF कंप्रेस करें">Compress PDF</a></li>
            <li><a href="/tools/rotate-pdf.html" data-en="Rotate PDF" data-hi="PDF घुमाएँ">Rotate PDF</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3 data-en="Security" data-hi="सुरक्षा">Security</h3>
          <ul>
            <li><a href="/tools/lock-pdf.html" data-en="Protect PDF" data-hi="PDF सुरक्षित करें">Protect PDF</a></li>
            <li><a href="/tools/unlock-pdf.html" data-en="Unlock PDF" data-hi="PDF अनलॉक करें">Unlock PDF</a></li>
            <li><a href="/tools/sign-pdf.html" data-en="Sign PDF" data-hi="PDF पर हस्ताक्षर करें">Sign PDF</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3 data-en="Company" data-hi="कंपनी">Company</h3>
          <ul>
            <li><a href="/about.html" data-en="About Us" data-hi="हमारे बारे में">About Us</a></li>
            <li><a href="/contact.html" data-en="Contact" data-hi="संपर्क करें">Contact</a></li>
            <li><a href="/privacy.html" data-en="Privacy Policy" data-hi="गोपनीयता नीति">Privacy Policy</a></li>
            <li><a href="/terms.html" data-en="Terms of Service" data-hi="सेवा की शर्तें">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>
          &copy; 2024 RocketPDF. <span data-en="Made with ❤️ in India." data-hi="भारत में ❤️ के साथ बनाया गया।">Made with ❤️ in India.</span>
        </p>
        <!-- Developer Credit (already in main HTML but can also be here) -->
      </div>
    </div>
  `;

  const placeholder = document.getElementById('rocket-footer');
  if (placeholder) {
    const footer = document.createElement('footer');
    footer.id = 'mainFooter';
    footer.innerHTML = footerHTML;
    placeholder.replaceWith(footer);
  } else {
    if (!document.getElementById('mainFooter')) {
      const footer = document.createElement('footer');
      footer.id = 'mainFooter';
      footer.innerHTML = footerHTML;
      document.body.appendChild(footer);
    }
  }
}

// ==================== THEME TOGGLE ====================
function setupThemeToggle() {
  // Wait a bit for DOM to be ready (in case header not injected yet)
  setTimeout(() => {
    const toggleBtn = document.getElementById('darkToggle');
    if (!toggleBtn) return;

    // Check saved theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      toggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
  }, 100);
}

// ==================== LANGUAGE TOGGLE ====================
function setupLanguageToggle() {
  setTimeout(() => {
    const langEn = document.getElementById('langEn');
    const langHi = document.getElementById('langHi');

    if (!langEn || !langHi) return;

    // Check saved language
    const savedLang = localStorage.getItem('lang') || 'en';
    setLanguage(savedLang);

    langEn.addEventListener('click', () => setLanguage('en'));
    langHi.addEventListener('click', () => setLanguage('hi'));
  }, 100);
}

// ==================== ROBOT CHAT FUNCTIONALITY ====================
function setupRobotChat() {
  setTimeout(() => {
    const robotIcon = document.getElementById('robotIcon');
    const chatBox = document.getElementById('chatBox');
    const closeChat = document.getElementById('closeChat');
    const sendBtn = document.getElementById('sendMessageBtn');
    const userMessage = document.getElementById('userMessage');
    const userEmail = document.getElementById('userEmail');
    const chatStatus = document.getElementById('chatStatus');

    // अगर ये एलिमेंट मौजूद नहीं हैं तो कोई बात नहीं
    if (!robotIcon || !chatBox) return;

    // Open chat
    robotIcon.addEventListener('click', () => {
      chatBox.style.display = 'block';
    });

    // Close chat
    if (closeChat) {
      closeChat.addEventListener('click', () => {
        chatBox.style.display = 'none';
      });
    }

    // Send message
    if (sendBtn && userMessage && chatStatus) {
      sendBtn.addEventListener('click', () => {
        const message = userMessage.value.trim();
        const email = userEmail ? userEmail.value.trim() : '';

        if (message === '') {
          chatStatus.innerHTML = '❌ Please enter a message.';
          chatStatus.style.color = 'red';
          return;
        }

        // यहाँ आप असल में EmailJS या बैकएंड API से मेल भेज सकते हैं
        // अभी हम सिर्फ कंसोल में दिखा रहे हैं और यूजर को स्टेटस दे रहे हैं
        console.log('📧 Message from user:');
        console.log('Message:', message);
        console.log('Email:', email || 'Not provided');

        // Demo: show success
        chatStatus.innerHTML = '✅ Message sent! (Demo)';
        chatStatus.style.color = '#10b981';
        userMessage.value = '';
        if (userEmail) userEmail.value = '';

        // 3 सेकंड बाद स्टेटस हटाएँ
        setTimeout(() => {
          chatStatus.innerHTML = '';
        }, 3000);
      });
    }

    // Click outside to close? Optional
    document.addEventListener('click', (e) => {
      if (chatBox.style.display === 'block' && 
          !chatBox.contains(e.target) && 
          !robotIcon.contains(e.target)) {
        chatBox.style.display = 'none';
      }
    });

  }, 200);
}

// ==================== SET LANGUAGE FUNCTION ====================
function setLanguage(lang) {
  localStorage.setItem('lang', lang);

  // Update language buttons
  const langEn = document.getElementById('langEn');
  const langHi = document.getElementById('langHi');
  if (langEn) langEn.classList.toggle('active', lang === 'en');
  if (langHi) langHi.classList.toggle('active', lang === 'hi');

  // Update all elements with data-en/data-hi
  document.querySelectorAll('[data-en]').forEach(el => {
    const newText = el.getAttribute(`data-${lang}`);
    if (newText) {
      // अगर एलिमेंट में children हैं तो भी टेक्स्ट बदलें (जैसे buttons)
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.placeholder) {
          const placeholder = el.getAttribute(`data-${lang}-placeholder`);
          if (placeholder) el.placeholder = placeholder;
        }
      } else {
        // सिर्फ टेक्स्ट कंटेंट बदलें, HTML स्ट्रक्चर नहीं
        // अगर एलिमेंट के अंदर सिर्फ टेक्स्ट है तो बदलें
        const childNodes = el.childNodes;
        let hasTextNode = false;
        childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
            hasTextNode = true;
          }
        });
        if (hasTextNode || el.children.length === 0) {
          el.textContent = newText;
        } else {
          // कुछ एलिमेंट्स में आइकन भी हैं, तो उनके अंदर के टेक्स्ट नोड्स बदलें
          Array.from(el.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
              node.textContent = newText;
            }
          });
        }
      }
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-en-placeholder]').forEach(el => {
    const placeholder = el.getAttribute(`data-${lang}-placeholder`);
    if (placeholder) el.placeholder = placeholder;
  });
}

// ==================== SCROLL HEADER EFFECT ====================
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (!header) return;
  const isDark = document.body.classList.contains('dark-mode');
  if (window.scrollY > 40) {
    header.style.background = isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)';
    header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  } else {
    header.style.background = isDark ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.8)';
    header.style.boxShadow = 'none';
  }
});