/**
 * Validates a FEN string structure.
 * Returns true if the FEN has valid board characters and a valid turn indicator.
 */
export const validateFEN = (fen: string): boolean => {
    if (!fen || typeof fen !== 'string') {
        return false;
    }

    const parts = fen.trim().split(/\s+/);

    // Must have at least 2 parts: Board position and Active Color
    if (parts.length < 2) {
        return false;
    }

    const board = parts[0];
    const activeColor = parts[1];

    // Basic Board Validation:
    // - Must only contain valid characters (p,P,r,R,n,N,b,B,q,Q,k,K,1-8,/)
    const boardRegex = /^[prnbqkPRNBQK1-8/]+$/;

    if (!boardRegex.test(board)) {
        return false;
    }

    // Basic Turn Validation:
    // - Must be 'w' or 'b'
    if (activeColor !== 'w' && activeColor !== 'b') {
        return false;
    }

    return true;
};

/**
 * Helper to get the image URL for a FEN if valid.
 */
export const getFenImageData = (fen: string) => {
    if (!validateFEN(fen)) {
        return { isValid: false, imageUrl: '' };
    }

    const parts = fen.trim().split(/\s+/);
    const pov = parts[1].toLowerCase() === 'b' ? 'black' : 'white';
    const encodedFen = encodeURIComponent(parts.join(' '));

    return {
        isValid: true,
        imageUrl: `https://fen2image.chessvision.ai/${encodedFen}?pov=${pov}`,
    };
};
