// Shared "decrypt text" animator: walks every text node under `root` and,
// frame by frame, resolves it left-to-right between its real content and a
// scrambled, code-like version — the same mechanism drives both directions,
// just read in reverse (see direction below).

const CODE_CHARS = '01{}[]()<>;:=+-*/%&|!?#$^~_'.split('');

function randomChar() {
	return CODE_CHARS[(Math.random() * CODE_CHARS.length) | 0];
}

/**
 * @param {Element} root
 * @returns {Text[]}
 */
function collectTextNodes(root) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode(node) {
			if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
			const parent = /** @type {Text} */ (node).parentElement;
			if (!parent) return NodeFilter.FILTER_REJECT;
			if (parent.closest('script, style, noscript, [data-no-scramble]')) {
				return NodeFilter.FILTER_REJECT;
			}
			return NodeFilter.FILTER_ACCEPT;
		}
	});
	/** @type {Text[]} */
	const nodes = [];
	let n = walker.nextNode();
	while (n) {
		nodes.push(/** @type {Text} */ (n));
		n = walker.nextNode();
	}
	return nodes;
}

/**
 * @param {Element} root
 * @param {{ direction: 'toCode' | 'toReal', duration?: number, onDone?: () => void }} opts
 */
export function scrambleTransition(root, { direction, duration = 650, onDone }) {
	const nodes = collectTextNodes(root);
	const originals = nodes.map((n) => n.nodeValue ?? '');
	const start = performance.now();

	function frame(/** @type {number} */ now) {
		const p = Math.min(1, (now - start) / duration);
		// Fraction of each string's characters (left-to-right) that are
		// already "resolved" to their real value this frame.
		const resolveFrac = direction === 'toReal' ? p : 1 - p;

		for (let i = 0; i < nodes.length; i++) {
			const original = originals[i];
			const len = original.length;
			const resolvedCount = Math.floor(len * resolveFrac);
			let out = '';
			for (let c = 0; c < len; c++) {
				const ch = original[c];
				out += ch === ' ' || ch === '\n' || ch === '\t' || c < resolvedCount ? ch : randomChar();
			}
			nodes[i].nodeValue = out;
		}

		if (p < 1) {
			requestAnimationFrame(frame);
		} else {
			if (direction === 'toReal') {
				for (let i = 0; i < nodes.length; i++) nodes[i].nodeValue = originals[i];
			}
			onDone?.();
		}
	}

	requestAnimationFrame(frame);
}
