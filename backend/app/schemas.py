from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

# Kullanıcı Şemaları
class KullaniciBase(BaseModel):
    sicil_no: str
    ad_soyad: str
    unvan: str

class KullaniciCreate(KullaniciBase):
    sifre: str

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

class DosyaCreate(DosyaBase):
    pass

class Dosya(DosyaBase):
    id: int

    class Config:
        from_attributes = True

# Görev Şemaları
class AktifGorevBase(BaseModel):
    dosya_id: int
    sablon_id: int
    vade_tarihi: date
    notlar: Optional[str] = None
    durum: str = "Bekliyor"

class AktifGorevCreate(AktifGorevBase):
    pass

class AktifGorev(AktifGorevBase):
    id: int
    baslama_tarihi: date

    class Config:
        from_attributes = True
# Şablon Şemaları
class SenaryoSablonuBase(BaseModel):
    ad: str
    aciklama: Optional[str] = None
    varsayilan_sure_gun: int

class SenaryoSablonuCreate(SenaryoSablonuBase):
    pass

class SenaryoSablonu(SenaryoSablonuBase):
    id: int

    class Config:
        from_attributes = True
