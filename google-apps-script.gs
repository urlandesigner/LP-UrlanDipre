/**
 * UD Labs — Briefing → Google Sheets
 * ----------------------------------------------------------------------------
 * Recebe os leads do formulário público (briefing.html) e grava na planilha.
 *
 * COMO USAR (resumo — passo a passo completo no chat):
 *  1. Crie uma Planilha Google nova.
 *  2. Menu  Extensões ▸ Apps Script.
 *  3. Apague o conteúdo padrão e cole TODO este arquivo.
 *  4. Clique em  Implantar ▸ Nova implantação ▸ tipo "App da Web".
 *       - Executar como: Eu mesmo
 *       - Quem tem acesso: Qualquer pessoa
 *  5. Copie a URL gerada (termina em /exec) e cole na constante
 *     ENDPOINT dentro de briefing.html.
 * ----------------------------------------------------------------------------
 */

// Nome da aba onde os leads serão gravados (criada automaticamente se não existir).
const SHEET_NAME = 'Leads';

// Ordem das colunas (cabeçalho). Mantenha igual aos campos enviados pelo form.
const HEADERS = [
  'Data/Hora', 'Status', 'Nome', 'E-mail', 'WhatsApp',
  'Empresa', 'Segmento', 'Cidade', 'Estado', 'Site', 'Instagram',
  'Tipo de Projeto', 'Objetivo', 'Prazo', 'Investimento',
  'Referências', 'Observações', 'Origem',
  'IA · Resumo', 'IA · Complexidade', 'IA · Escopo Sugerido', 'IA · Faixa de Valor'
];

// Receba um e-mail a cada novo lead. Deixe '' para desativar.
const NOTIFY_EMAIL = 'urlan87@gmail.com';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(30000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    sheet.appendRow([
      data.dataHora || new Date().toLocaleString('pt-BR'),
      data.status || 'Novo Lead',
      data.nome || '',
      data.email || '',
      data.whatsapp || '',
      data.empresa || '',
      data.segmento || '',
      data.cidade || '',
      data.estado || '',
      data.site || '',
      data.instagram || '',
      data.tipoProjeto || '',
      data.objetivo || '',
      data.prazo || '',
      data.investimento || '',
      data.referencias || '',
      data.observacoes || '',
      data.origem || 'Formulário Público',
      data.iaResumo || '',
      data.iaComplexidade || '',
      data.iaEscopo || '',
      data.iaFaixaValor || ''
    ]);

    notify_(data);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, msg: 'UD Labs briefing endpoint ativo.' });
}

/**
 * Envia um e-mail de aviso a cada novo lead.
 * Falhas no e-mail não derrubam a gravação na planilha.
 */
function notify_(data) {
  if (!NOTIFY_EMAIL) return;
  try {
    const wa = String(data.whatsapp || '').replace(/\D/g, '');
    const linkWa = wa ? ('https://wa.me/55' + wa.replace(/^55/, '')) : '';
    const assunto = '🚀 Novo lead: ' + (data.nome || 'Sem nome') +
      (data.tipoProjeto ? ' · ' + data.tipoProjeto : '');

    const linha = (rotulo, valor) => valor
      ? '<tr><td style="padding:6px 14px 6px 0;color:#6b6b6b;white-space:nowrap;vertical-align:top">' +
        rotulo + '</td><td style="padding:6px 0;color:#111">' + valor + '</td></tr>'
      : '';

    const html =
      '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#111">' +
        '<div style="background:#0B0A0F;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">' +
          '<div style="font-size:18px;font-weight:bold">UD Labs · Novo lead</div>' +
          '<div style="color:#A255FD;font-size:13px;margin-top:2px">' + (data.dataHora || '') + '</div>' +
        '</div>' +
        '<div style="border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;padding:18px 24px">' +
          '<table style="border-collapse:collapse;font-size:14px;width:100%">' +
            linha('Nome', data.nome) +
            linha('E-mail', data.email) +
            linha('WhatsApp', wa ? ('<a href="' + linkWa + '">' + data.whatsapp + '</a>') : '') +
            linha('Empresa', data.empresa) +
            linha('Segmento', data.segmento) +
            linha('Local', [data.cidade, data.estado].filter(String).join(' / ')) +
            linha('Site', data.site) +
            linha('Instagram', data.instagram) +
          '</table>' +
          '<hr style="border:none;border-top:1px solid #eee;margin:14px 0">' +
          '<table style="border-collapse:collapse;font-size:14px;width:100%">' +
            linha('Projeto', data.tipoProjeto) +
            linha('Objetivo', data.objetivo) +
            linha('Prazo', data.prazo) +
            linha('Investimento', data.investimento) +
            linha('Referências', data.referencias) +
            linha('Observações', data.observacoes) +
          '</table>' +
          '<div style="background:#F5F0FF;border-radius:10px;padding:14px 16px;margin-top:16px">' +
            '<div style="font-size:12px;font-weight:bold;color:#7120D1;letter-spacing:.06em">ANÁLISE AUTOMÁTICA</div>' +
            '<table style="border-collapse:collapse;font-size:14px;width:100%;margin-top:6px">' +
              linha('Resumo', data.iaResumo) +
              linha('Complexidade', data.iaComplexidade) +
              linha('Escopo', data.iaEscopo) +
              linha('Faixa de valor', data.iaFaixaValor) +
            '</table>' +
          '</div>' +
          (linkWa ? ('<a href="' + linkWa + '" style="display:inline-block;margin-top:18px;background:#25D366;color:#fff;text-decoration:none;padding:11px 20px;border-radius:999px;font-weight:bold;font-size:14px">Responder no WhatsApp</a>') : '') +
        '</div>' +
      '</div>';

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: assunto,
      htmlBody: html,
      replyTo: data.email || NOTIFY_EMAIL,
      name: 'UD Labs · Briefing'
    });
  } catch (err) {
    // não interrompe a gravação do lead
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Rode esta função UMA vez no editor (botão ▶ Executar) para autorizar o
 * envio de e-mail e receber um exemplo da notificação no seu e-mail.
 */
function testarEmail() {
  notify_({
    dataHora: new Date().toLocaleString('pt-BR'),
    nome: 'Maria Teste', email: 'maria@exemplo.com', whatsapp: '(27) 99999-0000',
    empresa: 'Clínica Exemplo', segmento: 'Odontologia', cidade: 'Vitória', estado: 'ES',
    site: 'www.exemplo.com.br', instagram: '@exemplo',
    tipoProjeto: 'Site Institucional', objetivo: 'Gerar mais clientes',
    prazo: 'Em até 30 dias', investimento: 'R$ 2.000 a R$ 5.000',
    referencias: 'Gosto do site da clínica X', observacoes: 'Quero agendamento online',
    iaResumo: 'Clínica odontológica buscando site institucional para gerar novos pacientes.',
    iaComplexidade: 'Média', iaEscopo: 'Home • Sobre • Serviços • Agendamento • Contato',
    iaFaixaValor: 'Entre R$ 2.000 e R$ 5.000'
  });
}
