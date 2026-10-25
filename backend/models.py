
from sqlalchemy import Column, Integer, String, Float
from database import Base

class Ride(Base):
    __tablename__ = "rides"

    id = Column(Integer, primary_key=True, index=True)
    rider_name = Column(String(100), nullable=False)
    pickup = Column(String(250), nullable=False)
    drop = Column(String(250), nullable=False)
    distance_km = Column(Float, nullable=False)
    estimated_fare = Column(Float, nullable=False)
    status = Column(String(30), default="requested")
