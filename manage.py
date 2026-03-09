#!/usr/bin/env python
"""Entry point mínimo para ejecutar Django localmente."""

import os
import sys


def main() -> None:
    os.environ["DJANGO_SETTINGS_MODULE"] = "backend.configuracion_django.settings"
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
