from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date, timedelta

# --- DOSYA İŞLEMLERİ ---
def get_dosya(db: Session, dosya_id: int):
    return db.query(models.Dosya).filter(models.Dosya.id == dosya_id).first()

def get_dosyalar(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Dosya).offset(skip).limit(limit).all()

def create_dosya(db: Session, dosya: schemas.DosyaCreate):
    db_dosya = models.Dosya(**dosya.dict())
    db.add(db_dosya)
    db.commit()
    db.refresh(db_dosya)
    return db_dosya

# --- ŞABLON İŞLEMLERİ ---
def get_sablonlar(db: Session):
    return db.query(models.SenaryoSablonu).all()

def create_sablon(db: Session, sablon: schemas.SenaryoSablonu):
    db_sablon = models.SenaryoSablonu(**sablon.dict())
    db.add(db_sablon)
    db.commit()
    db.refresh(db_sablon)
    return db_sablon

# --- GÖREV İŞLEMLERİ ---
def get_gorevler_by_dosya(db: Session, dosya_id: int):
    return db.query(models.AktifGorev).filter(models.AktifGorev.dosya_id == dosya_id).all()

def create_gorev(db: Session, gorev: schemas.AktifGorevCreate):
    # Şablonu bulup vade tarihini otomatik hesapla
    sablon = db.query(models.SenaryoSablonu).filter(models.SenaryoSablonu.id == gorev.sablon_id).first()
    vade_tarihi = date.today() + timedelta(days=sablon.varsayilan_sure_gun if sablon else 0)
    
    db_gorev = models.AktifGorev(
        **gorev.dict(exclude={"vade_tarihi"}),
        vade_tarihi=vade_tarihi
    )
    db.add(db_gorev)
    db.commit()
    db.refresh(db_gorev)
    return db_gorev

def update_gorev_durum(db: Session, gorev_id: int, durum: str):
    db_gorev = db.query(models.AktifGorev).filter(models.AktifGorev.id == gorev_id).first()
    if db_gorev:
        db_gorev.durum = durum
        db.commit()
    return db_gorev

# --- KULLANICI İŞLEMLERİ ---
def get_kullanici_by_sicil(db: Session, sicil_no: str):
    return db.query(models.Kullanici).filter(models.Kullanici.sicil_no == sicil_no).first()

def create_kullanici(db: Session, kullanici: schemas.KullaniciCreate):
    db_user = models.Kullanici(**kullanici.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
