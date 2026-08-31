import { json } from '@sveltejs/kit';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { name, company, email, serviceType, budgetDeadline, message, _hp } = body;

		// 1. Spam protection via honeypot
		if (_hp) {
			// Silently ignore spam
			return json({ success: true, message: 'Message received' });
		}

		// 2. Validate required fields
		if (!name || !email || !message) {
			return json(
				{ success: false, error: 'お名前、メールアドレス、ご相談内容は必須項目です。' },
				{ status: 400 }
			);
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json(
				{ success: false, error: '有効なメールアドレスを入力してください。' },
				{ status: 400 }
			);
		}

		const resendApiKey = env.RESEND_API_KEY;
		const receiveEmail = env.CONTACT_RECEIVE_EMAIL || 'momoyama.tech@gmail.com';
		const discordWebhookUrl = env.DISCORD_WEBHOOK_URL;
		// Sender address. Before a domain is verified in Resend this must stay
		// `onboarding@resend.dev`; after verifying momotech.club, set
		// MAIL_FROM="Momoyama Tech <noreply@momotech.club>" in the host env.
		const mailFrom = env.MAIL_FROM || 'Momoyama Tech <onboarding@resend.dev>';

		let emailSent = false;
		let discordSent = false;

		// 3. Send email via Resend if API key is provided
		if (resendApiKey) {
			try {
				const resend = new Resend(resendApiKey);

				// Admin notification email
				const adminEmailHtml = `
				<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
					<h2 style="color: #0f172a; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-top: 0;">
						【公式サイト】新規お問い合わせ・ご相談を受信しました
					</h2>
					<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
						<tr>
							<td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 140px;">お名前:</td>
							<td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${name}</td>
						</tr>
						<tr>
							<td style="padding: 8px 0; color: #64748b; font-weight: bold;">貴社・組織名:</td>
							<td style="padding: 8px 0; color: #0f172a;">${company || '未入力'}</td>
						</tr>
						<tr>
							<td style="padding: 8px 0; color: #64748b; font-weight: bold;">メールアドレス:</td>
							<td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #0284c7;">${email}</a></td>
						</tr>
						<tr>
							<td style="padding: 8px 0; color: #64748b; font-weight: bold;">ご相談種別:</td>
							<td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${serviceType || '未指定'}</td>
						</tr>
						<tr>
							<td style="padding: 8px 0; color: #64748b; font-weight: bold;">ご予算・希望納期:</td>
							<td style="padding: 8px 0; color: #0f172a;">${budgetDeadline || '未入力'}</td>
						</tr>
					</table>
					<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
					<div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #06b6d4;">
						<p style="margin: 0 0 8px 0; font-weight: bold; color: #334155;">ご相談・ご要望の詳細:</p>
						<p style="margin: 0; white-space: pre-wrap; color: #1e293b; line-height: 1.6;">${message}</p>
					</div>
					<p style="color: #94a3b8; font-size: 12px; margin-top: 25px; text-align: center;">
						桃山学院大学テック部 公式Webサイト システム通知
					</p>
				</div>
			`;

				await resend.emails.send({
					from: mailFrom,
					to: receiveEmail,
					replyTo: email,
					subject: `【お問い合わせ】${serviceType ? `[${serviceType}] ` : ''}${name}様より`,
					html: adminEmailHtml
				});
				emailSent = true;

				// User Auto-Reply confirmation email
				const userReplyHtml = `
				<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
					<h2 style="color: #0f172a; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-top: 0;">
						お問い合わせありがとうございます
					</h2>
					<p style="color: #334155; line-height: 1.6;">
						${name} 様<br><br>
						この度は、桃山学院大学テック部へお問い合わせいただき誠にありがとうございます。<br>
						以下の内容でお問い合わせを受け付けました。
					</p>
					<div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
						<p style="margin: 0 0 8px 0;"><strong>ご相談種別:</strong> ${serviceType || '未指定'}</p>
						<p style="margin: 0 0 8px 0;"><strong>ご予算・希望納期:</strong> ${budgetDeadline || '未入力'}</p>
						<p style="margin: 0 0 8px 0;"><strong>お問い合わせ内容:</strong></p>
						<p style="margin: 0; white-space: pre-wrap; color: #475569;">${message}</p>
					</div>
					<p style="color: #334155; line-height: 1.6;">
						内容を確認の上、担当者より通常2〜3営業日以内にご連絡差し上げます。<br>
						今しばらくお待ちくださいますようお願い申し上げます。
					</p>
					<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
					<p style="color: #64748b; font-size: 13px; line-height: 1.5;">
						<strong>桃山学院大学テック部 (Momoyama Tech Club)</strong><br>
						Web: <a href="https://momotech.club" style="color: #0284c7;">https://momotech.club</a><br>
						Email: ${receiveEmail}
					</p>
					<p style="color: #94a3b8; font-size: 11px; margin-top: 15px;">
						※このメールは送信専用アドレスから自動送信されています。
					</p>
				</div>
			`;

				try {
					await resend.emails.send({
						from: mailFrom,
						to: email,
						subject: '【桃山学院大学テック部】お問い合わせを受け付けました（自動送信）',
						html: userReplyHtml
					});
				} catch (replyErr) {
					console.warn('Auto-reply email failed:', replyErr);
					// Do not fail the whole request if auto-reply fails
				}
			} catch (mailErr) {
				// Email failed entirely (bad key, unverified sender domain, …).
				// Fall through so a configured Discord webhook can still deliver.
				console.error('Email delivery failed:', mailErr);
			}
		} else {
			console.warn('RESEND_API_KEY is not set. Email not sent.');
		}

		// 4. Send Discord Webhook Notification if URL is configured
		if (discordWebhookUrl) {
			try {
				const dcRes = await fetch(discordWebhookUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						username: 'Momoyama Tech Contact Bot',
						avatar_url: 'https://momotech.club/ogp.png',
						embeds: [
							{
								title: '📩 新規お問い合わせ・ご相談',
								color: 0x06b6d4, // Cyan
								fields: [
									{ name: '👤 お名前', value: name, inline: true },
									{ name: '🏢 会社・組織名', value: company || '未入力', inline: true },
									{ name: '✉️ メールアドレス', value: email, inline: false },
									{ name: '🏷️ ご相談種別', value: serviceType || '未指定', inline: true },
									{ name: '💰 ご予算・希望納期', value: budgetDeadline || '未入力', inline: true },
									{
										name: '📝 内容',
										value: message.length > 1000 ? message.slice(0, 1000) + '...' : message,
										inline: false
									}
								],
								timestamp: new Date().toISOString(),
								footer: { text: '桃山学院大学テック部 公式Webサイト' }
							}
						]
					})
				});
				discordSent = dcRes.ok;
			} catch (discordErr) {
				console.error('Discord Webhook notification failed:', discordErr);
				// Non-critical, continue
			}
		}

		// If nothing was actually delivered, tell the user instead of a false success.
		if (!emailSent && !discordSent) {
			console.error(
				'Contact form: no delivery channel configured (RESEND_API_KEY / DISCORD_WEBHOOK_URL).'
			);
			return json(
				{
					success: false,
					error: '現在お問い合わせを受け付けられません。お手数ですが直接メールでご連絡ください。'
				},
				{ status: 503 }
			);
		}

		return json({ success: true, message: 'お問い合わせを送信しました。' });
	} catch (error) {
		console.error('API Contact Error:', error);
		return json(
			{
				success: false,
				error: 'サーバー内部エラーが発生しました。時間をおいて再送信してください。'
			},
			{ status: 500 }
		);
	}
}
