<script>
	import { enhance } from '$app/forms';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { createEventDispatcher } from 'svelte';
	// Direct imports based on existing project pattern
	import X from 'lucide-svelte/icons/x';
	import Send from 'lucide-svelte/icons/send';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';

	let { isOpen, onClose, onSuccess } = $props();

	/** @type {'idle' | 'submitting' | 'success' | 'error'} */
	let status = $state('idle');
	let errorMessage = $state('');

	function handleClose() {
		if (status === 'submitting') return;
		onClose();
		// Reset status after animation plays out if needed, but keeping success state is nice
		setTimeout(() => {
			if (status === 'success' || status === 'error') {
				status = 'idle';
			}
		}, 500);
	}

	/** @type {import('@sveltejs/kit').SubmitFunction} */
	function handleSubmit({ form, data, action, cancel }) {
		status = 'submitting';

		return async ({ result, update }) => {
			if (result.type === 'success') {
				status = 'success';
				if (onSuccess) onSuccess(); // Signal parent
				await update({ reset: true });
				setTimeout(() => {
					handleClose();
				}, 2000);
			} else {
				status = 'error';
				errorMessage = '送信に失敗しました。時間をおいて再送してください。';
				setTimeout(() => {
					status = 'idle';
				}, 3000);
				await update({ reset: false });
			}
		};
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
			onclick={handleClose}
			aria-label="Close modal"
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
		></button>

		<!-- Modal Content -->
		<div
			class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white/90 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:bg-zinc-900/90 dark:ring-white/10"
			in:scale={{ start: 0.95, duration: 300, easing: cubicOut }}
			out:scale={{ start: 0.95, duration: 200, easing: cubicOut }}
		>
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
					class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			{#if status === 'success'}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<div class="mb-4 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30">
						<CheckCircle2 class="h-8 w-8" />
					</div>
					<h3 class="text-xl font-bold text-gray-900 dark:text-white">送信しました</h3>
					<p class="mt-2 text-gray-500 dark:text-gray-400">
						お問い合わせありがとうございます。<br />確認次第、ご連絡いたします。
					</p>
				</div>
			{:else}
				<form method="POST" action="/contact" use:enhance={handleSubmit} class="space-y-5">
					<div class="space-y-1">
						<label
							for="name"
							class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
							>Name</label
						>
						<input
							type="text"
							name="name"
							id="name"
							required
							placeholder="お名前"
							class="w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black dark:bg-black/50 dark:text-white dark:ring-white/10 dark:focus:ring-white"
						/>
					</div>

					<div class="space-y-1">
						<label
							for="email"
							class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
							>Email</label
						>
						<input
							type="email"
							name="email"
							id="email"
							required
							placeholder="example@andrew.ac.jp"
							class="w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black dark:bg-black/50 dark:text-white dark:ring-white/10 dark:focus:ring-white"
						/>
					</div>

					<div class="space-y-1">
						<label
							for="content"
							class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
							>Content</label
						>
						<textarea
							name="content"
							id="content"
							rows="4"
							required
							placeholder="お問い合わせ内容をご記入ください"
							class="w-full resize-none rounded-xl border-0 bg-gray-50 px-4 py-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black dark:bg-black/50 dark:text-white dark:ring-white/10 dark:focus:ring-white"
						></textarea>
					</div>

					{#if status === 'error'}
						<p class="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
					{/if}

					<div class="pt-2">
						<button
							type="submit"
							disabled={status === 'submitting'}
							class="group flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-800 disabled:opacity-70 disabled:hover:scale-100 dark:bg-white dark:text-black dark:hover:bg-gray-200"
						>
							{#if status === 'submitting'}
								<Loader2 class="h-4 w-4 animate-spin" />
								<span>送信中...</span>
							{:else}
								<span>Send Message</span>
								<Send class="h-4 w-4 transition-transform group-hover:translate-x-1" />
							{/if}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}
