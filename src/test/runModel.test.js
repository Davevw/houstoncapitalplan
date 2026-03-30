import { describe, it, expect } from 'vitest';
import { runModel } from '../engine/runModel';
import { LOTS, DEEMED_CAPITAL_TOTAL } from '../data/projectData';

const DEFAULT_PARAMS = {
  equity: DEEMED_CAPITAL_TOTAL,
  prefReturn: 0.08,
  equityPct: 0.50,
  devPct: 0.50,
  loanRate: 0.11,
  mudTotal: 23400000,
  mudMonth1: 15,
  mudMonth2: 21,
  devFee: 0.05,
};

describe('runModel - Financial Engine', () => {
  const model = runModel(LOTS, DEFAULT_PARAMS);

  // ── Revenue Calculations ──
  describe('Revenue', () => {
    it('should compute positive total revenue', () => {
      expect(model.totalRev).toBeGreaterThan(0);
    });

    it('should have lot revenue + MUD revenue = total revenue', () => {
      expect(model.totalLotRev + model.totalMudRev).toBeCloseTo(model.totalRev, 2);
    });

    it('should have 30 lots calculated', () => {
      expect(model.lotsCalc).toHaveLength(30);
    });

    it('should apply 4% closing costs (net = gross * 0.96)', () => {
      const lot = model.lotsCalc[0]; // Lot 1: 3.88 acres, $7.25/sf
      const expectedGross = 3.88 * 43560 * 7.25;
      expect(lot.gross).toBeCloseTo(expectedGross, 0);
      expect(lot.net).toBeCloseTo(expectedGross * 0.96, 0);
    });

    it('should split MUD revenue into two tranches', () => {
      expect(model.mudRevenue[DEFAULT_PARAMS.mudMonth1]).toBeCloseTo(DEFAULT_PARAMS.mudTotal / 2, 0);
      expect(model.mudRevenue[DEFAULT_PARAMS.mudMonth2]).toBeCloseTo(DEFAULT_PARAMS.mudTotal / 2, 0);
    });
  });

  // ── Cost Calculations ──
  describe('Costs', () => {
    it('should compute positive total cost', () => {
      expect(model.totalCost).toBeGreaterThan(0);
    });

    it('should have total cost = unlevered + finance', () => {
      expect(model.totalUnlev + model.totalFin).toBeCloseTo(model.totalCost, 2);
    });

    it('should have hard costs around $23.6M', () => {
      expect(model.totalHard).toBeGreaterThan(23000000);
      expect(model.totalHard).toBeLessThan(24000000);
    });
  });

  // ── Profitability ──
  describe('Profitability', () => {
    it('should have positive total profit', () => {
      expect(model.totalProfit).toBeGreaterThan(0);
    });

    it('total profit should equal revenue minus cost', () => {
      expect(model.totalProfit).toBeCloseTo(model.totalRev - model.totalCost, 2);
    });
  });

  // ── Equity Waterfall ──
  describe('Equity Waterfall', () => {
    it('should have positive equity contributions', () => {
      expect(model.eqTotalContrib).toBeGreaterThan(0);
    });

    it('should have positive preferred return', () => {
      expect(model.eqTotalPref).toBeGreaterThan(0);
    });

    it('equity net profit should equal distributions + final share - contributions', () => {
      expect(model.eqNetProfit).toBeCloseTo(
        model.eqTotalDist + model.eqTotalFinal - model.eqTotalContrib, 2
      );
    });

    it('developer net profit should equal dev final distributions', () => {
      expect(model.devNetProfit).toBeCloseTo(model.eqTotalFinal * (DEFAULT_PARAMS.devPct / DEFAULT_PARAMS.equityPct), 1);
    });

    it('equity multiple should be > 1 (profitable deal)', () => {
      expect(model.eqMultiple).toBeGreaterThan(1);
    });

    it('equity + dev profit split should sum correctly', () => {
      // remaining[m] = eqFinalDist[m] + devFinalDist[m] (by construction)
      const totalRemaining = model.remaining.reduce((a, b) => a + b, 0);
      const totalFinalSplit = model.eqTotalFinal + model.devNetProfit;
      expect(totalFinalSplit).toBeCloseTo(totalRemaining, 2);
    });
  });

  // ── Equity/Dev Split Validation ──
  describe('Split Validation', () => {
    it('50/50 split should give equal profit shares of remaining', () => {
      // With 50/50 split, eqTotalFinal should equal devTotalFinal
      expect(model.eqTotalFinal).toBeCloseTo(model.devNetProfit, 2);
    });

    it('changing split should change distribution proportionally', () => {
      const model70_30 = runModel(LOTS, { ...DEFAULT_PARAMS, equityPct: 0.70, devPct: 0.30 });
      // Equity should get more, developer less
      expect(model70_30.eqTotalFinal).toBeGreaterThan(model70_30.devNetProfit);
      // Ratio should be ~70/30
      const totalSplit = model70_30.eqTotalFinal + model70_30.devNetProfit;
      expect(model70_30.eqTotalFinal / totalSplit).toBeCloseTo(0.70, 2);
    });
  });

  // ── Loan Mechanics ──
  describe('Loan Mechanics', () => {
    it('should have a peak loan balance', () => {
      expect(model.peakLoan).toBeGreaterThan(0);
    });

    it('loan should start at zero', () => {
      expect(model.loanBeg[0]).toBe(0);
    });

    it('loan balance should never go negative', () => {
      model.loanEnd.forEach(bal => {
        expect(bal).toBeGreaterThanOrEqual(-0.01); // allow tiny float errors
      });
    });
  });

  // ── Cash Flow Integrity ──
  describe('Cash Flow Integrity', () => {
    it('cumulative CF should match sum of monthly CFs', () => {
      let cum = 0;
      model.monthlyCFData.forEach(d => {
        cum += d.cf;
        expect(d.cumCF).toBeCloseTo(cum, 2);
      });
    });

    it('should have 55 months of data (0 through 54)', () => {
      expect(model.monthlyCFData).toHaveLength(55);
    });
  });
});
