from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class BirimBase(BaseModel):
    ad: str

class BirimCreate(BirimBase):
    pass

class Birim(BirimBase):
    id: int
    class Config:
        from_attributes = True

# Kullanıcı Şemaları
class KullaniciBase(BaseModel):
    sicil_no: str
    ad_soyad: str
    unvan: str # Katip, Müdür, Hakim
    birim_id: Optional[int] = None

class KullaniciCreate(KullaniciBase):
    sifre: str

class KullaniciUpdate(BaseModel):
    ad_soyad: Optional[str] = None
    unvan: Optional[str] = None
    sifre: Optional[str] = None
    birim_id: Optional[int] = None

class Kullanici(KullaniciBase):
    id: int
    class Config:
        from_attributes = True

# Dosya Şemaları
class DosyaBase(BaseModel):
    yil: int
    esas_no: int
    taraf_bilgileri: str
    konu: str
    durum: str = "Açık"
    birim_id: Optional[int] = None
    olusturan_id: Optional[int] = None

class DosyaCreate(DosyaBase):
    pass

class Dosya(DosyaBase):
    id: int
    class Config:
        from_attributes = True

# Şablon Şemaları
class SenaryoSablonuBase(BaseModel):
    ad: str
    aciklama: str
    varsayilan_sure_gun: int

class SenaryoSablonuCreate(SenaryoSablonuBase):
    pass

class SenaryoSablonu(SenaryoSablonuBase):
    id: int
    class Config:
        from_attributes = True

# Görev Şemaları
class AktifGorevBase(BaseModel):
    dosya_id: int
    sablon_id: int
    olusturan_id: Optional[int] = None
    atanan_id: Optional[int] = None
    durum: str = "Bekliyor"
    notlar: Optional[str] = None

class AktifGorevCreate(AktifGorevBase):
    pass

class AktifGorev(AktifGorevBase):
    id: int
    baslama_tarihi: date
    vade_tarihi: date
    dosya: Optional[Dosya] = None

    class Config:
        from_attributes = True

# --- YENİ EKLENEN ŞEMALAR ---

class BildirimBase(BaseModel):
    kullanici_id: int
    mesaj: str
    tur: str # "İş Aktarımı", "Sistem", "Onay"
    okundu: bool = False

class Bildirim(BildirimBase):
    id: int
    tarih: date
    class Config:
        from_attributes = True

class DosyaSilmeTalebiBase(BaseModel):
    dosya_id: int
    talep_eden_id: int
    neden: str

class DosyaSilmeTalebi(DosyaSilmeTalebiBase):
    id: int
    durum: str # "Bekliyor", "Onaylandı", "Reddedildi"
    talep_tarihi: date
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    sicil_no: str
    sifre: str
