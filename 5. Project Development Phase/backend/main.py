from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import trips, itinerary, share

app = FastAPI(
    title="Travel Itinerary Planner API",
    description="AI-powered personalized travel itinerary generator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trips.router)
app.include_router(itinerary.router)
app.include_router(share.router)


@app.get("/")
def root():
    return {"message": "Travel Itinerary Planner API", "status": "running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
