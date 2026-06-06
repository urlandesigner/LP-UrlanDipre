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

    // (Opcional) avise por e-mail a cada novo lead — descomente e ajuste:
    // MailApp.sendEmail('urlan87@gmail.com', 'Novo lead: ' + (data.nome||''),
    //   JSON.stringify(data, null, 2));

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
