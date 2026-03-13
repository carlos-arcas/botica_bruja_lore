"""Lectura robusta de CSV/XLSX para importación masiva."""

import csv
import io
import zipfile
from xml.etree import ElementTree


MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".csv", ".xlsx"}
ALLOWED_MIME_TYPES = {
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


def validar_archivo_subido(uploaded_file) -> None:
    if uploaded_file.size > MAX_FILE_SIZE:
        raise ValueError("El archivo supera el tamaño máximo de 10MB.")

    nombre = (uploaded_file.name or "").lower()
    if not any(nombre.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise ValueError("Formato no soportado. Usa CSV o XLSX.")

    content_type = uploaded_file.content_type or ""
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise ValueError("Tipo MIME inválido para importación.")


def _normalizar_celda(valor) -> str:
    if valor is None:
        return ""
    return str(valor).strip()


def leer_tabla(uploaded_file) -> tuple[list[str], list[dict[str, str]]]:
    validar_archivo_subido(uploaded_file)
    nombre = (uploaded_file.name or "").lower()
    if nombre.endswith(".xlsx"):
        return _leer_xlsx(uploaded_file)
    return _leer_csv(uploaded_file)


def _leer_csv(uploaded_file) -> tuple[list[str], list[dict[str, str]]]:
    contenido = uploaded_file.read().decode("utf-8-sig")
    sample = contenido[:2048]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;") if sample else csv.excel
    except csv.Error:
        dialect = csv.excel
    reader = csv.DictReader(io.StringIO(contenido), dialect=dialect)
    if not reader.fieldnames:
        raise ValueError("El archivo CSV no contiene cabeceras.")
    cabeceras = [_normalizar_celda(c) for c in reader.fieldnames]
    filas = [{k.strip(): _normalizar_celda(v) for k, v in row.items() if k} for row in reader]
    return cabeceras, filas


def _leer_xlsx(uploaded_file) -> tuple[list[str], list[dict[str, str]]]:
    try:
        with zipfile.ZipFile(uploaded_file) as zf:
            shared = _leer_shared_strings(zf)
            sheet_data = zf.read("xl/worksheets/sheet1.xml")
    except (KeyError, zipfile.BadZipFile) as exc:
        raise ValueError("XLSX malformado o no compatible.") from exc

    rows = _parse_sheet_rows(sheet_data, shared)
    if not rows:
        raise ValueError("El Excel está vacío.")
    cabeceras = [_normalizar_celda(c) for c in rows[0]]
    filas = []
    for row in rows[1:]:
        data = {}
        for idx, header in enumerate(cabeceras):
            if not header:
                continue
            data[header] = _normalizar_celda(row[idx] if idx < len(row) else "")
        filas.append(data)
    return cabeceras, filas


def _leer_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    try:
        xml = zf.read("xl/sharedStrings.xml")
    except KeyError:
        return []
    root = ElementTree.fromstring(xml)
    ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    return ["".join(si.itertext()) for si in root.findall("x:si", ns)]


def _parse_sheet_rows(sheet_xml: bytes, shared_strings: list[str]) -> list[list[str]]:
    root = ElementTree.fromstring(sheet_xml)
    ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    rows: list[list[str]] = []
    for row in root.findall(".//x:sheetData/x:row", ns):
        values: list[str] = []
        for cell in row.findall("x:c", ns):
            cell_type = cell.attrib.get("t")
            v = cell.find("x:v", ns)
            inline = cell.find("x:is/x:t", ns)
            raw = v.text if v is not None else ""
            if inline is not None and inline.text is not None:
                raw = inline.text
            elif cell_type == "s" and raw:
                idx = int(raw)
                raw = shared_strings[idx] if idx < len(shared_strings) else ""
            values.append(raw)
        rows.append(values)
    return rows
