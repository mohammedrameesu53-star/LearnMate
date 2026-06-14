from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and
            request.user.role == "admin"
        )
        
        
class IsMentor(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and
            request.user.role == "mentor"
        )
        
        
class IsStudent(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and
            request.user.role == "student"
        )                