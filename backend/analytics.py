
import pandas as pd
from database import SessionLocal
from models import Ride


def get_ride_analytics():
    db = SessionLocal()

    try:
        rides = db.query(Ride).all()

        data = [
            {
                "id": ride.id,
                "rider_name": ride.rider_name,
                "pickup": ride.pickup,
                "drop": ride.drop,
                "distance_km": ride.distance_km,
                "estimated_fare": ride.estimated_fare,
                "status": ride.status
            }
            for ride in rides
        ]

        columns = [
            "id", "rider_name", "pickup", "drop",
            "distance_km", "estimated_fare", "status"
        ]

        df = pd.DataFrame(data, columns=columns)

        if df.empty:
            return {
                "total_rides": 0,
                "average_fare": 0,
                "total_estimated_fare": 0,
                "total_distance_km": 0,
                "rides_by_status": {},
                "popular_routes": []
            }

        popular_routes = (
            df.groupby(["pickup", "drop"])
            .size()
            .reset_index(name="ride_count")
            .sort_values("ride_count", ascending=False)
        )

        return {
            "total_rides": int(len(df)),
            "average_fare": round(float(df["estimated_fare"].mean()), 2),
            "total_estimated_fare": round(
                float(df["estimated_fare"].sum()), 2
            ),
            "total_distance_km": round(
                float(df["distance_km"].sum()), 2
            ),
            "rides_by_status": {
                str(key): int(value)
                for key, value in df["status"].value_counts().items()
            },
            "popular_routes": popular_routes.to_dict(orient="records")
        }

    finally:
        db.close()
