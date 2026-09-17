// Shared flag: true once the first-visit BootSequence (if any) has
// finished, so other components (the home hero typewriter) can wait for
// it before starting their own entrance animation instead of running it
// invisibly underneath the boot overlay. BootSequence.svelte sets this to
// true immediately when it decides not to play (already booted this
// session, or prefers-reduced-motion), and after its sequence finishes
// when it does play.
function createBootStore() {
	let complete = $state(false);

	function markComplete() {
		complete = true;
	}

	return {
		get complete() {
			return complete;
		},
		markComplete
	};
}

export const boot = createBootStore();
