from .auth import router as auth_router
from .tests import router as tests_router
from .roadmap import router as roadmap_router
from .mentoring import router as mentoring_router

__all__ = ["auth_router", "tests_router", "roadmap_router", "mentoring_router"]
