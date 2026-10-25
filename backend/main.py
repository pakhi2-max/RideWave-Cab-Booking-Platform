
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal, get_db
from models import Ride

from analytics import get_ride_analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RideRequest(BaseModel):
    rider_name: str
    pickup: str
    drop: str
    distance_km: float = Field(gt=0, le=1000)


@app.get("/")
def home():
    return {"message": "Cab Booking Platform is running!"}


@app.post("/rides")
def book_ride(
    ride: RideRequest,
    db: Session = Depends(get_db)
):
    fare = round(50 + ride.distance_km * 12, 2)

    new_ride = Ride(
        rider_name=ride.rider_name,
        pickup=ride.pickup,
        drop=ride.drop,
        distance_km=ride.distance_km,
        estimated_fare=fare,
        status="requested"
    )

    db.add(new_ride)
    db.commit()
    db.refresh(new_ride)

    return {
        "id": new_ride.id,
        "rider": new_ride.rider_name,
        "pickup": new_ride.pickup,
        "drop": new_ride.drop,
        "distance_km": new_ride.distance_km,
        "estimated_fare": new_ride.estimated_fare,
        "status": new_ride.status
    }


@app.get("/rides")
def get_rides(db: Session = Depends(get_db)):
    rides = db.query(Ride).order_by(Ride.id.desc()).all()

    return [
        {
            "id": ride.id,
            "rider": ride.rider_name,
            "pickup": ride.pickup,
            "drop": ride.drop,
            "distance_km": ride.distance_km,
            "estimated_fare": ride.estimated_fare,
            "status": ride.status
        }
        for ride in rides
    ]


@app.get("/rides/{ride_id}")
def get_ride(
    ride_id: int,
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(
            status_code=404,
            detail="Ride not found"
        )

    return {
        "id": ride.id,
        "rider": ride.rider_name,
        "pickup": ride.pickup,
        "drop": ride.drop,
        "distance_km": ride.distance_km,
        "estimated_fare": ride.estimated_fare,
        "status": ride.status
    }

@app.get("/analytics")
def analytics():
    return get_ride_analytics()

@app.patch("/rides/{ride_id}/status")
def update_ride_status(ride_id: int, new_status: str, db: Session = Depends(get_db)):
    allowed_statuses = ["requested", "confirmed", "completed", "cancelled"]

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status. Use requested, confirmed, completed, or cancelled."
        )

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    ride.status = new_status
    db.commit()
    db.refresh(ride)

    return {
        "message": "Ride status updated successfully",
        "id": ride.id,
        "status": ride.status
    }
