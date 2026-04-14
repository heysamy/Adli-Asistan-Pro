from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal, get_db
from . import models
from .routers import auth, files, tasks, templates

# Veritabanı tablolarını oluştur
models.Base.metadata.create_all(bind=engine)

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
def get_stats(db: SessionLocal = Depends(database.get_db)):
    today = date.today()
    
    # İstatistikleri hesapla
    vadesi_gecen = db.query(models.AktifGorev).filter(models.AktifGorev.vade_tarihi < today, models.AktifGorev.durum != "Tamamlandı").count()
    kritik = db.query(models.AktifGorev).filter(models.AktifGorev.vade_tarihi >= today, models.AktifGorev.vade_tarihi <= today + timedelta(days=3), models.AktifGorev.durum != "Tamamlandı").count()
    devam_eden = db.query(models.AktifGorev).filter(models.AktifGorev.durum == "Bekliyor").count()
    tamamlanan = db.query(models.AktifGorev).filter(models.AktifGorev.durum == "Tamamlandı").count()
    
    # Son görevleri al (Gerçek veri)
    recent_tasks_db = db.query(models.AktifGorev).order_by(models.AktifGorev.vade_tarihi.asc()).limit(5).all()
    recent_tasks = []
    for t in recent_tasks_db:
        dosya = db.query(models.Dosya).filter(models.Dosya.id == t.dosya_id).first()
        sablon = db.query(models.SenaryoSablonu).filter(models.SenaryoSablonu.id == t.sablon_id).first()
        
        # Durum belirleme logic'i
        durum_label = "Bekliyor"
        if t.vade_tarihi < today: durum_label = "Gecikmiş"
        elif t.vade_tarihi <= today + timedelta(days=3): durum_label = "Kritik"
        
        recent_tasks.append({
            "id": t.id,
            "file": f"{dosya.yil}/{dosya.esas_no} Esas" if dosya else "Bilinmiyor",
            "action": sablon.ad if sablon else "İşlem",
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
