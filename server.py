#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor local para Calidad Suite - Planta 5 (Produccion de TV)
Ejecutar con: python server.py
"""

import http.server
import socketserver
import webbrowser
import base64
import os
import sys
import csv
import concurrent.futures
import datetime
import difflib
import email.message
import io
import json
import re
import hashlib
import hmac
import gzip
import secrets
import smtplib
import ssl
import sqlite3
import threading
import time
import unicodedata
from collections import Counter, defaultdict
from contextlib import contextmanager
from http.cookies import SimpleCookie
from http.cookies import CookieError
from urllib.parse import parse_qs, unquote, urlparse
import urllib.error
import urllib.request

PORT = int(os.environ.get('PORT', '8000'))
AUTH_DB_PATH = os.environ.get(
    'QUALITY_AUTH_DB',
    os.path.join(os.path.dirname(os.path.abspath(__file__)), 'quality_users.sqlite3')
)
PASSWORD_HASH_ITERATIONS = 310_000
SESSION_DURATION_SECONDS = 12 * 60 * 60
SESSION_COOKIE_NAME = 'quality_session'
DEFAULT_ACCOUNTS = [
    ('rober', 'Rober Quiquinlla', 'RQ', 'Administrador General de Planta 5', 'Turno General',
     'bg-red-600', 1, '3bb855034cf9ac15f55ba49cb3a3749a',
     'af26f5505b56a7072cbaa3625198244ff32e86aa241bfa42aa162117eb19233e'),
    ('agustina', 'Agustina Queirolo', 'AQ', 'Administrador General de Planta 5', 'Turno 1 - Mañana',
     'bg-red-600', 1, '0b506b89576f46e8c7bc2521aaa2bc57',
     '0f18947ff7148c8726601eba44aa5edc5621dc92189134729468169297cee3da'),
    ('sole', 'Azul Son', 'AS', 'Auditora Senior Open Cell & OLED', 'Turno 1 - Mañana',
     'bg-blue-600', 0, 'a88fc629b8a22e575b91ee1ae1bfa5df',
     '1669ca6351af33c7b8ad8c114487c987b2cf3b0db5298981def9536a03841941'),
    ('daniela', 'Daniela Suarez', 'DS', 'Auditora Mainboard & Hi-Pot', 'Turno 1 - Mañana',
     'bg-purple-600', 0, 'cf544d47ad6e1025dffc3e433906f45e',
     '867049b30bc334322bc2f1d2f8083c626297a43909192914eab8f43f1c262e26')
]
MDR_SHEET_CSV_URL = (
    'https://docs.google.com/spreadsheets/d/'
    '1lBdDXVgjBblsGtRbuwekvsp3yHrk0awVXQPF8ed_ACs/export?format=csv&gid=0'
)
TV_EVENTS_SHEET_CSV_URL = (
    'https://docs.google.com/spreadsheets/d/'
    '1VcOpoC6kBXION9Kpxo3WbSspAyVz-bVTdCGXDJKi-Do/export?format=csv&gid=840189666'
)
TV_EVENTS_CACHE_LOCK = threading.Lock()
TV_EVENTS_CACHE = {'records': None, 'loaded_at': 0.0}

AUDIT_SHEETS_CONFIG = {
    'esd': {
        'formKey': 'esd',
        'title': 'PULSERAS ESD',
        'url': 'https://docs.google.com/spreadsheets/d/1WvzanQZwS7H7uv43M2RCbyq9XZIQt7oXKJnkqyov954/export?format=csv',
        'active': True
    },
    'torque': {
        'formKey': 'torque',
        'title': 'CONTROL DE TORQUE',
        'url': 'https://docs.google.com/spreadsheets/d/1wmu23GE3cLlo1HvszHTZrEwwPnwEvQSSK6PhCKD81YI/export?format=csv&gid=0',
        'active': True
    },
    'inicio_turno': {
        'formKey': 'inicio_turno',
        'title': 'CHECKLIST INICIO DE TURNO',
        'url': 'https://docs.google.com/spreadsheets/d/1qPsgTkBIDePsZe6HQ_3_vKNoyTNZYNoi5WibrZ3bXx0/export?format=csv',
        'pautas_url': 'https://docs.google.com/spreadsheets/d/1qPsgTkBIDePsZe6HQ_3_vKNoyTNZYNoi5WibrZ3bXx0/export?format=csv&gid=497192886',
        'active': True
    },
    'cambio_modelo': {
        'formKey': 'cambio_modelo',
        'title': 'CAMBIO DE MODELO (RG-0220 / RG-0772)',
        'url': 'https://docs.google.com/spreadsheets/d/1DlabBVjOzzNqKEf8O3UkYAIGtNvowl2YU6A-pfmewwI/export?format=csv',
        'pautas_url': 'https://docs.google.com/spreadsheets/d/1DlabBVjOzzNqKEf8O3UkYAIGtNvowl2YU6A-pfmewwI/export?format=csv&gid=1471194500',
        'active': True
    },
    'im_diario': {
        'formKey': 'im_diario',
        'title': 'INICIO DE PRODUCCIÓN DIARIO DE IM',
        'url': 'https://docs.google.com/spreadsheets/d/1EcjYg5iZtZIaMiI-sme-E2Ir_SYcP93VLlJCMZhAMlw/export?format=csv&gid=1125572101',
        'pautas_url': 'https://docs.google.com/spreadsheets/d/1EcjYg5iZtZIaMiI-sme-E2Ir_SYcP93VLlJCMZhAMlw/export?format=csv&gid=1023804119',
        'active': True
    },
    'im_cambio': {
        'formKey': 'im_cambio',
        'title': 'SEGUIMIENTO DE PAUTAS / CAMBIO DE MODELO IM',
        'url': 'https://docs.google.com/spreadsheets/d/1MaVZtjSoiE5ErA_Zac9ouxvFWv39LfrH6u6BQ8_9BeA/export?format=csv&gid=425660990',
        'pautas_url': 'https://docs.google.com/spreadsheets/d/1MaVZtjSoiE5ErA_Zac9ouxvFWv39LfrH6u6BQ8_9BeA/export?format=csv&gid=1956137597',
        'active': True
    }
}
AUDIT_SHEETS_CACHE_LOCK = threading.Lock()
AUDIT_SHEETS_CACHE = {'records': None, 'loaded_at': 0.0, 'counts': {}}

SCRAP_SCREENS_SHEET_CSV_URL = (
    'https://docs.google.com/spreadsheets/d/'
    '1kZdSfg89UjRIBu8BxXy-osN_PieYr5YiuhLE20vJmXE/export?format=csv&gid=1203582049'
)
SCRAP_SCREENS_SCANNER_CSV_URL = (
    'https://docs.google.com/spreadsheets/d/'
    '1kZdSfg89UjRIBu8BxXy-osN_PieYr5YiuhLE20vJmXE/export?format=csv&gid=2002456885'
)
IQC_MODEL_BRANDS_CSV_URL = (
    'https://docs.google.com/spreadsheets/d/'
    '1YlKilJheM2A21cWcKuI4YCbpTLyjJ_WJ1ezpQLIbRQ0/export?format=csv&gid=1493243980'
)
SCRAP_SCREENS_CACHE_TTL_SECONDS = 300
SCRAP_SCREENS_CACHE_LOCK = threading.Lock()
SCRAP_SCREENS_REFRESH_LOCK = threading.Lock()
SCRAP_SCREENS_REFRESH_REQUEST_LOCK = threading.Lock()
SCRAP_SCREENS_REFRESHING = threading.Event()
SCRAP_SCREENS_CACHE = {
    'records': None,
    'loaded_at': 0.0,
    'is_live': False,
    'refresh_error': ''
}
SCRAP_SCANNER_CACHE_LOCK = threading.Lock()
SCRAP_SCANNER_CACHE = {'records': None, 'loaded_at': 0.0}
SCRAP_SCANNER_PAYLOAD_CACHE_LOCK = threading.Lock()
SCRAP_SCANNER_PAYLOAD_REFRESH_LOCK = threading.Lock()
SCRAP_SCANNER_PAYLOAD_REFRESHING = threading.Event()
SCRAP_SCANNER_PAYLOAD_CACHE = {
    'payload': None,
    'loaded_at': 0.0,
    'refresh_error': ''
}
SCRAP_SCANNER_FIRST_DATA_ROW = 3669
SCRAP_SCREENS_ARCHIVE_DB_PATH = os.environ.get(
    'SCRAP_SCREENS_ARCHIVE_DB',
    os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scrap_screens_archive.sqlite3')
)
IQC_MODEL_BRANDS_CACHE_LOCK = threading.Lock()
IQC_MODEL_BRANDS_CACHE = {'brands': None, 'loaded_at': 0.0}


def normalize_scrap_model(value):
    normalized = unicodedata.normalize('NFD', str(value).strip().casefold())
    return ''.join(
        character for character in normalized
        if unicodedata.category(character) != 'Mn' and character.isalnum()
    )


def normalize_scrap_serial(value):
    return ''.join(str(value).split()).casefold()


def send_screen_validation_email(record, images):
    smtp_user = os.environ.get('QUALITY_SMTP_USER', '').strip()
    smtp_password = os.environ.get('QUALITY_SMTP_APP_PASSWORD', '').replace(' ', '')
    recipients = [
        address.strip()
        for address in os.environ.get(
            'QUALITY_SCREEN_VALIDATION_RECIPIENTS',
            'roberqsc@gmail.com,roberqsc@hotmail.com'
        ).split(',')
        if address.strip()
    ]
    if not smtp_user or not smtp_password:
        return {
            'sent': False,
            'message': 'Registro guardado, pero falta configurar Gmail en el servidor para enviar el correo.'
        }
    if not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', smtp_user):
        return {
            'sent': False,
            'message': 'Registro guardado, pero la cuenta Gmail configurada para enviar no es válida.'
        }
    if not recipients or any(not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', address) for address in recipients):
        return {
            'sent': False,
            'message': 'Registro guardado, pero la lista de destinatarios de correo no es válida.'
        }

    date_str = datetime.datetime.fromtimestamp(record['created_at']).strftime('%d/%m/%Y %H:%M:%S')
    raw_serials = [s.strip() for s in str(record.get('barcode', '')).split(',') if s.strip()]
    if not raw_serials:
        raw_serials = [str(record.get('barcode', '')).strip()]

    serial_chips_html = ''.join(
        f'<span style="display:inline-block;margin:3px 4px 3px 0;padding:5px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;font-weight:600;color:#1e293b;">{html.escape(s)}</span>'
        for s in raw_serials
    )

    obs_text = html.escape(record.get('observations', '') or '').strip()
    obs_html = f'<div style="padding:10px 14px;background:#f8fafc;border-left:3px solid #cbd5e1;border-radius:4px;font-size:13px;color:#334155;line-height:1.5;">{obs_text}</div>' if obs_text else '<span style="color:#94a3b8;font-size:13px;font-style:italic;">Sin observaciones</span>'

    line_name = html.escape(str(record.get('line', '')))
    model_name = html.escape(str(record.get('model', '')))
    lot_name = html.escape(str(record.get('lot', '')))
    auditor_name = html.escape(str(record.get('created_by', '')))
    images_count = len(images)

    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validación de pantalla</title>
</head>
<body style="margin:0;padding:24px 12px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
    <!-- Top red accent bar -->
    <tr>
      <td style="height:4px;background:linear-gradient(90deg, #dc2626 0%, #ef4444 100%);"></td>
    </tr>
    <!-- Header -->
    <tr>
      <td style="padding:28px 28px 20px 28px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#dc2626;margin-bottom:4px;">
                PLANTA 5 · CONTROL DE CALIDAD
              </div>
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;line-height:1.25;">
                Validación de Pantalla
              </h1>
            </td>
            <td align="right" valign="top">
              <span style="display:inline-block;padding:5px 12px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:20px;font-size:11px;font-weight:600;color:#059669;white-space:nowrap;">
                ✓ Registrada
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Divider -->
    <tr>
      <td style="padding:0 28px;">
        <div style="height:1px;background-color:#f1f5f9;"></div>
      </td>
    </tr>
    <!-- Main Content Form Details -->
    <tr>
      <td style="padding:20px 28px 24px 28px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="50%" valign="top" style="padding-bottom:16px;padding-right:12px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Línea</div>
              <div>
                <span style="display:inline-block;padding:3px 10px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;font-weight:700;color:#1e293b;">
                  {line_name}
                </span>
              </div>
            </td>
            <td width="50%" valign="top" style="padding-bottom:16px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Modelo</div>
              <div style="font-size:15px;font-weight:700;color:#0f172a;letter-spacing:-0.2px;">
                {model_name}
              </div>
            </td>
          </tr>
          <tr>
            <td width="50%" valign="top" style="padding-bottom:16px;padding-right:12px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Lote</div>
              <div style="font-size:13px;font-weight:600;color:#1e293b;">
                {lot_name}
              </div>
            </td>
            <td width="50%" valign="top" style="padding-bottom:16px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Responsable</div>
              <div style="font-size:13px;font-weight:600;color:#1e293b;">
                {auditor_name}
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="2" valign="top" style="padding-bottom:18px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Fecha y Hora</div>
              <div style="font-size:12px;color:#475569;">
                {date_str}
              </div>
            </td>
          </tr>
          <!-- Serials / Barcodes Section -->
          <tr>
            <td colspan="2" valign="top" style="padding-top:6px;padding-bottom:18px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:6px;">
                Códigos de barras / Serials escaneados ({len(raw_serials)})
              </div>
              <div>
                {serial_chips_html}
              </div>
            </td>
          </tr>
          <!-- Observations Section -->
          <tr>
            <td colspan="2" valign="top" style="padding-bottom:18px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:6px;">Observaciones</div>
              {obs_html}
            </td>
          </tr>
          <!-- Evidences Note -->
          <tr>
            <td colspan="2" valign="top">
              <div style="display:inline-flex;align-items:center;padding:7px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;color:#475569;">
                📎 <strong style="margin-left:6px;margin-right:4px;color:#1e293b;">{images_count}</strong> archivo(s) de imagen adjunto(s)
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding:16px 28px;background-color:#f8fafc;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;line-height:1.5;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <strong style="color:#64748b;">Site de Calidad · Planta 5</strong><br>
              Notificación automática generada tras la inspección en línea.
            </td>
            <td align="right" valign="middle" style="color:#cbd5e1;font-size:10px;">
              CONFIDENCIAL
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    message = email.message.EmailMessage()
    message['Subject'] = f"Validación de pantalla · {record['line']} · {record['barcode']}"
    message['From'] = smtp_user
    message['To'] = ', '.join(recipients)
    message.set_content(
        f'''Se registró una validación de pantalla.\n\n'
        f'Fecha: {date_str}\n'
        f'Línea: {record["line"]}\n'
        f'Modelo / descripción: {record["model"]}\n'
        f'Código de barras / serial: {record["barcode"]}\n'
        f'Lote: {record["lot"]}\n'
        f'Observaciones: {record["observations"] or "Sin observaciones"}\n'
        f'Registró: {record["created_by"]}\n'
        f'Imágenes adjuntas: {len(images)}\n'''
    )
    message.add_alternative(html_content, subtype='html')
    for filename, image_type, content in images:
        safe_filename = re.sub(r'[^A-Za-z0-9._-]', '_', filename) or 'evidencia'
        message.add_attachment(
            content,
            maintype='image',
            subtype=image_type.split('/', 1)[1],
            filename=safe_filename
        )

    try:
        with smtplib.SMTP_SSL(
            'smtp.gmail.com', 465, timeout=20, context=ssl.create_default_context()
        ) as smtp:
            smtp.login(smtp_user, smtp_password)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException, UnicodeError, ValueError) as error:
        print(f'[ERROR] No se pudo enviar el correo de validación de pantalla: {error}')
        return {
            'sent': False,
            'message': 'Registro guardado, pero Gmail no pudo enviar el correo. Verificá la cuenta y su clave de aplicación.'
        }
    return {'sent': True, 'message': 'Correo enviado correctamente.'}


def find_scrap_model_by_similar_serial(serial, candidates, candidates_by_prefix):
    serial_key = normalize_scrap_serial(serial)
    if len(serial_key) < 12:
        return None

    candidate_pool = candidates_by_prefix.get(serial_key[:4]) or candidates
    matches = [
        (
            difflib.SequenceMatcher(None, serial_key, candidate['serialKey']).ratio(),
            candidate
        )
        for candidate in candidate_pool
        if candidate['serialKey'] != serial_key and candidate['model']
    ]
    if not matches:
        return None
    matches.sort(key=lambda item: (-item[0], item[1]['serialKey']))
    best_score = matches[0][0]
    if best_score < 0.85:
        return None

    close_matches = [
        candidate
        for score, candidate in matches
        if score >= max(0.85, best_score - 0.02)
    ]
    models = {normalize_scrap_model(candidate['model']) for candidate in close_matches}
    if len(models) != 1:
        return None
    return matches[0][1]


def parse_scanner_sheet_datetime(value):
    normalized = str(value).strip()
    if not normalized:
        return None
    try:
        return datetime.datetime.fromisoformat(normalized.replace('Z', '+00:00')).replace(tzinfo=None)
    except ValueError:
        pass
    for date_format in (
        '%d/%m/%Y %H:%M:%S',
        '%d/%m/%Y %H:%M',
        '%d/%m/%Y',
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%d %H:%M',
        '%Y-%m-%d'
    ):
        try:
            return datetime.datetime.strptime(normalized, date_format)
        except ValueError:
            continue
    return None


def load_scrap_scanner_records(force_refresh=False):
    with SCRAP_SCANNER_CACHE_LOCK:
        cache_age = time.time() - SCRAP_SCANNER_CACHE['loaded_at']
        if (
            not force_refresh and
            SCRAP_SCANNER_CACHE['records'] is not None and
            cache_age < SCRAP_SCREENS_CACHE_TTL_SECONDS
        ):
            return SCRAP_SCANNER_CACHE['records']

        request = urllib.request.Request(
            SCRAP_SCREENS_SCANNER_CSV_URL,
            headers={'User-Agent': 'CalidadSuitePlanta5/1.0'}
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            csv_content = response.read().decode('utf-8-sig')

        reader = csv.reader(io.StringIO(csv_content, newline=''))
        headers = next(reader, None)
        if (
            not headers or
            len(headers) < 13 or
            normalize_scrap_model(headers[0]) != 'seriado' or
            normalize_scrap_model(headers[3]) != 'modelo' or
            normalize_scrap_model(headers[7]) != 'hora' or
            normalize_scrap_model(headers[8]) != 'op' or
            normalize_scrap_model(headers[9]) != 'lpn'
        ):
            raise ValueError('La pestaña SCANER no contiene las columnas esperadas (A, D, H, I, J, K y M).')

        records = []
        for source_row, values in enumerate(reader, start=2):
            if source_row < SCRAP_SCANNER_FIRST_DATA_ROW:
                continue
            values.extend([''] * (13 - len(values)))
            if not any(value.strip() for value in values):
                continue
            serial = values[0].strip()
            scanned_at = parse_scanner_sheet_datetime(values[10])
            if (
                not serial or
                serial.casefold() == 's' or
                not values[3].strip() or
                values[3].strip().casefold() == 's' or
                not scanned_at or
                scanned_at.year != 2026
            ):
                continue
            records.append({
                'serial': serial[:120],
                'model': values[3].strip()[:120],
                'op': values[8].strip()[:120],
                'lpn': values[9].strip()[:120],
                'scannedAt': scanned_at,
                'location': values[12].strip()[:160]
            })

        SCRAP_SCANNER_CACHE['records'] = records
        SCRAP_SCANNER_CACHE['loaded_at'] = time.time()
        return records


def build_scrap_scanner_payload(records, bbdd_records, today=None):
    current_date = today or datetime.date.today()
    scanned_today_by_serial = {}
    scanned_serials_by_month = defaultdict(set)
    all_scanned_serials = set()
    proof_of_life_by_serial = {}
    for record in records:
        scanned_at = record['scannedAt']
        serial_key = normalize_scrap_serial(record['serial'])
        if not serial_key:
            continue
        all_scanned_serials.add(serial_key)
        location = str(record.get('location', '')).strip()
        if (
            'pruebadevida' in normalize_scrap_model(location) and
            (
                serial_key not in proof_of_life_by_serial or
                scanned_at >= proof_of_life_by_serial[serial_key]['_scannedAt']
            )
        ):
            proof_of_life_by_serial[serial_key] = {
                'serial': record['serial'],
                'model': record['model'],
                'scannedAt': scanned_at.strftime('%d/%m/%Y %H:%M:%S'),
                'location': location,
                '_scannedAt': scanned_at
            }
        if scanned_at.year == 2026:
            scanned_serials_by_month[scanned_at.month].add(serial_key)
            if scanned_at.date() == current_date:
                scanned_today_by_serial[serial_key] = {
                    'serial': record['serial'],
                    'model': record['model'],
                    'op': record.get('op', '').strip(),
                    'lpn': record['lpn'],
                    'scannedAt': scanned_at.strftime('%H:%M:%S')
                }

    month_names = (
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    )
    bbdd_by_month = defaultdict(dict)
    bbdd_by_serial = {}
    rma_serials = set()
    for record in bbdd_records:
        serial = str(record.get('serial', '')).strip()
        serial_key = normalize_scrap_serial(serial)
        if not serial_key or serial_key == 's':
            continue
        rma_serials.add(serial_key)
        bbdd_match = bbdd_by_serial.setdefault(serial_key, {
            'serial': serial,
            'serialKey': serial_key,
            'model': '',
            'op': ''
        })
        if not bbdd_match['model']:
            bbdd_match['model'] = str(record.get('model', '')).strip()
        if not bbdd_match['op']:
            bbdd_match['op'] = str(record.get('op', '')).strip()
        if record.get('year') != 2026:
            continue
        disposed_at = parse_scanner_sheet_datetime(record.get('disposedAt', ''))
        if not disposed_at or disposed_at.year != 2026:
            continue
        month_records = bbdd_by_month[disposed_at.month]
        if serial_key in month_records:
            continue
        month_records[serial_key] = {
            'serial': serial,
            'model': str(record.get('model', '')).strip(),
            'date': disposed_at.strftime('%d/%m/%Y'),
            'disposedAt': disposed_at
        }

    for serial_key, scanned_record in scanned_today_by_serial.items():
        bbdd_match = bbdd_by_serial.get(serial_key, {})
        if not scanned_record['model']:
            scanned_record['model'] = bbdd_match.get('model', '')
        if not scanned_record['op']:
            scanned_record['op'] = bbdd_match.get('op', '')

    bbdd_model_candidates = list(bbdd_by_serial.values())
    bbdd_models_by_prefix = defaultdict(list)
    for candidate in bbdd_model_candidates:
        if candidate['serialKey']:
            bbdd_models_by_prefix[candidate['serialKey'][:4]].append(candidate)
    pending_by_month = []
    pending_records = []
    for month in range(1, 13):
        screens = bbdd_by_month[month]
        scanned_serials = scanned_serials_by_month[month]
        received_serials = screens.keys() & all_scanned_serials
        pending_screens = [
            screen for serial, screen in screens.items()
            if serial not in received_serials
        ]
        pending_records.extend({
            'month': month,
            'serial': screen['serial'],
            'model': screen['model'],
            'date': screen['date']
        } for screen in pending_screens)
        pending_by_month.append({
            'month': month,
            'name': month_names[month - 1],
            'bbddCount': len(screens),
            'scannedCount': len(scanned_serials),
            'receivedCount': len(received_serials),
            'pendingCount': len(pending_screens)
        })

    today_screens = bbdd_by_month[current_date.month]
    today_screens = {
        serial: screen for serial, screen in today_screens.items()
        if screen['disposedAt'].date() == current_date
    }
    today_received = today_screens.keys() & all_scanned_serials
    pending_today = [
        {
            'serial': screen['serial'],
            'model': screen['model'],
            'date': screen['date']
        }
        for serial, screen in today_screens.items()
        if serial not in today_received
    ]
    unregistered_scans_by_serial = {}
    for record in records:
        serial_key = normalize_scrap_serial(record['serial'])
        if not serial_key or serial_key in rma_serials:
            continue
        if (
            serial_key not in unregistered_scans_by_serial or
            record['scannedAt'] >= unregistered_scans_by_serial[serial_key]['_scannedAt']
        ):
            model = str(record.get('model', '')).strip()
            normalized_model = normalize_scrap_model(model)
            model_source = 'SCANER' if model else 'Sin modelo en SCANER ni coincidencia exacta en BBDD'
            if normalized_model in ('', 's', 'prueba', 'noseencontro', 'noencontrado'):
                possible_match = find_scrap_model_by_similar_serial(
                    record['serial'],
                    bbdd_model_candidates,
                    bbdd_models_by_prefix
                )
                if possible_match:
                    model = possible_match['model']
                    model_source = f"BBDD · serial similar {possible_match['serial']}"
                else:
                    model = ''
                    model_source = 'Sin coincidencia confiable en BBDD'
            unregistered_scans_by_serial[serial_key] = {
                'serial': record['serial'],
                'model': model,
                'modelSource': model_source,
                'scannedAt': record['scannedAt'].strftime('%d/%m/%Y %H:%M:%S'),
                '_scannedAt': record['scannedAt']
            }

    proof_of_life_locations = [
        {key: value for key, value in record.items() if key != '_scannedAt'}
        for record in sorted(
            proof_of_life_by_serial.values(),
            key=lambda record: record['_scannedAt'],
            reverse=True
        )
    ]
    unregistered_scans = [
        {key: value for key, value in record.items() if key != '_scannedAt'}
        for record in sorted(
            unregistered_scans_by_serial.values(),
            key=lambda record: record['_scannedAt'],
            reverse=True
        )
    ]
    return {
        'today': current_date.isoformat(),
        'scannedToday': sorted(
            scanned_today_by_serial.values(),
            key=lambda record: record['scannedAt']
        ),
        'bbddToday': len(today_screens),
        'receivedToday': len(today_received),
        'pendingToday': len(pending_today),
        'pendingTodayRecords': pending_today,
        'pendingTotal': len(pending_records),
        'pendingByMonth': pending_by_month,
        'pendingRecords': pending_records,
        'proofOfLifeLocations': proof_of_life_locations,
        'unregisteredScans': unregistered_scans
    }


def refresh_scrap_scanner_payload_in_background(force_refresh=False):
    with SCRAP_SCANNER_PAYLOAD_REFRESH_LOCK:
        if SCRAP_SCANNER_PAYLOAD_REFRESHING.is_set():
            return
        SCRAP_SCANNER_PAYLOAD_REFRESHING.set()
    with SCRAP_SCANNER_PAYLOAD_CACHE_LOCK:
        SCRAP_SCANNER_PAYLOAD_CACHE['refresh_error'] = ''

    def refresh():
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                scanner_future = executor.submit(
                    load_scrap_scanner_records,
                    force_refresh=force_refresh
                )
                bbdd_future = executor.submit(
                    load_scrap_screens_records,
                    force_refresh=force_refresh
                )
                scanner_records = scanner_future.result()
                bbdd_records = bbdd_future.result()
            payload = build_scrap_scanner_payload(scanner_records, bbdd_records)
            with SCRAP_SCANNER_PAYLOAD_CACHE_LOCK:
                SCRAP_SCANNER_PAYLOAD_CACHE.update({
                    'payload': payload,
                    'loaded_at': time.time(),
                    'refresh_error': ''
                })
        except (
            urllib.error.URLError,
            TimeoutError,
            UnicodeDecodeError,
            ValueError,
            OSError,
            sqlite3.Error
        ) as error:
            with SCRAP_SCANNER_PAYLOAD_CACHE_LOCK:
                SCRAP_SCANNER_PAYLOAD_CACHE['refresh_error'] = str(error)
            print(f'[SCANNER] No se pudieron actualizar los datos: {error}', file=sys.stderr)
        finally:
            with SCRAP_SCANNER_PAYLOAD_REFRESH_LOCK:
                SCRAP_SCANNER_PAYLOAD_REFRESHING.clear()

    refresh_thread = threading.Thread(
        target=refresh,
        name='scrap-scanner-background-refresh',
        daemon=True
    )
    try:
        refresh_thread.start()
    except RuntimeError as error:
        with SCRAP_SCANNER_PAYLOAD_CACHE_LOCK:
            SCRAP_SCANNER_PAYLOAD_CACHE['refresh_error'] = str(error)
        with SCRAP_SCANNER_PAYLOAD_REFRESH_LOCK:
            SCRAP_SCANNER_PAYLOAD_REFRESHING.clear()
        print(f'[SCANNER] No se pudo iniciar la actualización en segundo plano: {error}', file=sys.stderr)


def get_scrap_scanner_snapshot(force_refresh=False):
    with SCRAP_SCANNER_PAYLOAD_CACHE_LOCK:
        cache_age = time.time() - SCRAP_SCANNER_PAYLOAD_CACHE['loaded_at']
        needs_refresh = (
            force_refresh or
            SCRAP_SCANNER_PAYLOAD_CACHE['payload'] is None or
            cache_age >= SCRAP_SCREENS_CACHE_TTL_SECONDS
        )
    if needs_refresh:
        refresh_scrap_scanner_payload_in_background(force_refresh)

    with SCRAP_SCANNER_PAYLOAD_CACHE_LOCK:
        return (
            SCRAP_SCANNER_PAYLOAD_CACHE['payload'],
            SCRAP_SCANNER_PAYLOAD_CACHE['loaded_at'],
            SCRAP_SCANNER_PAYLOAD_CACHE['refresh_error'],
            SCRAP_SCANNER_PAYLOAD_REFRESHING.is_set()
        )


def load_tv_events_records(force_refresh=False):
    with TV_EVENTS_CACHE_LOCK:
        cache_age = time.time() - TV_EVENTS_CACHE['loaded_at']
        if (
            not force_refresh and
            TV_EVENTS_CACHE['records'] is not None and
            cache_age < SCRAP_SCREENS_CACHE_TTL_SECONDS
        ):
            return TV_EVENTS_CACHE['records']
        try:
            request = urllib.request.Request(
                TV_EVENTS_SHEET_CSV_URL,
                headers={'User-Agent': 'CalidadSuitePlanta5/1.0'}
            )
            with urllib.request.urlopen(request, timeout=30) as response:
                csv_content = response.read().decode('utf-8-sig')
            reader = csv.reader(io.StringIO(csv_content, newline=''))
            next(reader, None)  # Fila 1 (links superiores)
            headers = next(reader, None)  # Fila 2 (encabezados)
            if not headers or len(headers) < 22:
                return []
            records = []
            for row_idx, values in enumerate(reader, start=3):
                if not any(cell.strip() for cell in values):
                    continue
                values.extend([''] * (22 - len(values)))
                raw_timestamp = values[0].strip()
                parsed_dt = parse_scanner_sheet_datetime(raw_timestamp)
                year = parsed_dt.year if parsed_dt else None
                month = parsed_dt.month if parsed_dt else None
                date_str = parsed_dt.strftime('%d/%m/%Y') if parsed_dt else raw_timestamp
                sort_ts = int(parsed_dt.timestamp()) if parsed_dt else 0

                model = values[2].strip()
                supplier = values[4].strip()
                chassis = values[5].strip()
                part_number = values[8].strip()
                raw_nc_type = values[7].strip()
                if raw_nc_type.casefold() in ('maquina / herramental', 'máquina / herramental'):
                    nc_type = 'Máquina / Herramental'
                else:
                    nc_type = raw_nc_type
                raw_urls = values[16].strip()
                parsed_urls = [u.strip() for u in re.split(r'[\s,\n]+', raw_urls) if u.strip().startswith('http')]
                defect_val = values[10].strip()
                impact_val = values[12].strip()
                containment_val = values[13].strip()
                corrective_val = values[14].strip()
                mdr_text_found = (
                    'MDR' in defect_val.upper() or
                    'MDR' in impact_val.upper() or
                    'MDR' in containment_val.upper() or
                    'MDR' in corrective_val.upper()
                )
                mdr_min_ts = int(datetime.datetime(2026, 11, 10, 0, 0, 0).timestamp())
                has_mdr = bool(mdr_text_found and sort_ts >= mdr_min_ts)

                records.append({
                    'id': row_idx,
                    'timestamp': raw_timestamp,
                    'date': date_str,
                    'sortTimestamp': sort_ts,
                    'year': year,
                    'month': month,
                    'model': model,
                    'otherModels': values[3].strip(),
                    'supplier': supplier,
                    'chassis': chassis,
                    'lot': values[6].strip(),
                    'ncType': nc_type,
                    'partNumber': part_number,
                    'materialSupplier': values[9].strip(),
                    'defect': defect_val,
                    'responsibleArea': values[11].strip(),
                    'impact': impact_val,
                    'containmentAction': containment_val,
                    'correctiveAction': corrective_val,
                    'contacts': values[15].strip(),
                    'evidenceUrl': raw_urls,
                    'urls': parsed_urls,
                    'observations': values[17].strip(),
                    'considerations': values[17].strip(),
                    'hasMdr': has_mdr,
                    'claimDate': values[18].strip(),
                    'sapDelivery': values[19].strip(),
                    'sapBatch': values[20].strip(),
                    'eventNumber': values[21].strip() or f'EV-{row_idx:04d}'
                })
            TV_EVENTS_CACHE['records'] = records
            TV_EVENTS_CACHE['loaded_at'] = time.time()
            return records
        except Exception as e:
            print(f'[TV_EVENTS] Error loading: {e}')
            return TV_EVENTS_CACHE['records'] or []

def load_iqc_model_brands(force_refresh=False):
    with IQC_MODEL_BRANDS_CACHE_LOCK:
        cache_age = time.time() - IQC_MODEL_BRANDS_CACHE['loaded_at']
        if (
            not force_refresh and
            IQC_MODEL_BRANDS_CACHE['brands'] is not None and
            cache_age < SCRAP_SCREENS_CACHE_TTL_SECONDS
        ):
            return IQC_MODEL_BRANDS_CACHE['brands']

        request = urllib.request.Request(
            IQC_MODEL_BRANDS_CSV_URL,
            headers={'User-Agent': 'CalidadSuitePlanta5/1.0'}
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            csv_content = response.read().decode('utf-8-sig')

        rows = csv.reader(io.StringIO(csv_content, newline=''))
        header_found = False
        brand_counts = defaultdict(Counter)
        for values in rows:
            if len(values) <= 4:
                continue
            if (
                normalize_scrap_model(values[3]) == 'modelo' and
                normalize_scrap_model(values[4]) == 'marca'
            ):
                header_found = True
                continue
            model_key = normalize_scrap_model(values[3])
            brand = values[4].strip()
            if header_found and model_key and brand:
                brand_counts[model_key][brand] += 1

        if not header_found:
            raise ValueError('La planilla IQC no contiene las columnas Modelo (D) y Marca (E).')

        brands = {
            model_key: sorted(counts.items(), key=lambda item: (-item[1], item[0].casefold()))[0][0]
            for model_key, counts in brand_counts.items()
        }
        IQC_MODEL_BRANDS_CACHE['brands'] = brands
        IQC_MODEL_BRANDS_CACHE['loaded_at'] = time.time()
        return brands


def load_scrap_screens_records(force_refresh=False):
    with SCRAP_SCREENS_REFRESH_LOCK:
        with SCRAP_SCREENS_CACHE_LOCK:
            cache_age = time.time() - SCRAP_SCREENS_CACHE['loaded_at']
            if (
                not force_refresh and
                SCRAP_SCREENS_CACHE['is_live'] and
                cache_age < SCRAP_SCREENS_CACHE_TTL_SECONDS
            ):
                return SCRAP_SCREENS_CACHE['records']

        request = urllib.request.Request(
            SCRAP_SCREENS_SHEET_CSV_URL,
            headers={'User-Agent': 'CalidadSuitePlanta5/1.0'}
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            csv_content = response.read().decode('utf-8-sig')

        reader = csv.reader(io.StringIO(csv_content, newline=''))
        headers = next(reader, None)
        if not headers or len(headers) < 29:
            raise ValueError('La planilla de scrap no contiene todas las columnas esperadas.')
        if (
            headers[1].strip().casefold() != 'modelo' or
            headers[2].strip().casefold() != 'part number' or
            headers[9].strip().casefold() != 'tipo' or
            headers[24].strip().casefold() != 'año' or
            headers[25].strip().casefold() != 'cant origen' or
            headers[26].strip().casefold() != 'cant roto en proceso' or
            headers[28].strip().casefold() != 'marca'
        ):
            raise ValueError('Las columnas de modelo, part number, tipo, año o marca no están en las posiciones esperadas.')

        photo_labels = [
            headers[index].strip() or f'Foto {index - 9}'
            for index in range(10, 16)
        ]
        model_brands = load_iqc_model_brands(force_refresh=force_refresh)
        duplicate_rows = Counter()

        def parse_count(value):
            try:
                count = float(value.strip().replace(',', '.'))
                return max(0, int(count))
            except (AttributeError, OverflowError, ValueError):
                return 0

        records = []
        for source_order, values in enumerate(reader, start=2):
            if not any(value.strip() for value in values):
                continue
            values.extend([''] * (29 - len(values)))
            row_signature = json.dumps(values, ensure_ascii=False, separators=(',', ':'))
            duplicate_index = duplicate_rows[row_signature]
            duplicate_rows[row_signature] += 1
            year_value = values[24].strip()
            try:
                year = int(year_value) if year_value else None
            except ValueError:
                year = None
            if year is None:
                date_year = re.search(r'(?:^|[/-])(20\d{2})(?:\D|$)', values[19].strip())
                if date_year:
                    year = int(date_year.group(1))

            type_value = values[9].strip()
            normalized_type = type_value.casefold()
            model = values[1].strip()
            model_brand = model_brands.get(normalize_scrap_model(model))
            origin_count = parse_count(values[25])
            process_count = parse_count(values[26])
            if not origin_count and 'origen' in normalized_type:
                origin_count = 1
            if not process_count and 'roto en proceso' in normalized_type:
                process_count = 1

            records.append({
                'recordId': hashlib.sha256(
                    f'{row_signature}\x1f{duplicate_index}'.encode('utf-8')
                ).hexdigest(),
                '_sourceOrder': source_order,
                'serial': values[4].strip(),
                'model': model,
                'partNumber': values[2].strip(),
                'line': values[3].strip(),
                'inches': values[5].strip(),
                'lot': values[6].strip(),
                'type': type_value,
                'originCount': origin_count,
                'processCount': process_count,
                'brand': model_brand or values[28].strip() or 'Sin marca',
                'photos': [
                    {'label': photo_labels[index], 'url': values[index + 10].strip()}
                    for index in range(6)
                    if values[index + 10].strip()
                ],
                'lpn': values[16].strip(),
                'ebsPending': values[18].strip(),
                'disposedAt': values[19].strip(),
                'op': values[21].strip(),
                'po': values[22].strip(),
                'year': year
            })

        records.sort(
            key=lambda record: (
                record['year'] is not None,
                record['year'] or 0,
                record['_sourceOrder']
            ),
            reverse=True
        )
        for record in records:
            del record['_sourceOrder']

        loaded_at = time.time()
        try:
            persist_scrap_screens_archive(records, loaded_at)
            refresh_error = ''
        except sqlite3.Error as error:
            refresh_error = f'No se pudo guardar la copia local hasta 2025: {error}'
            print(f'[SCRAP] {refresh_error}', file=sys.stderr)
        with SCRAP_SCREENS_CACHE_LOCK:
            SCRAP_SCREENS_CACHE.update({
                'records': records,
                'loaded_at': loaded_at,
                'is_live': True,
                'refresh_error': refresh_error
            })
        return records


def persist_scrap_screens_archive(records, loaded_at):
    archive_records = [
        record for record in records
        if record['year'] is None or record['year'] <= 2025
    ]
    with sqlite3.connect(SCRAP_SCREENS_ARCHIVE_DB_PATH, timeout=10) as connection:
        connection.execute(
            'CREATE TABLE IF NOT EXISTS scrap_screen_archive ('
            'record_id TEXT PRIMARY KEY, record_json TEXT NOT NULL)'
        )
        connection.execute(
            'CREATE TABLE IF NOT EXISTS scrap_screen_archive_metadata ('
            'key TEXT PRIMARY KEY, value TEXT NOT NULL)'
        )
        connection.execute('DELETE FROM scrap_screen_archive')
        connection.executemany(
            'INSERT INTO scrap_screen_archive (record_id, record_json) VALUES (?, ?)',
            (
                (
                    record['recordId'],
                    json.dumps(record, ensure_ascii=False, separators=(',', ':'))
                )
                for record in archive_records
            )
        )
        connection.execute(
            'INSERT OR REPLACE INTO scrap_screen_archive_metadata (key, value) VALUES (?, ?)',
            ('loaded_at', str(loaded_at))
        )


def load_scrap_screens_archive():
    with sqlite3.connect(SCRAP_SCREENS_ARCHIVE_DB_PATH, timeout=10) as connection:
        connection.row_factory = sqlite3.Row
        connection.execute(
            'CREATE TABLE IF NOT EXISTS scrap_screen_archive ('
            'record_id TEXT PRIMARY KEY, record_json TEXT NOT NULL)'
        )
        connection.execute(
            'CREATE TABLE IF NOT EXISTS scrap_screen_archive_metadata ('
            'key TEXT PRIMARY KEY, value TEXT NOT NULL)'
        )
        rows = connection.execute(
            'SELECT record_json FROM scrap_screen_archive ORDER BY rowid'
        ).fetchall()
        metadata = connection.execute(
            'SELECT value FROM scrap_screen_archive_metadata WHERE key = ?',
            ('loaded_at',)
        ).fetchone()

    records = [json.loads(row['record_json']) for row in rows]
    loaded_at = float(metadata['value']) if metadata else 0.0
    with SCRAP_SCREENS_CACHE_LOCK:
        SCRAP_SCREENS_CACHE.update({
            'records': records,
            'loaded_at': loaded_at,
            'is_live': False,
            'refresh_error': ''
        })


def refresh_scrap_screens_in_background(force_refresh=False):
    with SCRAP_SCREENS_REFRESH_REQUEST_LOCK:
        if SCRAP_SCREENS_REFRESHING.is_set():
            return
        SCRAP_SCREENS_REFRESHING.set()

    def refresh():
        try:
            load_scrap_screens_records(force_refresh)
        except (urllib.error.URLError, TimeoutError, UnicodeDecodeError, ValueError, OSError, sqlite3.Error) as error:
            with SCRAP_SCREENS_CACHE_LOCK:
                SCRAP_SCREENS_CACHE['refresh_error'] = (
                    f'No se pudieron actualizar los datos desde Google Sheets: {error}'
                )
            print(f'[SCRAP] {error}', file=sys.stderr)
        finally:
            with SCRAP_SCREENS_REFRESH_REQUEST_LOCK:
                SCRAP_SCREENS_REFRESHING.clear()

    threading.Thread(
        target=refresh,
        name='scrap-screens-background-refresh',
        daemon=True
    ).start()


def get_scrap_screens_snapshot(force_refresh=False):
    with SCRAP_SCREENS_CACHE_LOCK:
        cache_age = time.time() - SCRAP_SCREENS_CACHE['loaded_at']
        needs_refresh = (
            force_refresh or
            not SCRAP_SCREENS_CACHE['is_live'] or
            cache_age >= SCRAP_SCREENS_CACHE_TTL_SECONDS
        )
    if needs_refresh:
        refresh_scrap_screens_in_background(force_refresh)

    with SCRAP_SCREENS_CACHE_LOCK:
        return (
            SCRAP_SCREENS_CACHE['records'] or [],
            SCRAP_SCREENS_CACHE['loaded_at'],
            SCRAP_SCREENS_CACHE['refresh_error'],
            SCRAP_SCREENS_REFRESHING.is_set(),
            SCRAP_SCREENS_CACHE['is_live']
        )


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/mdr':
            self.send_mdr_data()
            return
        if path == '/api/tv-events':
            self.send_tv_events_data()
            return
        if path == '/api/audits/sheets-data':
            self.send_audit_sheets_data()
            return
        if path == '/api/scrap-screens/scanner':
            if not self.get_authenticated_user():
                return
            self.send_scrap_screens_scanner_data()
            return
        if path == '/api/scrap-screens':
            if not self.get_authenticated_user():
                return
            self.send_scrap_screens_data()
            return
        if path == '/api/scrap-screens/disposals':
            if not self.get_authenticated_user():
                return
            self.send_scrap_screen_disposals()
            return
        if path == '/api/line-auditors':
            if not self.get_authenticated_user():
                return
            with self.database() as connection:
                connection.execute('''
                    CREATE TABLE IF NOT EXISTS line_auditor_assignments (
                        line_code TEXT PRIMARY KEY,
                        auditor1_name TEXT NOT NULL DEFAULT '',
                        auditor1_email TEXT NOT NULL DEFAULT '',
                        auditor2_name TEXT NOT NULL DEFAULT '',
                        auditor2_email TEXT NOT NULL DEFAULT '',
                        updated_at INTEGER NOT NULL
                    )
                ''')
                rows = connection.execute(
                    'SELECT line_code, auditor1_name, auditor1_email, auditor2_name, auditor2_email, updated_at '
                    'FROM line_auditor_assignments'
                ).fetchall()
            self.send_json(200, {
                'assignments': [
                    {
                        'lineCode': row['line_code'],
                        'auditor1Name': row['auditor1_name'],
                        'auditor1Email': row['auditor1_email'],
                        'auditor2Name': row['auditor2_name'],
                        'auditor2Email': row['auditor2_email'],
                        'updatedAt': row['updated_at']
                    }
                    for row in rows
                ]
            })
            return
        if path == '/api/line-auditors':
            if not self.require_same_origin() or not self.require_admin():
                return
            body = self.read_json_body()
            if body is None:
                return
            assignments = body.get('assignments', [])
            if not isinstance(assignments, list):
                self.send_json(400, {'error': 'Formato de asignaciones inválido.'})
                return
            now = int(time.time())
            with self.database() as connection:
                connection.execute('''
                    CREATE TABLE IF NOT EXISTS line_auditor_assignments (
                        line_code TEXT PRIMARY KEY,
                        auditor1_name TEXT NOT NULL DEFAULT '',
                        auditor1_email TEXT NOT NULL DEFAULT '',
                        auditor2_name TEXT NOT NULL DEFAULT '',
                        auditor2_email TEXT NOT NULL DEFAULT '',
                        updated_at INTEGER NOT NULL
                    )
                ''')
                for item in assignments:
                    line_code = str(item.get('lineCode', '')).strip()
                    if not line_code:
                        continue
                    a1_name = str(item.get('auditor1Name', '')).strip()
                    a1_email = str(item.get('auditor1Email', '')).strip()
                    a2_name = str(item.get('auditor2Name', '')).strip()
                    a2_email = str(item.get('auditor2Email', '')).strip()
                    connection.execute('''
                        INSERT INTO line_auditor_assignments (line_code, auditor1_name, auditor1_email, auditor2_name, auditor2_email, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON CONFLICT(line_code) DO UPDATE SET
                            auditor1_name = excluded.auditor1_name,
                            auditor1_email = excluded.auditor1_email,
                            auditor2_name = excluded.auditor2_name,
                            auditor2_email = excluded.auditor2_email,
                            updated_at = excluded.updated_at
                    ''', (line_code, a1_name, a1_email, a2_name, a2_email, now))
            self.send_json(200, {'ok': True})
            return
        if path == '/api/quality-team':
            if not self.get_authenticated_user():
                return
            with self.database() as connection:
                rows = connection.execute(
                    'SELECT id, full_name, email, phone, phone2, sector '
                    'FROM quality_team_members ORDER BY sector COLLATE NOCASE, full_name COLLATE NOCASE'
                ).fetchall()
            self.send_json(200, {
                'members': [
                    {
                        'id': row['id'],
                        'fullName': row['full_name'],
                        'email': row['email'],
                        'phone': row['phone'],
                        'phone2': row['phone2'],
                        'sector': row['sector']
                    }
                    for row in rows
                ]
            })
            return
        if path == '/api/screen-validations':
            if not self.require_admin():
                return
            with self.database() as connection:
                rows = connection.execute(
                    'SELECT id, line, model, barcode, lot, created_by, created_at '
                    'FROM screen_validation_records ORDER BY created_at DESC LIMIT 20'
                ).fetchall()
                records = []
                for row in rows:
                    images = connection.execute(
                        'SELECT position, filename FROM screen_validation_images '
                        'WHERE record_id = ? ORDER BY position',
                        (row['id'],)
                    ).fetchall()
                    records.append({
                        'id': row['id'],
                        'line': row['line'],
                        'model': row['model'],
                        'barcode': row['barcode'],
                        'lot': row['lot'],
                        'createdBy': row['created_by'],
                        'createdAt': row['created_at'],
                        'images': [
                            {'position': image['position'], 'filename': image['filename']}
                            for image in images
                        ]
                    })
            self.send_json(200, {'records': records})
            return
        image_match = re.fullmatch(r'/api/screen-validations/([a-f0-9]{32})/images/([1-5])', path)
        if image_match:
            if not self.require_admin():
                return
            record_id, position = image_match.groups()
            with self.database() as connection:
                image = connection.execute(
                    'SELECT mime_type, content FROM screen_validation_images '
                    'WHERE record_id = ? AND position = ?',
                    (record_id, int(position))
                ).fetchone()
            if not image:
                self.send_json(404, {'error': 'No se encontró la imagen solicitada.'})
                return
            self.send_response(200)
            self.send_header('Content-Type', image['mime_type'])
            self.send_header('Content-Length', str(len(image['content'])))
            self.send_header('Cache-Control', 'private, no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            self.wfile.write(image['content'])
            return
        if path == '/api/audits/im-cambio':
            if not self.get_authenticated_user():
                return
            parameters = parse_qs(urlparse(self.path).query)
            lot = parameters.get('lot', [''])[0].strip()
            model = parameters.get('model', [''])[0].strip()
            if not lot or not model or len(lot) > 100 or len(model) > 250:
                self.send_json(400, {'error': 'Ingresá un lote y un modelo válidos para buscar los desvíos.'})
                return
            with self.database() as connection:
                rows = connection.execute(
                    'SELECT source_id, lot, model, line, auditor, created_at, nonconformities_json '
                    'FROM im_change_audits WHERE lot_key = ? AND model_key = ? ORDER BY created_at DESC',
                    (lot.casefold(), model.casefold())
                ).fetchall()
                results = []
                for row in rows:
                    items = json.loads(row['nonconformities_json'])
                    followups = connection.execute(
                        'SELECT item_key, status, notes, updated_by, updated_at '
                        'FROM im_change_followups WHERE source_id = ?',
                        (row['source_id'],)
                    ).fetchall()
                    followup_by_key = {item['item_key']: item for item in followups}
                    results.append({
                        'sourceId': row['source_id'],
                        'lot': row['lot'],
                        'model': row['model'],
                        'line': row['line'],
                        'auditor': row['auditor'],
                        'createdAt': row['created_at'],
                        'nonconformities': [
                            {
                                **item,
                                'status': followup_by_key[item['key']]['status']
                                if item['key'] in followup_by_key else 'Pendiente',
                                'followupNotes': followup_by_key[item['key']]['notes']
                                if item['key'] in followup_by_key else ''
                            }
                            for item in items
                        ]
                    })
            self.send_json(200, {'records': results})
            return
        if path == '/api/auth/me':
            user = self.get_authenticated_user()
            if user:
                self.send_json(200, {'user': user})
            return
        if path == '/api/admin/users':
            if not self.require_admin():
                return
            with self.database() as connection:
                users = connection.execute(
                    'SELECT username, full_name, initials, role, shift, avatar_bg, is_admin '
                    'FROM users ORDER BY full_name COLLATE NOCASE'
                ).fetchall()
            self.send_json(200, {'users': [self.public_user(user) for user in users]})
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == '/api/quality-team':
            if not self.require_same_origin() or not self.require_admin():
                return
            body = self.read_json_body()
            if body is None:
                return
            full_name = body.get('fullName')
            email = body.get('email', '')
            phone = body.get('phone', '')
            phone2 = body.get('phone2', '')
            sector = body.get('sector')
            if (
                not isinstance(full_name, str) or not full_name.strip() or len(full_name.strip()) > 120 or
                not isinstance(email, str) or len(email.strip()) > 254 or
                (email.strip() and not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email.strip())) or
                not isinstance(phone, str) or len(phone.strip()) > 40 or
                not isinstance(phone2, str) or len(phone2.strip()) > 40 or
                not isinstance(sector, str) or not sector.strip() or len(sector.strip()) > 120
            ):
                self.send_json(400, {'error': 'Completá un nombre y sector válidos; revisá también el correo y el celular.'})
                return
            with self.database() as connection:
                cursor = connection.execute(
                    'INSERT INTO quality_team_members (full_name, email, phone, phone2, sector, created_at) '
                    'VALUES (?, ?, ?, ?, ?, ?)',
                    (full_name.strip(), email.strip(), phone.strip(), phone2.strip(), sector.strip(), int(time.time()))
                )
            self.send_json(201, {'ok': True, 'id': cursor.lastrowid})
            return
        if path == '/api/screen-validations':
            if not self.require_same_origin():
                return
            if not self.require_admin():
                return
            user = self.get_authenticated_user()
            if not user:
                return
            body = self.read_json_body(max_bytes=36 * 1024 * 1024)
            if body is None:
                return

            line = body.get('line')
            model = body.get('model')
            barcode = body.get('barcode')
            lot = body.get('lot')
            observations = body.get('observations', '')
            images = body.get('images', [])
            allowed_lines = {'LCD6', 'LCD8', 'CELDA1', 'CELDA2', 'CELDA3'}
            if (
                not isinstance(line, str) or line not in allowed_lines or
                not isinstance(model, str) or not model.strip() or len(model.strip()) > 120 or
                not model.strip().startswith('91') or model.strip() != model.strip().upper() or
                not isinstance(barcode, str) or not barcode.strip() or len(barcode.strip()) > 150 or
                not isinstance(lot, str) or not lot.strip() or len(lot.strip()) > 100 or
                not isinstance(observations, str) or len(observations) > 1000 or
                not isinstance(images, list) or len(images) > 5
            ):
                self.send_json(400, {'error': 'Completá línea, modelo que comience con 91 en mayúsculas, código de barras y lote válidos.'})
                return

            prepared_images = []
            allowed_image_types = {
                'image/jpeg': lambda content: content.startswith(b'\xff\xd8\xff'),
                'image/png': lambda content: content.startswith(b'\x89PNG\r\n\x1a\n'),
                'image/webp': lambda content: content.startswith(b'RIFF') and content[8:12] == b'WEBP'
            }
            data_url_pattern = re.compile(r'^data:(image/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$')
            for image in images:
                if (
                    not isinstance(image, dict) or
                    not isinstance(image.get('name'), str) or
                    not isinstance(image.get('dataUrl'), str)
                ):
                    self.send_json(400, {'error': 'Una de las imágenes adjuntas no tiene un formato válido.'})
                    return
                match = data_url_pattern.fullmatch(image['dataUrl'])
                if not match:
                    self.send_json(400, {'error': 'Una de las imágenes adjuntas tiene un formato no permitido.'})
                    return
                image_type, encoded_content = match.groups()
                try:
                    content = base64.b64decode(encoded_content, validate=True)
                except ValueError:
                    self.send_json(400, {'error': 'No se pudo interpretar una de las imágenes adjuntas.'})
                    return
                if (
                    not content or len(content) > 5 * 1024 * 1024 or
                    not allowed_image_types[image_type](content)
                ):
                    self.send_json(400, {'error': 'Una imagen está vacía, supera 5 MB o no coincide con su formato.'})
                    return
                filename = re.split(r'[\\/]', image['name'].strip())[-1][:255]
                if not filename:
                    self.send_json(400, {'error': 'El nombre de una imagen adjunta no es válido.'})
                    return
                prepared_images.append((filename, image_type, content))

            record_id = secrets.token_hex(16)
            created_at = int(time.time())
            record = {
                'id': record_id,
                'line': line,
                'model': model.strip(),
                'barcode': barcode.strip(),
                'lot': lot.strip(),
                'observations': observations.strip(),
                'created_by': user['fullName'],
                'created_at': created_at
            }
            with self.database() as connection:
                connection.execute(
                    'INSERT INTO screen_validation_records '
                    '(id, line, model, barcode, lot, observations, created_by, created_at) '
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    (
                        record_id, line, model.strip(), barcode.strip(), lot.strip(),
                        observations.strip(), user['fullName'], created_at
                    )
                )
                connection.executemany(
                    'INSERT INTO screen_validation_images (record_id, position, filename, mime_type, content) '
                    'VALUES (?, ?, ?, ?, ?)',
                    [
                        (record_id, index, filename, image_type, content)
                        for index, (filename, image_type, content) in enumerate(prepared_images, start=1)
                    ]
                )
            email_result = send_screen_validation_email(record, prepared_images)
            self.send_json(201, {
                'ok': True,
                'id': record_id,
                'emailSent': email_result['sent'],
                'emailMessage': email_result['message']
            })
            return
        if path == '/api/scrap-screens/disposals':
            if not self.require_same_origin():
                return
            user = self.get_authenticated_user()
            if not user:
                return
            body = self.read_json_body()
            if body is None:
                return
            record_id = body.get('recordId')
            disposal_date = body.get('date')
            responsible = body.get('responsible')
            reason = body.get('reason')
            if (
                not isinstance(record_id, str) or not re.fullmatch(r'[a-f0-9]{64}', record_id) or
                not isinstance(disposal_date, str) or
                not re.fullmatch(r'\d{4}-\d{2}-\d{2}', disposal_date) or
                not isinstance(responsible, str) or not responsible.strip() or len(responsible.strip()) > 100 or
                not isinstance(reason, str) or not reason.strip() or len(reason.strip()) > 500
            ):
                self.send_json(400, {'error': 'Completá una fecha válida, el responsable y el motivo de la baja.'})
                return
            try:
                datetime.date.fromisoformat(disposal_date)
            except ValueError:
                self.send_json(400, {'error': 'La fecha de baja no es válida.'})
                return
            try:
                source_record = next(
                    (record for record in load_scrap_screens_records() if record['recordId'] == record_id),
                    None
                )
            except (urllib.error.URLError, TimeoutError, UnicodeDecodeError, ValueError, OSError) as error:
                self.send_json(502, {'error': f'No se pudo validar el registro de scrap: {error}'})
                return
            if not source_record:
                self.send_json(404, {'error': 'El registro ya no está disponible en la base de scrap.'})
                return

            try:
                with self.database() as connection:
                    connection.execute(
                        'INSERT INTO scrap_screen_disposals '
                        '(record_id, model, brand, line, part_number, lot, disposal_date, responsible, reason, '
                        'registered_by, registered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        (
                            record_id, source_record['model'], source_record['brand'], source_record['line'],
                            source_record['partNumber'], source_record['lot'], disposal_date,
                            responsible.strip(), reason.strip(), user['fullName'], int(time.time())
                        )
                    )
            except sqlite3.IntegrityError:
                self.send_json(409, {'error': 'Este registro ya fue dado de baja.'})
                return
            self.send_json(201, {'ok': True})
            return
        if path in ('/api/audits/im-cambio', '/api/audits/im-cambio/followups'):
            if not self.require_same_origin():
                return
            user = self.get_authenticated_user()
            if not user:
                return
            body = self.read_json_body()
            if body is None:
                return
            if path.endswith('/followups'):
                updates = body.get('updates')
                valid_statuses = {'Pendiente', 'En seguimiento', 'Resuelto'}
                if (
                    not isinstance(updates, list) or not updates or len(updates) > 100
                ):
                    self.send_json(400, {'error': 'Los datos del seguimiento no son válidos.'})
                    return
                flattened_followups = []
                source_ids = []
                for update in updates:
                    source_id = update.get('sourceId') if isinstance(update, dict) else None
                    followups = update.get('followups') if isinstance(update, dict) else None
                    if (
                        not isinstance(source_id, str) or not source_id or len(source_id) > 100 or
                        not isinstance(followups, list) or not followups or len(followups) > 100
                    ):
                        self.send_json(400, {'error': 'Los datos del seguimiento no son válidos.'})
                        return
                    source_ids.append(source_id)
                    for item in followups:
                        if (
                            not isinstance(item, dict) or
                            not isinstance(item.get('key'), str) or len(item['key']) > 100 or
                            item.get('status') not in valid_statuses or
                            not isinstance(item.get('notes', ''), str) or len(item.get('notes', '')) > 1000
                        ):
                            self.send_json(400, {'error': 'Hay un estado o una observación de seguimiento inválidos.'})
                            return
                        flattened_followups.append((source_id, item))
                now = int(time.time())
                with self.database() as connection:
                    placeholders = ','.join('?' for _ in source_ids)
                    existing_ids = {
                        row['source_id'] for row in connection.execute(
                            f'SELECT source_id FROM im_change_audits WHERE source_id IN ({placeholders})',
                            source_ids
                        )
                    }
                    if existing_ids != set(source_ids):
                        self.send_json(404, {'error': 'No se encontró la auditoría de cambio de modelo asociada.'})
                        return
                    connection.executemany(
                        'INSERT INTO im_change_followups (source_id, item_key, status, notes, updated_by, updated_at) '
                        'VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(source_id, item_key) DO UPDATE SET '
                        'status = excluded.status, notes = excluded.notes, updated_by = excluded.updated_by, '
                        'updated_at = excluded.updated_at',
                        [
                            (source_id, item['key'], item['status'], item.get('notes', '').strip(),
                             user['username'], now)
                            for source_id, item in flattened_followups
                        ]
                    )
                self.send_json(200, {'ok': True})
                return

            source_id = body.get('sourceId', '')
            lot = body.get('lot', '')
            model = body.get('model', '')
            line = body.get('line', '')
            auditor = body.get('auditor', '')
            nonconformities = body.get('nonconformities')
            if (
                not isinstance(source_id, str) or not source_id or len(source_id) > 100 or
                not isinstance(lot, str) or not lot.strip() or len(lot.strip()) > 100 or
                not isinstance(model, str) or not model.strip() or len(model.strip()) > 250 or
                not isinstance(line, str) or len(line) > 100 or
                not isinstance(auditor, str) or len(auditor) > 100 or
                not isinstance(nonconformities, list) or len(nonconformities) > 100
            ):
                self.send_json(400, {'error': 'La auditoría de cambio de modelo contiene datos inválidos.'})
                return
            for index, item in enumerate(nonconformities):
                if (
                    not isinstance(item, dict) or item.get('key') != str(index) or
                    not isinstance(item.get('description'), str) or not item['description'].strip() or
                    len(item['description']) > 1000
                ):
                    self.send_json(400, {'error': 'La lista de no conformidades contiene datos inválidos.'})
                    return
            with self.database() as connection:
                connection.execute(
                    'INSERT INTO im_change_audits '
                    '(source_id, lot, lot_key, model, model_key, line, auditor, created_at, nonconformities_json) '
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(source_id) DO UPDATE SET '
                    'lot = excluded.lot, lot_key = excluded.lot_key, model = excluded.model, '
                    'model_key = excluded.model_key, line = excluded.line, auditor = excluded.auditor, '
                    'nonconformities_json = excluded.nonconformities_json',
                    (
                        source_id, lot.strip(), lot.strip().casefold(), model.strip(), model.strip().casefold(),
                        line.strip(), auditor.strip(), int(time.time()),
                        json.dumps(nonconformities, ensure_ascii=False)
                    )
                )
            self.send_json(200, {'ok': True, 'sourceId': source_id})
            return
        if path == '/api/auth/login':
            if not self.require_same_origin():
                return
            body = self.read_json_body()
            if body is None:
                return
            username = body.get('username', '')
            password = body.get('password', '')
            if (
                not isinstance(username, str) or len(username) > 40 or
                not isinstance(password, str) or len(password) > 128
            ):
                self.send_json(400, {'error': 'Usuario o contraseña inválidos.'})
                return
            with self.database() as connection:
                user = connection.execute(
                    'SELECT username, full_name, initials, role, shift, avatar_bg, is_admin, '
                    'password_salt, password_hash, password_iterations, auth_version '
                    'FROM users WHERE username = ? COLLATE NOCASE',
                    (username.strip(),)
                ).fetchone()
                if not user or not self.check_password(password, user):
                    self.send_json(401, {'error': 'Usuario o contraseña incorrectos.'})
                    return
                token = secrets.token_urlsafe(32)
                connection.execute(
                    'INSERT INTO sessions (token_hash, username, auth_version, expires_at) VALUES (?, ?, ?, ?)',
                    (self.hash_session_token(token), user['username'], user['auth_version'],
                     int(time.time()) + SESSION_DURATION_SECONDS)
                )
            self.send_json(
                200,
                {'user': self.public_user(user)},
                headers={'Set-Cookie': self.make_session_cookie(token, SESSION_DURATION_SECONDS)}
            )
            return
        if path == '/api/auth/logout':
            if not self.require_same_origin():
                return
            token = self.get_session_token()
            if token:
                with self.database() as connection:
                    connection.execute('DELETE FROM sessions WHERE token_hash = ?', (self.hash_session_token(token),))
            self.send_json(
                200,
                {'ok': True},
                headers={'Set-Cookie': self.make_session_cookie('', 0)}
            )
            return
        if path == '/api/admin/users/import-local':
            if not self.require_same_origin() or not self.require_admin():
                return
            body = self.read_json_body()
            if body is None:
                return
            accounts = body.get('accounts')
            if not isinstance(accounts, list) or not accounts or len(accounts) > 100:
                self.send_json(400, {'error': 'No se recibió una lista válida de cuentas locales.'})
                return

            validated_accounts = []
            allowed_avatar_colors = {
                'bg-red-600', 'bg-blue-600', 'bg-purple-600', 'bg-emerald-600',
                'bg-amber-600', 'bg-cyan-600', 'bg-pink-600', 'bg-indigo-600'
            }
            for index, account in enumerate(accounts, start=1):
                if not isinstance(account, dict):
                    self.send_json(400, {'error': f'La cuenta local {index} no es válida.'})
                    return
                username = account.get('username', '')
                full_name = account.get('fullName', '')
                password = account.get('password', '')
                role = account.get('role', '')
                shift = account.get('shift', '')
                is_admin = account.get('isAdmin', False)
                avatar_bg = account.get('avatarBg', 'bg-blue-600')
                if (
                    not isinstance(username, str) or not re.fullmatch(r'[a-zA-Z0-9._-]{2,40}', username) or
                    not isinstance(full_name, str) or not full_name.strip() or len(full_name.strip()) > 80 or
                    not isinstance(password, str) or len(password) < 6 or len(password) > 128 or
                    not isinstance(role, str) or len(role.strip()) > 80 or
                    not isinstance(shift, str) or len(shift.strip()) > 80 or
                    not isinstance(is_admin, bool) or
                    not isinstance(avatar_bg, str) or avatar_bg not in allowed_avatar_colors
                ):
                    self.send_json(400, {'error': f'La cuenta local {index} tiene datos incompletos o inválidos.'})
                    return
                initials = ''.join(part[0] for part in full_name.strip().split()[:2]).upper()
                validated_accounts.append({
                    'username': username.strip().lower(),
                    'full_name': full_name.strip(),
                    'initials': initials,
                    'role': role.strip() or 'Personal de Calidad',
                    'shift': shift.strip() or 'Turno General',
                    'avatar_bg': avatar_bg,
                    'is_admin': int(is_admin),
                    'password': password
                })

            imported = 0
            with self.database() as connection:
                for account in validated_accounts:
                    salt = secrets.token_bytes(16)
                    password_hash = self.hash_password(account['password'], salt)
                    result = connection.execute(
                        'INSERT OR IGNORE INTO users (username, full_name, initials, role, shift, avatar_bg, is_admin, '
                        'password_salt, password_hash, password_iterations, created_at) '
                        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        (account['username'], account['full_name'], account['initials'], account['role'],
                         account['shift'], account['avatar_bg'], account['is_admin'], salt.hex(),
                         password_hash.hex(), PASSWORD_HASH_ITERATIONS, int(time.time()))
                    )
                    imported += result.rowcount
            self.send_json(200, {'imported': imported, 'skipped': len(validated_accounts) - imported})
            return
        if path == '/api/admin/users':
            if not self.require_same_origin() or not self.require_admin():
                return
            body = self.read_json_body()
            if body is None:
                return
            full_name = body.get('fullName', '')
            username = body.get('username', '')
            password = body.get('password', '')
            role = body.get('role', '')
            shift = body.get('shift', '')
            is_admin = body.get('isAdmin', False)
            if (
                not isinstance(full_name, str) or not full_name.strip() or len(full_name.strip()) > 80 or
                not isinstance(username, str) or not re.fullmatch(r'[a-z0-9._-]{2,40}', username) or
                not isinstance(password, str) or len(password) < 12 or len(password) > 128 or
                not isinstance(role, str) or len(role.strip()) > 80 or
                not isinstance(shift, str) or len(shift.strip()) > 80 or
                not isinstance(is_admin, bool)
            ):
                self.send_json(400, {'error': 'Revisá los datos: nombre, usuario válido y contraseña de al menos 12 caracteres.'})
                return
            salt = secrets.token_bytes(16)
            password_hash = self.hash_password(password, salt)
            initials = ''.join(part[0] for part in full_name.strip().split()[:2]).upper()
            try:
                with self.database() as connection:
                    connection.execute(
                        'INSERT INTO users (username, full_name, initials, role, shift, avatar_bg, is_admin, '
                        'password_salt, password_hash, password_iterations, created_at) '
                        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        (username, full_name.strip(), initials, role.strip() or 'Personal de Calidad',
                         shift.strip() or 'Turno General', 'bg-red-600' if is_admin else 'bg-blue-600',
                         int(is_admin), salt.hex(), password_hash.hex(), PASSWORD_HASH_ITERATIONS, int(time.time()))
                    )
            except sqlite3.IntegrityError:
                self.send_json(409, {'error': 'Ese nombre de usuario ya está registrado.'})
                return
            self.send_json(201, {'ok': True})
            return
        self.send_json(404, {'error': 'Ruta no encontrada.'})

    def do_PATCH(self):
        team_match = re.fullmatch(r'/api/quality-team/(\d+)', urlparse(self.path).path)
        if team_match:
            if not self.require_same_origin() or not self.require_admin():
                return
            body = self.read_json_body()
            if body is None:
                return
            full_name = body.get('fullName')
            email = body.get('email', '')
            phone = body.get('phone', '')
            phone2 = body.get('phone2', '')
            sector = body.get('sector')
            if (
                not isinstance(full_name, str) or not full_name.strip() or len(full_name.strip()) > 120 or
                not isinstance(email, str) or len(email.strip()) > 254 or
                (email.strip() and not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email.strip())) or
                not isinstance(phone, str) or len(phone.strip()) > 40 or
                not isinstance(phone2, str) or len(phone2.strip()) > 40 or
                not isinstance(sector, str) or not sector.strip() or len(sector.strip()) > 120
            ):
                self.send_json(400, {'error': 'Completá un nombre y sector válidos; revisá también el correo y el celular.'})
                return
            with self.database() as connection:
                result = connection.execute(
                    'UPDATE quality_team_members SET full_name = ?, email = ?, phone = ?, phone2 = ?, sector = ? '
                    'WHERE id = ?',
                    (full_name.strip(), email.strip(), phone.strip(), phone2.strip(), sector.strip(), int(team_match.group(1)))
                )
            if result.rowcount == 0:
                self.send_json(404, {'error': 'No se encontró ese integrante del equipo.'})
                return
            self.send_json(200, {'ok': True})
            return
        match = re.fullmatch(r'/api/admin/users/([^/]+)/password', urlparse(self.path).path)
        if not match:
            self.send_json(404, {'error': 'Ruta no encontrada.'})
            return
        if not self.require_same_origin() or not self.require_admin():
            return
        body = self.read_json_body()
        if body is None:
            return
        password = body.get('password', '')
        if not isinstance(password, str) or len(password) < 12 or len(password) > 128:
            self.send_json(400, {'error': 'La contraseña debe tener entre 12 y 128 caracteres.'})
            return
        username = unquote(match.group(1))
        salt = secrets.token_bytes(16)
        password_hash = self.hash_password(password, salt)
        with self.database() as connection:
            result = connection.execute(
                'UPDATE users SET password_salt = ?, password_hash = ?, password_iterations = ?, '
                'auth_version = auth_version + 1 WHERE username = ? COLLATE NOCASE',
                (salt.hex(), password_hash.hex(), PASSWORD_HASH_ITERATIONS, username)
            )
            if result.rowcount == 0:
                self.send_json(404, {'error': 'No se encontró ese usuario.'})
                return
            connection.execute('DELETE FROM sessions WHERE username = ? COLLATE NOCASE', (username,))
        self.send_json(200, {'ok': True, 'sessionsRevoked': True})

    def do_DELETE(self):
        validation_match = re.fullmatch(r'/api/screen-validations/([a-f0-9]{32})', urlparse(self.path).path)
        if validation_match:
            if not self.require_same_origin() or not self.require_admin():
                return
            record_id = validation_match.group(1)
            with self.database() as connection:
                connection.execute('DELETE FROM screen_validation_images WHERE record_id = ?', (record_id,))
                result = connection.execute('DELETE FROM screen_validation_records WHERE id = ?', (record_id,))
            if result.rowcount == 0:
                self.send_json(404, {'error': 'No se encontró ese registro de validación.'})
                return
            self.send_json(200, {'ok': True})
            return
        team_match = re.fullmatch(r'/api/quality-team/(\d+)', urlparse(self.path).path)
        if team_match:
            if not self.require_same_origin() or not self.require_admin():
                return
            with self.database() as connection:
                result = connection.execute(
                    'DELETE FROM quality_team_members WHERE id = ?', (int(team_match.group(1)),)
                )
            if result.rowcount == 0:
                self.send_json(404, {'error': 'No se encontró ese integrante del equipo.'})
                return
            self.send_json(200, {'ok': True})
            return
        match = re.fullmatch(r'/api/admin/users/([^/]+)', urlparse(self.path).path)
        if not match:
            self.send_json(404, {'error': 'Ruta no encontrada.'})
            return
        if not self.require_same_origin() or not self.require_admin():
            return
        username = unquote(match.group(1))
        user = self.get_authenticated_user()
        if user['username'].casefold() == username.casefold():
            self.send_json(400, {'error': 'No podés eliminar el usuario de la sesión actual.'})
            return
        with self.database() as connection:
            target = connection.execute(
                'SELECT is_admin FROM users WHERE username = ? COLLATE NOCASE', (username,)
            ).fetchone()
            if not target:
                self.send_json(404, {'error': 'No se encontró ese usuario.'})
                return
            if target['is_admin']:
                admin_count = connection.execute('SELECT COUNT(*) FROM users WHERE is_admin = 1').fetchone()[0]
                if admin_count <= 1:
                    self.send_json(400, {'error': 'Debe quedar al menos un administrador activo.'})
                    return
            connection.execute('DELETE FROM users WHERE username = ? COLLATE NOCASE', (username,))
        self.send_json(200, {'ok': True})

    @contextmanager
    def database(self):
        connection = sqlite3.connect(AUTH_DB_PATH, timeout=10)
        connection.row_factory = sqlite3.Row
        connection.execute('PRAGMA foreign_keys = ON')
        try:
            with connection:
                yield connection
        finally:
            connection.close()

    def send_json(self, status, payload, headers=None):
        response = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response)))
        self.send_header('Cache-Control', 'no-store')
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(response)

    def read_json_body(self, max_bytes=65_536):
        try:
            content_length = int(self.headers.get('Content-Length', '0'))
            if content_length < 1 or content_length > max_bytes:
                raise ValueError('El tamaño de la solicitud no es válido.')
            body = json.loads(self.rfile.read(content_length))
            if not isinstance(body, dict):
                raise ValueError('El cuerpo de la solicitud no es válido.')
            return body
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(400, {'error': f'Solicitud inválida: {error}'})
            return None

    def require_same_origin(self):
        origin = self.headers.get('Origin')
        host = self.headers.get('Host')
        if not origin or not host:
            self.send_json(403, {'error': 'No se pudo validar el origen de la solicitud.'})
            return False
        parsed_origin = urlparse(origin)
        if parsed_origin.netloc.casefold() != host.casefold():
            self.send_json(403, {'error': 'Origen de solicitud no permitido.'})
            return False
        return True

    def get_session_token(self):
        cookie_header = self.headers.get('Cookie', '')
        cookie = SimpleCookie()
        try:
            cookie.load(cookie_header)
        except CookieError:
            return None
        morsel = cookie.get(SESSION_COOKIE_NAME)
        return morsel.value if morsel else None

    @staticmethod
    def hash_session_token(token):
        return hashlib.sha256(token.encode('utf-8')).hexdigest()

    @staticmethod
    def make_session_cookie(token, max_age):
        return (
            f'{SESSION_COOKIE_NAME}={token}; Path=/; HttpOnly; SameSite=Lax; '
            f'Max-Age={max_age}'
        )

    @staticmethod
    def hash_password(password, salt):
        return hashlib.pbkdf2_hmac(
            'sha256', password.encode('utf-8'), salt, PASSWORD_HASH_ITERATIONS
        )

    @staticmethod
    def check_password(password, user):
        try:
            calculated = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                bytes.fromhex(user['password_salt']),
                int(user['password_iterations'])
            )
            return hmac.compare_digest(calculated, bytes.fromhex(user['password_hash']))
        except (ValueError, TypeError):
            return False

    @staticmethod
    def public_user(user):
        return {
            'username': user['username'],
            'fullName': user['full_name'],
            'initials': user['initials'],
            'role': user['role'],
            'shift': user['shift'],
            'avatarBg': user['avatar_bg'],
            'isAdmin': bool(user['is_admin'])
        }

    def get_authenticated_user(self):
        token = self.get_session_token()
        if not token:
            self.send_json(401, {'error': 'Sesión no iniciada.'})
            return None
        now = int(time.time())
        with self.database() as connection:
            user = connection.execute(
                'SELECT u.username, u.full_name, u.initials, u.role, u.shift, u.avatar_bg, u.is_admin, '
                's.token_hash FROM sessions s JOIN users u ON u.username = s.username '
                'WHERE s.token_hash = ? AND s.expires_at > ? AND s.auth_version = u.auth_version',
                (self.hash_session_token(token), now)
            ).fetchone()
            if not user:
                connection.execute('DELETE FROM sessions WHERE token_hash = ?', (self.hash_session_token(token),))
                self.send_json(
                    401, {'error': 'Sesión vencida o revocada.'},
                    headers={'Set-Cookie': self.make_session_cookie('', 0)}
                )
                return None
        return self.public_user(user)

    def require_admin(self):
        user = self.get_authenticated_user()
        if not user:
            return False
        if not user['isAdmin']:
            self.send_json(403, {'error': 'Acceso solo para administradores.'})
            return False
        return True

    def send_mdr_data(self):
        try:
            request = urllib.request.Request(
                MDR_SHEET_CSV_URL,
                headers={'User-Agent': 'CalidadSuitePlanta5/1.0'}
            )
            with urllib.request.urlopen(request, timeout=30) as response:
                csv_content = response.read().decode('utf-8-sig')
            reader = csv.reader(io.StringIO(csv_content, newline=''))
            next(reader, None)
            next(reader, None)
            headers = next(reader, None)
            if not headers or 'Año' not in headers or 'N° MDR' not in headers or 'Planta' not in headers:
                raise ValueError('La planilla no contiene las columnas MDR esperadas.')

            records = []
            for values in reader:
                row = dict(zip(headers, values))
                year_value = row.get('Año', '').strip()
                if not year_value.isdigit() or int(year_value) < 2022:
                    continue

                detection_tokens = set(re.findall(r'[A-Z]+', row.get('Detectó', '').upper()))
                is_origin = bool({'IQC', 'ABAST'} & detection_tokens)
                is_process = 'PROD' in detection_tokens
                if is_origin and is_process:
                    detection_class = 'mixed'
                elif is_origin:
                    detection_class = 'origin'
                elif is_process:
                    detection_class = 'process'
                else:
                    detection_class = 'other'

                records.append({
                    'year': int(year_value),
                    'mdr': row.get('N° MDR', '').strip(),
                    'date': row.get('Fecha', '').strip(),
                    'plant': row.get('Planta', '').strip(),
                    'line': row.get('Línea', '').strip(),
                    'model': row.get('Modelo', '').strip(),
                    'supplier': row.get('Proveedor', '').strip(),
                    'origin': row.get('Origen', '').strip().upper(),
                    'detectedBy': row.get('Detectó', '').strip(),
                    'description': row.get('Problema detectado', '').strip(),
                    'status': row.get('Estado', '').strip(),
                    'mdrFileUrl': row.get('Link MDR Enviado', '').strip(),
                    'response8dFileUrl': row.get('Link Respuesta 8D', '').strip(),
                    'detectionClass': detection_class
                })

            payload = json.dumps({'records': records}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except (urllib.error.URLError, TimeoutError, UnicodeDecodeError, ValueError) as error:
            self.send_error(502, f'No se pudieron cargar los datos MDR: {error}')

    def send_tv_events_data(self):
        try:
            parameters = parse_qs(urlparse(self.path).query)
            force_refresh = parameters.get('refresh', [''])[0] == '1'
            records = load_tv_events_records(force_refresh=force_refresh)
            loaded_at = int(TV_EVENTS_CACHE['loaded_at'])
            payload = json.dumps({
                'records': records,
                'fetchedAt': loaded_at
            }, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except (urllib.error.URLError, TimeoutError, UnicodeDecodeError, ValueError) as error:
            self.send_error(502, f'No se pudieron cargar los datos de Eventos TV: {error}')

    def send_audit_sheets_data(self):
            try:
                parameters = parse_qs(urlparse(self.path).query)
                force_refresh = parameters.get('refresh', [''])[0] == '1'
                with AUDIT_SHEETS_CACHE_LOCK:
                    cache_age = time.time() - AUDIT_SHEETS_CACHE['loaded_at']
                    if (
                        not force_refresh and
                        AUDIT_SHEETS_CACHE['records'] is not None and
                        cache_age < SCRAP_SCREENS_CACHE_TTL_SECONDS
                    ):
                        records = AUDIT_SHEETS_CACHE['records']
                        counts = AUDIT_SHEETS_CACHE['counts']
                        loaded_at = int(AUDIT_SHEETS_CACHE['loaded_at'])
                    else:
                        all_records = []
                        counts = {}

                        def parse_audit_date(raw):
                            m = re.match(r'^\s*(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})', str(raw or ''))
                            if m:
                                d, mth, y = m.groups()
                                return f"{y}-{int(mth):02d}-{int(d):02d}"
                            return ''

                        def normalize_audit_line(line):
                            l = str(line or '').upper()
                            if 'CELDA 1' in l: return 'CELDA 1 (OLED 55")'
                            if 'CELDA 2' in l: return 'CELDA 2 (QLED 65")'
                            if 'LCD 6' in l or 'LCD6' in l: return 'LCD 6 (UHD 50")'
                            if 'LCD 8' in l or 'LCD8' in l: return 'LCD 8 (FHD 43")'
                            if 'CELDA 3' in l: return 'CELDA 3 (HD 32")'
                            if 'INSERCION' in l or 'PLACAS' in l or 'PLACA' in l: return 'INSERCIÓN PLACAS'
                            return line or 'Sin línea'

                        def fetch_csv(url, timeout=20):
                            if not url: return []
                            try:
                                req = urllib.request.Request(url, headers={'User-Agent': 'CalidadSuitePlanta5/1.0'})
                                with urllib.request.urlopen(req, timeout=timeout) as resp:
                                    content = resp.read().decode('utf-8', errors='replace')
                                    return list(csv.reader(io.StringIO(content)))
                            except Exception as e:
                                print(f"Error fetching {url}: {e}")
                                return []

                        # 1. ESD - Pulseras
                        try:
                            rows = fetch_csv(AUDIT_SHEETS_CONFIG['esd']['url'])
                            sessions = defaultdict(list)
                            for r in rows[1:]:
                                if r and r[0].strip():
                                    sessions[(r[0].strip(), r[1].strip() if len(r)>1 else '')].append(r)
                            esd_records = []
                            for idx, ((ts, raw_line), srows) in enumerate(sessions.items(), start=1):
                                date_key = parse_audit_date(ts)
                                norm_line = normalize_audit_line(raw_line)
                                auditor = srows[0][2].strip() if len(srows[0])>2 else ''
                                shift = srows[0][3].strip() if len(srows[0])>3 else ''
                                model = srows[0][4].strip() if len(srows[0])>4 else ''
                                ng_items = []
                                audited_items = []
                                for r in srows:
                                    puesto = r[5].strip() if len(r)>5 else ''
                                    cod_t = r[6].strip() if len(r)>6 else ''
                                    desc_t = r[7].strip() if len(r)>7 else ''
                                    pulsera = r[8].strip() if len(r)>8 else ''
                                    conf = r[9].strip().upper() if len(r)>9 else ''
                                    row_is_ng = ('NO CONFORME' in conf or pulsera.upper() == 'NG' or cod_t.upper() in ('NE', 'NP', 'NG'))
                                    if row_is_ng:
                                        ng_items.append(f"Puesto {puesto}: {desc_t or cod_t} (Pulsera: {pulsera})")
                                    audited_items.append({
                                        'label': f"Puesto {puesto}" if puesto else 'Puesto',
                                        'detail': f"Pulsera: {pulsera or '-'} · Estado: {desc_t or cod_t or conf or '-'}",
                                        'status': 'NG' if row_is_ng else 'OK',
                                        'isNg': row_is_ng
                                    })
                                is_ng = len(ng_items) > 0
                                esd_records.append({
                                    'id': f"sheet-esd-{idx}",
                                    'formKey': 'esd',
                                    'formName': 'PULSERAS ESD',
                                    'line': norm_line,
                                    'rawLine': raw_line,
                                    'dateKey': date_key,
                                    'timestamp': ts,
                                    'auditor': auditor,
                                    'turno': shift,
                                    'model': model,
                                    'status': 'No Conforme' if is_ng else 'Conforme',
                                    'isNg': is_ng,
                                    'ngItems': ng_items,
                                    'auditedItems': audited_items,
                                    'puestosCount': len(srows),
                                    'source': 'Google Sheets · Pulseras'
                                })
                            all_records.extend(esd_records)
                            counts['esd'] = len(esd_records)
                        except Exception as e:
                            counts['esd'] = 0

                        # 2. Torque
                        try:
                            rows = fetch_csv(AUDIT_SHEETS_CONFIG['torque']['url'])
                            sessions = defaultdict(list)
                            for r in rows[1:]:
                                if r and r[0].strip():
                                    sessions[(r[0].strip(), r[1].strip() if len(r)>1 else '')].append(r)
                            torque_records = []
                            for idx, ((ts, raw_line), srows) in enumerate(sessions.items(), start=1):
                                date_key = parse_audit_date(ts)
                                norm_line = normalize_audit_line(raw_line)
                                shift = srows[0][2].strip() if len(srows[0])>2 else ''
                                auditor = srows[0][3].strip() if len(srows[0])>3 else ''
                                model = srows[0][4].strip() if len(srows[0])>4 else ''
                                ng_items = []
                                audited_items = []
                                for r in srows:
                                    puesto = r[5].strip() if len(r)>5 else ''
                                    min_t = r[6].strip() if len(r)>6 else ''
                                    max_t = r[7].strip() if len(r)>7 else ''
                                    num_at = r[8].strip() if len(r)>8 else ''
                                    prisionero = r[9].strip().upper() if len(r)>9 else ''
                                    torque_med = r[10].strip() if len(r)>10 else ''
                                    est = r[14].strip().upper() if len(r)>14 else ''
                                    row_is_ng = (est == 'NG' or prisionero == 'NG' or 'NO' in est)
                                    if row_is_ng:
                                        ng_items.append(f"Puesto {puesto} (Atornilladora {num_at}): Torque {torque_med} kgf*cm [{min_t}-{max_t}]")
                                    audited_items.append({
                                        'label': f"Puesto {puesto}" + (f" (Atorn. {num_at})" if num_at else ''),
                                        'detail': f"Medido: {torque_med or '-'} kgf*cm · Rango [{min_t or '-'}-{max_t or '-'}] · Prisionero: {prisionero or '-'} · Est: {est or ('NG' if row_is_ng else 'OK')}",
                                        'status': 'NG' if row_is_ng else 'OK',
                                        'isNg': row_is_ng
                                    })
                                is_ng = len(ng_items) > 0
                                torque_records.append({
                                    'id': f"sheet-torque-{idx}",
                                    'formKey': 'torque',
                                    'formName': 'CONTROL DE TORQUE',
                                    'line': norm_line,
                                    'rawLine': raw_line,
                                    'dateKey': date_key,
                                    'timestamp': ts,
                                    'auditor': auditor,
                                    'turno': shift,
                                    'model': model,
                                    'status': 'No Conforme' if is_ng else 'Conforme',
                                    'isNg': is_ng,
                                    'ngItems': ng_items,
                                    'auditedItems': audited_items,
                                    'puestosCount': len(srows),
                                    'source': 'Google Sheets · Torque'
                                })
                            all_records.extend(torque_records)
                            counts['torque'] = len(torque_records)
                        except Exception as e:
                            counts['torque'] = 0

                        def parse_checklist_records(sheet_url, form_key, form_name, source_label, max_col, obs_col):
                            rows = fetch_csv(sheet_url)
                            header = rows[0] if rows else []
                            parsed = []
                            for idx, r in enumerate(rows[1:], start=1):
                                if not r or not r[0].strip():
                                    continue
                                ts = r[0].strip()
                                date_key = parse_audit_date(ts)
                                raw_line = r[1].strip() if len(r) > 1 else ''
                                norm_line = normalize_audit_line(raw_line)
                                shift = r[2].strip() if len(r) > 2 else ''
                                auditor = r[3].strip() if len(r) > 3 else ''
                                supervisor = r[4].strip() if len(r) > 4 else ''
                                model = r[5].strip() if len(r) > 5 else ''
                                lote = r[6].strip() if len(r) > 6 else ''
                                conf_gen = r[7].strip().upper() if len(r) > 7 else ''
                                ng_items = []
                                audited_items = []
                                for col_idx in range(8, min(max_col, len(r))):
                                    raw_val = r[col_idx].strip()
                                    val = raw_val.upper()
                                    item_is_ng = ('NG' in val or 'NO CONFORME' in val or val == 'NO')
                                    item_name = header[col_idx].strip() if col_idx < len(header) and header[col_idx].strip() else f"Ítem {col_idx}"
                                    if item_is_ng:
                                        ng_items.append(f"{item_name}: NG")
                                    if raw_val:
                                        audited_items.append({
                                            'label': item_name,
                                            'detail': raw_val,
                                            'status': 'NG' if item_is_ng else 'OK',
                                            'isNg': item_is_ng
                                        })
                                obs_text = r[obs_col].strip() if len(r) > obs_col else ''
                                if obs_text and obs_text != '-':
                                    ng_items.append(f"Desvío: {obs_text}")
                                    audited_items.append({
                                        'label': 'Observación / Desvío reportado',
                                        'detail': obs_text,
                                        'status': 'NG',
                                        'isNg': True
                                    })
                                is_ng = ('NO CONFORME' in conf_gen or len(ng_items) > 0)
                                parsed.append({
                                    'id': f"sheet-{form_key}-{idx}",
                                    'formKey': form_key,
                                    'formName': form_name,
                                    'line': norm_line,
                                    'rawLine': raw_line,
                                    'dateKey': date_key,
                                    'timestamp': ts,
                                    'auditor': auditor,
                                    'supervisor': supervisor,
                                    'turno': shift,
                                    'model': model,
                                    'lote': lote,
                                    'observacion': obs_text if obs_text and obs_text != '-' else '',
                                    'status': 'No Conforme' if is_ng else 'Conforme',
                                    'isNg': is_ng,
                                    'ngItems': ng_items,
                                    'auditedItems': audited_items,
                                    'source': source_label
                                })
                            return parsed

                        # 3. Inicio Turno (TV)
                        try:
                            it_records = parse_checklist_records(
                                AUDIT_SHEETS_CONFIG['inicio_turno']['url'],
                                'inicio_turno', 'CHECKLIST INICIO DE TURNO',
                                'Google Sheets · Inicio Turno', 26, 26
                            )
                            all_records.extend(it_records)
                            counts['inicio_turno'] = len(it_records)
                        except Exception as e:
                            counts['inicio_turno'] = 0

                        # 4. Cambio Modelo (TV)
                        try:
                            cm_records = parse_checklist_records(
                                AUDIT_SHEETS_CONFIG['cambio_modelo']['url'],
                                'cambio_modelo', 'CAMBIO DE MODELO (RG-0220 / RG-0772)',
                                'Google Sheets · Cambio Modelo TV', 29, 29
                            )
                            rows_cmp = fetch_csv(AUDIT_SHEETS_CONFIG['cambio_modelo']['pautas_url'])
                            for r in rows_cmp[1:]:
                                ts = r[0].strip() if len(r) > 0 else ''
                                if not ts:
                                    continue
                                puesto = r[8].strip() if len(r) > 8 else ''
                                pauta_val = r[9].strip() if len(r) > 9 else ''
                                est_pauta = r[7].strip() if len(r) > 7 else ''
                                obs = r[11].strip() if len(r) > 11 else ''
                                pauta_is_ng = (len(r) > 9 and (pauta_val.upper() == 'NG' or 'NO' in est_pauta.upper()))
                                for rec in cm_records:
                                    if rec['timestamp'] == ts:
                                        rec['auditedItems'].append({
                                            'label': f"Pauta Puesto {puesto or '-'}",
                                            'detail': obs or f"Estado: {pauta_val or est_pauta or 'OK'}",
                                            'status': 'NG' if pauta_is_ng else 'OK',
                                            'isNg': pauta_is_ng
                                        })
                                        if pauta_is_ng:
                                            rec['ngItems'].append(f"Puesto {puesto}: {obs or 'Desvío en pauta'}")
                                            rec['isNg'] = True
                                            rec['status'] = 'No Conforme'
                            all_records.extend(cm_records)
                            counts['cambio_modelo'] = len(cm_records)
                        except Exception as e:
                            counts['cambio_modelo'] = 0

                        # 5. IM Diario
                        try:
                            imd_records = parse_checklist_records(
                                AUDIT_SHEETS_CONFIG['im_diario']['url'],
                                'im_diario', 'INICIO PRODUCCIÓN DIARIO DE IM',
                                'Google Sheets · IM Diario', 27, 27
                            )
                            all_records.extend(imd_records)
                            counts['im_diario'] = len(imd_records)
                        except Exception as e:
                            counts['im_diario'] = 0

                        # 6. IM Cambio Modelo / Pautas
                        try:
                            imc_records = parse_checklist_records(
                                AUDIT_SHEETS_CONFIG['im_cambio']['url'],
                                'im_cambio', 'SEGUIMIENTO DE PAUTAS / CAMBIO DE MODELO IM',
                                'Google Sheets · IM Cambio Modelo', 21, 21
                            )
                            all_records.extend(imc_records)
                            counts['im_cambio'] = len(imc_records)
                        except Exception as e:
                            counts['im_cambio'] = 0

                        counts['totalAudits'] = len(all_records)
                        records = all_records
                        AUDIT_SHEETS_CACHE['records'] = records
                        AUDIT_SHEETS_CACHE['counts'] = counts
                        AUDIT_SHEETS_CACHE['loaded_at'] = time.time()
                        loaded_at = int(AUDIT_SHEETS_CACHE['loaded_at'])

                payload = json.dumps({
                    'success': True,
                    'records': records,
                    'counts': counts,
                    'sources': {k: {'title': v['title'], 'active': v['active']} for k, v in AUDIT_SHEETS_CONFIG.items()},
                    'fetchedAt': loaded_at
                }, ensure_ascii=False).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
            except Exception as error:
                self.send_error(502, f'No se pudieron cargar los datos de auditorías de Google Sheets: {error}')

    def send_scrap_screens_data(self):
        try:
            parameters = parse_qs(urlparse(self.path).query)
            force_refresh = parameters.get('refresh', [''])[0] == '1'
            (
                source_records,
                fetched_at,
                refresh_error,
                refreshing,
                is_live
            ) = get_scrap_screens_snapshot(force_refresh)
            with self.database() as connection:
                disposed_record_ids = {
                    row['record_id']
                    for row in connection.execute('SELECT record_id FROM scrap_screen_disposals')
                }
            all_records = [
                record for record in source_records
                if record['recordId'] not in disposed_record_ids
            ]

            # Enriquecer modelos con proveedor y chasis de Eventos TV
            try:
                tv_events_records = load_tv_events_records(force_refresh=False)
            except Exception:
                tv_events_records = []

            model_meta_map = {}
            for ev in tv_events_records:
                ev_sup = ev.get('supplier', '').strip()
                ev_chas = ev.get('chassis', '').strip()
                m_norm = normalize_scrap_model(ev.get('model', ''))
                if m_norm and (ev_sup or ev_chas) and m_norm not in model_meta_map:
                    model_meta_map[m_norm] = {'supplier': ev_sup, 'chassis': ev_chas}
                if ev.get('otherModels'):
                    for alt in ev.get('otherModels').split(','):
                        alt_norm = normalize_scrap_model(alt.strip())
                        if alt_norm and alt_norm not in model_meta_map:
                            model_meta_map[alt_norm] = {'supplier': ev_sup, 'chassis': ev_chas}

            def get_scrap_model_meta(raw_m):
                norm = normalize_scrap_model(raw_m)
                if norm in model_meta_map:
                    return model_meta_map[norm]
                if norm.startswith('91') and norm[2:] in model_meta_map:
                    return model_meta_map[norm[2:]]
                for k, v in model_meta_map.items():
                    if k and (k in norm or norm in k):
                        return v
                return None

            for record in all_records:
                meta = get_scrap_model_meta(record.get('model', ''))
                if meta:
                    record['supplier'] = meta['supplier'] or record.get('brand') or 'Sin proveedor'
                    record['chassis'] = meta['chassis'] or 'Sin chasis'
                else:
                    record['supplier'] = record.get('brand') or 'Sin proveedor'
                    record['chassis'] = 'Sin chasis'

            selected_year = parameters.get('year', [''])[0].strip()
            selected_line = parameters.get('line', [''])[0].strip()
            selected_brand = parameters.get('brand', [''])[0].strip()
            selected_supplier = parameters.get('supplier', [''])[0].strip()
            selected_chassis = parameters.get('chassis', [''])[0].strip()
            selected_model = parameters.get('model', [''])[0].strip()[:250]
            selected_lot = parameters.get('lot', [''])[0].strip()[:120]
            lot_filter = 'lots' in parameters
            selected_lots = []
            if lot_filter:
                try:
                    lot_items = json.loads(parameters.get('lots', ['[]'])[0])
                except json.JSONDecodeError as error:
                    raise ValueError('El filtro de lotes no tiene un formato válido.') from error
                if not isinstance(lot_items, list) or len(lot_items) > 1000:
                    raise ValueError('El filtro de lotes no tiene un formato válido.')
                for item in lot_items:
                    if not isinstance(item, dict):
                        raise ValueError('El filtro de lotes no tiene un formato válido.')
                    lot = item.get('lot')
                    year = item.get('year')
                    if (
                        not isinstance(lot, str) or
                        not lot.strip() or
                        (year is not None and (not isinstance(year, int) or isinstance(year, bool)))
                    ):
                        raise ValueError('El filtro de lotes no tiene un formato válido.')
                    selected_lots.append({'year': year, 'lot': lot.strip()[:120]})
            try:
                selected_month = int(parameters.get('month', [''])[0])
            except ValueError:
                selected_month = 0
            if not 1 <= selected_month <= 12:
                selected_month = 0
            normalized_model = normalize_scrap_model(selected_model)
            query = parameters.get('q', [''])[0].strip()[:120]
            normalized_query = ''.join(
                character for character in unicodedata.normalize('NFD', query).casefold()
                if unicodedata.category(character) != 'Mn'
            )
            try:
                page = max(1, int(parameters.get('page', ['1'])[0]))
            except ValueError:
                page = 1
            try:
                page_size = min(100, max(1, int(parameters.get('pageSize', ['100'])[0])))
            except ValueError:
                page_size = 100

            def record_month(record):
                date_value = record['disposedAt']
                match = re.match(
                    r'^\s*(\d{1,2})/(\d{1,2})/\d{4}|^\s*\d{4}-(\d{1,2})-\d{1,2}',
                    date_value
                )
                if not match:
                    return 0
                if match.group(3):
                    month = int(match.group(3))
                else:
                    first, second = int(match.group(1)), int(match.group(2))
                    month = second if first > 12 or second <= 12 else first
                return month if 1 <= month <= 12 else 0

            def matches_selection(record, include_lot=True):
                if selected_year and str(record['year'] or '') != selected_year:
                    return False
                if selected_month and record_month(record) != selected_month:
                    return False
                if selected_line and record['line'] != selected_line:
                    return False
                if selected_brand and record['brand'] != selected_brand:
                    return False
                if selected_supplier and record.get('supplier') != selected_supplier:
                    return False
                if selected_chassis and record.get('chassis') != selected_chassis:
                    return False
                if normalized_model and normalize_scrap_model(record['model']) != normalized_model:
                    return False
                if include_lot and lot_filter and not any(
                    record['year'] == item['year'] and record['lot'].strip() == item['lot']
                    for item in selected_lots
                ):
                    return False
                if include_lot and selected_lot and record['lot'].strip() != selected_lot:
                    return False
                return True

            def matches_query(record):
                if not normalized_query:
                    return True
                searchable = ''.join(
                    character for character in unicodedata.normalize('NFD', ' '.join((
                        record['model'], record['partNumber'], record['line'],
                        record['lot'], record['op'], record['po'], record['brand']
                    )).casefold())
                    if unicodedata.category(character) != 'Mn'
                )
                return normalized_query in searchable

            filtered_records = [
                record for record in all_records
                if matches_selection(record) and matches_query(record)
            ]
            lot_trend_records = [
                record for record in all_records
                if matches_selection(record, include_lot=False) and matches_query(record)
            ]
            filtered_records.sort(
                key=lambda record: (record['year'] is not None, record['year'] or 0),
                reverse=True
            )
            start = (page - 1) * page_size
            visible_records = filtered_records[start:start + page_size]

            def summarize(records):
                return {
                    'total': len(records),
                    'origin': sum(record['originCount'] for record in records),
                    'process': sum(record['processCount'] for record in records),
                    'ebsPending': sum(
                        bool(record['ebsPending'].strip()) and
                        record['year'] is not None and record['year'] >= 2026
                        for record in records
                    )
                }

            trend_by_year = {}
            for record in filtered_records:
                year_label = str(record['year']) if record['year'] is not None else 'Sin año'
                trend = trend_by_year.setdefault(year_label, {'year': year_label, 'origin': 0, 'process': 0})
                trend['origin'] += record['originCount']
                trend['process'] += record['processCount']
            trend = sorted(
                trend_by_year.values(),
                key=lambda item: (item['year'] != 'Sin año', item['year']),
                reverse=True
            )

            monthly_trend_by_period = {}
            for record in filtered_records:
                month = record_month(record)
                if record['year'] is None or not 1 <= month <= 12:
                    continue
                period_key = (record['year'], month)
                monthly_trend = monthly_trend_by_period.setdefault(
                    period_key,
                    {
                        'year': record['year'],
                        'month': month,
                        'origin': 0,
                        'process': 0
                    }
                )
                monthly_trend['origin'] += record['originCount']
                monthly_trend['process'] += record['processCount']
            monthly_trend = [
                monthly_trend_by_period[key]
                for key in sorted(monthly_trend_by_period)
            ]

            lot_trend_by_batch = {}
            if normalized_model:
                for record in lot_trend_records:
                    lot = record['lot'].strip()
                    if not lot:
                        continue
                    year = record['year']
                    batch_key = (year, lot)
                    batch_trend = lot_trend_by_batch.setdefault(
                        batch_key,
                        {
                            'year': year,
                            'lot': lot,
                            'origin': 0,
                            'process': 0
                        }
                    )
                    batch_trend['origin'] += record['originCount']
                    batch_trend['process'] += record['processCount']
            lot_trend = sorted(
                lot_trend_by_batch.values(),
                key=lambda item: (
                    item['year'] is None,
                    item['year'] or 0,
                    tuple(
                        (0, int(part)) if part.isdigit() else (1, part)
                        for part in re.split(r'(\d+)', item['lot'].casefold())
                    )
                )
            )

            model_counts = {}
            for record in filtered_records:
                model = record['model'].strip() or 'Sin modelo'
                model_key = model.casefold()
                counts = model_counts.setdefault(model_key, {'model': model, 'origin': 0, 'process': 0})
                counts['origin'] += record['originCount']
                counts['process'] += record['processCount']
            top_models = {
                category: sorted(
                    (
                        {'model': item['model'], 'count': item[category]}
                        for item in model_counts.values() if item[category] > 0
                    ),
                    key=lambda item: (-item['count'], item['model'].casefold())
                )[:5]
                for category in ('origin', 'process')
            }

            payload = json.dumps({
                'records': [
                    {key: value for key, value in record.items() if key != 'serial'}
                    for record in visible_records
                ],
                'total': len(filtered_records),
                'page': page,
                'pageSize': page_size,
                'summary': summarize(filtered_records),
                'filters': {
                    'years': sorted({record['year'] for record in all_records if record['year'] is not None and record['year'] >= 2024}, reverse=True),
                    'lines': sorted({record['line'] for record in all_records if record['line']}, key=str.casefold),
                    'brands': sorted({record['brand'] for record in all_records if record.get('brand')}, key=str.casefold),
                    'suppliers': sorted({record['supplier'] for record in all_records if record.get('supplier') and record['supplier'] not in ('Sin proveedor', 'Sin marca')}, key=str.casefold),
                    'chassis': sorted({record['chassis'] for record in all_records if record.get('chassis') and record['chassis'] != 'Sin chasis'}, key=str.casefold),
                    'models': sorted(
                        {record['model'].strip() for record in all_records if record['model'].strip()},
                        key=str.casefold
                    )
                },
                'selectedSupplier': selected_supplier,
                'selectedChassis': selected_chassis,
                'supplierChassisTrend': sorted([
                    item for item in (
                        lambda: [
                            dict(
                                supplier=k[0],
                                chassis=k[1],
                                origin=v['origin'],
                                process=v['process'],
                                total=v['origin'] + v['process']
                            )
                            for k, v in (
                                lambda counts={}: [
                                    (counts.setdefault((r.get('supplier', 'Sin proveedor'), r.get('chassis', 'Sin chasis')), {'origin': 0, 'process': 0}).update({
                                        'origin': counts[(r.get('supplier', 'Sin proveedor'), r.get('chassis', 'Sin chasis'))]['origin'] + r['originCount'],
                                        'process': counts[(r.get('supplier', 'Sin proveedor'), r.get('chassis', 'Sin chasis'))]['process'] + r['processCount']
                                    })) for r in filtered_records
                                ] and counts
                            )().items()
                        ]
                    )()
                ], key=lambda x: -x['total']),
                'selectedModel': selected_model,
                'selectedLot': selected_lot,
                'lotFilter': lot_filter,
                'selectedLots': selected_lots,
                'trend': trend,
                'monthlyTrend': monthly_trend,
                'lotTrend': lot_trend,
                'topModels': top_models,
                'fetchedAt': int(fetched_at),
                'refreshing': refreshing,
                'refreshError': refresh_error,
                'isLive': is_live
            }, ensure_ascii=False).encode('utf-8')
            compressed = 'gzip' in self.headers.get('Accept-Encoding', '').casefold()
            if compressed:
                payload = gzip.compress(payload, compresslevel=5)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Vary', 'Accept-Encoding')
            if compressed:
                self.send_header('Content-Encoding', 'gzip')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except (urllib.error.URLError, TimeoutError, UnicodeDecodeError, ValueError, OSError) as error:
            self.send_error(502, f'No se pudieron cargar los datos de scrap de pantallas: {error}')

    def send_scrap_screens_scanner_data(self):
        parameters = parse_qs(urlparse(self.path).query)
        force_refresh = parameters.get('refresh', [''])[0] == '1'
        payload, loaded_at, refresh_error, refreshing = get_scrap_scanner_snapshot(
            force_refresh
        )
        if payload is None:
            if refresh_error and not refreshing:
                self.send_json(
                    502,
                    {'error': f'No se pudieron cargar los datos del scanner: {refresh_error}'}
                )
                return
            self.send_json(200, {
                'loading': True,
                'refreshing': refreshing
            })
            return

        response_payload = dict(payload)
        response_payload.update({
            'loading': False,
            'refreshing': refreshing,
            'refreshError': refresh_error,
            'loadedAt': loaded_at
        })
        self.send_json(200, response_payload)

    def send_scrap_screen_disposals(self):
        with self.database() as connection:
            records = connection.execute(
                'SELECT record_id, model, brand, line, part_number, lot, disposal_date, responsible, reason, '
                'registered_by, registered_at FROM scrap_screen_disposals '
                'ORDER BY disposal_date DESC, registered_at DESC'
            ).fetchall()
        self.send_json(200, {
            'records': [
                {
                    'recordId': row['record_id'],
                    'model': row['model'],
                    'brand': row['brand'],
                    'line': row['line'],
                    'partNumber': row['part_number'],
                    'lot': row['lot'],
                    'date': row['disposal_date'],
                    'responsible': row['responsible'],
                    'reason': row['reason'],
                    'registeredBy': row['registered_by'],
                    'registeredAt': row['registered_at']
                }
                for row in records
            ]
        })

    def end_headers(self):
        # Asegurar encabezados anti-cache en desarrollo local
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

class ThreadingServer(socketserver.ThreadingTCPServer):
    daemon_threads = True
    allow_reuse_address = True


def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    initialize_auth_database()
    load_scrap_screens_archive()

    with ThreadingServer(("", PORT), Handler) as httpd:
        refresh_scrap_screens_in_background()
        refresh_scrap_scanner_payload_in_background()
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print("[OK] CALIDAD SUITE - PLANTA 5 (PRODUCCION DE TV)")
        print(f"[OK] Servidor iniciado con exito en: {url}")
        print("Presiona Ctrl + C para detener el servidor")
        print("=" * 60)
        
        try:
            webbrowser.open(url)
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nDeteniendo servidor...")
            httpd.server_close()
            print("Servidor detenido correctamente.")


def initialize_auth_database():
    connection = sqlite3.connect(AUTH_DB_PATH, timeout=10)
    try:
        connection.execute('PRAGMA foreign_keys = ON')
        connection.executescript(
            '''
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY COLLATE NOCASE,
                full_name TEXT NOT NULL,
                initials TEXT NOT NULL,
                role TEXT NOT NULL,
                shift TEXT NOT NULL,
                avatar_bg TEXT NOT NULL,
                is_admin INTEGER NOT NULL CHECK (is_admin IN (0, 1)),
                password_salt TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                password_iterations INTEGER NOT NULL,
                auth_version INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                username TEXT NOT NULL COLLATE NOCASE REFERENCES users(username) ON DELETE CASCADE,
                auth_version INTEGER NOT NULL,
                expires_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
            CREATE TABLE IF NOT EXISTS im_change_audits (
                source_id TEXT PRIMARY KEY,
                lot TEXT NOT NULL,
                lot_key TEXT NOT NULL,
                model TEXT NOT NULL,
                model_key TEXT NOT NULL,
                line TEXT NOT NULL,
                auditor TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                nonconformities_json TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS im_change_audits_lot_model_idx
                ON im_change_audits(lot_key, model_key);
            CREATE TABLE IF NOT EXISTS im_change_followups (
                source_id TEXT NOT NULL REFERENCES im_change_audits(source_id) ON DELETE CASCADE,
                item_key TEXT NOT NULL,
                status TEXT NOT NULL CHECK (status IN ('Pendiente', 'En seguimiento', 'Resuelto')),
                notes TEXT NOT NULL DEFAULT '',
                updated_by TEXT NOT NULL,
                updated_at INTEGER NOT NULL,
                PRIMARY KEY (source_id, item_key)
            );
            CREATE TABLE IF NOT EXISTS scrap_screen_disposals (
                record_id TEXT PRIMARY KEY,
                model TEXT NOT NULL,
                brand TEXT NOT NULL,
                line TEXT NOT NULL,
                part_number TEXT NOT NULL,
                lot TEXT NOT NULL,
                disposal_date TEXT NOT NULL,
                responsible TEXT NOT NULL,
                reason TEXT NOT NULL,
                registered_by TEXT NOT NULL,
                registered_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS scrap_screen_disposals_date_idx
                ON scrap_screen_disposals(disposal_date, registered_at);
            CREATE TABLE IF NOT EXISTS screen_validation_records (
                id TEXT PRIMARY KEY,
                line TEXT NOT NULL,
                model TEXT NOT NULL,
                barcode TEXT NOT NULL,
                lot TEXT NOT NULL,
                observations TEXT NOT NULL DEFAULT '',
                created_by TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS screen_validation_records_created_at_idx
                ON screen_validation_records(created_at DESC);
            CREATE TABLE IF NOT EXISTS screen_validation_images (
                record_id TEXT NOT NULL REFERENCES screen_validation_records(id) ON DELETE CASCADE,
                position INTEGER NOT NULL,
                filename TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                content BLOB NOT NULL,
                PRIMARY KEY (record_id, position)
            );
            CREATE TABLE IF NOT EXISTS quality_team_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL DEFAULT '',
                phone TEXT NOT NULL DEFAULT '',
                phone2 TEXT NOT NULL DEFAULT '',
                sector TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            '''
        )
        team_columns = {
            row[1] for row in connection.execute('PRAGMA table_info(quality_team_members)')
        }
        if 'phone2' not in team_columns:
            connection.execute(
                "ALTER TABLE quality_team_members ADD COLUMN phone2 TEXT NOT NULL DEFAULT ''"
            )
        team_member_count = connection.execute('SELECT COUNT(*) FROM quality_team_members').fetchone()[0]
        if team_member_count == 0:
            initial_team = [
                ('Agustina Queirolo', 'agustina.queirolo@newsan.com.ar', '', 'Jefatura del sector'),
                ('Rober Adolfo Quiquinlla', 'roberadolfo.quiquinlla@newsan.com.ar', '', 'IQC · Control de calidad de ingreso'),
                ('Leonardo Federico Locascio', 'leonardofederico.locascio@newsan.com.ar', '', 'Analistas · Análisis y seguimiento de calidad'),
                ('María Soledad Romano', 'mariasoledad.romano@newsan.com.ar', '', 'Auditoría · LCD6 · Inserción Manual & JIG'),
                ('Cristian Ramírez', 'cristian.ramirez@newsan.com.ar', '', 'Auditoría · LCD8'),
                ('Maico Arias', 'maico.arias@newsan.com.ar', '', 'Auditoría · CELDA3'),
                ('Francisco Fuentes', 'francisco.fuentes@newsan.com.ar', '', 'OQC · QA'),
                ('Matías Ricardo', 'matias.ricardo@newsan.com.ar', '', 'Reparaciones'),
                ('Enrique Sosa', 'enrique.sosa@newsan.com.ar', '', 'Reparaciones'),
                ('Mateo Joaquín Zabala', 'mateojoaquin.zabala@newsan.com.ar', '', 'Reparaciones')
            ]
            connection.executemany(
                'INSERT INTO quality_team_members (full_name, email, phone, sector, created_at) '
                'VALUES (?, ?, ?, ?, ?)',
                [(*member, int(time.time())) for member in initial_team]
            )
        existing_user = connection.execute('SELECT COUNT(*) FROM users').fetchone()[0]
        if existing_user == 0:
            configured_admin_password = os.environ.get('QUALITY_ADMIN_PASSWORD')
            if configured_admin_password and len(configured_admin_password) < 12:
                raise RuntimeError('QUALITY_ADMIN_PASSWORD debe tener al menos 12 caracteres.')
            for account in DEFAULT_ACCOUNTS:
                (username, full_name, initials, role, shift, avatar_bg, is_admin,
                 salt_hex, hash_hex) = account
                password_iterations = PASSWORD_HASH_ITERATIONS
                if username == 'rober' and configured_admin_password:
                    salt = secrets.token_bytes(16)
                    salt_hex = salt.hex()
                    hash_hex = hashlib.pbkdf2_hmac(
                        'sha256', configured_admin_password.encode('utf-8'),
                        salt, PASSWORD_HASH_ITERATIONS
                    ).hex()
                connection.execute(
                    'INSERT INTO users (username, full_name, initials, role, shift, avatar_bg, is_admin, '
                    'password_salt, password_hash, password_iterations, created_at) '
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    (username, full_name, initials, role, shift, avatar_bg, is_admin,
                     salt_hex, hash_hex, password_iterations, int(time.time()))
                )
            print('[SEGURIDAD] Se inicializaron las cuentas del equipo en la base central.')
            if configured_admin_password:
                print('[SEGURIDAD] Se aplicó QUALITY_ADMIN_PASSWORD a la cuenta rober.')
            else:
                print('[SEGURIDAD] Cambien las contraseñas iniciales desde Usuarios.')
        connection.commit()
    finally:
        connection.close()

if __name__ == '__main__':
    run()
