import sqlite3

def check_users():
    conn = sqlite3.connect('adli_asistan.db')
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT sicil_no, ad_soyad, unvan FROM kullanicilar")
        users = cursor.fetchall()
        print("VERİTABANINDAKİ KULLANICILAR:")
        print("-" * 30)
        for user in users:
            print(f"Sicil: {user[0]} | İsim: {user[1]} | Unvan: {user[2]}")
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_users()
