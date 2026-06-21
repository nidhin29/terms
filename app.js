// Interactive logic for Spendy Terms & Conditions Website

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Theme Toggle (Dark / Light Mode)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Load saved theme or check system default
    const savedTheme = localStorage.getItem('spendy-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('spendy-theme', newTheme);
        showToast(`Switched to ${newTheme} theme`, 'info');
    });

    // ==========================================
    // 2. Custom Toast System
    // ==========================================
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    let toastTimeout;

    function showToast(message, type = 'success') {
        clearTimeout(toastTimeout);
        toastMessage.textContent = message;
        
        const icon = toast.querySelector('.toast-icon');
        if (type === 'success') {
            icon.style.backgroundColor = 'var(--success-alpha-2)';
            icon.style.color = 'var(--success)';
            icon.style.borderColor = 'var(--success)';
        } else if (type === 'danger') {
            icon.style.backgroundColor = 'var(--danger-alpha-2)';
            icon.style.color = 'var(--danger)';
            icon.style.borderColor = 'var(--danger)';
        } else {
            icon.style.backgroundColor = 'var(--primary-alpha-2)';
            icon.style.color = 'var(--primary)';
            icon.style.borderColor = 'var(--primary)';
        }

        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ==========================================
    // 3. Live Text Search with Highlighting
    // ==========================================
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const policySections = document.querySelectorAll('.policy-section');
    
    // Store original HTML contents of search-eligible elements to revert highlights cleanly
    const searchables = [];
    policySections.forEach(section => {
        const elements = section.querySelectorAll('p, li, h2, h3, div.disclaimer-alert-box, div.warning-text');
        elements.forEach(el => {
            searchables.push({
                element: el,
                originalHTML: el.innerHTML,
                originalText: el.textContent
            });
        });
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length > 0) {
            searchClear.style.display = 'block';
        } else {
            searchClear.style.display = 'none';
        }

        if (query.length < 2) {
            // Revert all to original HTML
            searchables.forEach(item => {
                item.element.innerHTML = item.originalHTML;
            });
            // Show all sections
            policySections.forEach(s => {
                s.style.opacity = '1';
                s.style.borderColor = 'var(--border-color)';
            });
            return;
        }

        let totalMatches = 0;
        const matchedSections = new Set();

        searchables.forEach(item => {
            const text = item.originalText;
            const index = text.toLowerCase().indexOf(query);
            
            if (index !== -1) {
                const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
                item.element.innerHTML = item.originalHTML.replace(regex, '<mark class="search-highlight">$1</mark>');
                totalMatches++;
                
                const section = item.element.closest('.policy-section');
                if (section) {
                    matchedSections.add(section);
                }
            } else {
                item.element.innerHTML = item.originalHTML;
            }
        });

        // Dim sections that have no matches to make matches stand out
        policySections.forEach(section => {
            if (matchedSections.has(section)) {
                section.style.opacity = '1';
                section.style.borderColor = 'var(--primary)';
            } else {
                section.style.opacity = '0.4';
                section.style.borderColor = 'var(--border-color)';
            }
        });
    });

    // Clear search action
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        searchables.forEach(item => {
            item.element.innerHTML = item.originalHTML;
        });
        policySections.forEach(s => {
            s.style.opacity = '1';
            s.style.borderColor = 'var(--border-color)';
        });
        searchInput.focus();
    });

    // Shortcut '/' key to focus search
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.blur();
            searchClear.click();
        }
    });

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ==========================================
    // 4. Table of Contents (TOC) Active Tracker
    // ==========================================
    const tocLinks = document.querySelectorAll('.toc-link');
    
    // Active highlight on scroll using Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                tocLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                        link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    policySections.forEach(section => {
        observer.observe(section);
    });

    // Smooth scroll for TOC links
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 90;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // 5. Email Copy to Clipboard
    // ==========================================
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const emailText = document.getElementById('email-text').textContent;

    copyEmailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(emailText).then(() => {
            showToast('Email copied to clipboard!', 'success');
        }).catch(err => {
            const input = document.createElement('input');
            input.value = emailText;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showToast('Email copied to clipboard!', 'success');
        });
    });

    // ==========================================
    // 7. Backup Encryption & Key Validator Simulator
    // ==========================================
    const encKeyInput = document.getElementById('enc-key');
    const encryptBtn = document.getElementById('encrypt-btn');
    const decKeyInput = document.getElementById('dec-key');
    const decryptBtn = document.getElementById('decrypt-btn');
    const simStatus = document.getElementById('sim-status');
    const plaintextDb = document.getElementById('plaintext-db');
    const ciphertextDb = document.getElementById('ciphertext-db');
    const panelDecrypt = document.getElementById('panel-decrypt');

    const originalPlaintext = plaintextDb.textContent;
    let storedPlaintext = originalPlaintext;
    let encryptionKey = '';
    let isEncrypting = false;
    let isDecrypting = false;

    encryptBtn.addEventListener('click', async () => {
        const key = encKeyInput.value.trim();
        if (key.length < 6) {
            showToast('Key must be at least 6 characters long!', 'danger');
            encKeyInput.focus();
            return;
        }

        if (isEncrypting) return;
        isEncrypting = true;

        // Visual feedback during encryption
        encryptBtn.disabled = true;
        encKeyInput.disabled = true;
        encryptBtn.textContent = 'Encrypting locally...';
        simStatus.className = 'status-badge status-ready';
        simStatus.textContent = 'Encrypting';
        
        await delay(1200); // Simulate processing time

        encryptionKey = key;
        
        // Mock AES-256 base64 generation
        const mockCipher = generateMockCiphertext(originalPlaintext, key);
        ciphertextDb.textContent = mockCipher;
        ciphertextDb.classList.add('encrypted-output');

        // Status update
        simStatus.className = 'status-badge status-encrypted';
        simStatus.textContent = 'Encrypted (Sync Ready)';
        encryptBtn.textContent = 'Encrypted';
        
        // Enable decrypt panel
        panelDecrypt.classList.remove('panel-disabled');
        decKeyInput.disabled = false;
        decryptBtn.disabled = false;
        
        showToast('Database encrypted locally & synced to Google Drive!', 'success');
        isEncrypting = false;
    });

    decryptBtn.addEventListener('click', async () => {
        const key = decKeyInput.value.trim();
        if (!key) {
            showToast('Please enter the decryption key!', 'danger');
            decKeyInput.focus();
            return;
        }

        if (isDecrypting) return;
        isDecrypting = true;

        decryptBtn.disabled = true;
        decKeyInput.disabled = true;
        decryptBtn.textContent = 'Decrypting archive...';
        
        await delay(1000); // Simulate processing

        if (key === encryptionKey) {
            simStatus.className = 'status-badge status-encrypted';
            simStatus.textContent = 'Restoring...';
            
            await delay(500);
            
            // Decrypt successfully
            ciphertextDb.classList.remove('encrypted-output');
            ciphertextDb.textContent = `✓ RESTORE COMPLETED SUCCESSFULLY!\n\n${originalPlaintext}`;
            
            simStatus.className = 'status-badge status-ready';
            simStatus.textContent = 'Restored';
            decryptBtn.textContent = 'Restored';
            
            showToast('Backup restored successfully!', 'success');
            
            // Reset after delay to try again
            await delay(4000);
            resetSimulator();
        } else {
            // Decrypt failed
            simStatus.className = 'status-badge status-failed';
            simStatus.textContent = 'Decryption Failed';
            ciphertextDb.textContent = `⚠️ ERROR: INVALID KEY! DECRYPTION FAILED.\n\nRaw backup remains locked. Developer cannot bypass this key. Your local database cannot be restored.`;
            
            decryptBtn.disabled = false;
            decKeyInput.disabled = false;
            decryptBtn.textContent = 'Try Again';
            
            showToast('Decryption failed! Password does not match.', 'danger');
        }
        
        isDecrypting = false;
    });

    function generateMockCiphertext(text, key) {
        // Generates realistic looking block of AES text
        const salt = btoa(key).substring(0, 12);
        const headers = `U2FsdGVkX18${salt}`;
        const mainContent = btoa(text.replace(/\s/g, '')).substring(10, 110);
        return `${headers}m9qL7pDxFwN4yV${mainContent}a8f9c2d1e0b5c4a3f2d1e0b5c4a3pQ==`;
    }

    function resetSimulator() {
        encKeyInput.value = '';
        encKeyInput.disabled = false;
        encryptBtn.disabled = false;
        encryptBtn.textContent = 'Encrypt Data';
        
        decKeyInput.value = '';
        decKeyInput.disabled = true;
        decryptBtn.disabled = true;
        decryptBtn.textContent = 'Decrypt & Sync';
        panelDecrypt.classList.add('panel-disabled');
        
        ciphertextDb.textContent = 'Waiting for encryption...';
        ciphertextDb.classList.remove('encrypted-output');
        
        simStatus.className = 'status-badge status-ready';
        simStatus.textContent = 'Ready';
        encryptionKey = '';
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

});
