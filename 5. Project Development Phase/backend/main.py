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
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://travel-itinerary-planner-frontend-rose.vercel.app",
    ],
    allow_credentials=True,
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
