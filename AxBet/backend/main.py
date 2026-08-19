import json
import re
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
MATCHES_FILE = BASE_DIR / "matches.json"


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="Cricket API",
    version="2.0.0",
    description="ESPNcricinfo-powered cricket API",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HELPERS
# ============================================================

def normalize(value):
    value = str(value or "").lower()
    value = re.sub(
        r"[^a-z0-9]+",
        " ",
        value,
    )

    return re.sub(
        r"\s+",
        " ",
        value,
    ).strip()


def deduplicate(matches):
    seen = set()
    output = []

    for match in matches:

        match_id = str(
            match.get("match_id", "")
        ).strip()

        if match_id:
            key = f"id:{match_id}"

        else:
            team1 = normalize(
                match.get("team1")
            )

            team2 = normalize(
                match.get("team2")
            )

            key = (
                f"teams:{min(team1, team2)}|"
                f"{max(team1, team2)}"
            )

        if key in seen:
            continue

        seen.add(key)
        output.append(match)

    return output


def load_data() -> dict[str, Any]:

    if not MATCHES_FILE.exists():
        raise HTTPException(
            status_code=503,
            detail=(
                "matches.json not found. "
                "Run scraper.py first."
            ),
        )

    try:

        with open(
            MATCHES_FILE,
            "r",
            encoding="utf-8",
        ) as file:

            data = json.load(file)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="matches.json contains invalid JSON.",
        )

    except OSError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not read matches.json: {exc}",
        )

    if not isinstance(data, dict):
        raise HTTPException(
            status_code=500,
            detail="Invalid matches.json format.",
        )

    matches = data.get(
        "matches",
        [],
    )

    if not isinstance(matches, list):
        matches = []

    data["matches"] = deduplicate(
        matches
    )

    data["count"] = len(
        data["matches"]
    )

    return data


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "success": True,
        "name": "Cricket API",
        "version": "2.0.0",
        "source": "ESPNcricinfo",
        "max_matches": 8,
        "endpoints": [
            "/live",
            "/upcoming",
            "/results",
            "/players/{player_name}",
            "/matches",
            "/health",
        ],
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    data = load_data()

    return {
        "success": True,
        "status": "online",
        "source": "ESPNcricinfo",
        "match_count": len(
            data["matches"]
        ),
        "updated_at": data.get(
            "updated_at"
        ),
    }


# ============================================================
# ALL
# ============================================================

@app.get("/matches")
def matches():

    data = load_data()

    return {
        "success": True,
        "count": len(
            data["matches"]
        ),
        "matches": data["matches"],
        "source": "ESPNcricinfo",
        "updated_at": data.get(
            "updated_at"
        ),
    }


# ============================================================
# LIVE
# ============================================================

@app.get("/live")
def live():

    data = load_data()

    matches = [
        match
        for match in data["matches"]
        if str(
            match.get("status", "")
        ).upper() == "LIVE"
    ]

    return {
        "success": True,
        "status": "LIVE",
        "count": len(matches),
        "matches": matches,
        "source": "ESPNcricinfo",
        "updated_at": data.get(
            "updated_at"
        ),
    }


# ============================================================
# UPCOMING
# ============================================================

@app.get("/upcoming")
def upcoming():

    data = load_data()

    matches = [
        match
        for match in data["matches"]
        if str(
            match.get("status", "")
        ).upper() == "UPCOMING"
    ]

    return {
        "success": True,
        "status": "UPCOMING",
        "count": len(matches),
        "matches": matches,
        "source": "ESPNcricinfo",
        "updated_at": data.get(
            "updated_at"
        ),
    }


# ============================================================
# RESULTS
# ============================================================

@app.get("/results")
def results():

    data = load_data()

    matches = [
        match
        for match in data["matches"]
        if str(
            match.get("status", "")
        ).upper() == "RESULT"
    ]

    return {
        "success": True,
        "status": "RESULT",
        "count": len(matches),
        "matches": matches,
        "source": "ESPNcricinfo",
        "updated_at": data.get(
            "updated_at"
        ),
    }


# ============================================================
# PLAYER SEARCH
# ============================================================

@app.get("/players/{player_name}")
def player(player_name: str):

    if not player_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Player name is required.",
        )

    data = load_data()

    query = normalize(
        player_name
    )

    found = []

    for match in data["matches"]:

        searchable = normalize(
            json.dumps(
                match,
                ensure_ascii=False,
            )
        )

        if query in searchable:
            found.append(match)

    return {
        "success": True,
        "player": player_name,
        "count": len(found),
        "matches": found,
        "source": "ESPNcricinfo",
    }


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )