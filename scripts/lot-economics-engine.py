#!/usr/bin/env python3
"""
ITPH Lot Economics Engine — Design Concept Scenario Generator
==============================================================
Generates lot-to-district assignments and financial projections
for each of the 5 design concepts from the base plan data.

Base Plan (30 lots, 136 acres):
- Multifamily: Lots 13-16 (48.5 ac, $6.50-$7.50/SF)
- Retail: Lots 2-4, 8, 17-30 (18 lots, 23.48 ac, $7-$15/SF)
- Industrial/Flex: Lots 1, 5-7, 9-12 (8 lots, 27.6 ac, $6.50-$15/SF)
- Detention: 24.27 ac (non-revenue)
- ROW: 9.21 ac (non-revenue)

Constants:
- 136 total acres, 30 developable lots
- MUD Bond Reimbursement: $23.4M
- Development Budget: $36.2M
- Entity: Bissonnet 136, LLC
"""

import json
from dataclasses import dataclass, asdict
from typing import List, Dict

# ── Base Lot Schedule ──────────────────────────────────────────
BASE_LOTS = [
    {"id":1,  "phase":1, "type":"Industrial",  "acres":3.88, "asking":7.25, "saleMonth":13, "location":"interior", "road":"Cook Rd"},
    {"id":2,  "phase":1, "type":"Retail",      "acres":1.4,  "asking":15,   "saleMonth":13, "location":"corner",   "road":"Bissonnet/ITPH"},
    {"id":3,  "phase":1, "type":"Retail",      "acres":1.2,  "asking":15,   "saleMonth":1,  "location":"corner",   "road":"Bissonnet/ITPH"},
    {"id":4,  "phase":1, "type":"Retail",      "acres":1.2,  "asking":15,   "saleMonth":14, "location":"corner",   "road":"Bissonnet/ITPH"},
    {"id":5,  "phase":1, "type":"Industrial",  "acres":6.4,  "asking":6.5,  "saleMonth":8,  "location":"interior", "road":"S Kirkwood"},
    {"id":6,  "phase":1, "type":"Industrial",  "acres":4.9,  "asking":6.5,  "saleMonth":11, "location":"interior", "road":"S Kirkwood"},
    {"id":7,  "phase":1, "type":"Industrial",  "acres":3.3,  "asking":15,   "saleMonth":8,  "location":"corner",   "road":"S Kirkwood/ITPH"},
    {"id":8,  "phase":1, "type":"Retail",      "acres":1.3,  "asking":7,    "saleMonth":6,  "location":"interior", "road":"Cook Corridor"},
    {"id":9,  "phase":2, "type":"Industrial",  "acres":3.1,  "asking":6.5,  "saleMonth":30, "location":"interior", "road":"Cook Corridor"},
    {"id":10, "phase":2, "type":"Industrial",  "acres":2.4,  "asking":6.5,  "saleMonth":30, "location":"interior", "road":"Cook Corridor"},
    {"id":11, "phase":2, "type":"Industrial",  "acres":1.8,  "asking":6.5,  "saleMonth":30, "location":"interior", "road":"Interior"},
    {"id":12, "phase":2, "type":"Industrial",  "acres":1.8,  "asking":6.5,  "saleMonth":30, "location":"interior", "road":"Interior"},
    {"id":13, "phase":2, "type":"Multifamily", "acres":11.8, "asking":6.5,  "saleMonth":28, "location":"interior", "road":"Interior"},
    {"id":14, "phase":2, "type":"Multifamily", "acres":13.2, "asking":7.5,  "saleMonth":28, "location":"interior", "road":"Interior"},
    {"id":15, "phase":2, "type":"Multifamily", "acres":11.2, "asking":7.5,  "saleMonth":28, "location":"interior", "road":"Interior"},
    {"id":16, "phase":1, "type":"Multifamily", "acres":12.3, "asking":7.5,  "saleMonth":17, "location":"interior", "road":"S Kirkwood"},
    {"id":17, "phase":1, "type":"Retail",      "acres":1.2,  "asking":15,   "saleMonth":8,  "location":"corner",   "road":"Bissonnet/Collector"},
    {"id":18, "phase":2, "type":"Retail",      "acres":1.2,  "asking":15,   "saleMonth":22, "location":"interior", "road":"Interior"},
    {"id":19, "phase":1, "type":"Retail",      "acres":2.0,  "asking":15,   "saleMonth":12, "location":"corner",   "road":"Bissonnet/Collector"},
    {"id":20, "phase":1, "type":"Retail",      "acres":1.4,  "asking":15,   "saleMonth":10, "location":"corner",   "road":"Collector/ITPH"},
    {"id":21, "phase":1, "type":"Retail",      "acres":1.1,  "asking":15,   "saleMonth":15, "location":"interior", "road":"Collector"},
    {"id":22, "phase":1, "type":"Retail",      "acres":1.2,  "asking":15,   "saleMonth":11, "location":"corner",   "road":"Collector/ITPH"},
    {"id":23, "phase":1, "type":"Retail",      "acres":2.0,  "asking":15,   "saleMonth":16, "location":"corner",   "road":"Bissonnet/Collector"},
    {"id":24, "phase":1, "type":"Retail",      "acres":1.2,  "asking":15,   "saleMonth":15, "location":"interior", "road":"Collector"},
    {"id":25, "phase":1, "type":"Retail",      "acres":1.4,  "asking":15,   "saleMonth":16, "location":"corner",   "road":"Collector/ITPH"},
    {"id":26, "phase":1, "type":"Retail",      "acres":1.2,  "asking":15,   "saleMonth":18, "location":"interior", "road":"Interior"},
    {"id":27, "phase":1, "type":"Retail",      "acres":1.0,  "asking":15,   "saleMonth":19, "location":"interior", "road":"Interior"},
    {"id":28, "phase":2, "type":"Retail",      "acres":1.0,  "asking":15,   "saleMonth":20, "location":"interior", "road":"Interior"},
    {"id":29, "phase":1, "type":"Retail",      "acres":1.0,  "asking":15,   "saleMonth":14, "location":"interior", "road":"Interior"},
    {"id":30, "phase":1, "type":"Retail",      "acres":1.5,  "asking":15,   "saleMonth":5,  "location":"corner",   "road":"Bissonnet/S Kirkwood"},
]

# ── Constants ──────────────────────────────────────────────────
TOTAL_ACRES = 136.0
DEVELOPABLE_LOTS = 30
MUD_REIMBURSEMENT = 23_400_000
DEV_BUDGET = 36_200_000
EQUITY_REQUIRED = 11_387_289
PREF_RETURN = 0.08
PROMOTE_SPLIT_EQUITY = 0.70
PROMOTE_SPLIT_DEV = 0.30
INVESTMENT_PERIOD_MONTHS = 58  # avg 54-62

# Pricing per SF by type
PRICING = {
    "Retail_corner": 15.00,
    "Retail_interior": 10.00,
    "Industrial_corner": 15.00,
    "Industrial_interior": 6.50,
    "Multifamily": 7.00,  # avg of 6.50-7.50
    "Flex_corner": 12.00,
    "Flex_interior": 6.50,
}

SF_PER_ACRE = 43560

def compute_lot_revenue(lot, override_type=None, override_asking=None):
    """Compute gross revenue for a single lot."""
    t = override_type or lot["type"]
    asking = override_asking or lot["asking"]
    sf = lot["acres"] * SF_PER_ACRE
    return round(sf * asking, 2)

def compute_scenario(name, description, lot_assignments):
    """
    Compute full scenario economics from lot assignments.
    lot_assignments: list of {lot_id, type, asking} overrides
    """
    # Build override map
    overrides = {a["lot_id"]: a for a in lot_assignments}
    
    # Compute per-lot economics
    lots_result = []
    type_summary = {}
    total_revenue = 0
    
    for lot in BASE_LOTS:
        override = overrides.get(lot["id"], {})
        lot_type = override.get("type", lot["type"])
        lot_asking = override.get("asking", lot["asking"])
        revenue = compute_lot_revenue(lot, lot_type, lot_asking)
        total_revenue += revenue
        
        lots_result.append({
            "id": lot["id"],
            "phase": lot["phase"],
            "type": lot_type,
            "acres": lot["acres"],
            "asking_psf": lot_asking,
            "revenue": revenue,
            "location": lot["location"],
            "road": lot["road"],
            "saleMonth": override.get("saleMonth", lot["saleMonth"]),
            "changed": lot["id"] in overrides,
        })
        
        if lot_type not in type_summary:
            type_summary[lot_type] = {"lots": 0, "acres": 0, "revenue": 0, "min_psf": 999, "max_psf": 0}
        ts = type_summary[lot_type]
        ts["lots"] += 1
        ts["acres"] += lot["acres"]
        ts["revenue"] += revenue
        ts["min_psf"] = min(ts["min_psf"], lot_asking)
        ts["max_psf"] = max(ts["max_psf"], lot_asking)
    
    net_profit = total_revenue - DEV_BUDGET + MUD_REIMBURSEMENT
    equity_net = net_profit * PROMOTE_SPLIT_EQUITY
    dev_net = net_profit * PROMOTE_SPLIT_DEV
    equity_multiple = (EQUITY_REQUIRED + equity_net) / EQUITY_REQUIRED
    # Simple IRR approximation
    years = INVESTMENT_PERIOD_MONTHS / 12
    equity_irr = (equity_multiple ** (1/years) - 1) * 100
    project_multiple = (EQUITY_REQUIRED + net_profit) / EQUITY_REQUIRED
    project_irr = (project_multiple ** (1/years) - 1) * 100
    
    return {
        "name": name,
        "description": description,
        "lots": lots_result,
        "type_summary": type_summary,
        "total_revenue": round(total_revenue),
        "dev_budget": DEV_BUDGET,
        "mud_reimbursement": MUD_REIMBURSEMENT,
        "net_profit": round(net_profit),
        "equity_required": EQUITY_REQUIRED,
        "equity_net_profit": round(equity_net),
        "dev_net_profit": round(dev_net),
        "equity_multiple": round(equity_multiple, 2),
        "equity_irr": round(equity_irr, 1),
        "project_multiple": round(project_multiple, 2),
        "project_irr": round(project_irr, 1),
        "pref_return": PREF_RETURN,
        "promote_split": f"{int(PROMOTE_SPLIT_EQUITY*100)}/{int(PROMOTE_SPLIT_DEV*100)}",
        "investment_period": f"{INVESTMENT_PERIOD_MONTHS-4}–{INVESTMENT_PERIOD_MONTHS+4} months",
    }


# ── SCENARIO DEFINITIONS ──────────────────────────────────────

def scenario_base():
    """Current base plan — no changes."""
    return compute_scenario(
        "Base Plan (Current)",
        "Current 30-lot configuration as designed. Balanced mix of retail, industrial/flex, and multifamily.",
        []  # no overrides
    )

def scenario_town_center():
    """Town Center — retail-dominant, restaurant pads, medical office."""
    overrides = [
        # Convert interior industrial lots to retail
        {"lot_id": 5,  "type": "Retail", "asking": 10.00},  # S Kirkwood interior → value retail
        {"lot_id": 6,  "type": "Retail", "asking": 10.00},  # S Kirkwood interior → value retail
        {"lot_id": 9,  "type": "Retail", "asking": 10.00},  # Cook Corridor → retail
        {"lot_id": 10, "type": "Retail", "asking": 10.00},  # Cook Corridor → retail
        {"lot_id": 11, "type": "Retail", "asking": 10.00},  # Interior → retail
        {"lot_id": 12, "type": "Retail", "asking": 10.00},  # Interior → retail
        # Keep corner industrial as premium retail
        {"lot_id": 1,  "type": "Retail", "asking": 12.00},  # Corner → restaurant pad
        {"lot_id": 7,  "type": "Retail", "asking": 15.00},  # S Kirkwood corner stays premium
    ]
    return compute_scenario(
        "Town Center",
        "Retail-dominant configuration. Restaurant pads on Bissonnet frontage, medical office cluster, neighborhood services. Reduced industrial allocation. Target: walkable mixed-use town center.",
        overrides
    )

def scenario_logistics():
    """Logistics Corridor — industrial/flex-dominant."""
    overrides = [
        # Convert interior retail lots to industrial/flex
        {"lot_id": 8,  "type": "Industrial", "asking": 7.00},
        {"lot_id": 18, "type": "Industrial", "asking": 6.50},
        {"lot_id": 21, "type": "Industrial", "asking": 6.50},
        {"lot_id": 24, "type": "Industrial", "asking": 6.50},
        {"lot_id": 26, "type": "Industrial", "asking": 6.50},
        {"lot_id": 27, "type": "Industrial", "asking": 6.50},
        {"lot_id": 28, "type": "Industrial", "asking": 6.50},
        {"lot_id": 29, "type": "Industrial", "asking": 6.50},
        # Keep corner retail for support services only
    ]
    return compute_scenario(
        "Logistics Corridor",
        "Industrial/flex-dominant configuration. 60%+ industrial and flex/warehouse lots. Support retail only (gas, food, convenience). Leverages Beltway 8 access and SW Houston logistics demand.",
        overrides
    )

def scenario_workforce():
    """Workforce Village — multifamily-anchor, EB-5/LIHTC."""
    overrides = [
        # Convert industrial lots to multifamily
        {"lot_id": 5,  "type": "Multifamily", "asking": 7.00},
        {"lot_id": 6,  "type": "Multifamily", "asking": 7.00},
        {"lot_id": 9,  "type": "Multifamily", "asking": 6.50},
        {"lot_id": 10, "type": "Multifamily", "asking": 6.50},
        # Convert some interior retail to multifamily
        {"lot_id": 18, "type": "Multifamily", "asking": 6.50},
        {"lot_id": 26, "type": "Multifamily", "asking": 6.50},
        {"lot_id": 27, "type": "Multifamily", "asking": 6.50},
        {"lot_id": 28, "type": "Multifamily", "asking": 6.50},
    ]
    return compute_scenario(
        "Workforce Village",
        "Multifamily-anchor configuration. Maximizes multifamily acreage for EB-5 and LIHTC compatibility. Workforce housing focus with supporting retail and services. Target: tax credit investors and community development.",
        overrides
    )

def scenario_premium_pad():
    """Premium Pad Strategy — two-tier pricing."""
    overrides = [
        # Corner lots at premium pricing
        {"lot_id": 2,  "type": "Retail", "asking": 18.00},  # Bissonnet corner premium
        {"lot_id": 3,  "type": "Retail", "asking": 18.00},
        {"lot_id": 4,  "type": "Retail", "asking": 18.00},
        {"lot_id": 7,  "type": "Retail", "asking": 18.00},  # S Kirkwood corner
        {"lot_id": 17, "type": "Retail", "asking": 18.00},
        {"lot_id": 19, "type": "Retail", "asking": 18.00},
        {"lot_id": 20, "type": "Retail", "asking": 18.00},
        {"lot_id": 22, "type": "Retail", "asking": 18.00},
        {"lot_id": 23, "type": "Retail", "asking": 18.00},
        {"lot_id": 25, "type": "Retail", "asking": 18.00},
        {"lot_id": 30, "type": "Retail", "asking": 18.00},  # Bissonnet/S Kirkwood corner
        # Interior lots at discounted flex pricing
        {"lot_id": 5,  "type": "Flex", "asking": 5.50},
        {"lot_id": 6,  "type": "Flex", "asking": 5.50},
        {"lot_id": 8,  "type": "Flex", "asking": 5.50},
        {"lot_id": 9,  "type": "Flex", "asking": 5.50},
        {"lot_id": 10, "type": "Flex", "asking": 5.50},
        {"lot_id": 11, "type": "Flex", "asking": 5.50},
        {"lot_id": 12, "type": "Flex", "asking": 5.50},
    ]
    return compute_scenario(
        "Premium Pad Strategy",
        "Two-tier pricing model. Corner lots at $18/SF premium rates (Bissonnet/collector road frontage), interior lots at discounted $5.50/SF flex pricing. Optimizes revenue by location-based pricing differentials.",
        overrides
    )

def scenario_balanced():
    """Balanced Mixed-Use — refined baseline with phasing."""
    overrides = [
        # Slight adjustments: move Cook Corridor retail to flex (per broker feedback)
        {"lot_id": 8,  "type": "Flex", "asking": 8.00},
        {"lot_id": 9,  "type": "Flex", "asking": 7.00},
        {"lot_id": 10, "type": "Flex", "asking": 7.00},
        # Bump corner retail slightly
        {"lot_id": 2,  "type": "Retail", "asking": 16.00},
        {"lot_id": 3,  "type": "Retail", "asking": 16.00},
        {"lot_id": 30, "type": "Retail", "asking": 16.00},
    ]
    return compute_scenario(
        "Balanced Mixed-Use",
        "Refined baseline with optimized phasing and absorption timeline. Proportional mix across all use types. Cook Corridor adjusted to flex per broker feedback. Corner premiums applied. Staged lot releases tied to infrastructure milestones and MUD bond issuance schedule.",
        overrides
    )


def main():
    scenarios = [
        scenario_base(),
        scenario_town_center(),
        scenario_logistics(),
        scenario_workforce(),
        scenario_premium_pad(),
        scenario_balanced(),
    ]
    
    # Save full data
    output_path = "/Users/dave/.openclaw/workspace/houstoncapitalplan/data/scenario_economics.json"
    import os
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(scenarios, f, indent=2)
    
    # Print summary
    print("=" * 80)
    print("ITPH LOT ECONOMICS ENGINE — SCENARIO COMPARISON")
    print("=" * 80)
    
    header = f"{'Scenario':<25} {'Revenue':>12} {'Net Profit':>12} {'Eq Multiple':>12} {'Eq IRR':>8} {'Proj IRR':>8}"
    print(header)
    print("-" * 80)
    
    for s in scenarios:
        print(f"{s['name']:<25} ${s['total_revenue']/1e6:>9.1f}M ${s['net_profit']/1e6:>9.1f}M {s['equity_multiple']:>10.2f}x {s['equity_irr']:>6.1f}% {s['project_irr']:>6.1f}%")
    
    print()
    for s in scenarios:
        print(f"\n{'─'*60}")
        print(f"  {s['name'].upper()}")
        print(f"  {s['description'][:100]}")
        print(f"{'─'*60}")
        print(f"  {'Type':<15} {'Lots':>5} {'Acres':>8} {'$/SF':>12} {'Revenue':>14}")
        for tname, ts in sorted(s["type_summary"].items()):
            psf = f"${ts['min_psf']:.2f}–${ts['max_psf']:.2f}" if ts['min_psf'] != ts['max_psf'] else f"${ts['min_psf']:.2f}"
            print(f"  {tname:<15} {ts['lots']:>5} {ts['acres']:>7.1f} {psf:>12} ${ts['revenue']/1e6:>11.2f}M")
        print(f"  {'TOTAL':<15} {30:>5} {sum(t['acres'] for t in s['type_summary'].values()):>7.1f} {'':>12} ${s['total_revenue']/1e6:>11.2f}M")
    
    print(f"\n✅ Full data saved to: {output_path}")
    return scenarios


if __name__ == "__main__":
    main()
