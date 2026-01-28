import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import { fail } from '@sveltejs/kit';

const resend = new Resend(RESEND_API_KEY);

/** @type {import('./$types').Actions} */
export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const name = String(formData.get('name'));
        const email = String(formData.get('email'));
        const content = String(formData.get('content'));

        if (!name || !email || !content) {
            return fail(400, { missing: true });
        }

        try {
            // 1. Send notification to admin
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'tech@andrew.ac.jp',
                replyTo: email,
                subject: `【Momo Tech】公式サイトよりお問い合わせ（${name}様）`,
                html: `
					<h2>公式サイトからのお問い合わせ</h2>
					<p><strong>お名前:</strong> ${name}</p>
					<p><strong>メールアドレス:</strong> ${email}</p>
					<hr />
					<p><strong>お問い合わせ内容:</strong></p>
					<p style="white-space: pre-wrap;">${content}</p>
				`
            });

            // 2. Send auto-reply to user
            await resend.emails.send({
                from: 'Momoyama Tech <tech@andrew.ac.jp>', // Or use the onboarding/verified domain
                // Note: For 'onboarding@resend.dev', you can only send to yourself unless verified.
                // Since I don't know if they have a domain, I'll assume they might need to verify 'tech@andrew.ac.jp' or use the resend domain.
                // Safest is to try sending to the user's email if possible, but Resend free tier restricts this.
                // For now, I will comment this out or make it safe.
                // Actually, let's try to send it. If it fails, we catch it.
                to: email,
                subject: '【桃山学院大学テック部】お問い合わせありがとうございます',
                html: `
					<p>${name} 様</p>
					<p>この度は、桃山学院大学テック部へお問い合わせいただきありがとうございます。<br>
					以下の内容で受け付けました。</p>
					<hr />
					<p style="white-space: pre-wrap;">${content}</p>
					<hr />
					<p>確認次第、担当者よりご連絡いたします。</p>
					<p>※このメールは自動送信されています。</p>
				`
            });

            return { success: true };
        } catch (error) {
            console.error('Resend Error:', error);
            return fail(500, { success: false, error: 'Failed to send email' });
        }
    }
};
