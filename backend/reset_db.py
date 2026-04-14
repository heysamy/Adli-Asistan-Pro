from app.database import engine, Base
import app.models as models

print("Veritabanı tabloları temizleniyor...")
Base.metadata.drop_all(bind=engine)
print("Yeni tablolar oluşturuluyor...")
Base.metadata.create_all(bind=engine)
print("Sıfırlama tamamlandı. Tüm veriler silindi, şema güncellendi.")
