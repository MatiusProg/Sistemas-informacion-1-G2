from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, min_length=6)
    nombre = serializers.CharField(required=True, max_length=100)
    rol = serializers.ChoiceField(
        choices=['chef', 'administrador', 'usuario'],
        default='usuario',  # <-- Cambiar default a 'usuario'
        required=False      # <-- Hacerlo OPCIONAL
    )


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
