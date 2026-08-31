<script>
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import { localize } from '$lib/i18n/localize.svelte.js';
	import { submitInquiry } from '$lib/contact.js';

	/**
	 * @type {{
	 *   initialContext?: string,
	 *   variant?: 'inline' | 'modal',
	 *   onSuccess?: () => void
	 * }}
	 */
	let { initialContext = '', variant = 'inline', onSuccess } = $props();

	const serviceTypes = [
		'Webサイト・LP制作',
		'業務ツール・システム開発',
		'プロジェクションマッピング・映像制作',
		'プログラミング教室・ワークショップ',
		'学生プロジェクト・共創のご相談',
		'その他'
	];

	const jp = {
		labels: {
			name: 'Name / お名前',
			org: 'Organization / 組織名・学校名',
			email: 'Email / メールアドレス',
			category: 'Category / ご相談種別',
			budget: 'Budget & Timeline / ご予算・希望納期',
			message: 'Message / ご相談内容の詳細'
		},
		ph: {
			name: '山田 太郎',
			org: '株式会社〇〇 / 桃山学院大学',
			budget: '例: ご予算10〜20万円 / 2026年秋頃の納品希望',
			message: 'ご相談内容やプロジェクトの概要・ご要望についてご記入ください。'
		},
		required: 'Required',
		optional: 'Optional',
		send: '送信する',
		sending: '送信中...',
		successTitle: '送信が完了いたしました',
		successBody:
			'お問い合わせいただき誠にありがとうございます。内容を確認の上、担当者より通常2〜3営業日以内にご連絡差し上げます。',
		again: '続けて送信する',
		errNetwork: '通信エラーが発生しました。時間をおいて再度お試しください。',
		serviceTypes
	};
	const c = localize(() => jp);

	/** @param {string} ctx */
	function guessCategory(ctx) {
		if (!ctx) return serviceTypes[0];
		if (/マッピング|映像|配信/.test(ctx)) return 'プロジェクションマッピング・映像制作';
		if (/教育|ワークショップ|教室/.test(ctx)) return 'プログラミング教室・ワークショップ';
		if (/学生主導|共同開発|共創/.test(ctx)) return '学生プロジェクト・共創のご相談';
		if (/Web|システム|アプリ|ツール|HP|LP/.test(ctx)) return '業務ツール・システム開発';
		return serviceTypes[0];
	}

	let name = $state('');
	let company = $state('');
	let email = $state('');
	let serviceType = $state(serviceTypes[0]);
	let budgetDeadline = $state('');
	let message = $state('');
	let honeyPot = $state('');

	/** @type {'idle' | 'submitting' | 'success' | 'error'} */
	let status = $state('idle');
	let errorMessage = $state('');

	// Pre-fill when opened from a specific service card.
	let primed = $state(false);
	$effect(() => {
		if (initialContext && !primed) {
			message = `「${initialContext}」について相談したいです。\n\n`;
			serviceType = guessCategory(initialContext);
			primed = true;
		}
	});

	function reset() {
		name = '';
		company = '';
		email = '';
		serviceType = serviceTypes[0];
		budgetDeadline = '';
		message = '';
		status = 'idle';
		errorMessage = '';
	}

	/** @param {SubmitEvent} e */
	async function handleSubmit(e) {
		e.preventDefault();
		if (status === 'submitting') return;
		if (honeyPot) {
			status = 'success';
			onSuccess?.();
			return;
		}

		status = 'submitting';
		errorMessage = '';

		const { ok, error } = await submitInquiry({
			name,
			email,
			message,
			company,
			serviceType,
			budgetDeadline,
			honeyPot
		});

		if (ok) {
			status = 'success';
			onSuccess?.();
		} else {
			status = 'error';
			errorMessage = error || c.value.errNetwork;
		}
	}

	const fieldClass =
		'w-full rounded-lg px-4 py-3.5 text-sm bg-zinc-50 dark:bg-[#0a0a0a] text-[#1D1D1F] dark:text-white border border-black/10 dark:border-white/15 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors';
	const labelClass =
		'font-mono text-xs tracking-wider text-zinc-600 dark:text-zinc-300 uppercase font-medium';
</script>

{#if status === 'success'}
	<div class="relative z-10 py-12 text-center flex flex-col items-center justify-center">
		<div
			class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400"
		>
			<CheckCircle2 class="h-8 w-8 stroke-2" />
		</div>
		<h3 class="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-3">
			{c.value.successTitle}
		</h3>
		<p class="text-zinc-600 dark:text-zinc-300 max-w-md text-sm leading-relaxed font-normal">
			{c.value.successBody}
		</p>
		{#if variant === 'inline'}
			<button
				type="button"
				onclick={reset}
				class="mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-mono tracking-widest uppercase bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors font-semibold"
			>
				{c.value.again}
			</button>
		{/if}
	</div>
{:else}
	<form onsubmit={handleSubmit} class="space-y-6 relative z-10">
		<!-- Honeypot -->
		<div class="hidden" aria-hidden="true">
			<label for="cf-hp">Do not fill this</label>
			<input type="text" id="cf-hp" tabindex="-1" autocomplete="off" bind:value={honeyPot} />
		</div>

		<div class="grid gap-6 sm:grid-cols-2">
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label for="cf-name" class={labelClass}>{c.value.labels.name}</label>
					<span
						class="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold"
						>{c.value.required}</span
					>
				</div>
				<input
					type="text"
					id="cf-name"
					required
					placeholder={c.value.ph.name}
					bind:value={name}
					class={fieldClass}
				/>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label for="cf-company" class={labelClass}>{c.value.labels.org}</label>
					<span class="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-semibold"
						>{c.value.optional}</span
					>
				</div>
				<input
					type="text"
					id="cf-company"
					placeholder={c.value.ph.org}
					bind:value={company}
					class={fieldClass}
				/>
			</div>
		</div>

		<div class="grid gap-6 sm:grid-cols-2">
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label for="cf-email" class={labelClass}>{c.value.labels.email}</label>
					<span
						class="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold"
						>{c.value.required}</span
					>
				</div>
				<input
					type="email"
					id="cf-email"
					required
					placeholder="taro@example.com"
					bind:value={email}
					class={fieldClass}
				/>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label for="cf-service" class={labelClass}>{c.value.labels.category}</label>
					<span
						class="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold"
						>{c.value.required}</span
					>
				</div>
				<select id="cf-service" bind:value={serviceType} class={fieldClass}>
					{#each serviceTypes as type, i}
						<option value={type} class="bg-white dark:bg-[#141414] text-[#1D1D1F] dark:text-white">
							{c.value.serviceTypes[i]}
						</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label for="cf-budget" class={labelClass}>{c.value.labels.budget}</label>
				<span class="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-semibold"
					>{c.value.optional}</span
				>
			</div>
			<input
				type="text"
				id="cf-budget"
				placeholder={c.value.ph.budget}
				bind:value={budgetDeadline}
				class={fieldClass}
			/>
		</div>

		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label for="cf-message" class={labelClass}>{c.value.labels.message}</label>
				<span
					class="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold"
					>{c.value.required}</span
				>
			</div>
			<textarea
				id="cf-message"
				required
				rows="5"
				placeholder={c.value.ph.message}
				bind:value={message}
				class="{fieldClass} resize-none"
			></textarea>
		</div>

		{#if status === 'error'}
			<div
				class="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-xs font-mono text-red-600 dark:text-red-400"
			>
				<AlertCircle class="h-5 w-5 shrink-0" />
				<p>{errorMessage}</p>
			</div>
		{/if}

		<button
			type="submit"
			disabled={status === 'submitting'}
			class="group relative flex w-full items-center justify-center gap-3 rounded-lg px-8 py-3.5 text-xs font-mono tracking-[0.2em] uppercase bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md font-semibold"
		>
			{#if status === 'submitting'}
				<Loader2 class="h-4 w-4 animate-spin" />
				<span>{c.value.sending}</span>
			{:else}
				<span>{c.value.send}</span>
				<ArrowRight
					class="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
				/>
			{/if}
		</button>
	</form>
{/if}
