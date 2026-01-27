const lrcContent = `[00:30.00] I watch the raindrops hit the glass`;

const parseLrc = (lrc, fps) => {
	const lines = lrc.split('\n');
    // Try relaxed regex
	const regex = /\{(\d+):(\d+)\.(\d+)\}(.*)/;

	for (const line of lines) {
        const trimmed = line.trim();
		const match = trimmed.match(regex);
        console.log(`Line: "${trimmed}"`);
        console.log(`Char codes: ${trimmed.split('').map(c => c.charCodeAt(0)).join(',')}`);
        console.log(`Match: ${match ? 'YES' : 'NO'}`);
	}
};

parseLrc(lrcContent, 30);
