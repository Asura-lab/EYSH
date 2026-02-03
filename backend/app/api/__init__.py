from .auth import router as auth_router
from .tests import router as tests_router
from .roadmap import router as roadmap_router
from .mentoring import router as mentoring_router
from .topics import router as topics_router
from .admin import router as admin_router
from .problems import router as problems_router

__all__ = [
    "auth_router",
    "tests_router",
    "roadmap_router",
    "mentoring_router",
    "topics_router",
    "admin_router",
    "problems_router",
]
