const frame = document.getElementById('f');
const fromHash = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';

frame.src = fromHash.startsWith('https://claude.ai/') ? fromHash : 'https://claude.ai/new';
