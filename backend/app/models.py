from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class Kullanici(Base):
    __tablename__ = "kullanicilar"

    id = Column(Integer, primary_key=True, index=True)
    sicil_no = Column(String, unique=True, index=True)
    ad_soyad = Column(String)
    unvan = Column(String)  # Katip, Müdür, Hakim
    sifre = Column(String)

class Dosya(Base):
    __tablename__ = "dosyalar"

    id = Column(Integer, primary_key=True, index=True)
    yil = Column(Integer, default=lambda: datetime.datetime.now().year)
    esas_no = Column(Integer, index=True)
    taraf_bilgileri = Column(Text)
    konu = Column(String)
    durum = Column(String, default="Açık")  # Açık, Kapalı, Arşiv

    gorevler = relationship("AktifGorev", back_populates="dosya")

class SenaryoSablonu(Base):
    __tablename__ = "senaryo_sablonlari"

    id = Column(Integer, primary_key=True, index=True)
    ad = Column(String)
    aciklama = Column(Text)
    varsayilan_sure_gun = Column(Integer)

class AktifGorev(Base):
    __tablename__ = "aktif_gorevler"

    id = Column(Integer, primary_key=True, index=True)
    dosya_id = Column(Integer, ForeignKey("dosyalar.id"))
    sablon_id = Column(Integer, ForeignKey("senaryo_sablonlari.id"))
    baslama_tarihi = Column(Date, default=datetime.date.today)
    vade_tarihi = Column(Date)
    durum = Column(String, default="Bekliyor")  # Bekliyor, Tamamlandı, Gecikmiş
    notlar = Column(Text)

    dosya = relationship("Dosya", back_populates="gorevler")
    sablon = relationship("SenaryoSablonu")
