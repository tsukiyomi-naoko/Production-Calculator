import React, { useEffect, useMemo, useState } from 'react';

const STORE_KEY = 'production-calculator-projects-v2';
const makeId = () => `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const withIds = (rows) => rows.map((row) => ({ ...row, id: makeId() }));
const cleanRows = (rows) => rows.map(({ id, ...row }) => ({ ...row }));
const positive = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
};

const sampleFilaments = [
  { name: 'Filament 1', color: '#f4f1e8', modelG: 15.01, purgeG: 3.49, towerG: 0.75, priceKg: 25 },
  { name: 'Filament 2', color: '#ff7a2f', modelG: 2.64, purgeG: 1.77, towerG: 0.18, priceKg: 25 },
  { name: 'Filament 3', color: '#303238', modelG: 8.84, purgeG: 1.16, towerG: 0.4, priceKg: 25 },
  { name: 'Filament 4', color: '#003a70', modelG: 7.7, purgeG: 1.45, towerG: 0.37, priceKg: 25 },
];

const sampleBulk = [
  { object: 'Labels', price: 9.99, lotQty: 500 },
  { object: 'Bags', price: 14.99, lotQty: 100 },
  { object: 'Key rings', price: 12, lotQty: 100 },
];

const sampleExtras = [
  { name: 'Labeling', fixedCost: 0, costPerPiece: 0.03, minutesPerPlate: 0, minutesPerPiece: 0.25, hourlyRate: 25 },
  { name: 'Packaging', fixedCost: 0, costPerPiece: 0.2, minutesPerPlate: 0, minutesPerPiece: 0.5, hourlyRate: 25 },
  { name: 'Post-processing', fixedCost: 0, costPerPiece: 0, minutesPerPlate: 0, minutesPerPiece: 2, hourlyRate: 25 },
  { name: 'Handling / admin', fixedCost: 0, costPerPiece: 0, minutesPerPlate: 5, minutesPerPiece: 0, hourlyRate: 25 },
  { name: 'Design time', fixedCost: 0, costPerPiece: 0, minutesPerPlate: 20, minutesPerPiece: 0, hourlyRate: 25 },
];

const blankFilaments = [{ name: 'Filament 1', color: '#94a3b8', modelG: 0, purgeG: 0, towerG: 0, priceKg: 25 }];
const blankBulk = [{ object: 'Object 1', price: 0, lotQty: 1 }];
const blankExtras = sampleExtras.map((row) => ({ ...row, fixedCost: 0, costPerPiece: 0, minutesPerPlate: 0, minutesPerPiece: 0, hourlyRate: 25 }));

const copy = {
  en: {
    badge: 'Bambu-style plate cost calculator',
    title: 'Filament Consumption Calculator',
    intro: 'Enter Bambu Studio slicing-table grams, spool prices, bulk item costs, labour, packaging, and design time. The calculator splits the full production cost across every piece on the plate.',
    copySummary: 'Copy summary', copied: 'Summary copied', exportReport: 'Export report', resetAll: 'Reset all',
    savedProjects: 'Saved projects', savedIntro: 'Save this calculator state in your browser and reload it later.', projectName: 'Project name', savedProject: 'Saved project', saveProject: 'Save project', loadProject: 'Load project', deleteProject: 'Delete', chooseProject: 'Choose a saved project', noProjects: 'No saved projects yet', saved: 'Project saved', loaded: 'Project loaded', deleted: 'Project deleted',
    filamentCost: 'Filament cost', addedCosts: 'Added costs', totalJobCost: 'Total job cost', costPerPiece: 'Cost per piece', consumed: 'consumed total', addedDetail: 'labour, packaging, labels, bulk items, design', allIncluded: 'filament + labour + bulk items', piecesOnPlateDetail: (n) => `${n} piece${n === 1 ? '' : 's'} on plate`,
    plateSettings: 'Plate settings', piecesOnPlate: 'Pieces on plate', currency: 'Currency', wasteCalculation: 'Waste calculation', countPurge: 'Count purge as waste', countTower: 'Count prime tower as waste', perPieceDisplay: 'Per-piece display', trueCost: 'True cost: model + purge + tower', modelOnly: 'Model-only sellable material', showChecks: 'Show built-in checks', hideChecks: 'Hide built-in checks',
    filamentRows: 'Filament rows', addFilament: 'Add filament', reset: 'Reset', colour: 'Colour', name: 'Name', modelG: 'Model g', purgedG: 'Purged g', towerG: 'Tower g', priceKg: '$/kg', totalG: 'Total g', cost: 'Cost', remove: 'Remove', total: 'Total',
    bulkTitle: 'Bulk order quick calc', bulkIntro: 'Compare purchase lots quickly. Price/unit = price ÷ lot quantity.', addBulk: 'Add bulk row', object: 'Object', price: 'Price', lotQty: 'Lot QTY', priceUnit: 'Price/unit', bulkTotal: 'Bulk total',
    perPieceBreakdown: 'Filament per-piece breakdown', modelMaterialPc: 'Model material / piece', wastePc: 'Waste / piece', filamentPc: 'Filament cost / piece', filament: 'Filament', modelPc: 'Model / piece', shownPc: 'Shown total / piece',
    wasteVisual: 'Waste visual', model: 'Model', purge: 'Purge', tower: 'Prime tower', note: 'The default filament values are copied from your Bambu screenshot. At $25/kg, 43.76 g lands at about $1.09 for the whole plate before added production costs.',
    extrasTitle: 'Labour, packaging & production costs', extrasIntro: 'Use one row per real-world cost. Fixed cost is charged once per plate/order, cost/pc scales with pieces, and time is converted using the hourly rate.', addCost: 'Add cost row', fixedCost: 'Fixed cost', costPc: 'Cost/pc', minPlate: 'Min/plate', minPc: 'Min/pc', hourly: '$/hour', materialCost: 'Material cost', labourCost: 'Labour cost', perPiece: '/ piece', time: 'Time',
    production: 'Production breakdown', supplies: 'Supplies', bulkItems: 'Bulk items', labour: 'Labour', finalPc: 'Final cost / piece', hours: 'hours',
    reportTitle: 'Project cost report', reportSubtitle: 'Clean production cost and expense breakdown', preview: 'Report preview', printHint: 'Formatted for Letter paper. Use the print dialog to save as PDF or print.', print: 'Print / Save PDF', close: 'Close', generated: 'Generated', project: 'Project', summary: 'Executive summary', filamentSection: 'Filament consumption', bulkSection: 'Bulk order items', labourSection: 'Labour, packaging & production costs', finalSection: 'Final production totals',
    language: 'Language', view: 'Layout', auto: 'AUTO', desktop: 'DESK', phone: 'PHONE', dark: 'DARK', light: 'LIGHT', studio: 'THEME',
    checks: 'Built-in calculation checks', passed: 'All passed', failed: (n) => `${n} failed`, expectedGot: (e, a) => `Expected ${e} / got ${a}`,
  },
  fr: {
    badge: 'Calculateur de coût de plateau style Bambu',
    title: 'Calculateur de consommation de filament',
    intro: 'Entrez les grammes du tableau Bambu Studio, le prix des bobines, les coûts d’articles en lot, la main-d’œuvre, l’emballage et le design. Le calculateur répartit le coût complet sur chaque pièce du plateau.',
    copySummary: 'Copier le résumé', copied: 'Résumé copié', exportReport: 'Exporter rapport', resetAll: 'Tout réinitialiser',
    savedProjects: 'Projets sauvegardés', savedIntro: 'Sauvegardez l’état du calculateur dans ce navigateur et rechargez-le plus tard.', projectName: 'Nom du projet', savedProject: 'Projet sauvegardé', saveProject: 'Sauvegarder', loadProject: 'Charger', deleteProject: 'Supprimer', chooseProject: 'Choisir un projet', noProjects: 'Aucun projet sauvegardé', saved: 'Projet sauvegardé', loaded: 'Projet chargé', deleted: 'Projet supprimé',
    filamentCost: 'Coût filament', addedCosts: 'Coûts ajoutés', totalJobCost: 'Coût total du lot', costPerPiece: 'Coût par pièce', consumed: 'consommés au total', addedDetail: 'main-d’œuvre, emballage, étiquettes, lots, design', allIncluded: 'filament + main-d’œuvre + lots', piecesOnPlateDetail: (n) => `${n} pièce${n === 1 ? '' : 's'} sur le plateau`,
    plateSettings: 'Paramètres du plateau', piecesOnPlate: 'Pièces sur le plateau', currency: 'Devise', wasteCalculation: 'Calcul du gaspillage', countPurge: 'Compter la purge comme gaspillage', countTower: 'Compter la tour de purge comme gaspillage', perPieceDisplay: 'Affichage par pièce', trueCost: 'Coût réel : modèle + purge + tour', modelOnly: 'Matière vendable seulement', showChecks: 'Afficher les vérifications', hideChecks: 'Masquer les vérifications',
    filamentRows: 'Filaments', addFilament: 'Ajouter un filament', reset: 'Réinitialiser', colour: 'Couleur', name: 'Nom', modelG: 'Modèle g', purgedG: 'Purge g', towerG: 'Tour g', priceKg: '$/kg', totalG: 'Total g', cost: 'Coût', remove: 'Retirer', total: 'Total',
    bulkTitle: 'Calcul rapide d’achat en lot', bulkIntro: 'Comparez rapidement les lots d’achat. Prix/unité = prix ÷ quantité du lot.', addBulk: 'Ajouter un lot', object: 'Objet', price: 'Prix', lotQty: 'Qté lot', priceUnit: 'Prix/unité', bulkTotal: 'Total lots',
    perPieceBreakdown: 'Détail filament par pièce', modelMaterialPc: 'Matière modèle / pièce', wastePc: 'Gaspillage / pièce', filamentPc: 'Coût filament / pièce', filament: 'Filament', modelPc: 'Modèle / pièce', shownPc: 'Total affiché / pièce',
    wasteVisual: 'Visualisation du gaspillage', model: 'Modèle', purge: 'Purge', tower: 'Tour de purge', note: 'Les valeurs de filament par défaut viennent de votre capture Bambu. À 25 $/kg, 43,76 g donne environ 1,09 $ pour le plateau complet avant les coûts de production ajoutés.',
    extrasTitle: 'Main-d’œuvre, emballage et coûts de production', extrasIntro: 'Utilisez une ligne par coût réel. Le coût fixe est chargé une fois par plateau/commande, le coût/pièce suit le nombre de pièces, et le temps est converti avec le taux horaire.', addCost: 'Ajouter une ligne', fixedCost: 'Coût fixe', costPc: 'Coût/pièce', minPlate: 'Min/plateau', minPc: 'Min/pièce', hourly: '$/heure', materialCost: 'Coût matériel', labourCost: 'Coût main-d’œuvre', perPiece: '/ pièce', time: 'Temps',
    production: 'Détail de production', supplies: 'Fournitures', bulkItems: 'Articles en lot', labour: 'Main-d’œuvre', finalPc: 'Coût final / pièce', hours: 'heures',
    reportTitle: 'Rapport de coût du projet', reportSubtitle: 'Détail propre des coûts de production et dépenses', preview: 'Aperçu du rapport', printHint: 'Formaté pour papier Lettre. Utilisez la fenêtre d’impression pour sauvegarder en PDF ou imprimer.', print: 'Imprimer / PDF', close: 'Fermer', generated: 'Généré', project: 'Projet', summary: 'Résumé exécutif', filamentSection: 'Consommation de filament', bulkSection: 'Articles achetés en lot', labourSection: 'Main-d’œuvre, emballage et coûts de production', finalSection: 'Totaux finaux de production',
    language: 'Langue', view: 'Affichage', auto: 'AUTO', desktop: 'BUREAU', phone: 'TEL', dark: 'NOIR', light: 'CLAIR', studio: 'THÈME',
    checks: 'Vérifications de calcul intégrées', passed: 'Tout est valide', failed: (n) => `${n} échec${n === 1 ? '' : 's'}`, expectedGot: (e, a) => `Attendu ${e} / obtenu ${a}`,
  },
};

function getText(language) { return copy[language] || copy.en; }
function locale(language) { return language === 'fr' ? 'fr-CA' : 'en-CA'; }
function money(value, currency, language) {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(locale(language), { style: 'currency', currency, minimumFractionDigits: safe < 1 ? 3 : 2, maximumFractionDigits: safe < 1 ? 3 : 2 }).format(safe);
}
function number(value, language, digits = 2) { return new Intl.NumberFormat(locale(language), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0); }
function grams(value, language) { return `${number(value, language)} g`; }
function minutes(value, language) { return `${number(value, language, 1)} min`; }
function percent(value, language) { return `${number(value, language, 1)}%`; }

function calcFilament(rows, opts) {
  const pieceCount = Math.max(1, positive(opts.pieceCount, 1));
  const detail = rows.map((row) => {
    const modelG = positive(row.modelG);
    const purgeG = positive(row.purgeG);
    const towerG = positive(row.towerG);
    const priceKg = positive(row.priceKg);
    const totalG = modelG + purgeG + towerG;
    const wasteG = (opts.includePurge ? purgeG : 0) + (opts.includeTower ? towerG : 0);
    const modelCost = modelG * priceKg / 1000;
    const purgeCost = purgeG * priceKg / 1000;
    const towerCost = towerG * priceKg / 1000;
    const wasteCost = wasteG * priceKg / 1000;
    const totalCost = totalG * priceKg / 1000;
    return { ...row, modelG, purgeG, towerG, priceKg, totalG, wasteG, modelCost, purgeCost, towerCost, wasteCost, totalCost, modelCostPerPiece: modelCost / pieceCount, wasteCostPerPiece: wasteCost / pieceCount, totalCostPerPiece: totalCost / pieceCount };
  });
  const sum = (key) => detail.reduce((total, row) => total + row[key], 0);
  const totalG = sum('totalG');
  const totalWasteG = sum('wasteG');
  const totalCost = sum('totalCost');
  const totalModelG = sum('modelG');
  const totalPurgeG = sum('purgeG');
  const totalTowerG = sum('towerG');
  return {
    detail, pieceCount, totalG, totalWasteG, totalCost, totalModelG, totalPurgeG, totalTowerG,
    modelCost: sum('modelCost'), wasteCost: sum('wasteCost'),
    modelGPerPiece: totalModelG / pieceCount, wasteGPerPiece: totalWasteG / pieceCount, totalGPerPiece: totalG / pieceCount,
    modelCostPerPiece: sum('modelCost') / pieceCount, wasteCostPerPiece: sum('wasteCost') / pieceCount, totalCostPerPiece: totalCost / pieceCount,
    modelPercent: totalG ? totalModelG / totalG * 100 : 0, purgePercent: totalG ? totalPurgeG / totalG * 100 : 0, towerPercent: totalG ? totalTowerG / totalG * 100 : 0,
  };
}

function calcBulk(rows, pieceCountValue) {
  const pieceCount = Math.max(1, positive(pieceCountValue, 1));
  const detail = rows.map((row) => {
    const price = positive(row.price);
    const lotQty = positive(row.lotQty);
    const unitPrice = lotQty > 0 ? price / lotQty : 0;
    const productionCost = unitPrice * pieceCount;
    return { ...row, price, lotQty, unitPrice, productionCost };
  });
  const productionCost = detail.reduce((sum, row) => sum + row.productionCost, 0);
  return {
    detail,
    totalPrice: detail.reduce((sum, row) => sum + row.price, 0),
    totalQty: detail.reduce((sum, row) => sum + row.lotQty, 0),
    sumUnitPrice: detail.reduce((sum, row) => sum + row.unitPrice, 0),
    productionCost,
    productionCostPerPiece: productionCost / pieceCount,
  };
}

function calcExtras(rows, pieceCountValue) {
  const pieceCount = Math.max(1, positive(pieceCountValue, 1));
  const detail = rows.map((row) => {
    const fixedCost = positive(row.fixedCost);
    const costPerPiece = positive(row.costPerPiece);
    const minutesPerPlate = positive(row.minutesPerPlate);
    const minutesPerPiece = positive(row.minutesPerPiece);
    const hourlyRate = positive(row.hourlyRate);
    const materialCost = fixedCost + costPerPiece * pieceCount;
    const totalMinutes = minutesPerPlate + minutesPerPiece * pieceCount;
    const labourCost = totalMinutes / 60 * hourlyRate;
    const totalCost = materialCost + labourCost;
    return { ...row, fixedCost, costPerPiece, minutesPerPlate, minutesPerPiece, hourlyRate, materialCost, totalMinutes, labourCost, totalCost, totalCostPerPiece: totalCost / pieceCount };
  });
  const materialCost = detail.reduce((sum, row) => sum + row.materialCost, 0);
  const labourCost = detail.reduce((sum, row) => sum + row.labourCost, 0);
  const totalMinutes = detail.reduce((sum, row) => sum + row.totalMinutes, 0);
  const totalCost = materialCost + labourCost;
  return { detail, materialCost, labourCost, totalMinutes, totalHours: totalMinutes / 60, totalCost, totalCostPerPiece: totalCost / pieceCount };
}

function calcProduction(filament, extras, bulk) {
  const pieceCount = filament.pieceCount;
  const addedCost = extras.totalCost + bulk.productionCost;
  const fullCost = filament.totalCost + addedCost;
  const supplyCost = extras.materialCost + bulk.productionCost;
  return { pieceCount, addedCost, fullCost, fullCostPerPiece: fullCost / pieceCount, filamentCostPerPiece: filament.totalCostPerPiece, addedCostPerPiece: addedCost / pieceCount, supplyCost, supplyCostPerPiece: supplyCost / pieceCount, bulkProductionCost: bulk.productionCost, bulkProductionCostPerPiece: bulk.productionCost / pieceCount };
}

function serialize(state) {
  return { version: 2, savedAt: new Date().toISOString(), filaments: cleanRows(state.filaments), bulkRows: cleanRows(state.bulkRows), extraRows: cleanRows(state.extraRows), pieceCount: positive(state.pieceCount, 1), currency: state.currency, language: state.language, includePurge: state.includePurge, includeTower: state.includeTower, mode: state.mode, theme: state.theme, view: state.view };
}

function sampleProject() {
  const savedAt = new Date().toISOString();
  return { id: 'sample-project-01', name: 'Sample Project 01', savedAt, state: { ...serialize({ filaments: sampleFilaments, bulkRows: sampleBulk, extraRows: sampleExtras, pieceCount: 8, currency: 'CAD', language: 'en', includePurge: true, includeTower: true, mode: 'full', theme: 'dark', view: 'auto' }), savedAt } };
}

function readProjects() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    const list = Array.isArray(parsed) ? parsed : [];
    return list.some((project) => project.id === 'sample-project-01') ? list : [sampleProject(), ...list].slice(0, 50);
  } catch {
    return [sampleProject()];
  }
}
function writeProjects(projects) { try { localStorage.setItem(STORE_KEY, JSON.stringify(projects)); } catch {} }

function Icon({ name }) {
  const icons = { moon: '☾', sun: '☀', theme: '◒', copy: '⧉', print: '⎙', reset: '↻', plus: '+', trash: '×', dollar: '$', box: '◇', layers: '▱', calc: '▣' };
  return <span className="icon" aria-hidden="true">{icons[name] || '•'}</span>;
}

function Button({ children, onClick, variant = 'primary', className = '', disabled = false, title }) {
  return <button type="button" onClick={onClick} disabled={disabled} title={title} className={`btn btn-${variant} ${className}`}>{children}</button>;
}
function Card({ children, className = '' }) { return <section className={`panel ${className}`}>{children}</section>; }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function Numeric({ value, onChange, step = '0.01', suffix }) { return <div className="input-wrap"><input type="number" min="0" step={step} value={value} onChange={(event) => onChange(positive(event.target.value))} />{suffix ? <em>{suffix}</em> : null}</div>; }
function Stat({ icon, label, value, detail, accent }) { return <Card className={`stat-card ${accent ? 'accent' : ''}`}><div className="stat-icon"><Icon name={icon} /></div><div><span>{label}</span><strong>{value}</strong>{detail ? <small>{detail}</small> : null}</div></Card>; }
function Progress({ label, value, language, tone }) { const safe = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0)); return <div className="progress"><div><span>{label}</span><b>{percent(safe, language)}</b></div><i><em className={tone} style={{ width: `${safe}%` }} /></i></div>; }

function ProjectManager({ text, language, name, setName, projects, selected, setSelected, save, load, remove, status }) {
  return <Card className="project-panel"><div className="section-head"><div><h2>{text.savedProjects}</h2><p>{text.savedIntro}</p></div>{status ? <span className="status-pill">{text[status]}</span> : null}</div><div className="project-grid"><Field label={text.projectName}><input value={name} onChange={(event) => setName(event.target.value)} /></Field><Field label={text.savedProject}><select value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">{projects.length ? text.chooseProject : text.noProjects}</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name} — {new Date(project.savedAt).toLocaleString(locale(language))}</option>)}</select></Field><div className="project-actions"><Button onClick={save}>{text.saveProject}</Button><Button variant="secondary" onClick={load} disabled={!selected}>{text.loadProject}</Button><Button variant="danger" onClick={remove} disabled={!selected}>{text.deleteProject}</Button></div></div></Card>;
}

function PlateSettings(props) {
  const { text, pieceCount, setPieceCount, currency, setCurrency, includePurge, setIncludePurge, includeTower, setIncludeTower, mode, setMode, showChecks, setShowChecks } = props;
  return <Card className="settings-card"><div className="card-pad compact"><h2>{text.plateSettings}</h2><div className="two-fields"><Field label={text.piecesOnPlate}><Numeric value={pieceCount} step="1" suffix="pcs" onChange={setPieceCount} /></Field><Field label={text.currency}><select value={currency} onChange={(event) => setCurrency(event.target.value)}><option>CAD</option><option>USD</option><option>EUR</option></select></Field></div><div className="option-box"><b>{text.wasteCalculation}</b><label><input type="checkbox" checked={includePurge} onChange={(event) => setIncludePurge(event.target.checked)} />{text.countPurge}</label><label><input type="checkbox" checked={includeTower} onChange={(event) => setIncludeTower(event.target.checked)} />{text.countTower}</label></div><div className="option-box"><b>{text.perPieceDisplay}</b><label><input type="radio" checked={mode === 'full'} onChange={() => setMode('full')} />{text.trueCost}</label><label><input type="radio" checked={mode === 'model'} onChange={() => setMode('model')} />{text.modelOnly}</label></div><Button className="full" variant="secondary" onClick={() => setShowChecks((value) => !value)}>{showChecks ? text.hideChecks : text.showChecks}</Button></div></Card>;
}

function FilamentTable({ text, totals, update, add, reset, remove, currency, language }) {
  return <Card className="filament-card"><div className="section-head table-headline"><h2>{text.filamentRows}</h2><div className="button-row"><Button variant="secondary" onClick={reset}><Icon name="reset" /> {text.reset}</Button><Button variant="secondary" onClick={add}><Icon name="plus" /> {text.addFilament}</Button></div></div><div className="table-frame"><table className="data-table filament-table"><thead><tr><th>{text.colour}</th><th>{text.name}</th><th>{text.modelG}</th><th>{text.purgedG}</th><th>{text.towerG}</th><th>{text.priceKg}</th><th>{text.totalG}</th><th>{text.cost}</th><th>{text.remove}</th></tr></thead><tbody>{totals.detail.map((row) => <tr key={row.id}><td><input type="color" value={row.color} onChange={(event) => update(row.id, { color: event.target.value })} /></td><td><input value={row.name} onChange={(event) => update(row.id, { name: event.target.value })} /></td><td><Numeric value={row.modelG} onChange={(value) => update(row.id, { modelG: value })} /></td><td><Numeric value={row.purgeG} onChange={(value) => update(row.id, { purgeG: value })} /></td><td><Numeric value={row.towerG} onChange={(value) => update(row.id, { towerG: value })} /></td><td><Numeric value={row.priceKg} onChange={(value) => update(row.id, { priceKg: value })} /></td><td className="num">{grams(row.totalG, language)}</td><td className="money">{money(row.totalCost, currency, language)}</td><td><Button variant="danger" className="tiny" onClick={() => remove(row.id)}><Icon name="trash" /></Button></td></tr>)}<tr className="total-row"><td colSpan="2">{text.total}</td><td>{grams(totals.totalModelG, language)}</td><td>{grams(totals.totalPurgeG, language)}</td><td>{grams(totals.totalTowerG, language)}</td><td>—</td><td>{grams(totals.totalG, language)}</td><td>{money(totals.totalCost, currency, language)}</td><td /></tr></tbody></table></div></Card>;
}

function BulkCard({ text, totals, update, add, reset, remove, currency, language }) {
  return <Card className="bulk-card"><div className="section-head small-head"><div><h2>{text.bulkTitle}</h2><p>{text.bulkIntro}</p></div><div className="button-row"><Button variant="secondary" className="square" onClick={reset}><Icon name="reset" /></Button><Button variant="secondary" className="square" onClick={add}><Icon name="plus" /></Button></div></div><div className="mini-table bulk-table"><div className="mini-head"><span>{text.object}</span><span>{text.price}</span><span>{text.lotQty}</span><span>{text.priceUnit}</span><span /></div>{totals.detail.map((row) => <div className="mini-row" key={row.id}><input value={row.object} onChange={(event) => update(row.id, { object: event.target.value })} /><Numeric value={row.price} onChange={(value) => update(row.id, { price: value })} /><Numeric value={row.lotQty} step="1" onChange={(value) => update(row.id, { lotQty: value })} /><b>{money(row.unitPrice, currency, language)}</b><Button variant="danger" className="tiny" onClick={() => remove(row.id)}><Icon name="trash" /></Button></div>)}<div className="mini-row total-row"><span>{text.bulkTotal}</span><span>{money(totals.totalPrice, currency, language)}</span><span>{number(totals.totalQty, language, 0)}</span><b>{money(totals.sumUnitPrice, currency, language)}</b><span /></div></div></Card>;
}

function PerPieceCard({ text, totals, mode, currency, language }) {
  return <Card className="per-piece-card"><div className="card-pad"><h2>{text.perPieceBreakdown}</h2><div className="mini-stats"><div><span>{text.modelMaterialPc}</span><strong>{money(totals.modelCostPerPiece, currency, language)}</strong><small>{grams(totals.modelGPerPiece, language)}</small></div><div><span>{text.wastePc}</span><strong>{money(totals.wasteCostPerPiece, currency, language)}</strong><small>{grams(totals.wasteGPerPiece, language)}</small></div><div className="accent"><span>{text.filamentPc}</span><strong>{money(totals.totalCostPerPiece, currency, language)}</strong><small>{grams(totals.totalGPerPiece, language)}</small></div></div><div className="per-piece-list"><div className="list-head"><span>{text.filament}</span><span>{text.modelPc}</span><span>{text.wastePc}</span><span>{text.shownPc}</span></div>{totals.detail.map((row) => <div key={row.id}><span className="name-dot"><i style={{ backgroundColor: row.color }} />{row.name}</span><span>{money(row.modelCostPerPiece, currency, language)}</span><span>{money(row.wasteCostPerPiece, currency, language)}</span><b>{mode === 'full' ? money(row.totalCostPerPiece, currency, language) : money(row.modelCostPerPiece, currency, language)}</b></div>)}</div></div></Card>;
}

function WasteCard({ text, totals, language }) {
  return <Card className="waste-card"><div className="card-pad"><h2>{text.wasteVisual}</h2><Progress label={text.model} value={totals.modelPercent} language={language} tone="cyan" /><Progress label={text.purge} value={totals.purgePercent} language={language} tone="orange" /><Progress label={text.tower} value={totals.towerPercent} language={language} tone="violet" /><p className="note-box">{text.note}</p></div></Card>;
}

function ExtrasCard({ text, totals, update, add, reset, remove, currency, language }) {
  return <Card className="extras-card"><div className="section-head"><div><h2>{text.extrasTitle}</h2><p>{text.extrasIntro}</p></div><div className="button-row"><Button variant="secondary" onClick={reset}><Icon name="reset" /> {text.reset}</Button><Button variant="secondary" onClick={add}><Icon name="plus" /> {text.addCost}</Button></div></div><div className="table-frame"><table className="data-table extras-table"><thead><tr><th>{text.name}</th><th>{text.fixedCost}</th><th>{text.costPc}</th><th>{text.minPlate}</th><th>{text.minPc}</th><th>{text.hourly}</th><th>{text.materialCost}</th><th>{text.labourCost}</th><th>{text.total}</th><th>{text.perPiece}</th><th>{text.remove}</th></tr></thead><tbody>{totals.detail.map((row) => <tr key={row.id}><td><input value={row.name} onChange={(event) => update(row.id, { name: event.target.value })} /></td><td><Numeric value={row.fixedCost} onChange={(value) => update(row.id, { fixedCost: value })} /></td><td><Numeric value={row.costPerPiece} onChange={(value) => update(row.id, { costPerPiece: value })} /></td><td><Numeric value={row.minutesPerPlate} step="0.1" onChange={(value) => update(row.id, { minutesPerPlate: value })} /></td><td><Numeric value={row.minutesPerPiece} step="0.1" onChange={(value) => update(row.id, { minutesPerPiece: value })} /></td><td><Numeric value={row.hourlyRate} onChange={(value) => update(row.id, { hourlyRate: value })} /></td><td className="num">{money(row.materialCost, currency, language)}</td><td className="num">{money(row.labourCost, currency, language)}</td><td className="money">{money(row.totalCost, currency, language)}</td><td className="num">{money(row.totalCostPerPiece, currency, language)}</td><td><Button variant="danger" className="tiny" onClick={() => remove(row.id)}><Icon name="trash" /></Button></td></tr>)}<tr className="total-row"><td>{text.total}</td><td>—</td><td>—</td><td colSpan="2">{minutes(totals.totalMinutes, language)}</td><td>—</td><td>{money(totals.materialCost, currency, language)}</td><td>{money(totals.labourCost, currency, language)}</td><td>{money(totals.totalCost, currency, language)}</td><td>{money(totals.totalCostPerPiece, currency, language)}</td><td /></tr></tbody></table></div></Card>;
}

function ProductionCard({ text, production, extras, filament, currency, language }) {
  return <Card className="production-card"><div className="card-pad"><h2>{text.production}</h2><div className="production-stack"><div><span>{text.supplies}</span><strong>{money(production.supplyCost, currency, language)}</strong><small>{money(production.supplyCostPerPiece, currency, language)} {text.perPiece}</small></div><div><span>{text.bulkItems}</span><strong>{money(production.bulkProductionCost, currency, language)}</strong><small>{money(production.bulkProductionCostPerPiece, currency, language)} {text.perPiece}</small></div><div><span>{text.labour}</span><strong>{money(extras.labourCost, currency, language)}</strong><small>{minutes(extras.totalMinutes, language)} / {number(extras.totalHours, language, 2)} {text.hours}</small></div><div className="accent"><span>{text.finalPc}</span><strong>{money(production.fullCostPerPiece, currency, language)}</strong><small>{money(production.fullCost, currency, language)} {text.total.toLowerCase()}</small></div></div></div></Card>;
}

function Tests({ text, language }) {
  const f = calcFilament(sampleFilaments, { pieceCount: 8, includePurge: true, includeTower: true });
  const tests = [
    ['43.76 g total', Math.abs(f.totalG - 43.76) < 0.01, 43.76, f.totalG],
    ['34.19 g model', Math.abs(f.totalModelG - 34.19) < 0.01, 34.19, f.totalModelG],
    ['$1.09 plate cost', Math.abs(f.totalCost - 1.094) < 0.02, 1.094, f.totalCost],
  ];
  const failed = tests.filter((test) => !test[1]);
  return <Card className="tests-card"><div className="card-pad"><div className="section-head"><h2>{text.checks}</h2><span className={`status-pill ${failed.length ? 'bad' : ''}`}>{failed.length ? text.failed(failed.length) : text.passed}</span></div><div className="tests-grid">{tests.map(([name, pass, expected, actual]) => <div key={name} className={pass ? 'test pass' : 'test fail'}><b>{pass ? '✓' : '!'}</b><span>{name}</span><small>{text.expectedGot(number(expected, language, 4), number(actual, language, 4))}</small></div>)}</div></div></Card>;
}

function Report({ text, language, projectName, filament, bulk, extras, production, currency, onClose }) {
  const generated = new Date().toLocaleString(locale(language), { dateStyle: 'long', timeStyle: 'short' });
  return <div className="report-overlay"><div className="report-actions"><div><b>{text.preview}</b><span>{text.printHint}</span></div><div><Button onClick={() => window.print()}><Icon name="print" /> {text.print}</Button><Button variant="secondary" onClick={onClose}>{text.close}</Button></div></div><article className="print-sheet"><header><span>{text.badge}</span><h1>{text.reportTitle}</h1><p>{text.reportSubtitle}</p><div className="report-meta"><div><small>{text.project}</small><b>{projectName || 'Untitled project'}</b></div><div><small>{text.generated}</small><b>{generated}</b></div></div></header><main><h2>{text.summary}</h2><div className="report-cards"><ReportCard label={text.totalJobCost} value={money(production.fullCost, currency, language)} detail={text.allIncluded} /><ReportCard label={text.costPerPiece} value={money(production.fullCostPerPiece, currency, language)} detail={text.piecesOnPlateDetail(production.pieceCount)} accent /><ReportCard label={text.filamentCost} value={money(filament.totalCost, currency, language)} detail={grams(filament.totalG, language)} /><ReportCard label={text.addedCosts} value={money(production.addedCost, currency, language)} detail={minutes(extras.totalMinutes, language)} /></div><ReportTable title={text.filamentSection} headers={[text.filament, text.modelG, text.purgedG, text.towerG, text.totalG, text.cost]} rows={filament.detail.map((row) => [row.name, grams(row.modelG, language), grams(row.purgeG, language), grams(row.towerG, language), grams(row.totalG, language), money(row.totalCost, currency, language)])} /><ReportTable title={text.bulkSection} headers={[text.object, text.price, text.lotQty, text.priceUnit, text.total]} rows={bulk.detail.map((row) => [row.object, money(row.price, currency, language), number(row.lotQty, language, 0), money(row.unitPrice, currency, language), money(row.productionCost, currency, language)])} /><ReportTable title={text.labourSection} headers={[text.name, text.fixedCost, text.costPc, text.time, text.materialCost, text.labourCost, text.total]} rows={extras.detail.map((row) => [row.name, money(row.fixedCost, currency, language), money(row.costPerPiece, currency, language), minutes(row.totalMinutes, language), money(row.materialCost, currency, language), money(row.labourCost, currency, language), money(row.totalCost, currency, language)])} /></main></article></div>;
}
function ReportCard({ label, value, detail, accent }) { return <div className={accent ? 'report-card accent' : 'report-card'}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
function ReportTable({ title, headers, rows }) { return <section className="report-section"><h2>{title}</h2><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></section>; }

export default function App() {
  const [filaments, setFilaments] = useState(() => withIds(sampleFilaments));
  const [bulkRows, setBulkRows] = useState(() => withIds(sampleBulk));
  const [extraRows, setExtraRows] = useState(() => withIds(sampleExtras));
  const [pieceCount, setPieceCount] = useState(8);
  const [currency, setCurrency] = useState('CAD');
  const [language, setLanguage] = useState('en');
  const [includePurge, setIncludePurge] = useState(true);
  const [includeTower, setIncludeTower] = useState(true);
  const [mode, setMode] = useState('full');
  const [view, setView] = useState('auto');
  const [theme, setTheme] = useState('dark');
  const [isNarrow, setIsNarrow] = useState(false);
  const [showChecks, setShowChecks] = useState(false);
  const [copyState, setCopyState] = useState('idle');
  const [reportOpen, setReportOpen] = useState(false);
  const [projectName, setProjectName] = useState('Sample Project 01');
  const [projects, setProjects] = useState(readProjects);
  const [selectedProject, setSelectedProject] = useState('sample-project-01');
  const [projectStatus, setProjectStatus] = useState('');

  useEffect(() => {
    const update = () => setIsNarrow(window.innerWidth < 900);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => { writeProjects(projects); }, [projects]);

  const text = getText(language);
  const mobile = view === 'phone' || (view === 'auto' && isNarrow);
  const filamentTotals = useMemo(() => calcFilament(filaments, { pieceCount, includePurge, includeTower }), [filaments, pieceCount, includePurge, includeTower]);
  const bulkTotals = useMemo(() => calcBulk(bulkRows, pieceCount), [bulkRows, pieceCount]);
  const extraTotals = useMemo(() => calcExtras(extraRows, pieceCount), [extraRows, pieceCount]);
  const productionTotals = useMemo(() => calcProduction(filamentTotals, extraTotals, bulkTotals), [filamentTotals, extraTotals, bulkTotals]);

  const updateFilament = (id, patch) => setFilaments((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  const updateBulk = (id, patch) => setBulkRows((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  const updateExtra = (id, patch) => setExtraRows((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  const showProjectStatus = (status) => { setProjectStatus(status); window.setTimeout(() => setProjectStatus(''), 1400); };

  const saveProject = () => {
    const id = selectedProject || makeId();
    const savedAt = new Date().toISOString();
    const saved = { id, name: projectName.trim() || 'Untitled project', savedAt, state: serialize({ filaments, bulkRows, extraRows, pieceCount, currency, language, includePurge, includeTower, mode, theme, view }) };
    setProjects((items) => [saved, ...items.filter((item) => item.id !== id)].slice(0, 50));
    setSelectedProject(id);
    setProjectName(saved.name);
    showProjectStatus('saved');
  };
  const loadProject = () => {
    const project = projects.find((item) => item.id === selectedProject);
    if (!project) return;
    const state = project.state || {};
    setFilaments(withIds(state.filaments?.length ? state.filaments : sampleFilaments));
    setBulkRows(withIds(state.bulkRows?.length ? state.bulkRows : sampleBulk));
    setExtraRows(withIds(state.extraRows?.length ? state.extraRows : sampleExtras));
    setPieceCount(Math.max(1, positive(state.pieceCount, 8)));
    setCurrency(state.currency || 'CAD');
    setLanguage(state.language || 'en');
    setIncludePurge(state.includePurge ?? true);
    setIncludeTower(state.includeTower ?? true);
    setMode(state.mode || 'full');
    setTheme(state.theme || 'dark');
    setView(state.view || 'auto');
    setProjectName(project.name);
    showProjectStatus('loaded');
  };
  const deleteProject = () => { setProjects((items) => items.filter((item) => item.id !== selectedProject)); setSelectedProject(''); showProjectStatus('deleted'); };
  const resetAll = () => { setFilaments(withIds(blankFilaments)); setBulkRows(withIds(blankBulk)); setExtraRows(withIds(blankExtras)); setPieceCount(1); setCurrency('CAD'); setLanguage('en'); setIncludePurge(true); setIncludeTower(true); setMode('full'); setView('auto'); setTheme('dark'); setProjectName('Untitled project'); setSelectedProject(''); setReportOpen(false); setShowChecks(false); };
  const copySummary = async () => {
    const summary = [text.title, '', `${text.piecesOnPlate}: ${pieceCount}`, `${text.filamentCost}: ${money(filamentTotals.totalCost, currency, language)}`, `${text.addedCosts}: ${money(productionTotals.addedCost, currency, language)}`, `${text.totalJobCost}: ${money(productionTotals.fullCost, currency, language)}`, `${text.costPerPiece}: ${money(productionTotals.fullCostPerPiece, currency, language)}`].join('\n');
    try { await navigator.clipboard.writeText(summary); setCopyState('copied'); window.setTimeout(() => setCopyState('idle'), 1400); } catch { window.prompt('Copy', summary); }
  };

  return <main className={`app theme-${theme} ${mobile ? 'is-mobile' : 'is-desktop'}`}>
    <div className="theme-pill"><button onClick={() => setTheme('dark')} className={theme === 'dark' ? 'active' : ''} title={text.dark}><Icon name="moon" /></button><button onClick={() => setTheme('light')} className={theme === 'light' ? 'active' : ''} title={text.light}><Icon name="sun" /></button><button onClick={() => setTheme('studio')} className={theme === 'studio' ? 'active' : ''} title={text.studio}><Icon name="theme" /></button></div>
    {reportOpen ? <Report text={text} language={language} projectName={projectName} filament={filamentTotals} bulk={bulkTotals} extras={extraTotals} production={productionTotals} currency={currency} onClose={() => setReportOpen(false)} /> : null}
    <div className="shell">
      <header className="hero"><div><span className="badge">▣ {text.badge}</span><h1>{text.title}</h1><p>{text.intro}</p></div><div className="hero-actions"><div className="seg"><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button><button className={language === 'fr' ? 'active' : ''} onClick={() => setLanguage('fr')}>FR</button></div><div className="seg"><button className={view === 'auto' ? 'active' : ''} onClick={() => setView('auto')}>{text.auto}</button><button className={view === 'desktop' ? 'active' : ''} onClick={() => setView('desktop')}>{text.desktop}</button><button className={view === 'phone' ? 'active' : ''} onClick={() => setView('phone')}>{text.phone}</button></div><Button onClick={copySummary}><Icon name="copy" /> {copyState === 'copied' ? text.copied : text.copySummary}</Button><Button variant="secondary" onClick={() => setReportOpen(true)}><Icon name="print" /> {text.exportReport}</Button><Button variant="secondary" onClick={resetAll}><Icon name="reset" /> {text.resetAll}</Button></div></header>
      <ProjectManager text={text} language={language} name={projectName} setName={setProjectName} projects={projects} selected={selectedProject} setSelected={setSelectedProject} save={saveProject} load={loadProject} remove={deleteProject} status={projectStatus} />
      <section className="stats-grid"><Stat icon="dollar" label={text.filamentCost} value={money(filamentTotals.totalCost, currency, language)} detail={`${grams(filamentTotals.totalG, language)} ${text.consumed}`} /><Stat icon="box" label={text.addedCosts} value={money(productionTotals.addedCost, currency, language)} detail={text.addedDetail} /><Stat icon="layers" label={text.totalJobCost} value={money(productionTotals.fullCost, currency, language)} detail={text.allIncluded} /><Stat icon="calc" label={text.costPerPiece} value={money(productionTotals.fullCostPerPiece, currency, language)} detail={text.piecesOnPlateDetail(pieceCount)} accent /></section>
      <section className="workspace">
        <PlateSettings text={text} pieceCount={pieceCount} setPieceCount={setPieceCount} currency={currency} setCurrency={setCurrency} includePurge={includePurge} setIncludePurge={setIncludePurge} includeTower={includeTower} setIncludeTower={setIncludeTower} mode={mode} setMode={setMode} showChecks={showChecks} setShowChecks={setShowChecks} />
        <FilamentTable text={text} totals={filamentTotals} update={updateFilament} add={() => setFilaments((rows) => [...rows, { id: makeId(), name: `Filament ${rows.length + 1}`, color: '#94a3b8', modelG: 0, purgeG: 0, towerG: 0, priceKg: 25 }])} reset={() => { setFilaments(withIds(blankFilaments)); setIncludePurge(true); setIncludeTower(true); setMode('full'); }} remove={(id) => setFilaments((rows) => rows.filter((row) => row.id !== id))} currency={currency} language={language} />
        <BulkCard text={text} totals={bulkTotals} update={updateBulk} add={() => setBulkRows((rows) => [...rows, { id: makeId(), object: `Object ${rows.length + 1}`, price: 0, lotQty: 1 }])} reset={() => setBulkRows(withIds(blankBulk))} remove={(id) => setBulkRows((rows) => rows.filter((row) => row.id !== id))} currency={currency} language={language} />
        <PerPieceCard text={text} totals={filamentTotals} mode={mode} currency={currency} language={language} />
        <WasteCard text={text} totals={filamentTotals} language={language} />
        <ExtrasCard text={text} totals={extraTotals} update={updateExtra} add={() => setExtraRows((rows) => [...rows, { id: makeId(), name: `Cost ${rows.length + 1}`, fixedCost: 0, costPerPiece: 0, minutesPerPlate: 0, minutesPerPiece: 0, hourlyRate: 25 }])} reset={() => setExtraRows(withIds(blankExtras))} remove={(id) => setExtraRows((rows) => rows.filter((row) => row.id !== id))} currency={currency} language={language} />
        <ProductionCard text={text} production={productionTotals} extras={extraTotals} filament={filamentTotals} currency={currency} language={language} />
      </section>
      {showChecks ? <Tests text={text} language={language} /> : null}
    </div>
  </main>;
}
