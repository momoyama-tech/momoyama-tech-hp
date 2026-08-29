<script>
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import Mail from 'lucide-svelte/icons/mail';
	import { spotlight } from '$lib/actions/spotlight.js';
	import { localize } from '$lib/i18n/localize.svelte.js';

	const serviceTypes = [
		'Webサイト・LP制作',
		'業務ツール・システム開発',
		'プロジェクションマッピング・映像制作',
		'プログラミング教室・ワークショップ',
		'学生プロジェクト・共創のご相談',
		'その他'
	];

	const jp = {
		heading: 'お問い合わせ',
		lead: '学生エンジニアへのWeb・システム開発依頼、映像演出・イベント制作、学生プロジェクトとの共創など、まずはお気軽にご相談ください。',
		successTitle: '送信が完了いたしました',
		successBody:
			'お問い合わせいただき誠にありがとうございます。内容を確認の上、担当者より通常2〜3営業日以内にご連絡差し上げます。',
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
		serviceTypes,
		errSend: '送信に失敗しました。時間をおいて再送信してください。',
		errNetwork: '通信エラーが発生しました。時間をおいて再度お試しください。'
	};
	const c = localize(() => jp);

	let name = $state('');
	let company = $state('');
	let email = $state('');
	let serviceType = $state('Webサイト・LP制作');
	let budgetDeadline = $state('');
	let message = $state('');
	let honeyPot = $state('');

	/** @type {'idle' | 'submitting' | 'success' | 'error'} */
	let status = $state('idle');
	let errorMessage = $state('');

	/** @param {SubmitEvent} e */
	async function handleSubmit(e) {
		e.preventDefault();

		if (status === 'submitting') return;

		if (honeyPot) {
			status = 'success';
			return;
		}

		status = 'submitting';
		errorMessage = '';

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					company,
					email,
					serviceType,
					budgetDeadline,
					message,
					_hp: honeyPot
				})
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				throw new Error(data.error || c.value.errSend);
			}

			status = 'success';
			name = '';
			company = '';
			email = '';
			serviceType = 'Webサイト・LP制作';
			budgetDeadline = '';
			message = '';
		} catch (err) {
			console.error('Contact Form Error:', err);
			status = 'error';
			errorMessage =
				err instanceof Error
					? err.message
					: c.value.errNetwork;
		}
	}
</script>

<section
	id="contact-form"
	class="relative py-24 z-20 overflow-hidden text-[#1D1D1F] dark:text-white"
	style="scroll-margin-top: 80px;"
>
	<!-- Ambient Glow Layers -->
	<div
		class="w-[500px] h-[500px] rounded-full bg-cyan-500/4 blur-[140px] pointer-events-none absolute -top-20 -left-20"
		aria-hidden="true"
	></div>
	<div
		class="w-[600px] h-[600px] rounded-full bg-purple-500/3 blur-[160px] pointer-events-none absolute -bottom-24 -right-24"
		aria-hidden="true"
	></div>

	<div class="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12 relative z-10">
		<!-- Section Header -->
		<div class="mb-16">
			<div class="mb-3">
				<p class="font-mono text-xs tracking-[0.25em] text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
					Contact & Consultation
				</p>
			</div>

			<div>
				<h2 class="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#1D1D1F] dark:text-white mb-4">
					{c.value.heading}
				</h2>
				<p class="text-zinc-600 dark:text-zinc-300 text-base max-w-2xl leading-relaxed">
					{c.value.lead}
				</p>
			</div>

			<div class="mt-8 relative h-px w-full bg-black/10 dark:bg-white/10 overflow-hidden">
				<div class="absolute inset-0 bg-linear-to-r from-cyan-500/50 via-black/10 dark:via-white/20 to-transparent"></div>
			</div>
		</div>

		<!-- Form Container with Spotlight Effect -->
		<div
			use:spotlight
			class="group relative rounded-2xl p-8 sm:p-12 md:p-14 bg-white/70 dark:bg-[#141414]/90 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 backdrop-blur-md shadow-2xl transition-all duration-500 overflow-hidden"
		>
			<!-- Mouse-following Spotlight Layer -->
			<div
				class="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				style="background: radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.06), transparent 40%);"
			></div>

			<!-- Top Card Header -->
			<div class="relative z-10 flex items-center justify-between pb-6 mb-8 border-b border-black/10 dark:border-white/10">
				<div class="flex items-center gap-3">
					<div class="w-6 h-0.5 bg-cyan-400"></div>
					<span class="font-mono text-[11px] tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase font-medium">
						ONLINE INQUIRY FORM
					</span>
				</div>
				<Mail class="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
			</div>

			{#if status === 'success'}
				<!-- Success State -->
				<div class="relative z-10 py-16 text-center flex flex-col items-center justify-center">
					<div
						class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
					>
						<CheckCircle2 class="h-8 w-8 stroke-2" />
					</div>
					<h3 class="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-3">
						{c.value.successTitle}
					</h3>
					<p class="text-zinc-600 dark:text-zinc-300 max-w-md text-sm leading-relaxed mb-8 font-normal">
						{c.value.successBody}
					</p>
					<button
						type="button"
						onclick={() => (status = 'idle')}
						class="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-mono tracking-widest uppercase bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors font-semibold"
					>
						Reopen Form
					</button>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-8 relative z-10">
					<!-- Honeypot -->
					<div class="hidden" aria-hidden="true">
						<label for="hp_field_min">Do not fill this</label>
						<input
							type="text"
							id="hp_field_min"
							name="hp_field"
							tabindex="-1"
							autocomplete="off"
							bind:value={honeyPot}
						/>
					</div>

					<!-- Row 1: Name & Company -->
					<div class="grid gap-8 sm:grid-cols-2">
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="c-name" class="font-mono text-xs tracking-wider text-zinc-600 dark:text-zinc-300 uppercase font-medium">
									{c.value.labels.name}
								</label>
								<span class="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">Required</span>
							</div>
							<input
								type="text"
								id="c-name"
								name="name"
								required
								placeholder={c.value.ph.name}
								bind:value={name}
								class="w-full rounded-lg px-4 py-3.5 text-sm bg-zinc-50 dark:bg-[#0a0a0a] text-[#1D1D1F] dark:text-white border border-black/10 dark:border-white/15 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
							/>
						</div>

						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="c-company" class="font-mono text-xs tracking-wider text-zinc-600 dark:text-zinc-300 uppercase font-medium">
									{c.value.labels.org}
								</label>
								<span class="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Optional</span>
							</div>
							<input
								type="text"
								id="c-company"
								name="company"
								placeholder={c.value.ph.org}
								bind:value={company}
								class="w-full rounded-lg px-4 py-3.5 text-sm bg-zinc-50 dark:bg-[#0a0a0a] text-[#1D1D1F] dark:text-white border border-black/10 dark:border-white/15 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
							/>
						</div>
					</div>

					<!-- Row 2: Email & Service Type -->
					<div class="grid gap-8 sm:grid-cols-2">
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="c-email" class="font-mono text-xs tracking-wider text-zinc-600 dark:text-zinc-300 uppercase font-medium">
									{c.value.labels.email}
								</label>
								<span class="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">Required</span>
							</div>
							<input
								type="email"
								id="c-email"
								name="email"
								required
								placeholder="taro@example.com"
								bind:value={email}
								class="w-full rounded-lg px-4 py-3.5 text-sm bg-zinc-50 dark:bg-[#0a0a0a] text-[#1D1D1F] dark:text-white border border-black/10 dark:border-white/15 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
							/>
						</div>

						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="c-service" class="font-mono text-xs tracking-wider text-zinc-600 dark:text-zinc-300 uppercase font-medium">
									{c.value.labels.category}
								</label>
								<span class="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">Required</span>
							</div>
							<select
								id="c-service"
								name="serviceType"
								bind:value={serviceType}
								class="w-full rounded-lg px-4 py-3.5 text-sm bg-zinc-50 dark:bg-[#0a0a0a] text-[#1D1D1F] dark:text-white border border-black/10 dark:border-white/15 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
							>
								{#each serviceTypes as type, i}
									<option value={type} class="bg-white dark:bg-[#141414] text-[#1D1D1F] dark:text-white">
										{c.value.serviceTypes[i]}
									</option>
								{/each}
							</select>
						</div>
					</div>

					<!-- Row 3: Budget & Timeline -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<label for="c-budget" class="font-mono text-xs tracking-wider text-zinc-600 dark:text-zinc-300 uppercase font-medium">
								{c.value.labels.budget}
							</label>
							<span class="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Optional</span>
						</div>
						<input
							type="text"
							id="c-budget"
							name="budgetDeadline"
							placeholder={c.value.ph.budget}
							bind:value={budgetDeadline}
							class="w-full rounded-lg px-4 py-3.5 text-sm bg-zinc-50 dark:bg-[#0a0a0a] text-[#1D1D1F] dark:text-white border border-black/10 dark:border-white/15 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
						/>
					</div>

					<!-- Row 4: Message -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<label for="c-message" class="font-mono text-xs tracking-wider text-zinc-600 dark:text-zinc-300 uppercase font-medium">
								{c.value.labels.message}
							</label>
							<span class="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">Required</span>
						</div>
						<textarea
							id="c-message"
							name="message"
							required
							rows="5"
							placeholder={c.value.ph.message}
							bind:value={message}
							class="w-full resize-none rounded-lg px-4 py-3.5 text-sm bg-zinc-50 dark:bg-[#0a0a0a] text-[#1D1D1F] dark:text-white border border-black/10 dark:border-white/15 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
						></textarea>
					</div>

					<!-- Error Message -->
					{#if status === 'error'}
						<div
							class="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-xs font-mono text-red-600 dark:text-red-400"
						>
							<AlertCircle class="h-5 w-5 shrink-0" />
							<p>{errorMessage}</p>
						</div>
					{/if}

					<!-- Submit Button -->
					<div class="pt-4 flex justify-end">
						<button
							type="submit"
							disabled={status === 'submitting'}
							class="group relative inline-flex items-center gap-3 rounded-lg px-8 py-3.5 text-xs font-mono tracking-[0.2em] uppercase bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md font-semibold"
						>
							{#if status === 'submitting'}
								<Loader2 class="h-4 w-4 animate-spin" />
								<span>Sending...</span>
							{:else}
								<span>Send Inquiry</span>
								<ArrowRight class="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
							{/if}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</section>
