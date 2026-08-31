<script>
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import X from 'lucide-svelte/icons/x';
	import ContactForm from './ContactForm.svelte';

	let { isOpen, onClose, onSuccess, initialContext = '' } = $props();

	function handleClose() {
		onClose();
	}

	function handleFormSuccess() {
		if (onSuccess) onSuccess();
		setTimeout(handleClose, 2200);
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
			onclick={handleClose}
			aria-label="Close modal"
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
		></button>

		<!-- Modal Content -->
		<div
			class="relative w-full max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-black/10 backdrop-blur-2xl dark:bg-[#0f0f0f] dark:ring-white/10"
			in:scale={{ start: 0.95, duration: 300, easing: cubicOut }}
			out:scale={{ start: 0.95, duration: 200, easing: cubicOut }}
		>
			<!-- SF Scan Border -->
			<div class="absolute inset-0 pointer-events-none z-0">
				<div class="absolute inset-0 border border-cyan-500/30 rounded-3xl"></div>
				<div
					class="absolute inset-0 border border-cyan-400/50 rounded-3xl animate-modal-scan clip-path-inset"
				></div>
			</div>

			<!-- Content Wrapper -->
			<div class="relative z-10">
				<!-- Header -->
				<div class="mb-6 flex items-center justify-between">
					<div>
						<h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
							Contact Us
						</h2>
						<p class="text-sm text-gray-500 dark:text-gray-400">お問い合わせ</p>
					</div>
					<button
						onclick={handleClose}
						aria-label="閉じる"
						class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<X class="h-5 w-5" />
					</button>
				</div>

				<ContactForm variant="modal" {initialContext} onSuccess={handleFormSuccess} />
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes modal-scan {
		0%,
		100% {
			clip-path: inset(0 0 98% 0);
		}
		25% {
			clip-path: inset(0 98% 0 0);
		}
		50% {
			clip-path: inset(98% 0 0 0);
		}
		75% {
			clip-path: inset(0 0 0 98%);
		}
	}
	.animate-modal-scan {
		animation: modal-scan 4s linear infinite;
	}
</style>
