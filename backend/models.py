from sqlalchemy import Column, Integer, String, DateTime, Boolean, UniqueConstraint
from database import Base
import datetime


class FTPClient(Base):
    __tablename__ = "ftp_clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    host = Column(String)
    user = Column(String)
    password = Column(String)
    path = Column(String, default="/")
    pattern = Column(String, default="PrinterMonitorClient.db3.*")


class ResourceLink(Base):
    __tablename__ = "resource_links"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String)
    category = Column(String, default="Otros")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )


class MeterClientConfig(Base):
    __tablename__ = "meter_client_configs"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True)  # "sds" | "ers"
    customer_id = Column(String, index=True)
    customer_name = Column(String)
    suma_color = Column(Boolean, default=False)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    __table_args__ = (
        UniqueConstraint("source", "customer_id", name="uq_meter_client_source_customer"),
    )
