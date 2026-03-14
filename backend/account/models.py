from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class CustomUserManager(BaseUserManager):
    def create_superuser(self, loginid, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'inventory_manager')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(loginid, email, password, **extra_fields)

    def create_user(self, loginid, email, password, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))

        email = self.normalize_email(email)
        user = self.model(loginid=loginid, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser, PermissionsMixin):
    class user_roles(models.TextChoices):
        INVENTORY_MANAGER = 'inventory_manager', _('Inventory Manager')
        WAREHOUSE_STAFF = 'warehouse_staff', _('Warehouse Staff')

    loginid = models.CharField(unique=True, primary_key=True)
    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    date_joined = models.DateField(default=timezone.now)
    password_last_changed = models.DateTimeField(default=timezone.now)
    role = models.CharField(_('role'), max_length=30, choices=user_roles.choices, default='warehouse_staff')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'loginid'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.full_name or self.loginid


class OTP(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='otps')
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_valid(self):
        return timezone.now() < self.expires_at

    def __str__(self):
        return f"OTP for {self.user.email}"