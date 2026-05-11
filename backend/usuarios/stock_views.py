from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from supabase import create_client
from django.conf import settings

class StockListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

            response = supabase.table("stock").select("*").execute()

            return Response(response.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )