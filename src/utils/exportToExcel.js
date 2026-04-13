import * as XLSX from 'xlsx';

const fmt = (v) => typeof v === 'number' ? Math.round(v * 100) / 100 : v;
const currency = (v) => typeof v === 'number' ? Math.round(v) : 0;

export function exportModelToExcel(model, params, lots) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ──
  const summaryData = [
    ['ITP HOUSTON CAPITAL PLAN — Financial Model Export'],
    ['Generated', new Date().toLocaleDateString()],
    [],
    ['KEY METRICS'],
    ['Total Revenue', currency(model.totalRev)],
    ['  Lot Revenue', currency(model.totalLotRev)],
    ['  MUD Revenue', currency(model.totalMudRev)],
    ['Total Cost', currency(model.totalCost)],
    ['  Hard Costs', currency(model.totalHard)],
    ['  Soft Costs', currency(model.totalSoft)],
    ['  Dev Fee', currency(model.totalDevFee)],
    ['  Financing', currency(model.totalFin)],
    ['Total Profit', currency(model.totalProfit)],
    [],
    ['EQUITY WATERFALL'],
    ['Equity Contributed', currency(model.eqTotalContrib)],
    ['Preferred Return Accrued', currency(model.eqTotalPref)],
    ['Equity Distributed', currency(model.eqTotalDist)],
    ['Equity Profit Share', currency(model.eqTotalFinal)],
    ['Equity Net Profit', currency(model.eqNetProfit)],
    ['Developer Net Profit', currency(model.devNetProfit)],
    ['Equity Multiple', fmt(model.eqMultiple) + 'x'],
    ['Peak Loan Balance', currency(model.peakLoan)],
    [],
    ['ASSUMPTIONS'],
    ['Equity Investment', currency(params.equity)],
    ['Preferred Return', (params.prefReturn * 100) + '%'],
    ['Equity Split', (params.equityPct * 100) + '%'],
    ['Developer Split', (params.devPct * 100) + '%'],
    ['Loan Rate', (params.loanRate * 100) + '%'],
    ['MUD Total', currency(params.mudTotal)],
    ['Dev Fee %', (params.devFee * 100) + '%'],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ── Sheet 2: Lot Schedule ──
  const lotHeaders = ['Lot #', 'Type', 'Acres', 'Asking $/SF', 'Sale Month', 'Sq Ft', 'Gross Revenue', 'Closing Cost', 'Net Revenue'];
  const lotRows = model.lotsCalc.map(l => [l.id, l.type, l.acres, l.asking, l.saleMonth, Math.round(l.sf), currency(l.gross), currency(l.closing), currency(l.net)]);
  const wsLots = XLSX.utils.aoa_to_sheet([lotHeaders, ...lotRows]);
  wsLots['!cols'] = lotHeaders.map(() => ({ wch: 14 }));
  XLSX.utils.book_append_sheet(wb, wsLots, 'Lot Schedule');

  // ── Sheet 3: Monthly Cash Flows ──
  const cfHeaders = ['Month', 'Lot Revenue', 'MUD Revenue', 'Total Revenue', 'Hard Costs', 'Soft Costs', 'Dev Fee', 'Unlevered Cost', 'Fin Fixed', 'Loan Interest', 'Total Fin Cost', 'Levered CF', 'Loan Draw', 'Loan Paydown', 'Loan Balance', 'Escrow Balance'];
  const numMonths = model.lotRevenue.length;
  const cfRows = [];
  for (let m = 0; m < numMonths; m++) {
    cfRows.push([
      m, currency(model.lotRevenue[m]), currency(model.mudRevenue[m]), currency(model.totalRevenue[m]),
      currency(model.hardCostMo[m]), currency(model.softCostMo[m]), currency(model.devFeeMo[m]),
      currency(model.unleveredCost[m]), currency(model.finFixedMo[m]), currency(model.loanInt[m]),
      currency(model.totalFinCost[m]), currency(model.leveredCF[m]),
      currency(model.loanDraw[m]), currency(model.loanPay[m]), currency(model.loanEnd[m]), currency(model.escrowEnd[m])
    ]);
  }
  const wsCF = XLSX.utils.aoa_to_sheet([cfHeaders, ...cfRows]);
  wsCF['!cols'] = cfHeaders.map(() => ({ wch: 14 }));
  XLSX.utils.book_append_sheet(wb, wsCF, 'Monthly Cash Flows');

  // ── Sheet 4: Equity Waterfall ──
  const eqHeaders = ['Month', 'Eq Beginning', 'Eq Contribution', 'Pref Return', 'Eq Distribution', 'Eq Ending', 'Remaining', 'Eq Final Dist', 'Dev Final Dist'];
  const eqRows = [];
  for (let m = 0; m < numMonths; m++) {
    eqRows.push([
      m, currency(model.eqBeg[m]), currency(model.eqContrib[m]), currency(model.eqPref[m]),
      currency(model.eqDist[m]), currency(model.eqEnd[m]), currency(model.remaining[m]),
      currency(model.eqFinalDist[m]), currency(model.devFinalDist[m])
    ]);
  }
  const wsEq = XLSX.utils.aoa_to_sheet([eqHeaders, ...eqRows]);
  wsEq['!cols'] = eqHeaders.map(() => ({ wch: 16 }));
  XLSX.utils.book_append_sheet(wb, wsEq, 'Equity Waterfall');

  // ── Sheet 5: Lot Summary by Type ──
  const lsHeaders = ['Lot Type', 'Count', 'Total Acres', 'Total Net Value'];
  const lsRows = Object.entries(model.lotSummary).map(([type, data]) => [type, data.count, fmt(data.acres), currency(data.value)]);
  const wsLS = XLSX.utils.aoa_to_sheet([lsHeaders, ...lsRows]);
  wsLS['!cols'] = lsHeaders.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, wsLS, 'Lot Summary');

  // ── Download ──
  XLSX.writeFile(wb, 'ITP_Houston_Capital_Plan.xlsx');
}
