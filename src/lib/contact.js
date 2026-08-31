// Web3Forms access key — a PUBLIC key by design (rate-limited, bound only to the
// momoyama.tech@gmail.com inbox). Safe to ship in client code.
const WEB3FORMS_ACCESS_KEY = 'b15f194a-6a4c-48bb-ad97-f8ff5bb468d2';

/**
 * Send a contact inquiry via Web3Forms → delivered to momoyama.tech@gmail.com.
 *
 * Web3Forms' free tier only accepts requests from the browser, so this runs
 * client-side (no server endpoint / env vars needed).
 *
 * @param {{
 *   name: string,
 *   email: string,
 *   message: string,
 *   company?: string,
 *   serviceType?: string,
 *   budgetDeadline?: string,
 *   honeyPot?: string
 * }} data
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function submitInquiry({
	name,
	email,
	message,
	company = '',
	serviceType = '',
	budgetDeadline = '',
	honeyPot = ''
}) {
	try {
		const res = await fetch('https://api.web3forms.com/submit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify({
				access_key: WEB3FORMS_ACCESS_KEY,
				subject: `【お問い合わせ】${serviceType ? `[${serviceType}] ` : ''}${name}様より`,
				from_name: '桃山学院大学テック部 公式サイト',
				name,
				email,
				replyto: email,
				botcheck: honeyPot || '',
				'会社・組織名': company || '未入力',
				ご相談種別: serviceType || '未指定',
				'ご予算・希望納期': budgetDeadline || '未入力',
				message
			})
		});
		const data = await res.json().catch(() => ({}));
		if (res.ok && data.success) return { ok: true };
		return {
			ok: false,
			error: data.message || '送信に失敗しました。時間をおいて再度お試しください。'
		};
	} catch {
		return { ok: false, error: '通信エラーが発生しました。時間をおいて再度お試しください。' };
	}
}
