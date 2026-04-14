from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class Birim(Base):
    __tablename__ = "birimler"
    id = Column(Integer, primary_key=True, index=True)
    ad = Column(String, unique=True, index=True)
    
    kullanicilar = relationship("Kullanici", back_populates="birim")
    dosyalar = relationship("Dosya", back_populates="birim")

class Kullanici(Base):
    __tablename__ = "kullanicilar"
    id = Column(Integer, primary_key=True, index=True)
    sicil_no = Column(String, unique=True, index=True)
    ad_soyad = Column(String)
    unvan = Column(String)  # Katip, Müdür, Hakim
    sifre = Column(String)
    birim_id = Column(Integer, ForeignKey("birimler.id"))

    birim = relationship("Birim", back_populates="kullanicilar")

class Dosya(Base):
    __tablename__ = "dosyalar"
    id = Column(Integer, primary_key=True, index=True)
    yil = Column(Integer, default=lambda: datetime.datetime.now().year)
    esas_no = Column(Integer, index=True)
    taraf_bilgileri = Column(Text)
    konu = Column(String)
    durum = Column(String, default="Açık")
    birim_id = Column(Integer, ForeignKey("birimler.id"))
    olusturan_id = Column(Integer, ForeignKey("kullanicilar.id"))

    birim = relationship("Birim", back_populates="dosyalar")
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
    olusturan_id = Column(Integer, ForeignKey("kullanicilar.id"))
    atanan_id = Column(Integer, ForeignKey("kullanicilar.id")) # Sorumlu olan kişi
    baslama_tarihi = Column(Date, default=datetime.date.today)
    vade_tarihi = Column(Date)
    durum = Column(String, default="Bekliyor")
    notlar = Column(Text)

    dosya = relationship("Dosya", back_populates="gorevler")
    sablon = relationship("SenaryoSablonu")

class Bildirim(Base):
    __tablename__ = "bildirimler"
    id = Column(Integer, primary_key=True, index=True)
    kullanici_id = Column(Integer, ForeignKey("kullanicilar.id"))
    mesaj = Column(String)
    tarih = Column(Date, default=datetime.date.today)
    okundu = Column(Boolean, default=False)

class DosyaSilmeTalebi(Base):
    __tablename__ = "dosya_silme_talepleri"
    id = Column(Integer, primary_key=True, index=True)
    dosya_id = Column(Integer, ForeignKey("dosyalar.id"))
    talep_eden_id = Column(Integer, ForeignKey("kullanicilar.id"))
    neden = Column(Text)
    durum = Column(String, default="Bekliyor") # Bekliyor, Onaylandı, Reddedildi
    talep_tarihi = Column(Date, default=datetime.date.today)
