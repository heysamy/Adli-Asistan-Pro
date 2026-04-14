from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal, get_db
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Optional, List
from . import models
from .routers import auth, files, tasks, templates

# Veritabanı tablolarını oluştur
models.Base.metadata.create_all(bind=engine)

def run_migrations():
    """SQLite ALTER TABLE migrasyonları — sütun yoksa ekler."""
    db = SessionLocal()
    try:
        from sqlalchemy import text
        try:
            db.execute(text("ALTER TABLE dosya_silme_talepleri ADD COLUMN talep_tarihi DATE"))
            db.commit()
        except Exception:
            pass  # Sütun zaten varsa sessizce geç
    finally:
        db.close()

run_migrations()

def seed_data():
    db = SessionLocal()
    try:
        if db.query(models.SenaryoSablonu).count() == 0:
            sablonlar = [
                models.SenaryoSablonu(ad="Bilirkişi İncelemesi", aciklama="Dosyanın bilirkişiye tevdii ve rapor sükutu", varsayilan_sure_gun=30),
                models.SenaryoSablonu(ad="Müzekkere Takibi", aciklama="Kurumlara yazılan yazıların cevaplanması", varsayilan_sure_gun=15),
                models.SenaryoSablonu(ad="Tebligat Akıbeti", aciklama="Tebligat parçalarının dönüş takibi", varsayilan_sure_gun=10),
                models.SenaryoSablonu(ad="Karar Yazımı", aciklama="Gerekçeli kararın yazılması için yasal süre", varsayilan_sure_gun=30)
            ]
            db.add_all(sablonlar)
            db.commit()
    finally:
        db.close()

seed_data()

app = FastAPI(title="Adli Asistan PRO API")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(files.router)
app.include_router(tasks.router)
app.include_router(templates.router)

@app.get("/")
def read_root():
    return {
        "mesaj": "Adli Asistan PRO API Aktif",
        "durum": "Hazır",
        "gelistirici": "Semih Çetin - Bursa 4. İş Mahkemesi Yazı İşleri Müdürü"
    }

@app.get("/stats")
def get_stats(birim_id: Optional[int] = None, db: Session = Depends(get_db)):
    today = date.today()
    
    # Queryleri birim bazlı filtrele
    tasks_query = db.query(models.AktifGorev).join(models.Dosya).filter(models.Dosya.birim_id == birim_id) if birim_id else db.query(models.AktifGorev)
    
    # İstatistikleri hesapla
    vadesi_gecen = tasks_query.filter(models.AktifGorev.vade_tarihi < today, models.AktifGorev.durum != "Tamamlandı").count()
    kritik = tasks_query.filter(models.AktifGorev.vade_tarihi >= today, models.AktifGorev.vade_tarihi <= today + timedelta(days=3), models.AktifGorev.durum != "Tamamlandı").count()
    devam_eden = tasks_query.filter(models.AktifGorev.durum == "Bekliyor").count()
    tamamlanan = tasks_query.filter(models.AktifGorev.durum == "Tamamlandı").count()
    
    # Son görevleri al
    recent_tasks_db = tasks_query.order_by(models.AktifGorev.vade_tarihi.asc()).limit(5).all()
    recent_tasks = []
    for t in recent_tasks_db:
        # Durum belirleme logic'i
        durum_label = "Bekliyor"
        if t.vade_tarihi < today: durum_label = "Gecikmiş"
        elif t.vade_tarihi <= today + timedelta(days=3): durum_label = "Kritik"
        
        recent_tasks.append({
            "id": t.id,
            "file": f"{t.dosya.yil}/{t.dosya.esas_no} Esas" if t.dosya else "Bilinmiyor",
            "action": t.sablon.ad if t.sablon else "İşlem",
            "due": t.vade_tarihi.strftime("%d.%m.%Y"),
            "status": durum_label
        })

    return {
        "vadesi_gecen": vadesi_gecen,
        "kritik": kritik,
        "devam_eden": devam_eden,
        "tamamlanan": tamamlanan,
        "recent_tasks": recent_tasks
    }
