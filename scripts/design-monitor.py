#!/usr/bin/env python3
"""
G-Connect Design Request Monitor
=================================
Polls operational_requests for design_concept requests.
When found, triggers the lot economics engine and coordinates with Claude/GPT.

Usage:
    python3 design-monitor.py              # Run monitor
    python3 design-monitor.py --once       # Check once and exit
    python3 design-monitor.py --submit "Town Center: retail-dominant, 60% retail, restaurant pads, medical office"
"""

import argparse
import json
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    from supabase import create_client
except ImportError:
    # Fallback: use requests directly
    import requests

PT = timezone(timedelta(hours=-7))

# G-Connect Supabase
SUPABASE_URL = "https://puormcvvxvkxftocpvvg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b3JtY3Z2eHZreGZ0b2NwdnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NzMyMTcsImV4cCI6MjA5NTE0OTIxN30.bWgjMBf1datyjAOZ3xXxoBlGF8UBab3RrNsP4qKqVmM"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

BASE_URL = f"{SUPABASE_URL}/rest/v1"

def submit_design_request(description: str, submitted_by: str = "Beast", source: str = "direct"):
    """Submit a design concept request to G-Connect operational_requests."""
    payload = {
        "request_type": "design_concept",
        "category": "houston-itph",
        "title": f"Design Concept: {description[:60]}",
        "request_text": description,
        "body": json.dumps({
            "source": source,  # "direct", "broker_email", "mark_forward", "text_window"
            "raw_description": description,
            "project": "ITPH",
            "timestamp": datetime.now(PT).isoformat()
        }),
        "status": "submitted",
        "priority": "high",
        "submitted_by": submitted_by,
        "connector_targets": "{beast,claude,gpt}"
    }
    
    resp = requests.post(f"{BASE_URL}/operational_requests", json=payload, headers=HEADERS)
    if resp.status_code in (200, 201):
        data = resp.json()
        rid = data[0]["id"] if isinstance(data, list) else data.get("id", "?")
        print(f"✅ Design request submitted: {rid}")
        print(f"   Title: {payload['title']}")
        print(f"   Source: {source}")
        return rid
    else:
        print(f"❌ Failed to submit: {resp.status_code} {resp.text}")
        return None


def check_pending_requests():
    """Check for new design concept requests."""
    import requests as req
    resp = req.get(
        f"{BASE_URL}/operational_requests?request_type=eq.design_concept&status=eq.submitted&order=created_at.asc",
        headers=HEADERS
    )
    if resp.status_code == 200:
        return resp.json()
    return []


def update_status(request_id: str, status: str, result_text: str = None, result_url: str = None):
    """Update a design request's status."""
    import requests as req
    payload = {"status": status, "updated_at": datetime.now(PT).isoformat()}
    if result_text:
        payload["result_text"] = result_text
    if result_url:
        payload["result_url"] = result_url
    
    resp = req.patch(
        f"{BASE_URL}/operational_requests?id=eq.{request_id}",
        json=payload,
        headers={**HEADERS, "Prefer": "return=representation"}
    )
    return resp.status_code in (200, 204)


def parse_broker_email(email_text: str) -> dict:
    """Parse a broker email into design request parameters.
    
    Extracts: preferred use types, lot count preferences, special requirements.
    Returns a structured dict that can be fed to the lot economics engine.
    """
    text_lower = email_text.lower()
    
    params = {
        "raw_text": email_text,
        "preferences": [],
        "emphasis": None,
        "special_requirements": []
    }
    
    # Detect emphasis
    if any(w in text_lower for w in ["retail", "restaurant", "shopping", "store"]):
        params["preferences"].append("retail")
    if any(w in text_lower for w in ["industrial", "warehouse", "logistics", "flex", "distribution"]):
        params["preferences"].append("industrial")
    if any(w in text_lower for w in ["multifamily", "apartment", "residential", "workforce", "housing"]):
        params["preferences"].append("multifamily")
    if any(w in text_lower for w in ["corner", "premium", "pad site", "high-traffic"]):
        params["preferences"].append("premium_pads")
    if any(w in text_lower for w in ["mixed", "balanced", "phased", "timeline"]):
        params["preferences"].append("mixed_use")
    if any(w in text_lower for w in ["lihtc", "tax credit", "eb-5", "affordable"]):
        params["special_requirements"].append("tax_credit_eligible")
    
    # Set emphasis based on strongest signal
    if params["preferences"]:
        params["emphasis"] = params["preferences"][0]
    
    return params


def monitor_loop(interval=30):
    """Continuously poll for new design requests."""
    print(f"🔄 G-Connect Design Monitor started (polling every {interval}s)")
    print(f"   Watching: operational_requests where request_type='design_concept'")
    print(f"   Time: {datetime.now(PT).strftime('%Y-%m-%d %I:%M %p PT')}")
    print()
    
    while True:
        try:
            requests_list = check_pending_requests()
            if requests_list:
                for req in requests_list:
                    print(f"📥 New design request: {req['title']}")
                    print(f"   ID: {req['id']}")
                    print(f"   Body: {req.get('request_text', '')[:100]}")
                    
                    # Update status to processing
                    update_status(req["id"], "processing")
                    
                    # Parse if it's a broker email
                    body = json.loads(req.get("body", "{}")) if req.get("body") else {}
                    if body.get("source") == "broker_email":
                        params = parse_broker_email(req.get("request_text", ""))
                        print(f"   Parsed broker preferences: {params['preferences']}")
                    
                    # TODO: Trigger lot economics engine
                    # TODO: Send to Claude via BD for tear sheet
                    # TODO: Send to GPT for interactive page
                    print(f"   ⚡ Ready for lot economics → Claude → GPT pipeline")
                    print()
            
            time.sleep(interval)
        except KeyboardInterrupt:
            print("\n⏹ Monitor stopped")
            break
        except Exception as e:
            print(f"⚠️ Error: {e}")
            time.sleep(interval)


def main():
    parser = argparse.ArgumentParser(description="G-Connect Design Request Monitor")
    parser.add_argument("--once", action="store_true", help="Check once and exit")
    parser.add_argument("--submit", type=str, help="Submit a design request")
    parser.add_argument("--broker-email", type=str, help="Submit from broker email text")
    parser.add_argument("--source", type=str, default="direct", help="Source tag")
    parser.add_argument("--interval", type=int, default=30, help="Poll interval seconds")
    args = parser.parse_args()
    
    if args.submit:
        submit_design_request(args.submit, source=args.source)
    elif args.broker_email:
        submit_design_request(args.broker_email, submitted_by="broker", source="broker_email")
    elif args.once:
        reqs = check_pending_requests()
        if reqs:
            for r in reqs:
                print(f"📥 {r['created_at'][:16]} | {r['status']} | {r['title']}")
        else:
            print("No pending design requests")
    else:
        monitor_loop(args.interval)


if __name__ == "__main__":
    main()
