from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date, datetime, timedelta

# --- BIRIM ISLEMLERI ---
def get_birimler(db: Session):
    return db.query(models.Birim).all()

def create_birim(db: Session, birim: schemas.BirimCreate):
    db_birim = models.Birim(ad=birim.ad)
    db.add(db_birim)
    db.commit()
    db.refresh(db_birim)
    return db_birim

# --- DOSYA İŞLEMLERİ ---
def get_dosya(db: Session, dosya_id: int):
    return db.query(models.Dosya).filter(models.Dosya.id == dosya_id).first()

def get_dosyalar_by_birim(db: Session, birim_id: int):
    return db.query(models.Dosya).filter(models.Dosya.birim_id == birim_id).all()

def create_dosya(db: Session, dosya: schemas.DosyaCreate):
    db_dosya = models.Dosya(**dosya.dict())
    db.add(db_dosya)
    db.commit()
    db.refresh(db_dosya)
    return db_dosya

def update_dosya(db: Session, dosya_id: int, data: dict):
    db_dosya = db.query(models.Dosya).filter(models.Dosya.id == dosya_id).first()
    if db_dosya:
        for key, value in data.items():
            setattr(db_dosya, key, value)
        db.commit()
        db.refresh(db_dosya)
    return db_dosya

# --- ŞABLON (SENARYO) İŞLEMLERİ ---
def get_sablonlar(db: Session):
    return db.query(models.SenaryoSablonu).all()

def create_sablon(db: Session, sablon: schemas.SenaryoSablonuCreate):
    db_sablon = models.SenaryoSablonu(**sablon.dict())
    db.add(db_sablon)
    db.commit()
    db.refresh(db_sablon)
    return db_sablon

def update_sablon(db: Session, sablon_id: int, data: dict):
    db_obj = db.query(models.SenaryoSablonu).filter(models.SenaryoSablonu.id == sablon_id).first()
    if db_obj:
        for k, v in data.items():
            setattr(db_obj, k, v)
        db.commit()
        db.refresh(db_obj)
    return db_obj

def delete_sablon(db: Session, sablon_id: int):
    db_obj = db.query(models.SenaryoSablonu).filter(models.SenaryoSablonu.id == sablon_id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return db_obj

# --- GÖREV İŞLEMLERİ ---
def get_gorevler_by_birim(db: Session, birim_id: int):
    return db.query(models.AktifGorev).join(models.Dosya).filter(models.Dosya.birim_id == birim_id).all()

def get_gorevler_by_kullanici(db: Session, kullanici_id: int):
    return db.query(models.AktifGorev).filter(models.AktifGorev.atanan_id == kullanici_id).all()

def create_gorev(db: Session, gorev: schemas.AktifGorevCreate):
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
        db.refresh(db_gorev)
    return db_gorev

def delete_gorev(db: Session, gorev_id: int):
    db_gorev = db.query(models.AktifGorev).filter(models.AktifGorev.id == gorev_id).first()
    if db_gorev:
        db.delete(db_gorev)
        db.commit()
    return {"ok": True}

def transfer_gorev(db: Session, gorev_id: int, yeni_atanan_id: int, yapan_id: int):
    db_gorev = db.query(models.AktifGorev).filter(models.AktifGorev.id == gorev_id).first()
    if db_gorev:
        eski_atanan_id = db_gorev.atanan_id
        db_gorev.atanan_id = yeni_atanan_id
        
        # Bildirimler
        yapan = get_kullanici_by_id(db, yapan_id)
        msg = f"İş aktarıldı: {db_gorev.id} numaralı görev {yapan.ad_soyad} tarafından size aktarıldı."
        create_bildirim(db, yeni_atanan_id, msg)
        if eski_atanan_id:
            create_bildirim(db, eski_atanan_id, f"Üzerinizdeki {db_gorev.id} numaralı görev başka bir kullanıcıya aktarıldı.")
        
        db.commit()
        db.refresh(db_gorev)
    return db_gorev

# --- KULLANICI İŞLEMLERİ ---
def get_kullanici_by_id(db: Session, user_id: int):
    return db.query(models.Kullanici).filter(models.Kullanici.id == user_id).first()

def get_kullanici_by_sicil(db: Session, sicil_no: str):
    return db.query(models.Kullanici).filter(models.Kullanici.sicil_no == sicil_no).first()

def get_kullanicilar_by_birim(db: Session, birim_id: int):
    return db.query(models.Kullanici).filter(models.Kullanici.birim_id == birim_id).all()

def create_kullanici(db: Session, kullanici: schemas.KullaniciCreate):
    db_user = models.Kullanici(**kullanici.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_kullanici(db: Session, sicil_no: str, data: dict):
    db_user = get_kullanici_by_sicil(db, sicil_no)
    if db_user:
        for key, value in data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

# --- BILDIRIM ISLEMLERI ---
def create_bildirim(db: Session, kullanici_id: int, mesaj: str):
    db_bildirim = models.Bildirim(kullanici_id=kullanici_id, mesaj=mesaj)
    db.add(db_bildirim)
    db.commit()
    return db_bildirim

def get_bildirimler(db: Session, kullanici_id: int):
    return db.query(models.Bildirim).filter(models.Bildirim.kullanici_id == kullanici_id, models.Bildirim.okundu == False).all()

# --- SİLME TALEPLERİ ---
def create_silme_talebi(db: Session, dosya_id: int, talep_eden_id: int, neden: str):
    talep = models.DosyaSilmeTalebi(dosya_id=dosya_id, talep_eden_id=talep_eden_id, neden=neden)
    db.add(talep)
    db.commit()
    return talep

def get_silme_talepleri_by_birim(db: Session, birim_id: int):
    return db.query(models.DosyaSilmeTalebi).join(models.Dosya).filter(models.Dosya.birim_id == birim_id, models.DosyaSilmeTalebi.durum == "Bekliyor").all()

def approve_silme_talebi(db: Session, talep_id: int, onaylayan_id: int):
    talep = db.query(models.DosyaSilmeTalebi).filter(models.DosyaSilmeTalebi.id == talep_id).first()
    if talep:
        talep.durum = "Onaylandı"
        # Dosyayı sil
        dosya = db.query(models.Dosya).filter(models.Dosya.id == talep.dosya_id).first()
        if dosya:
            db.delete(dosya)
        db.commit()
    return talep
