from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database
from typing import List

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.Kullanici)
def register(user: schemas.KullaniciCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_kullanici_by_sicil(db, sicil_no=user.sicil_no)
    if db_user:
        raise HTTPException(status_code=400, detail="Sicil no zaten kayıtlı")
    return crud.create_kullanici(db=db, kullanici=user)

@router.post("/login")
def login(request: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    user = crud.get_kullanici_by_sicil(db, sicil_no=request.sicil_no)
    if not user or user.sifre != request.sifre:
        raise HTTPException(status_code=401, detail="Hatalı sicil no veya şifre")
    return {"status": "success", "user": user}

@router.put("/profile/{sicil_no}")
def update_profile(sicil_no: str, data: schemas.KullaniciUpdate, db: Session = Depends(database.get_db)):
    user = crud.update_kullanici(db, sicil_no=sicil_no, data=data.dict(exclude_unset=True))
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {"status": "success", "user": user}

# --- BIRIM ENDPOINTS ---
@router.get("/birimler", response_model=List[schemas.Birim])
def list_birimler(db: Session = Depends(database.get_db)):
    return crud.get_birimler(db)

@router.post("/birimler", response_model=schemas.Birim)
def create_birim(birim: schemas.BirimCreate, db: Session = Depends(database.get_db)):
    return crud.create_birim(db, birim)

# --- BILDIRIM ENDPOINTS ---
@router.get("/bildirimler/{user_id}", response_model=List[schemas.Bildirim])
def get_bildirimler(user_id: int, db: Session = Depends(database.get_db)):
    return crud.get_bildirimler(db, user_id)

# --- KALEM PERSONEL ---
@router.get("/kalem/{birim_id}", response_model=List[schemas.Kullanici])
def list_kalem_personel(birim_id: int, db: Session = Depends(database.get_db)):
    return crud.get_kullanicilar_by_birim(db, birim_id)

@router.delete("/personel/{sicil_no}")
def delete_personel(sicil_no: str, db: Session = Depends(database.get_db)):
    from .. import models
    user = db.query(models.Kullanici).filter(models.Kullanici.sicil_no == sicil_no).first()
    if not user:
        raise HTTPException(status_code=404, detail="Personel bulunamadı")
    db.delete(user)
    db.commit()
    return {"ok": True}
