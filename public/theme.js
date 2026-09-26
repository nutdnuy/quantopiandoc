try { const saved = localStorage.getItem('qrl-book-theme'); document.documentElement.dataset.theme = saved === 'dark' ? 'dark' : 'light'; } catch { document.documentElement.dataset.theme = 'light'; }
