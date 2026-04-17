# NextStop Backend

Backend API for trip planning using AC Transit data.

## Features

* Plan trips between locations
* Returns next bus information
* Provides map coordinates for frontend integration

## Tech Stack

* Python
* FastAPI
* Uvicorn

## How to Run

```bash
uvicorn main:app --reload
```

## Endpoints

* `/plan-trip`
* `/next-bus`
* `/test-actransit`

## Notes

Map data is currently hardcoded and ready for future Mapbox integration.
