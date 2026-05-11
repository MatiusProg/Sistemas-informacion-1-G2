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

            response = (supabase.table("stock").select("*, insumo(nombre)").execute())

            return Response(response.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from supabase import create_client
from django.conf import settings


class StockDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, stock_id):
        try:
            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )

            response = (
                supabase.table("stock")
                .select("*, insumo(nombre)")
                .eq("id", stock_id)
                .single()
                .execute()
            )

            return Response(
                response.data,
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request, stock_id):
        try:
            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )

            response = (
                supabase.table("stock")
                .update(request.data)
                .eq("id", stock_id)
                .execute()
            )

            return Response(
                response.data,
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, stock_id):
        try:
            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )

            (
                supabase.table("stock")
                .delete()
                .eq("id", stock_id)
                .execute()
            )

            return Response(
                {"message": "Stock eliminado"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )