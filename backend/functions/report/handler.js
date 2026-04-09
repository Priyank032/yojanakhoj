const connectDB = require('../../shared/utils/db');
const Session = require('../../shared/models/Session');
const Scheme = require('../../shared/models/Scheme');
const { ok, err } = require('../../shared/utils/response');
const PDFDocument = require('pdfkit');

function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

async function generatePDF(session, schemes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill('#16a34a');
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
      .text('Government Benefits Report', 50, 25);
    doc.fontSize(11).font('Helvetica')
      .text('YojanaKhoj — Apni Yojana Khojo', 50, 52);

    doc.moveDown(3).fillColor('#111827');

    // Profile Summary
    const p = session.profile;
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a').text('Your Profile');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#16a34a').stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#374151');
    doc.text(`State: ${p.state || 'N/A'}   |   Age: ${p.age || 'N/A'}   |   Occupation: ${(p.occupation || '').replace(/_/g, ' ')}   |   Annual Income: ${formatINR(p.annualIncome || 0)}`);
    doc.moveDown(1.5);

    // Summary Box
    const totalValue = schemes.reduce((s, sc) => s + (sc.benefit?.amount || 0), 0);
    doc.rect(50, doc.y, 495, 60).fill('#f0fdf4').stroke('#16a34a');
    const boxY = doc.y - 58;
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(13)
      .text(`You qualify for ${schemes.length} government schemes`, 65, boxY + 12);
    doc.font('Helvetica').fontSize(11).fillColor('#374151')
      .text(`Estimated annual benefit: ${formatINR(totalValue)}`, 65, boxY + 32);
    doc.moveDown(4);

    // Schemes
    const definite = schemes.filter(s => s.matchType === 'definite');
    const likely = schemes.filter(s => s.matchType !== 'definite');

    const renderSchemes = (list, label) => {
      if (!list.length) return;
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a').text(label);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#16a34a').stroke();
      doc.moveDown(0.5);

      for (const scheme of list) {
        if (doc.y > 720) doc.addPage();
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(`• ${scheme.name}`);
        doc.fontSize(10).font('Helvetica').fillColor('#374151')
          .text(`  Benefit: ${scheme.benefit?.description || 'N/A'}`, { indent: 15 });
        doc.text(`  Ministry: ${scheme.ministry}`, { indent: 15 });
        if (scheme.application?.portal) {
          doc.text(`  Apply at: ${scheme.application.portal}`, { indent: 15 });
        }
        doc.moveDown(0.8);
      }
      doc.moveDown(0.5);
    };

    renderSchemes(definite, 'Definitely Qualify');
    renderSchemes(likely, 'Likely Qualify');

    // Footer
    doc.fontSize(9).fillColor('#9ca3af')
      .text(`Generated on ${new Date().toLocaleDateString('en-IN')} by YojanaKhoj. Verify eligibility at official government portals before applying.`, 50, 780, { align: 'center' });

    doc.end();
  });
}

// POST /report/generate
async function generate(event) {
  try {
    await connectDB();
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { sessionId } = body;

    if (!sessionId) return err('INVALID_INPUT', 'sessionId is required');

    const session = await Session.findOne({ sessionId });
    if (!session) return err('SESSION_NOT_FOUND', 'Session not found', 404);
    if (!session.completed) return err('QUIZ_INCOMPLETE', 'Complete the quiz first');
    if (!session.matchedSchemes?.length) return err('NO_MATCHES', 'Run scheme matching first');

    // Fetch full scheme details
    const schemeIds = session.matchedSchemes.map(m => m.schemeId);
    const schemes = await Scheme.find({ schemeId: { $in: schemeIds } });

    // Attach matchType from session
    const enriched = schemes.map(s => {
      const match = session.matchedSchemes.find(m => m.schemeId === s.schemeId);
      return { ...s.toObject(), matchType: match?.matchType || 'likely' };
    });

    const pdfBuffer = await generatePDF(session, enriched);
    const base64 = pdfBuffer.toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64}`;

    // In production: upload to S3 and return presigned URL
    // For now: return base64 data URL
    session.reportUrl = dataUrl.substring(0, 100) + '...'; // store truncated ref
    await session.save();

    return ok({ sessionId, reportData: base64, filename: `benefits-report-${sessionId.slice(0, 8)}.pdf` });
  } catch (e) {
    console.error('report/generate error:', e);
    return err('SERVER_ERROR', e.message, 500);
  }
}

module.exports = { generate };
