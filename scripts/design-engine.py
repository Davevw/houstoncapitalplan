#!/opt/homebrew/bin/python3
"""
ITPH Design Request → Scenario + Tear Sheet Engine
=====================================================
Polls Supabase design_requests for status="submitted", auto-generates
a scenario from the request brief, renders an HTML tear sheet with
LANDCO NEXA branding, generates a PDF via Chrome headless, inserts
the scenario into design_scenarios, and marks the request "converted".

Usage:
    python3 design-engine.py                    # Process all pending requests
    python3 design-engine.py --request-id <id>  # Process a specific request
    python3 design-engine.py --dry-run          # Show what would be generated
    python3 design-engine.py --list             # List all design requests and status
"""

import argparse
import json
import os
import re
import subprocess
import sys
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests

# ─── Configuration ───────────────────────────────────────────────────────────

SUPABASE_URL = "https://tibxlixiqcfyljevkdib.supabase.co"
SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpYnhsaXhpcWNmeWxqZXZrZGliIiwi"
    "cm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTEwOTksImV4cCI6MjA5MDI4NzA5OX0."
    "nXyyRsIKcwIezVYyLyCXtT7JdZyO0VOcZjw4cunZub0"
)
BASE_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

PT = timezone(timedelta(hours=-7))

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = PROJECT_ROOT / "public" / "assets"
DATA_DIR = PROJECT_ROOT / "src" / "data"
SCENARIOS_JSON = DATA_DIR / "scenarios.json"

# ─── Lot Reference Data ─────────────────────────────────────────────────────

LOT_ACRES = {
    1: 3.88, 2: 1.40, 3: 1.20, 4: 1.20, 5: 6.38, 6: 4.88, 7: 3.28, 8: 1.26,
    9: 3.13, 10: 2.44, 11: 1.78, 12: 1.78, 13: 11.77, 14: 13.20, 15: 11.16,
    16: 12.26, 17: 1.20, 18: 1.18, 19: 1.96, 20: 1.38, 21: 1.14, 22: 1.16,
    23: 2.03, 24: 1.21, 25: 1.38, 26: 1.21, 27: 1.03, 28: 1.03, 29: 1.04, 30: 1.50,
}

LOT_POSITIONS = {
    1: "Corner", 2: "Frontage", 3: "Frontage", 4: "Frontage", 5: "Interior",
    6: "Interior", 7: "Interior", 8: "Frontage", 9: "Interior", 10: "Interior",
    11: "Interior", 12: "Corner", 13: "Interior", 14: "Corner", 15: "Corner",
    16: "Interior", 17: "Frontage", 18: "Frontage", 19: "Interior", 20: "Frontage",
    21: "Frontage", 22: "Frontage", 23: "Corner", 24: "Frontage", 25: "Frontage",
    26: "Frontage", 27: "Frontage", 28: "Frontage", 29: "Frontage", 30: "Frontage",
}

LOT_ROADS = {
    1: "Cook/Bissonnet", 2: "Bissonnet", 3: "Bissonnet", 4: "Bissonnet",
    5: "S Kirkwood", 6: "S Kirkwood", 7: "S Kirkwood/ITPH", 8: "Cook/ITPH",
    9: "Cook Corridor", 10: "Cook Corridor", 11: "Interior", 12: "ITPH/Cook",
    13: "Interior", 14: "Corner", 15: "Corner", 16: "S Kirkwood",
    17: "Bissonnet/Collector", 18: "Interior", 19: "Collector/ITPH",
    20: "Collector/ITPH", 21: "Collector", 22: "Collector/ITPH",
    23: "Bissonnet/Collector", 24: "Collector/ITPH", 25: "Collector",
    26: "Interior", 27: "Interior", 28: "Interior", 29: "Interior",
    30: "Bissonnet/S Kirkwood",
}

PRICING = {
    ("retail", "Corner"): 18.0,
    ("retail", "Frontage"): 15.0,
    ("retail", "Interior"): 12.0,
    ("flex", "any"): 10.0,
    ("industrial", "any"): 8.0,
    ("multifamily", "any"): 7.0,
    ("common", "any"): 0.0,
}

DISTRICT_COLORS = {
    "retail": "#5C6E3D",
    "flex": "#4A90A4",
    "industrial": "#888780",
    "multifamily": "#D4A84B",
    "common": "#D6D3CB",
}

DISTRICT_LABELS = {
    "retail": "Retail / Commercial",
    "flex": "Flex / Light Industrial",
    "industrial": "Light Industrial",
    "multifamily": "Multifamily",
    "common": "Common / Infrastructure",
}

CLIENT_TYPE_DEFAULTS = {
    "Retail Developer": "retail",
    "Restaurant Group": "retail",
    "Industrial": "flex",
    "Flex": "flex",
    "Multifamily": "multifamily",
    "Mixed-Use": "retail",
}

SQFT_PER_ACRE = 43560.0


# ─── Supabase Helpers ────────────────────────────────────────────────────────

def sb_get(table: str, params: str = "") -> list:
    url = f"{BASE_URL}/{table}"
    if params:
        url += f"?{params}"
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    return r.json()


def sb_post(table: str, payload: dict) -> dict:
    r = requests.post(f"{BASE_URL}/{table}", json=payload, headers=HEADERS, timeout=15)
    r.raise_for_status()
    data = r.json()
    return data[0] if isinstance(data, list) else data


def sb_patch(table: str, match: str, payload: dict) -> bool:
    r = requests.patch(
        f"{BASE_URL}/{table}?{match}",
        json=payload,
        headers={**HEADERS, "Prefer": "return=representation"},
        timeout=15,
    )
    return r.status_code in (200, 204)


# ─── Lot Assignment Parser ──────────────────────────────────────────────────

def parse_lot_assignments(req: dict) -> dict:
    """Parse a design request into a lot# → district mapping for all 30 lots."""
    desc = (req.get("description") or "").lower()
    priority = (req.get("priority_lots") or "").lower()
    client_type = req.get("target_client_type") or ""

    # Merge clarification responses into a single text blob
    clarifications = req.get("clarifications") or []
    clarif_text = " ".join(
        (c.get("response") or "") for c in clarifications
        if isinstance(c, dict)
    ).lower()

    combined = f"{desc} {priority} {clarif_text}"

    assignments: dict[int, str] = {}

    # ── Pass 1: Explicit lot mentions (e.g. "Lot 8 for fuel" → retail) ──
    explicit_patterns = [
        (r"lot\s*(\d+)\s+(?:for\s+)?(?:fuel|convenience|gas)", "retail"),
        (r"lot\s*(\d+)\s+(?:for\s+)?(?:restaurant|dining|qsr)", "retail"),
        (r"lot\s*(\d+)\s+(?:for\s+)?(?:retail|commercial|shop)", "retail"),
        (r"lot\s*(\d+)\s+(?:for\s+)?(?:flex|warehouse|showroom)", "flex"),
        (r"lot\s*(\d+)\s+(?:for\s+)?(?:industrial|manufacturing)", "industrial"),
        (r"lot\s*(\d+)\s+(?:for\s+)?(?:multifamily|residential|apartment)", "multifamily"),
        (r"lot\s*(\d+)\s+(?:for\s+)?(?:common|park|open\s*space)", "common"),
    ]
    for pat, district in explicit_patterns:
        for m in re.finditer(pat, combined):
            lot_num = int(m.group(1))
            if 1 <= lot_num <= 30:
                assignments[lot_num] = district

    # ── Explicit lot lists: "lots 2, 3, 4 for restaurant" ──
    list_patterns = [
        (r"lots?\s+([\d,\s]+?)(?:\s+(?:for|as|=)\s+)(?:restaurant|dining|retail|qsr|commercial)", "retail"),
        (r"lots?\s+([\d,\s]+?)(?:\s+(?:for|as|=)\s+)(?:flex|warehouse|showroom)", "flex"),
        (r"lots?\s+([\d,\s]+?)(?:\s+(?:for|as|=)\s+)(?:neighborhood\s+retail|retail\s+frontage)", "retail"),
        (r"lots?\s+([\d,\s]+?)(?:\s+(?:for|as|=)\s+)(?:industrial|manufacturing)", "industrial"),
        (r"lots?\s+([\d,\s]+?)(?:\s+(?:for|as|=)\s+)(?:multifamily|residential)", "multifamily"),
    ]
    for pat, district in list_patterns:
        for m in re.finditer(pat, combined):
            nums = re.findall(r"\d+", m.group(1))
            for n in nums:
                lot_num = int(n)
                if 1 <= lot_num <= 30 and lot_num not in assignments:
                    assignments[lot_num] = district

    # ── Explicit lot ranges in priority_lots: "Lots 19-22 for neighborhood retail" ──
    range_patterns = [
        (r"lots?\s+(\d+)\s*[-–]\s*(\d+)\s+(?:for\s+)?(?:retail|neighborhood|commercial)", "retail"),
        (r"lots?\s+(\d+)\s*[-–]\s*(\d+)\s+(?:for\s+)?(?:flex|warehouse)", "flex"),
        (r"lots?\s+(\d+)\s*[-–]\s*(\d+)\s+(?:for\s+)?(?:industrial)", "industrial"),
        (r"lots?\s+(\d+)\s*[-–]\s*(\d+)\s+(?:for\s+)?(?:multifamily|residential)", "multifamily"),
    ]
    for pat, district in range_patterns:
        for m in re.finditer(pat, combined):
            lo, hi = int(m.group(1)), int(m.group(2))
            for lot_num in range(lo, hi + 1):
                if 1 <= lot_num <= 30 and lot_num not in assignments:
                    assignments[lot_num] = district

    # ── Pass 2: Position-based rules ──
    position_rules: dict[str, str] = {}

    if re.search(r"corner\s+(?:lots?\s+)?(?:=\s*)?retail", combined):
        position_rules["Corner"] = "retail"
    if re.search(r"frontage\s+(?:lots?\s+)?(?:=\s*)?retail", combined):
        position_rules["Frontage"] = "retail"
    if re.search(r"interior\s+(?:lots?\s+)?(?:=\s*)?(?:flex|light\s*industrial)", combined):
        position_rules["Interior"] = "flex"
    if re.search(r"interior\s+(?:lots?\s+)?(?:=\s*)?(?:multifamily|residential)", combined):
        position_rules["Interior"] = "multifamily"
    if re.search(r"interior\s+(?:lots?\s+)?(?:=\s*)?(?:industrial)", combined):
        position_rules["Interior"] = "industrial"
    if re.search(r"frontage\s+(?:lots?\s+)?(?:=\s*)?flex", combined):
        position_rules["Frontage"] = "flex"

    # ── Pass 3: Keyword heuristics ──
    # "retail clustering at intersections" → Corner + intersection lots = retail
    if re.search(r"retail\s+cluster", combined) or re.search(r"cluster.*retail", combined):
        position_rules.setdefault("Corner", "retail")

    # "scale back multifamily" / "reduce multifamily" → only big interior lots
    scale_back_mf = bool(re.search(r"(?:scale\s*back|reduce|less)\s+multifamily", combined))
    # "keep multifamily" → preserve some MF
    keep_mf = bool(re.search(r"keep\s+multifamily", combined))

    # ── Pass 4: Clarification-driven specific lot overrides ──
    # Look for patterns like "lot 15 and 16" or "lots 15, 16" in clarifications
    for c in clarifications:
        resp = (c.get("response") or "").lower()
        # Find lot numbers mentioned alongside keywords
        lot_nums_in_resp = [int(x) for x in re.findall(r"\b(\d{1,2})\b", resp) if 1 <= int(x) <= 30]
        if lot_nums_in_resp:
            # Determine district from context
            if any(w in resp for w in ["resident", "walk", "multifamily", "housing"]):
                for ln in lot_nums_in_resp:
                    if ln not in assignments:
                        assignments[ln] = "multifamily"
            elif any(w in resp for w in ["showroom", "flex", "warehouse"]):
                for ln in lot_nums_in_resp:
                    if ln not in assignments:
                        assignments[ln] = "flex"
            elif any(w in resp for w in ["retail", "restaurant", "dining", "drive-through"]):
                for ln in lot_nums_in_resp:
                    if ln not in assignments:
                        assignments[ln] = "retail"

    # ── Pass 5: Apply position rules for unassigned lots ──
    for lot_num in range(1, 31):
        if lot_num in assignments:
            continue
        pos = LOT_POSITIONS[lot_num]
        if pos in position_rules:
            assignments[lot_num] = position_rules[pos]

    # ── Pass 6: Default remaining lots ──
    default_district = CLIENT_TYPE_DEFAULTS.get(client_type, "flex")

    # Large interior lots (>5 acres) default to multifamily unless scaled back
    for lot_num in range(1, 31):
        if lot_num in assignments:
            continue
        acres = LOT_ACRES[lot_num]
        pos = LOT_POSITIONS[lot_num]

        if acres > 5.0 and pos == "Interior":
            if scale_back_mf and not keep_mf:
                assignments[lot_num] = "flex"
            elif keep_mf or "multifamily" in combined:
                assignments[lot_num] = "multifamily"
            else:
                assignments[lot_num] = default_district
        elif pos == "Corner" and default_district == "retail":
            assignments[lot_num] = "retail"
        elif pos == "Frontage" and default_district in ("retail", "flex"):
            assignments[lot_num] = default_district
        else:
            assignments[lot_num] = default_district

    return assignments


# ─── Revenue Calculation ─────────────────────────────────────────────────────

def get_price_per_sf(district: str, position: str) -> float:
    key = (district, position)
    if key in PRICING:
        return PRICING[key]
    any_key = (district, "any")
    if any_key in PRICING:
        return PRICING[any_key]
    return 10.0  # fallback


def calc_revenue(lot_num: int, district: str) -> tuple[float, float]:
    acres = LOT_ACRES[lot_num]
    position = LOT_POSITIONS[lot_num]
    psf = get_price_per_sf(district, position)
    revenue = acres * SQFT_PER_ACRE * psf
    return psf, revenue


# ─── Scenario Builder ───────────────────────────────────────────────────────

def build_scenario(req: dict) -> dict:
    """Build a full scenario dict from a design request."""
    assignments = parse_lot_assignments(req)
    concept_name = req.get("concept_name") or "Untitled Concept"
    slug = re.sub(r"[^a-z0-9]+", "-", concept_name.lower()).strip("-")

    # Build lot details
    lot_details = []
    district_agg: dict[str, dict] = {}
    total_revenue = 0.0
    total_acreage = 0.0

    for lot_num in range(1, 31):
        district = assignments.get(lot_num, "flex")
        acres = LOT_ACRES[lot_num]
        position = LOT_POSITIONS[lot_num]
        road = LOT_ROADS[lot_num]
        psf, revenue = calc_revenue(lot_num, district)

        lot_details.append({
            "lot": lot_num,
            "district": district,
            "position": position,
            "road": road,
            "acres": acres,
            "psf": psf,
            "revenue": round(revenue, 2),
        })

        total_revenue += revenue
        total_acreage += acres

        if district not in district_agg:
            district_agg[district] = {
                "label": DISTRICT_LABELS.get(district, district.title()),
                "color": DISTRICT_COLORS.get(district, "#888"),
                "lots": 0,
                "acreage": 0.0,
                "revenue": 0.0,
            }
        district_agg[district]["lots"] += 1
        district_agg[district]["acreage"] += acres
        district_agg[district]["revenue"] += revenue

    # Compute percentages
    for d in district_agg.values():
        d["percentage"] = round(d["acreage"] / total_acreage * 100) if total_acreage else 0
        d["acreage"] = round(d["acreage"], 1)
        d["revenue"] = round(d["revenue"], 2)

    avg_psf = total_revenue / (total_acreage * SQFT_PER_ACRE) if total_acreage else 0

    # Build tagline from request
    desc = req.get("description") or ""
    tagline = desc[:160].rstrip(".") + "." if len(desc) > 160 else desc

    # Build target profile
    client_type = req.get("target_client_type") or "General"
    target_profile = (
        f"Designed for {client_type.lower()} buyers. "
        f"Blended ${avg_psf:.2f}/SF across {len(assignments)} lots, "
        f"total {total_acreage:.1f} acres."
    )

    # Build features
    features = _auto_features(assignments, district_agg, concept_name)

    # Lot assignments as string keys for JSON compat
    lot_assign_str = {str(k): v for k, v in assignments.items()}

    return {
        "id": str(uuid.uuid4()),
        "slug": slug,
        "name": concept_name,
        "tagline": tagline,
        "description": desc,
        "target_profile": target_profile,
        "status": "draft",
        "lot_assignments": lot_assign_str,
        "district_summary": district_agg,
        "lot_details": lot_details,
        "total_revenue": round(total_revenue, 2),
        "total_acreage": round(total_acreage, 1),
        "avg_psf": round(avg_psf, 2),
        "features": features,
        "request_id": req.get("id"),
        "created_at": datetime.now(PT).isoformat(),
    }


def _auto_features(assignments: dict, agg: dict, name: str) -> list[str]:
    """Auto-generate 3-4 bullet features from scenario characteristics."""
    features = []
    total_lots = len(assignments)

    # Count by district
    counts = {}
    for d in assignments.values():
        counts[d] = counts.get(d, 0) + 1

    # Dominant district
    dominant = max(counts, key=counts.get)
    dom_pct = round(counts[dominant] / total_lots * 100)
    features.append(
        f"{dominant.title()}-dominant layout: {counts[dominant]} of {total_lots} lots "
        f"({dom_pct}%) assigned to {DISTRICT_LABELS.get(dominant, dominant)}."
    )

    # Corner retail premium
    corner_retail = sum(
        1 for ln, d in assignments.items()
        if d == "retail" and LOT_POSITIONS.get(ln) == "Corner"
    )
    if corner_retail > 0:
        features.append(
            f"Premium corner positioning: {corner_retail} corner lot(s) at $18/SF "
            f"retail pricing for anchor tenants and QSR pads."
        )

    # Multifamily density
    if "multifamily" in agg:
        mf = agg["multifamily"]
        features.append(
            f"Multifamily anchors: {mf['lots']} lots totaling {mf['acreage']} acres "
            f"provide built-in residential demand for adjacent retail."
        )

    # Flex/industrial presence
    if "flex" in agg:
        fx = agg["flex"]
        features.append(
            f"Flex/light industrial: {fx['lots']} lots ({fx['acreage']} acres) at $10/SF "
            f"positioned on interior parcels for warehouse and showroom uses."
        )
    elif "industrial" in agg:
        ind = agg["industrial"]
        features.append(
            f"Industrial allocation: {ind['lots']} lots ({ind['acreage']} acres) at $8/SF "
            f"for light manufacturing and distribution."
        )

    return features[:4]


# ─── HTML Tear Sheet Generator ───────────────────────────────────────────────

def generate_html(scenario: dict) -> str:
    name = scenario["name"]
    tagline = scenario["tagline"]
    date_str = datetime.now(PT).strftime("%B %Y")
    total_rev = scenario["total_revenue"]
    total_lots = 30
    total_acres = scenario["total_acreage"]
    avg_psf = scenario["avg_psf"]
    lots = scenario["lot_details"]
    districts = scenario["district_summary"]
    target = scenario["target_profile"]
    features = scenario["features"]

    # District counts for KPI sub
    dist_parts = []
    for dname in ("retail", "flex", "industrial", "multifamily", "common"):
        if dname in districts:
            d = districts[dname]
            dist_parts.append(f"{d['lots']} {dname}")
    dist_sub = " · ".join(dist_parts)

    # District breakdown rows
    dist_rows = ""
    pill_class_map = {
        "retail": "pill-retail",
        "flex": "pill-flex",
        "industrial": "pill-ind",
        "multifamily": "pill-mf",
        "common": "pill-common",
    }
    for dname in ("retail", "flex", "industrial", "multifamily", "common"):
        if dname not in districts:
            continue
        d = districts[dname]
        pill_cls = pill_class_map.get(dname, "pill-flex")
        pricing_text = _district_pricing_text(dname)
        dist_rows += (
            f'        <tr>\n'
            f'          <td><span class="district-color" style="background:{d["color"]}"></span>'
            f'<span class="pill {pill_cls}">{d["label"]}</span></td>\n'
            f'          <td>{d["lots"]}</td>\n'
            f'          <td class="num">{d["acreage"]}</td>\n'
            f'          <td class="num">{d["percentage"]}%</td>\n'
            f'          <td class="num">${d["revenue"]:,.0f}</td>\n'
            f'          <td>{pricing_text}</td>\n'
            f'        </tr>\n'
        )

    # District totals
    total_dist_rev = sum(d["revenue"] for d in districts.values())

    # Lot rows
    lot_rows = ""
    for lot in lots:
        dname = lot["district"]
        pill_cls = pill_class_map.get(dname, "pill-flex")
        label = dname.title() if dname != "multifamily" else "Multifamily"
        lot_rows += (
            f'        <tr>'
            f'<td>{lot["lot"]}</td>'
            f'<td><span class="pill {pill_cls}">{label}</span></td>'
            f'<td>{lot["position"]}</td>'
            f'<td>{lot["road"]}</td>'
            f'<td class="num">{lot["acres"]:.2f}</td>'
            f'<td class="num">${lot["psf"]:.2f}</td>'
            f'<td class="num">${lot["revenue"]:,.0f}</td>'
            f'</tr>\n'
        )

    # Features list
    feat_items = "\n".join(f"        <li>{f}</li>" for f in features)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ITPH Houston — {_esc(name)} | LANDCO NEXA</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:Georgia,'Times New Roman',serif;background:#f4f4f4;color:#222;padding:20px}}
.shell{{width:100%;max-width:960px;margin:0 auto}}
.header-bar{{background:#1B2A4A;padding:20px 28px;border-radius:12px 12px 0 0;display:flex;align-items:flex-start;justify-content:space-between}}
.header-left h1{{color:#C9A84C;font-size:18px;font-weight:700;letter-spacing:.03em;margin-bottom:4px}}
.header-left .tagline{{color:rgba(255,255,255,.7);font-size:12px;font-family:Arial,sans-serif;line-height:1.5;max-width:540px}}
.header-right{{text-align:right}}
.header-right .brand{{color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-family:Arial,sans-serif}}
.header-right .date{{color:rgba(255,255,255,.55);font-size:20px;font-weight:700;margin-top:4px}}
.header-right .sub{{color:rgba(255,255,255,.35);font-size:10px;letter-spacing:.04em;text-transform:uppercase;margin-top:2px;font-family:Arial,sans-serif}}
.content{{background:#fff;border:1px solid #ddd;border-radius:0 0 12px 12px;padding:28px 32px}}
.section-hdr{{font-size:13px;font-weight:700;color:#1B2A4A;text-transform:uppercase;letter-spacing:.06em;margin:24px 0 12px;padding-bottom:7px;border-bottom:2px solid #C9A84C;font-family:Arial,sans-serif}}
.section-hdr:first-child{{margin-top:0}}
.kpi-row{{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 20px}}
.kpi-card{{flex:1;min-width:140px;background:#1B2A4A;color:#fff;padding:14px 16px;border-radius:8px;border-left:3px solid #C9A84C}}
.kpi-card .label{{font-size:10px;letter-spacing:.06em;color:rgba(255,255,255,.65);text-transform:uppercase;display:block;margin-bottom:6px;font-family:Arial,sans-serif}}
.kpi-card .value{{font-size:22px;font-weight:700;color:#C9A84C;display:block;line-height:1.1}}
.kpi-card .sub{{font-size:10px;color:rgba(255,255,255,.55);display:block;margin-top:4px;font-family:Arial,sans-serif}}
table.data{{width:100%;border-collapse:collapse;margin:10px 0 18px;font-size:12px;font-family:Arial,sans-serif}}
table.data thead{{background:#1B2A4A;color:#fff}}
table.data th{{padding:8px 8px;text-align:left;font-size:10px;letter-spacing:.05em;text-transform:uppercase;font-weight:700}}
table.data td{{padding:6px 8px;border-bottom:1px solid #EEE;color:#333;line-height:1.4}}
table.data tbody tr:nth-child(even){{background:#FAFAFA}}
table.data .num{{text-align:right;font-variant-numeric:tabular-nums}}
.pill{{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;letter-spacing:.03em;font-family:Arial,sans-serif}}
.pill-retail{{background:rgba(92,110,61,.18);color:#3d4f24;border:1px solid rgba(92,110,61,.4)}}
.pill-flex{{background:rgba(74,144,164,.18);color:#2a6878;border:1px solid rgba(74,144,164,.4)}}
.pill-ind{{background:rgba(136,135,128,.18);color:#555;border:1px solid rgba(136,135,128,.4)}}
.pill-mf{{background:rgba(212,168,75,.18);color:#7B5500;border:1px solid rgba(212,168,75,.4)}}
.pill-common{{background:rgba(214,211,203,.3);color:#666;border:1px solid rgba(214,211,203,.6)}}
.target-box{{background:linear-gradient(135deg,#1B2A4A 0%,#2a3f6a 100%);color:#fff;padding:18px 22px;border-radius:8px;margin:16px 0}}
.target-box h3{{color:#C9A84C;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;font-family:Arial,sans-serif}}
.target-box p{{font-size:13px;line-height:1.7;color:rgba(255,255,255,.85)}}
.features-box{{background:#FAF6ED;border-left:4px solid #C9A84C;padding:18px 22px;margin:16px 0;border-radius:0 8px 8px 0}}
.features-box h3{{font-size:12px;font-weight:700;color:#1B2A4A;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;font-family:Arial,sans-serif}}
.features-box ul{{padding-left:20px;margin:0;font-size:13px;line-height:1.8;color:#333}}
.features-box li{{margin-bottom:4px}}
.footer-strip{{background:#1B2A4A;color:rgba(255,255,255,.55);padding:14px 28px;border-radius:0 0 12px 12px;font-size:10px;display:flex;justify-content:space-between;letter-spacing:.04em;font-family:Arial,sans-serif;margin-top:0}}
.district-color{{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:middle}}
@media(max-width:640px){{.content{{padding:18px 16px}}.kpi-card{{min-width:130px}}}}
</style>
</head>
<body>
<div class="shell">

  <div class="header-bar">
    <div class="header-left">
      <h1>{_esc(name)}</h1>
      <p class="tagline">{_esc(tagline)}</p>
    </div>
    <div class="header-right">
      <div class="brand">LANDCO NEXA</div>
      <div class="date">{date_str}</div>
      <div class="sub">Design Concept Tear Sheet</div>
    </div>
  </div>

  <div class="content">

    <div class="section-hdr">Key Performance Indicators</div>
    <div class="kpi-row">
      <div class="kpi-card">
        <span class="label">Total Revenue</span>
        <span class="value">${_fmt_millions(total_rev)}</span>
        <span class="sub">30 lots · all districts</span>
      </div>
      <div class="kpi-card">
        <span class="label">Total Lots</span>
        <span class="value">{total_lots}</span>
        <span class="sub">{dist_sub}</span>
      </div>
      <div class="kpi-card">
        <span class="label">Total Acreage</span>
        <span class="value">{total_acres:.1f} ac</span>
        <span class="sub">Buildable land area</span>
      </div>
      <div class="kpi-card">
        <span class="label">Avg $/SF</span>
        <span class="value">${avg_psf:.2f}</span>
        <span class="sub">Blended across all districts</span>
      </div>
    </div>

    <div class="section-hdr">District Breakdown</div>
    <table class="data">
      <thead>
        <tr><th>District</th><th>Lots</th><th class="num">Acreage</th><th class="num">%</th><th class="num">Revenue</th><th>Pricing</th></tr>
      </thead>
      <tbody>
{dist_rows}      </tbody>
      <tfoot>
        <tr style="font-weight:700;border-top:2px solid #C9A84C">
          <td>Total</td>
          <td>{total_lots}</td>
          <td class="num">{total_acres:.1f}</td>
          <td class="num">100%</td>
          <td class="num">${total_dist_rev:,.0f}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <div class="section-hdr">Lot Assignment Schedule — 30 Lots</div>
    <table class="data">
      <thead>
        <tr><th>Lot</th><th>District</th><th>Position</th><th>Road</th><th class="num">Acres</th><th class="num">$/SF</th><th class="num">Gross Revenue</th></tr>
      </thead>
      <tbody>
{lot_rows}      </tbody>
      <tfoot>
        <tr style="font-weight:700;border-top:2px solid #C9A84C">
          <td colspan="4">Total — 30 Lots</td>
          <td class="num">{total_acres:.2f}</td>
          <td class="num">${avg_psf:.2f}</td>
          <td class="num">${total_rev:,.0f}</td>
        </tr>
      </tfoot>
    </table>

    <div class="target-box">
      <h3>Target Profile</h3>
      <p>{_esc(target)}</p>
    </div>

    <div class="features-box">
      <h3>Key Features — {_esc(name)}</h3>
      <ul>
{feat_items}
      </ul>
    </div>

  </div>

  <div class="footer-strip">
    <div>LANDCO NEXA &nbsp;|&nbsp; ITPH Houston &nbsp;|&nbsp; Confidential — {date_str}</div>
    <div>Design Concept — {_esc(name)}</div>
  </div>

</div>
</body>
</html>"""
    return html


def _esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _fmt_millions(val: float) -> str:
    m = val / 1_000_000
    if m >= 1:
        return f"{m:.1f}M"
    return f"{val:,.0f}"


def _district_pricing_text(dname: str) -> str:
    if dname == "retail":
        return "$12–$18/SF"
    elif dname == "flex":
        return "$10/SF"
    elif dname == "industrial":
        return "$8/SF"
    elif dname == "multifamily":
        return "$7/SF"
    elif dname == "common":
        return "—"
    return ""


# ─── PDF Generation ─────────────────────────────────────────────────────────

def generate_pdf(html_path: Path, pdf_path: Path) -> bool:
    """Generate PDF from HTML using Chrome headless."""
    cmd = [
        CHROME,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--print-to-pdf=" + str(pdf_path),
        "--print-to-pdf-no-header",
        "file://" + str(html_path),
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if pdf_path.exists() and pdf_path.stat().st_size > 0:
            return True
        print(f"  ⚠️  Chrome PDF generation may have failed: {result.stderr[:200]}")
        return False
    except FileNotFoundError:
        print(f"  ⚠️  Chrome not found at {CHROME}")
        return False
    except subprocess.TimeoutExpired:
        print("  ⚠️  Chrome PDF generation timed out")
        return False


# ─── Scenarios JSON Backup ───────────────────────────────────────────────────

def append_to_scenarios_json(scenario: dict):
    """Append scenario to local scenarios.json backup."""
    existing = []
    if SCENARIOS_JSON.exists():
        try:
            existing = json.loads(SCENARIOS_JSON.read_text())
            if not isinstance(existing, list):
                existing = [existing]
        except json.JSONDecodeError:
            existing = []

    # Remove lot_details from JSON backup (it's verbose)
    backup = {k: v for k, v in scenario.items() if k != "lot_details"}
    existing.append(backup)

    SCENARIOS_JSON.write_text(json.dumps(existing, indent=2, default=str))


# ─── Supabase Insert/Update ─────────────────────────────────────────────────

def insert_scenario_to_supabase(scenario: dict) -> str | None:
    """Insert scenario into design_scenarios table."""
    payload = {
        "name": scenario["name"],
        "slug": scenario["slug"],
        "tagline": scenario["tagline"],
        "description": scenario["description"],
        "lot_assignments": scenario["lot_assignments"],
        "district_summary": scenario["district_summary"],
        "target_profile": scenario["target_profile"],
        "status": "draft",
    }
    try:
        result = sb_post("design_scenarios", payload)
        return result.get("id")
    except Exception as e:
        print(f"  ⚠️  Failed to insert scenario to Supabase: {e}")
        return None


def mark_request_converted(request_id: str, scenario_id: str = None):
    """Update request status to 'converted'."""
    payload = {
        "status": "converted",
    }
    sb_patch("design_requests", f"id=eq.{request_id}", payload)


# ─── Main Processing ────────────────────────────────────────────────────────

def process_request(req: dict, dry_run: bool = False) -> dict | None:
    """Process a single design request end-to-end."""
    rid = req.get("id", "?")
    concept = req.get("concept_name") or "Untitled"
    print(f"\n{'='*60}")
    print(f"Processing: {concept}")
    print(f"Request ID: {rid}")
    print(f"Submitted by: {req.get('submitted_by', '?')}")
    print(f"{'='*60}")

    # Build scenario
    scenario = build_scenario(req)
    slug = scenario["slug"]

    print(f"\n  📊 Scenario: {scenario['name']}")
    print(f"  💰 Total Revenue: ${scenario['total_revenue']:,.0f}")
    print(f"  📐 Acreage: {scenario['total_acreage']} ac")
    print(f"  📈 Avg $/SF: ${scenario['avg_psf']:.2f}")
    print(f"  🏗️  Districts: {', '.join(f'{k}({v['lots']})' for k,v in scenario['district_summary'].items())}")

    if dry_run:
        print("\n  🔍 DRY RUN — no files written, no DB updates")
        return scenario

    # Ensure output dirs exist
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Generate HTML
    html_path = ASSETS_DIR / f"tearsheet-{slug}.html"
    html_content = generate_html(scenario)
    html_path.write_text(html_content)
    print(f"\n  ✅ HTML: {html_path}")

    # Generate PDF
    pdf_path = ASSETS_DIR / f"tearsheet-{slug}.pdf"
    if generate_pdf(html_path, pdf_path):
        print(f"  ✅ PDF:  {pdf_path}")
    else:
        print(f"  ⚠️  PDF generation failed (HTML still available)")

    # Append to scenarios.json
    append_to_scenarios_json(scenario)
    print(f"  ✅ JSON backup: {SCENARIOS_JSON}")

    # Insert to Supabase design_scenarios
    scenario_id = insert_scenario_to_supabase(scenario)
    if scenario_id:
        print(f"  ✅ Supabase scenario inserted: {scenario_id}")
    else:
        print(f"  ⚠️  Supabase insert skipped/failed")

    # Mark request as converted
    mark_request_converted(rid, scenario_id)
    print(f"  ✅ Request {rid} → status: converted")

    return scenario


def list_requests():
    """List all design requests and their status."""
    try:
        reqs = sb_get("design_requests", "order=created_at.desc")
    except Exception as e:
        print(f"❌ Failed to fetch design requests: {e}")
        return

    if not reqs:
        print("No design requests found.")
        return

    print(f"\n{'='*80}")
    print(f"{'ITPH Design Requests':^80}")
    print(f"{'='*80}")
    print(f"{'Status':<12} {'Concept':<30} {'Submitted By':<15} {'Created':<20}")
    print(f"{'-'*80}")

    for r in reqs:
        status = r.get("status", "?")
        concept = (r.get("concept_name") or "Untitled")[:28]
        by = (r.get("submitted_by") or "?")[:13]
        created = (r.get("created_at") or "")[:19]
        emoji = {"submitted": "🟡", "converted": "✅", "processing": "🔄"}.get(status, "⚪")
        print(f"{emoji} {status:<10} {concept:<30} {by:<15} {created:<20}")

    print(f"\nTotal: {len(reqs)} request(s)")


def main():
    parser = argparse.ArgumentParser(
        description="ITPH Design Request → Scenario + Tear Sheet Engine"
    )
    parser.add_argument("--request-id", help="Process a specific request by ID")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated")
    parser.add_argument("--list", action="store_true", dest="list_all", help="List all design requests")
    args = parser.parse_args()

    if args.list_all:
        list_requests()
        return

    if args.request_id:
        # Fetch specific request
        try:
            reqs = sb_get("design_requests", f"id=eq.{args.request_id}")
        except Exception as e:
            print(f"❌ Failed to fetch request: {e}")
            sys.exit(1)
        if not reqs:
            print(f"❌ No request found with ID: {args.request_id}")
            sys.exit(1)
        process_request(reqs[0], dry_run=args.dry_run)
    else:
        # Process all pending
        try:
            reqs = sb_get("design_requests", "status=eq.submitted&order=created_at.asc")
        except Exception as e:
            print(f"❌ Failed to fetch pending requests: {e}")
            sys.exit(1)

        if not reqs:
            print("✅ No pending design requests.")
            return

        print(f"Found {len(reqs)} pending request(s)")
        results = []
        for req in reqs:
            result = process_request(req, dry_run=args.dry_run)
            if result:
                results.append(result)

        print(f"\n{'='*60}")
        print(f"✅ Processed {len(results)} request(s)")
        if not args.dry_run:
            total_rev = sum(r["total_revenue"] for r in results)
            print(f"   Combined revenue across scenarios: ${total_rev:,.0f}")


if __name__ == "__main__":
    main()
