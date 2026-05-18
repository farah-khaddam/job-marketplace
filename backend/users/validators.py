from django.core.validators import RegexValidator, MinLengthValidator, MaxLengthValidator
from django.utils.translation import gettext_lazy as _

full_name_letters_only_validator = RegexValidator(
    regex=r'^[\u0621-\u064A\u0660-\u0669A-Za-z ]+$',
    message=_('Full name must contain letters only.')
)

phone_number_digits_only_validator = RegexValidator(
    regex=r'^\d+$',
    message=_('Phone number must contain numbers only.')
)

phone_number_min_length_validator = MinLengthValidator(
    9,
    _('Phone number must be at least 9 digits.')
)

phone_number_max_length_validator = MaxLengthValidator(
    15,
    _('Phone number cannot exceed 15 digits.')
)
