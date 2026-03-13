"""DTOs para resultados de validación/importación."""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ErrorFila:
    numero_fila: int
    motivo: str


@dataclass
class ResultadoImportacion:
    entidad: str
    filas_procesadas: int = 0
    creadas: int = 0
    actualizadas: int = 0
    ignoradas: int = 0
    fallidas: int = 0
    columnas_detectadas: list[str] = field(default_factory=list)
    columnas_faltantes: list[str] = field(default_factory=list)
    errores: list[ErrorFila] = field(default_factory=list)

    def registrar_error(self, numero_fila: int, motivo: str) -> None:
        self.fallidas += 1
        self.errores.append(ErrorFila(numero_fila=numero_fila, motivo=motivo))
