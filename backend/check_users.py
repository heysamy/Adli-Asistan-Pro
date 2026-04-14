from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT sicil_no, ad_soyad, sifre FROM kullanicilar"))
    print("--- KAYITLI KULLANICILAR ---")
    for row in result:
        print(f"Sicil: {row[0]}, Ad: {row[1]}, Şifre: {row[2]}")
