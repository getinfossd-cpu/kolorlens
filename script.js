// D:\ColorLense\script.js (FINAL LIGHT MODE ONLY - Magnifier Fix Applied)

// =======================================================
// --- Utility Function (Simplified) ---
// =======================================================
// Hardcoded text color constant (Light theme default)
const LIGHT_TEXT_COLOR = '#212529'; 
// Hardcoded hover background color (Light theme default)
const LIGHT_HOVER_BG_COLOR = '#f1f3f5';
const LIGHT_BORDER_COLOR = '#ced4da';


// =======================================================
// --- Theme Toggle Logic (REMOVED) ---
// =======================================================
// The entire block for initThemeToggle, applyTheme, and getCurrentColor is removed.


// =======================================================
// --- Text Animation Logic ---
// =======================================================
const MAX_DISTANCE = 25;
const FADE_DURATION = 1.5;
const WOBBLE_DURATION = 1.2;
const allCharData = [];
const resetTimeouts = new Map();

const colors = [
    'rgb(132,204,22)', 'rgb(204,197,94)', 'rgb(16,185,129)',
    'rgb(100,100,255)', 'rgb(255,100,100)', 'rgb(255,150,0)',
    'rgb(200,0,255)'
];

// Removed: updateTextColorForTheme() as it is no longer needed.


document.addEventListener('DOMContentLoaded', () => {
    // 1. Split text into spans
    document.querySelectorAll('.animate-line').forEach(line => {
        let index = 0;
        line.innerHTML = line.textContent.split('').map(char => {
            if (char === ' ') return ' ';
            const hoverColor = colors[index % colors.length];
            return `<span class="char" data-hover-color="${hoverColor}" style="--index:${index++}">${char}</span>`;
        }).join('');
    });

    // 2. Cache positions and apply initial color
    const updateCharPositions = () => {
        allCharData.length = 0;
        document.querySelectorAll('.animate-line .char').forEach(span => {
            const rect = span.getBoundingClientRect();
            allCharData.push({
                element: span,
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                hoverColor: span.getAttribute('data-hover-color'),
                isColored: false
            });
            // Apply hardcoded light theme color initially
            span.style.color = LIGHT_TEXT_COLOR; 
        });
    };
    updateCharPositions();
    window.addEventListener('resize', updateCharPositions);

    // 3. Mouse hover effect
    document.addEventListener('mousemove', e => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        requestAnimationFrame(() => {
            allCharData.forEach(char => {
                const dist = Math.hypot(mouseX - char.x, mouseY - char.y);
                if (dist < MAX_DISTANCE) {
                    if (!char.isColored) {
                        char.element.style.transition = 'color 0s, transform 0.2s';
                        char.element.style.color = char.hoverColor;
                        char.element.classList.add('wobble-active');
                        char.isColored = true;
                    }
                } else if (char.isColored && !resetTimeouts.has(char.element)) {
                    char.element.style.transition = `color ${FADE_DURATION}s ease, transform 0.2s`;
                    
                    // Clear any previous timeout
                    if (resetTimeouts.has(char.element)) {
                        clearTimeout(resetTimeouts.get(char.element));
                        resetTimeouts.delete(char.element);
                    }

                    const wobbleId = setTimeout(() => {
                        // Reset to the hardcoded light theme color
                        char.element.style.color = LIGHT_TEXT_COLOR; 
                        char.element.classList.remove('wobble-active');
                        char.isColored = false;
                        resetTimeouts.delete(char.element);
                    }, WOBBLE_DURATION * 1000);
                    resetTimeouts.set(char.element, wobbleId);
                }
            });
        });
    });
});


// =======================================================
// --- Color Picker, Magnifier, and Image Upload ---
// =======================================================
const fileInput = document.getElementById('image-upload');
const displayImage = document.getElementById('display-image');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const primaryColorBox = document.getElementById('primary-color-box');
const hexOutput = document.getElementById('hex-output');
const rgbOutput = document.getElementById('rgb-output');
const hslOutput = document.getElementById('hsl-output');
const magnifier = document.getElementById('magnifier');
const colorPromptMessage = document.getElementById('color-prompt-message');

const GRID_PIXEL_SIZE = 15;
const GRID_CELLS = 10;
const MAGNIFIER_SIZE = GRID_PIXEL_SIZE * GRID_CELLS;

if (magnifier) {
    magnifier.style.width = `${MAGNIFIER_SIZE}px`;
    magnifier.style.height = `${MAGNIFIER_SIZE}px`;
}

function rgbToHex(r, g, b) {
    const toHex = c => c.toString(16).padStart(2,'0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r, g, b) {
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0, s=0, l=(max+min)/2;
    if(max!==min){
        const d=max-min;
        s = l>0.5 ? d/(2-max-min) : d/(max+min);
        switch(max){
            case r: h=(g-b)/d + (g<b?6:0); break;
            case g: h=(b-r)/d + 2; break;
            case b: h=(r-g)/d + 4; break;
        }
        h/=6;
    }
    return `${Math.round(h*360)}, ${Math.round(s*100)}, ${Math.round(l*100)}`;
}

function updateColorDisplay(hex,r,g,b){
    if(colorPromptMessage){ 
        colorPromptMessage.style.display='none'; 
        primaryColorBox.style.border='none'; 
    }
    primaryColorBox.style.backgroundColor=hex;
    hexOutput.textContent=hex.toUpperCase();
    rgbOutput.textContent=`rgba(${r}, ${g}, ${b})`;
    hslOutput.textContent=rgbToHsl(r,g,b);
}

function initCanvas(imgSrc){
    displayImage.src=imgSrc;
    displayImage.style.display='block';
    const img = new Image();
    img.crossOrigin="anonymous";
    img.onload=()=> {
        canvas.width=img.width;
        canvas.height=img.height;
        ctx.drawImage(img,0,0,img.width,img.height);
        magnifier.style.backgroundImage=`url(${imgSrc})`;
    };
    img.src=imgSrc;
}

function initializeImageAndPlaceholders(){
    // *** FIX: Ensure magnifier is hidden on page load/re-initialization ***
    if (magnifier) {
        magnifier.style.display = 'none'; 
    }
    // **********************************************************************
    
    initCanvas('assets/default.jpg');
    hexOutput.textContent='- - -';
    rgbOutput.textContent='- - -';
    hslOutput.textContent='- - -';
    if(colorPromptMessage){
        colorPromptMessage.style.display='flex';
        // Use hardcoded light theme colors
        primaryColorBox.style.backgroundColor=LIGHT_HOVER_BG_COLOR; 
        primaryColorBox.style.border=`2px dashed ${LIGHT_BORDER_COLOR}`;
    }
}
initializeImageAndPlaceholders();

fileInput.addEventListener('change', e=>{
    const file=e.target.files[0];
    if(file){
        if(colorPromptMessage){
            colorPromptMessage.style.display='flex';
            primaryColorBox.style.border=`2px dashed ${LIGHT_BORDER_COLOR}`;
            primaryColorBox.style.backgroundColor=LIGHT_HOVER_BG_COLOR;
            hexOutput.textContent='- - -';
            rgbOutput.textContent='- - -';
            hslOutput.textContent='- - -';
        }
        const reader=new FileReader();
        reader.onload=event=>initCanvas(event.target.result);
        reader.readAsDataURL(file);
    }
});

displayImage.addEventListener('mouseenter',()=>{magnifier.style.display='block';});
displayImage.addEventListener('mouseleave',()=>{magnifier.style.display='none';});
displayImage.addEventListener('mousemove', e=>{
    if(magnifier.style.display==='none') return;
    magnifier.style.left=`${e.clientX}px`;
    magnifier.style.top=`${e.clientY}px`;
    const rect=displayImage.getBoundingClientRect();
    const x=Math.floor(e.clientX-rect.left);
    const y=Math.floor(e.clientY-rect.top);
    magnifier.style.backgroundSize=`${rect.width*GRID_PIXEL_SIZE}px ${rect.height*GRID_PIXEL_SIZE}px`;
    const offset=(MAGNIFIER_SIZE/2)-(GRID_PIXEL_SIZE/2);
    magnifier.style.backgroundPosition=`${offset-x*GRID_PIXEL_SIZE}px ${offset-y*GRID_PIXEL_SIZE}px`;
});

displayImage.addEventListener('click', e=>{
    const rect=displayImage.getBoundingClientRect();
    const scaleX=canvas.width/rect.width;
    const scaleY=canvas.height/rect.height;
    const x=(e.clientX-rect.left)*scaleX;
    const y=(e.clientY-rect.top)*scaleY;
    try{
        const data=ctx.getImageData(x,y,1,1).data;
        updateColorDisplay(rgbToHex(data[0],data[1],data[2]),data[0],data[1],data[2]);
    }catch(err){console.error("Color reading failed:",err);}
});

document.querySelectorAll('.copy-button').forEach(button=>{
    button.addEventListener('click', ()=>{
        const targetId=button.getAttribute('data-target');
        const target=document.getElementById(targetId);
        let text=target.textContent;
        if(targetId==='rgb-output') text=`rgb(${text.replace('rgba(','').replace(')','').trim()})`;
        if(targetId==='hsl-output') text=`hsl(${text.trim()})`;
        navigator.clipboard.writeText(text).then(()=>{
            const original=button.innerHTML;
            button.innerHTML='Copied!';
            setTimeout(()=>button.innerHTML=original,1000);
        }).catch(err=>console.error('Could not copy text:',err));
    });
});