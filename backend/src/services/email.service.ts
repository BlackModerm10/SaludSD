import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: nodemailer.Transporter;

// Initialize mail transporter
const initTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    // Real SMTP configuration
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log('Nodemailer: usando SMTP de producción configurado en .env');
  } else {
    // Ethereal fallback for local development testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('----------------------------------------------------');
      console.log('Nodemailer: Configuración de prueba de Ethereal creada.');
      console.log(`Usuario: ${testAccount.user}`);
      console.log(`Contraseña: ${testAccount.pass}`);
      console.log('----------------------------------------------------');
    } catch (err) {
      console.error('Nodemailer: error al inicializar cuenta de prueba:', err);
    }
  }
  return transporter;
};

// Base HTML wrapper to keep Gov design consistency
const getBaseHtml = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 0; color: #333333; }
    .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background-color: #006FB3; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .body-content { padding: 32px 24px; line-height: 1.6; font-size: 15px; }
    .footer { background-color: #0A132D; padding: 20px; text-align: center; color: #a8b7c7; font-size: 12px; }
    .footer a { color: #fe6565; text-decoration: none; }
    .btn { display: inline-block; background-color: #006FB3; color: #ffffff !important; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 4px; margin-top: 16px; text-align: center; }
    .tag { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; text-transform: uppercase; }
    .tag.info { background-color: #e3f0ff; color: #006FB3; }
    .tag.success { background-color: #d4edda; color: #155724; }
    .tag.warning { background-color: #fff3cd; color: #856404; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>SaludSD</h1>
    </div>
    <div class="body-content">
      ${content}
    </div>
    <div class="footer">
      <p>Municipalidad de Santo Domingo • Departamento de Salud Pública</p>
      <p>Este es un correo automático, por favor no responda directamente.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send an email helper.
 */
export async function sendEmail(to: string, subject: string, htmlContent: string) {
  try {
    const client = await initTransporter();
    if (!client) {
      console.warn('Nodemailer: cliente de correo no inicializado.');
      return;
    }
    
    const info = await client.sendMail({
      from: '"SaludSD Santo Domingo" <no-reply@saludsd.cl>',
      to,
      subject,
      html: htmlContent
    });

    console.log(`Nodemailer: Correo enviado con ID ${info.messageId}`);
    // If using Ethereal, print preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Nodemailer Preview URL: ${previewUrl}`);
    }
  } catch (err) {
    console.error('Nodemailer: error al enviar correo:', err);
  }
}

/**
 * Welcome Email Template.
 */
export async function sendWelcomeEmail(to: string, nombre: string) {
  const content = `
    <h2>¡Hola ${nombre}!</h2>
    <p>Te damos una cordial bienvenida a <strong>SaludSD</strong>, el portal de salud digital de la Ilustre Municipalidad de Santo Domingo.</p>
    <p>A partir de ahora, podrás solicitar citas médicas, revisar tu posición en las listas de espera, consultar tu historial de atenciones clínicas y recibir notificaciones instantáneas sobre tu salud.</p>
    <p>Tu cuenta ha sido creada exitosamente. Te invitamos a ingresar al portal y completar tu información de contacto.</p>
    <div style="text-align: center;">
      <a href="http://localhost:5173/login" class="btn">Ingresar a SaludSD</a>
    </div>
  `;
  await sendEmail(to, 'Bienvenido a SaludSD Santo Domingo', getBaseHtml('Bienvenido', content));
}

/**
 * Appointment Confirmation Email Template.
 */
export async function sendAppointmentEmail(to: string, nombre: string, especialidad: string, medico: string, fecha: string, hora: string, centro: string) {
  const content = `
    <h2>Confirmación de Cita Médica</h2>
    <p>Estimado/a ${nombre},</p>
    <p>Le informamos que se ha programado y confirmado su cita médica en nuestro sistema:</p>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #006FB3; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>Especialidad:</strong> ${especialidad}</p>
      <p style="margin: 4px 0;"><strong>Médico:</strong> ${medico}</p>
      <p style="margin: 4px 0;"><strong>Fecha:</strong> ${fecha}</p>
      <p style="margin: 4px 0;"><strong>Hora:</strong> ${hora} hrs</p>
      <p style="margin: 4px 0;"><strong>Centro de Salud:</strong> ${centro}</p>
    </div>
    <p>Le solicitamos presentarse con al menos 15 minutos de anticipación portando su cédula de identidad.</p>
    <p>Si necesita cancelar o reagendar esta hora, le solicitamos hacerlo a través del portal con al menos 24 horas de anticipación.</p>
  `;
  await sendEmail(to, `Cita Médica Confirmada - ${especialidad}`, getBaseHtml('Cita Médica Confirmada', content));
}

/**
 * Waitlist Status Update Email Template.
 */
export async function sendWaitlistEmail(to: string, nombre: string, especialidad: string, centro: string, estado: string, posicion?: number) {
  const isProgrammed = estado === 'programada';
  const statusLabel = isProgrammed ? 'Programada' : estado === 'en_espera' ? 'En espera' : estado;
  
  const content = `
    <h2>Actualización de tu Lista de Espera</h2>
    <p>Estimado/a ${nombre},</p>
    <p>Te informamos que tu solicitud en la lista de espera de especialidad ha registrado una actualización:</p>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #fe6565; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>Especialidad:</strong> ${especialidad}</p>
      <p style="margin: 4px 0;"><strong>Centro de Salud:</strong> ${centro}</p>
      <p style="margin: 4px 0;"><strong>Nuevo Estado:</strong> <span class="tag ${isProgrammed ? 'success' : 'warning'}">${statusLabel}</span></p>
      ${posicion ? `<p style="margin: 4px 0;"><strong>Posición Actual:</strong> #${posicion}</p>` : ''}
    </div>
    ${isProgrammed 
      ? '<p><strong>¡Excelente noticia!</strong> Tu turno ha llegado y tu cita ha sido programada. Por favor revisa los detalles de tu cita en tu correo de confirmación o en el portal de SaludSD.</p>' 
      : '<p>Continuamos gestionando tu solicitud según las prioridades clínicas del centro de salud.</p>'}
    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:5173/paciente/lista-espera" class="btn">Ver mi Lista de Espera</a>
    </div>
  `;
  await sendEmail(to, `Actualización de Lista de Espera - ${especialidad}`, getBaseHtml('Actualización de Lista de Espera', content));
}

/**
 * Password Recovery OTP Email Template.
 */
export async function sendRecoveryEmail(to: string, nombre: string, otp: string) {
  const content = `
    <h2>Recuperación de Contraseña</h2>
    <p>Hola ${nombre},</p>
    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de SaludSD.</p>
    <p>Utiliza el siguiente código de verificación temporal (OTP) para proceder con el cambio:</p>
    <div style="text-align: center; margin: 24px 0;">
      <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #006FB3; padding: 12px 30px; font-size: 28px; font-weight: 700; letter-spacing: 5px; color: #0A132D; border-radius: 6px;">
        ${otp}
      </div>
    </div>
    <p style="color: #666; font-size: 13px;">Este código es válido por los próximos 15 minutos. Si no has solicitado este cambio, puedes ignorar este correo de forma segura.</p>
  `;
  await sendEmail(to, 'Código de Recuperación de Contraseña - SaludSD', getBaseHtml('Recuperación de Contraseña', content));
}
