document.addEventListener('DOMContentLoaded', function () {
    // 创建切换按钮
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '📖 阅读模式';
    toggleButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    padding: 10px 20px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    font-size: 14px;
    transition: all 0.3s;
  `;

    toggleButton.onmouseover = () => {
        toggleButton.style.background = '#1976D2';
        toggleButton.style.transform = 'scale(1.05)';
    };

    toggleButton.onmouseout = () => {
        toggleButton.style.background = '#2196F3';
        toggleButton.style.transform = 'scale(1)';
    };

    document.body.appendChild(toggleButton);

    // 检查本地存储的状态
    const isReadingMode = localStorage.getItem('readingMode') === 'true';
    if (isReadingMode) {
        enableReadingMode();
    }

    // 点击切换
    toggleButton.addEventListener('click', function () {
        if (document.body.classList.contains('reading-mode')) {
            disableReadingMode();
        } else {
            enableReadingMode();
        }
    });

    function enableReadingMode() {
        document.body.classList.add('reading-mode');
        toggleButton.innerHTML = '👁️ 退出阅读';
        toggleButton.style.background = '#FF5722';
        localStorage.setItem('readingMode', 'true');
    }

    function disableReadingMode() {
        document.body.classList.remove('reading-mode');
        toggleButton.innerHTML = '📖 阅读模式';
        toggleButton.style.background = '#2196F3';
        localStorage.setItem('readingMode', 'false');
    }

    // 键盘快捷键 (按 R 键切换)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'r' || e.key === 'R') {
            if (!e.target.matches('input, textarea')) {
                toggleButton.click();
            }
        }
    });
});