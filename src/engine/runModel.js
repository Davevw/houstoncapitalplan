// ITP Houston Capital Plan - Financial Model Engine
// Extracted from monolithic component for maintainability and testability

import { HARD_COSTS, SOFT_COSTS, NUM_MONTHS } from '../data/projectData.js';

function runModel(lots, params) {
  const {equity,prefReturn,equityPct,devPct,loanRate,mudTotal,mudMonth1,mudMonth2,devFee} = params;
  const closingPct = 0.04;
  const lotsCalc = lots.map(l => {
    const sf = l.acres*43560;
    const gross = sf*l.asking;
    const closing = gross*closingPct;
    const net = gross-closing;
    return {...l,sf,gross,closing,net};
  });

  const lotRevenue = new Array(NUM_MONTHS+1).fill(0);
  const mudRevenue = new Array(NUM_MONTHS+1).fill(0);
  lotsCalc.forEach(l => {if(l.saleMonth>=0&&l.saleMonth<=NUM_MONTHS)lotRevenue[l.saleMonth]+=l.net;});
  if(mudMonth1<=NUM_MONTHS) mudRevenue[mudMonth1]=mudTotal/2;
  if(mudMonth2<=NUM_MONTHS) mudRevenue[mudMonth2]=mudTotal/2;

  const totalRevenue = lotRevenue.map((v,i)=>v+mudRevenue[i]);
  const hardCostMo = new Array(NUM_MONTHS+1).fill(0);
  const softCostMo = new Array(NUM_MONTHS+1).fill(0);
  HARD_COSTS.forEach(c=>{for(let m=c.start;m<c.start+c.dur&&m<=NUM_MONTHS;m++)hardCostMo[m]+=c.total/c.dur;});
  SOFT_COSTS.forEach(c=>{for(let m=c.start;m<c.start+c.dur&&m<=NUM_MONTHS;m++)softCostMo[m]+=c.total/c.dur;});

  const devFeeMo = hardCostMo.map((h,i)=>(h+softCostMo[i])*devFee);
  const landMo = new Array(NUM_MONTHS+1).fill(0);
  landMo[0] = equity;
  const unleveredCost = landMo.map((l,i)=>l+hardCostMo[i]+softCostMo[i]+devFeeMo[i]);
  const finFixedMo = new Array(NUM_MONTHS+1).fill(0);
  finFixedMo[0] = 240000+150000;

  const escrowBeg=new Array(NUM_MONTHS+1).fill(0),escrowEnd=new Array(NUM_MONTHS+1).fill(0);
  const loanBeg=new Array(NUM_MONTHS+1).fill(0),loanEnd=new Array(NUM_MONTHS+1).fill(0);
  const loanInt=new Array(NUM_MONTHS+1).fill(0),loanDraw=new Array(NUM_MONTHS+1).fill(0),loanPay=new Array(NUM_MONTHS+1).fill(0);

  for(let m=0;m<=NUM_MONTHS;m++){
    escrowBeg[m]=m===0?0:escrowEnd[m-1];
    loanBeg[m]=m===0?0:loanEnd[m-1];
    loanInt[m]=loanBeg[m]*loanRate/12;
    const expenses=hardCostMo[m]+softCostMo[m]+devFeeMo[m]+finFixedMo[m]+loanInt[m];
    const inflow=totalRevenue[m];
    const avail=escrowBeg[m]+inflow;
    loanDraw[m]=Math.max(0,expenses-avail);
    loanPay[m]=Math.min(loanBeg[m],Math.max(0,avail-expenses));
    const outflow=Math.min(expenses+loanPay[m],Math.max(0,avail));
    escrowEnd[m]=Math.max(0,avail-outflow);
    loanEnd[m]=Math.max(0,loanBeg[m]+loanDraw[m]-loanPay[m]);
  }

  const totalFinCost=finFixedMo.map((f,i)=>f+loanInt[i]);
  const leveredCF=totalRevenue.map((r,i)=>r-unleveredCost[i]-totalFinCost[i]+(loanDraw[i]-loanPay[i]));

  // Two-pass waterfall: Capital Return + Pref first, then Profit Split
  // Pass 1: All positive CF pays down equity balance (no premature splits)
  // Pass 2: Total residual after all equity repaid gets split at end
  const eqBeg=new Array(NUM_MONTHS+1).fill(0),eqContrib=new Array(NUM_MONTHS+1).fill(0);
  const eqPref=new Array(NUM_MONTHS+1).fill(0),eqDist=new Array(NUM_MONTHS+1).fill(0);
  const eqEnd=new Array(NUM_MONTHS+1).fill(0),remaining=new Array(NUM_MONTHS+1).fill(0);
  const eqFinalDist=new Array(NUM_MONTHS+1).fill(0),devFinalDist=new Array(NUM_MONTHS+1).fill(0);

  for(let m=0;m<=NUM_MONTHS;m++){
    eqBeg[m]=m===0?0:eqEnd[m-1];
    eqContrib[m]=leveredCF[m]<0?-leveredCF[m]:0;
    eqPref[m]=m===0?0:eqBeg[m]*((1+prefReturn)**(1/12)-1);
    const eqOwed=eqBeg[m]+eqContrib[m]+eqPref[m];
    if(leveredCF[m]>0){
      const payToEquity=Math.min(leveredCF[m],eqOwed);
      eqDist[m]=-payToEquity;
    } else {
      eqDist[m]=0;
    }
    eqEnd[m]=eqOwed+eqDist[m];
  }
  // Pass 2: Final settlement - pay off remaining equity, then split residual
  const finalBal=eqEnd[NUM_MONTHS];
  const totalPosCF=leveredCF.reduce((a,cf)=>a+(cf>0?cf:0),0);
  const totalDistributed=-eqDist.reduce((a,b)=>a+b,0);
  const surplusCF=totalPosCF-totalDistributed;
  const finalPayoff=Math.min(surplusCF,finalBal);
  const totalResidual=Math.max(0,surplusCF-finalPayoff);
  eqDist[NUM_MONTHS]+=-finalPayoff;
  eqEnd[NUM_MONTHS]=Math.max(0,finalBal-finalPayoff);
  remaining[NUM_MONTHS]=totalResidual;
  eqFinalDist[NUM_MONTHS]=totalResidual*equityPct;
  devFinalDist[NUM_MONTHS]=totalResidual*devPct;

  const totalLotRev=lotRevenue.reduce((a,b)=>a+b,0);
  const totalMudRev=mudRevenue.reduce((a,b)=>a+b,0);
  const totalRev=totalLotRev+totalMudRev;
  const totalHard=HARD_COSTS.reduce((a,c)=>a+c.total,0);
  const totalSoft=SOFT_COSTS.reduce((a,c)=>a+c.total,0);
  const totalDevFee=devFeeMo.reduce((a,b)=>a+b,0);
  const totalUnlev=unleveredCost.reduce((a,b)=>a+b,0);
  const totalFin=totalFinCost.reduce((a,b)=>a+b,0);
  const totalCost=totalUnlev+totalFin;
  const totalProfit=totalRev-totalCost;
  const peakLoan=Math.max(...loanEnd);
  const eqTotalContrib=eqContrib.reduce((a,b)=>a+b,0);
  const eqTotalPref=eqPref.reduce((a,b)=>a+b,0);
  const eqTotalDist=-eqDist.reduce((a,b)=>a+b,0);
  const eqTotalFinal=eqFinalDist.reduce((a,b)=>a+b,0);
  const devTotalFinal=devFinalDist.reduce((a,b)=>a+b,0);
  const eqNetProfit=eqTotalDist+eqTotalFinal-eqTotalContrib;
  const devNetProfit=devTotalFinal;
  const eqMultiple=eqTotalContrib>0?(eqTotalDist+eqTotalFinal)/eqTotalContrib:0;
  let cumCF=0;
  const monthlyCFData=leveredCF.map((cf,i)=>{cumCF+=cf;return{month:i,cf,cumCF,revenue:totalRevenue[i],cost:unleveredCost[i]+totalFinCost[i]};});
  const lotSummary={};
  lotsCalc.forEach(l=>{if(!lotSummary[l.type])lotSummary[l.type]={count:0,acres:0,value:0};lotSummary[l.type].count++;lotSummary[l.type].acres+=l.acres;lotSummary[l.type].value+=l.net;});

  return {
    lotsCalc,lotSummary,monthlyCFData,totalRev,totalLotRev,totalMudRev,totalCost,totalProfit,
    totalHard,totalSoft,totalDevFee,totalFin,peakLoan,eqTotalContrib,eqTotalPref,eqTotalDist,
    eqTotalFinal,eqNetProfit,devNetProfit,eqMultiple,lotRevenue,mudRevenue,hardCostMo,softCostMo,
    totalRevenue,unleveredCost,devFeeMo,landMo,finFixedMo,loanInt,loanDraw,loanPay,loanBeg,loanEnd,
    escrowBeg,escrowEnd,totalFinCost,leveredCF,eqBeg,eqContrib,eqPref,eqDist,eqEnd,
    remaining,eqFinalDist,devFinalDist,totalUnlev,
    equity:params.equity,prefReturn:params.prefReturn,equityPct:params.equityPct,devPct:params.devPct,
  };
}

export { runModel };
