document.addEventListener('DOMContentLoaded', () => {
    const MAX_DISTANCE = 25;
    const FADE_DURATION = 3; // seconds
    const WOBBLE_DURATION = 1.2; // seconds

    // --- 1. Hardcoded Light Theme Text Color ---
    // The previous dynamic lookup is replaced with the constant light theme text color.
    const DEFAULT_TEXT_COLOR = '#212529'; 

    // --- 2. Color palette for hover ---
    const colors = [
        'rgb(132,204,22)',
        'rgb(204,197,94)',
        'rgb(16,185,129)',
        'rgb(100,100,255)',
        'rgb(255,100,100)',
        'rgb(255,150,0)',
        'rgb(200,0,255)'
    ];

    // --- 3. Split lines into characters ---
    document.querySelectorAll('.animate-line').forEach(line => {
        line.innerHTML = line.textContent.split('').map((char, i) => {
            if (char === ' ') return ' ';
            const hoverColor = colors[i % colors.length];
            return `<span class="char" data-hover-color="${hoverColor}">${char}</span>`;
        }).join('');
    });

    // --- 4. Cache all char positions ---
    let chars = Array.from(document.querySelectorAll('.animate-line .char')).map(el => ({
        el,
        hoverColor: el.dataset.hoverColor
    }));

    // ★★★ CRITICAL FIX: INITIAL COLORIZATION ★★★
    // Set the initial color using the hardcoded light theme color.
    chars.forEach(c => {
        c.el.style.color = DEFAULT_TEXT_COLOR;
    });
    // ★★★ END CRITICAL FIX ★★★
    
    const updatePositions = () => {
        chars.forEach(c => {
            const rect = c.el.getBoundingClientRect();
            c.x = rect.left + rect.width / 2;
            c.y = rect.top + rect.height / 2;
        });
    };
    updatePositions();
    window.addEventListener('resize', updatePositions);

    // --- 5. Handle mouse hover ---
    document.addEventListener('mousemove', e => {
        const mx = e.clientX;
        const my = e.clientY;

        chars.forEach(c => {
            const dx = mx - c.x;
            const dy = my - c.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < MAX_DISTANCE) {
                // Hover: applies colorful inline style (overrides theme color)
                c.el.style.transition = 'color 0s, transform 0.2s';
                c.el.style.color = c.hoverColor;
                c.el.classList.add('wobble-active');
            } else if (c.el.classList.contains('wobble-active')) {
                // Mouse leave: fades back to hardcoded light theme color
                c.el.style.transition = `color ${FADE_DURATION}s ease, transform 0.2s`;
                c.el.style.color = DEFAULT_TEXT_COLOR;
                setTimeout(() => c.el.classList.remove('wobble-active'), WOBBLE_DURATION*1000);
            }
        });
    });
});