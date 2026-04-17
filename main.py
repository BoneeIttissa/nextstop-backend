import os
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime

load_dotenv()
ACTRANSIT_API_KEY = os.getenv("ACTRANSIT_API_KEY")

app = FastAPI(title="NextStop Backend API")

latest_bus_metrics: Dict[str, dict] = {}


class Telemetry(BaseModel):
    bus_id: str
    crowding_percentage: float
    passenger_count: int
    seats_available: int
    timestamp: Optional[str] = None
    location: Optional[str] = None
    device_status: Optional[str] = None


class NextClass(BaseModel):
    course: str
    location: str
    start_time: str
    minutes_until: int


class NearestStop(BaseModel):
    stop_name: str
    walking_minutes: int


class AvailableBus(BaseModel):
    route: str
    arrival_in_min: int
    capacity: int
    seats_left: int
    current_stop: str
    recommendation: str


class NextTripResponse(BaseModel):
    next_class: NextClass
    nearest_stop: NearestStop
    available_buses: List[AvailableBus]
    recommendation: str
    confidence: float
    message: str


@app.get("/")
def root():
    return {"message": "NextStop backend is running"}


@app.post("/telemetry")
def receive_telemetry(data: Telemetry):
    record = data.dict()
    if record["timestamp"] is None:
        record["timestamp"] = datetime.utcnow().isoformat()

    latest_bus_metrics[data.bus_id] = record
    return {"status": "success", "stored_bus_id": data.bus_id}


@app.get("/bus/{bus_id}")
def get_bus(bus_id: str):
    if bus_id not in latest_bus_metrics:
        raise HTTPException(status_code=404, detail="Bus not found")

    return latest_bus_metrics[bus_id]


@app.get("/next-trip/{stop_id}")
def get_next_trip(stop_id: str):
    next_bus_response = get_next_bus(stop_id)
    next_bus = next_bus_response["next_bus"]

    if next_bus is None:
        return {
            "stop_id": stop_id,
            "next_bus": None,
            "recommendation": "No buses available right now"
        }

    return {
        "stop_id": stop_id,
        "next_bus": next_bus,
        "recommendation": f"Leave now to catch Route {next_bus['RouteName']}"
    }


@app.get("/test-actransit")
def test_actransit():
    if not ACTRANSIT_API_KEY:
        raise HTTPException(status_code=500, detail="AC Transit API key not loaded")

    url = f"https://api.actransit.org/transit/stops/54963/predictions?token={ACTRANSIT_API_KEY}"
    response = requests.get(url, timeout=10)
    data = response.json()

    if not data:
        return {"status_code": response.status_code, "next_bus": None}

    next_bus = sorted(
        data,
        key=lambda item: datetime.fromisoformat(
            item["PredictedDeparture"].replace("Z", "+00:00")
        ),
    )[0]

    return {
        "status_code": response.status_code,
        "next_bus": next_bus
    }


@app.get("/next-bus/{stop_id}")
def get_next_bus(stop_id: str):
    if not ACTRANSIT_API_KEY:
        raise HTTPException(status_code=500, detail="AC Transit API key not loaded")

    url = f"https://api.actransit.org/transit/stops/{stop_id}/predictions?token={ACTRANSIT_API_KEY}"
    response = requests.get(url, timeout=10)
    data = response.json()

    if not data:
        return {
            "status_code": response.status_code,
            "stop_id": stop_id,
            "next_bus": None
        }

    next_bus = sorted(
        data,
        key=lambda item: datetime.fromisoformat(
            item["PredictedDeparture"].replace("Z", "+00:00")
        ),
    )[0]

    return {
        "status_code": response.status_code,
        "stop_id": stop_id,
        "next_bus": next_bus
    }


def _map_location_to_stop_id(location: str) -> str:
    normalized_location = location.strip().lower()

    if "northside" in normalized_location:
        return "54963"
    if "soda" in normalized_location:
        return "51234"
    if "downtown" in normalized_location:
        return "52019"

    return "54963"


def _map_location_to_coordinates(location: str) -> dict:
    normalized_location = location.strip().lower()

    if "northside" in normalized_location:
        return {"lat": 37.8756, "lng": -122.2588}
    if "soda" in normalized_location:
        return {"lat": 37.8753, "lng": -122.2586}
    if "downtown" in normalized_location:
        return {"lat": 37.8701, "lng": -122.2685}

    return {"lat": 37.8715, "lng": -122.2730}


@app.get("/plan-trip")
def plan_trip(start: str, destination: str):
    start_stop_id = _map_location_to_stop_id(start)
    destination_stop_id = _map_location_to_stop_id(destination)
    start_marker = _map_location_to_coordinates(start)
    destination_marker = _map_location_to_coordinates(destination)
    next_bus_response = get_next_bus(start_stop_id)
    next_bus = next_bus_response["next_bus"]

    if next_bus is None:
        recommendation = "No buses available right now"
    else:
        recommendation = (
            f"Leave now to catch Route {next_bus['RouteName']} "
            f"from stop {start_stop_id} toward {destination}"
        )

    return {
        "start": start,
        "destination": destination,
        "start_stop_id": start_stop_id,
        "destination_stop_id": destination_stop_id,
        "next_bus": next_bus,
        "recommendation": recommendation,
        "map_data": {
            "start_marker": start_marker,
            "destination_marker": destination_marker,
        },
    }
