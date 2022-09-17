import React from 'react';

type circleInput = {
    color: string|undefined
}

function Circle({color}: circleInput){
    
    return (
        <span style={{ color: hexToRGB(color) }}>⬤</span>
    );
}

function hexToRGB(color: string | undefined) {
    if (color === undefined) return;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return `rgb(${r},${g},${b})`;
}

export default Circle;
