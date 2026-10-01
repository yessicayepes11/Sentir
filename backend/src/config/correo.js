import nodemailer from 'nodemailer';

// Envío de correos de la app (usa la misma cuenta que los PIN de recuperación).
// .env: SMTP_SERVICE, SMTP_USER, SMTP_PASS (contraseña de aplicación de Gmail)

const smtpUser = String(process.env.SMTP_USER || '').trim();
const smtpPass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
    service: String(process.env.SMTP_SERVICE || 'gmail').trim(),
    auth: { user: smtpUser, pass: smtpPass }
});

export const correoConfigurado = () => Boolean(smtpUser && smtpPass);

export async function enviarCorreo({ para, asunto, texto, html }) {
    if (!correoConfigurado()) {
        throw new Error('Faltan SMTP_USER / SMTP_PASS en el archivo .env');
    }

    return transporter.sendMail({
        from: `"Sentir" <${smtpUser}>`,
        to: para,
        subject: asunto,
        text: texto,
        html
    });
}
