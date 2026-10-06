// Stilværksted → Figma: opretter en palet med nuancer som variabler, farvestile og en oversigt på lærredet.
figma.showUI(__html__, { width: 360, height: 420, themeColors: true });

const HEX = /^#[0-9a-f]{6}$/i;
const rgb = (h) => ({
  r: parseInt(h.slice(1, 3), 16) / 255,
  g: parseInt(h.slice(3, 5), 16) / 255,
  b: parseInt(h.slice(5, 7), 16) / 255,
});
const lum = (h) => {
  const c = rgb(h);
  const f = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'close') return figma.closePlugin();
  if (msg.type !== 'create') return;
  try {
    const name = String(msg.name || 'Stilværksted').slice(0, 60);
    const colors = (msg.colors || [])
      .map((c) => ({
        name: String(c.name || 'farve').replace(/\//g, '-').slice(0, 40),
        steps: (c.steps || []).filter((s) => s && HEX.test(s[1])).map((s) => [String(s[0]), s[1].toLowerCase()]),
      }))
      .filter((c) => c.steps.length);
    if (!colors.length) throw new Error('Ingen farver at oprette.');
    const opts = msg.opts || {};
    const made = { vars: 0, styles: 0, board: false };
    const varByName = {};

    if (opts.vars) {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const collection = collections.find((c) => c.name === name) || figma.variables.createVariableCollection(name);
      const modeId = collection.modes[0].modeId;
      const existing = (await figma.variables.getLocalVariablesAsync('COLOR')).filter(
        (v) => v.variableCollectionId === collection.id
      );
      for (const c of colors) {
        for (const [step, hex] of c.steps) {
          const vn = c.name + '/' + step;
          const v = existing.find((x) => x.name === vn) || figma.variables.createVariable(vn, collection, 'COLOR');
          v.setValueForMode(modeId, rgb(hex));
          varByName[vn] = v;
          made.vars++;
        }
      }
    }

    const paintFor = (vn, hex) => {
      let paint = { type: 'SOLID', color: rgb(hex) };
      if (varByName[vn]) paint = figma.variables.setBoundVariableForPaint(paint, 'color', varByName[vn]);
      return paint;
    };

    if (opts.styles) {
      const styles = await figma.getLocalPaintStylesAsync();
      for (const c of colors) {
        for (const [step, hex] of c.steps) {
          const vn = c.name + '/' + step;
          const sn = name + '/' + vn;
          const style = styles.find((x) => x.name === sn) || figma.createPaintStyle();
          style.name = sn;
          style.paints = [paintFor(vn, hex)];
          made.styles++;
        }
      }
    }

    if (opts.board) {
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
      const board = figma.createFrame();
      board.name = name;
      board.layoutMode = 'VERTICAL';
      board.primaryAxisSizingMode = 'AUTO';
      board.counterAxisSizingMode = 'AUTO';
      board.itemSpacing = 24;
      board.paddingLeft = board.paddingRight = board.paddingTop = board.paddingBottom = 40;
      board.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      for (const c of colors) {
        const group = figma.createFrame();
        group.name = c.name;
        group.layoutMode = 'VERTICAL';
        group.primaryAxisSizingMode = 'AUTO';
        group.counterAxisSizingMode = 'AUTO';
        group.itemSpacing = 8;
        group.fills = [];
        const title = figma.createText();
        title.fontName = { family: 'Inter', style: 'Bold' };
        title.fontSize = 14;
        title.characters = c.name;
        title.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.09, b: 0.11 } }];
        group.appendChild(title);
        const row = figma.createFrame();
        row.name = 'nuancer';
        row.layoutMode = 'HORIZONTAL';
        row.primaryAxisSizingMode = 'AUTO';
        row.counterAxisSizingMode = 'AUTO';
        row.itemSpacing = 0;
        row.fills = [];
        row.cornerRadius = 8;
        row.clipsContent = true;
        for (const [step, hex] of c.steps) {
          const cell = figma.createFrame();
          cell.name = step;
          cell.resize(96, 96);
          cell.layoutMode = 'VERTICAL';
          cell.primaryAxisSizingMode = 'FIXED';
          cell.counterAxisSizingMode = 'FIXED';
          cell.primaryAxisAlignItems = 'MAX';
          cell.paddingLeft = cell.paddingRight = cell.paddingBottom = 8;
          cell.itemSpacing = 2;
          cell.fills = [paintFor(c.name + '/' + step, hex)];
          const ink = lum(hex) > 0.36 ? { r: 0.07, g: 0.07, b: 0.07 } : { r: 1, g: 1, b: 1 };
          for (const [txt, size] of [[step, 12], [hex.toUpperCase(), 10]]) {
            const t = figma.createText();
            t.fontName = { family: 'Inter', style: size === 12 ? 'Bold' : 'Regular' };
            t.fontSize = size;
            t.characters = txt;
            t.fills = [{ type: 'SOLID', color: ink }];
            cell.appendChild(t);
          }
          row.appendChild(cell);
        }
        group.appendChild(row);
        board.appendChild(group);
      }
      board.x = Math.round(figma.viewport.center.x);
      board.y = Math.round(figma.viewport.center.y);
      figma.currentPage.appendChild(board);
      figma.currentPage.selection = [board];
      figma.viewport.scrollAndZoomIntoView([board]);
      made.board = true;
    }

    const parts = [];
    if (made.vars) parts.push(made.vars + ' variabler');
    if (made.styles) parts.push(made.styles + ' farvestile');
    if (made.board) parts.push('en oversigt');
    const text = parts.length ? 'Oprettet: ' + parts.join(', ') : 'Intet valgt at oprette.';
    figma.notify(text);
    figma.ui.postMessage({ type: 'done', text });
  } catch (e) {
    const message = String((e && e.message) || e);
    figma.notify('Fejl: ' + message, { error: true });
    figma.ui.postMessage({ type: 'error', text: message });
  }
};
