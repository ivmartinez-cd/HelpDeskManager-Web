import sqlite3
import ipaddress
import re
from typing import List, Set, Optional, Tuple
from contextlib import closing

CANDIDATE_IP_COLUMNS = {"ip", "ip_address", "direccion_ip", "ip_addr"}


def find_ip_column(conn: sqlite3.Connection) -> Optional[str]:
    try:
        with closing(conn.cursor()) as cur:
            cur.execute("PRAGMA table_info(counters)")
            cols = [row[1] for row in cur.fetchall()]
            if not cols:
                return None
            lower_map = {c.lower(): c for c in cols}
            for cand in CANDIDATE_IP_COLUMNS:
                if cand in lower_map:
                    return lower_map[cand]
            for c in cols:
                if "ip" in c.lower():
                    return c
    except sqlite3.Error:
        pass
    return None


def extract_ips_from_db(db_path: str) -> List[str]:
    ips = []
    try:
        with sqlite3.connect(f"file:{db_path}?mode=ro", uri=True) as conn:
            ip_col = find_ip_column(conn)
            if not ip_col:
                return []
            with closing(conn.cursor()) as cur:
                cur.execute(f'SELECT "{ip_col}" FROM counters')
                for (val,) in cur.fetchall():
                    if val:
                        ips.append(str(val).strip())
    except Exception as e:
        print(f"Error extrayendo IPs de {db_path}: {e}")
    return ips


def parse_ipv4(s: str) -> Optional[str]:
    # Regex simple para IPv4
    match = re.search(r"(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", s)
    if match:
        ip_str = match.group(1)
        try:
            ip = ipaddress.ip_address(ip_str)
            if isinstance(ip, ipaddress.IPv4Address):
                return str(ip)
        except:
            pass
    return None


def generate_ranges_from_ips(ips: List[str]) -> Tuple[str, int]:
    prefixes_24: Set[str] = set()
    for raw in ips:
        ip_str = parse_ipv4(raw)
        if ip_str:
            parts = ip_str.split(".")
            prefixes_24.add(f"{parts[0]}.{parts[1]}.{parts[2]}")

    if not prefixes_24:
        return "", 0

    ordered = sorted(prefixes_24, key=lambda pfx: ipaddress.IPv4Address(pfx + ".0"))
    ranges_line = ",".join(f"{p}.1-{p}.254" for p in ordered)
    return ranges_line, len(ordered)


def process_db3_to_ips(db3_paths: List[str]) -> Tuple[str, int]:
    all_ips = []
    for path in db3_paths:
        all_ips.extend(extract_ips_from_db(path))
    return generate_ranges_from_ips(all_ips)


def process_txt_to_ips(txt_content: str) -> Tuple[str, int]:
    # Encontrar todas las IPs en el texto
    ips = re.findall(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", txt_content)
    return generate_ranges_from_ips(ips)
