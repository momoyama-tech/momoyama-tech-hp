<script>
	import Mail from 'lucide-svelte/icons/mail';
	import { spotlight } from '$lib/actions/spotlight.js';
	import { localize } from '$lib/i18n/localize.svelte.js';
	import ContactForm from './ContactForm.svelte';

	const jp = {
		heading: 'お問い合わせ',
		lead: '学生エンジニアへのWeb・システム開発依頼、映像演出・イベント制作、学生プロジェクトとの共創など、まずはお気軽にご相談ください。'
	};
	const c = localize(() => jp);
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
				<p
					class="font-mono text-xs tracking-[0.25em] text-cyan-600 dark:text-cyan-400 uppercase font-semibold"
				>
					Contact & Consultation
				</p>
			</div>

			<div>
				<h2
					class="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#1D1D1F] dark:text-white mb-4"
				>
					{c.value.heading}
				</h2>
				<p class="text-zinc-600 dark:text-zinc-300 text-base max-w-2xl leading-relaxed">
					{c.value.lead}
				</p>
			</div>

			<div class="mt-8 relative h-px w-full bg-black/10 dark:bg-white/10 overflow-hidden">
				<div
					class="absolute inset-0 bg-linear-to-r from-cyan-500/50 via-black/10 dark:via-white/20 to-transparent"
				></div>
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
			<div
				class="relative z-10 flex items-center justify-between pb-6 mb-8 border-b border-black/10 dark:border-white/10"
			>
				<div class="flex items-center gap-3">
					<div class="w-6 h-0.5 bg-cyan-400"></div>
					<span
						class="font-mono text-[11px] tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase font-medium"
					>
						ONLINE INQUIRY FORM
					</span>
				</div>
				<Mail class="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
			</div>

			<ContactForm variant="inline" />
		</div>
	</div>
</section>
