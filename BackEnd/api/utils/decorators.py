# utils/decorators.py

from rest_framework.response import Response
from rest_framework import status
from functools import wraps

def role_required(allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if request.user.role not in allowed_roles:
                return Response({"error": "No tienes permisos para realizar esta acción."}, status=status.HTTP_403_FORBIDDEN)
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator
